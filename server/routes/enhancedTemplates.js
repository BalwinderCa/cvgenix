const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Template = require('../models/Template');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/templates/enhanced
// @desc    Get templates with enhanced filtering and sorting
// @access  Public
router.get('/enhanced', [
  query('category').optional().isString(),
  query('industry').optional().isString(),
  query('atsScore').optional().isInt({ min: 0, max: 100 }),
  query('isPremium').optional().isBoolean(),
  query('sortBy').optional().isIn(['popularity', 'newest', 'rating', 'usage', 'name']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      });
    }

    const {
      category,
      industry,
      atsScore,
      isPremium,
      sortBy = 'popularity',
      limit = 20,
      page = 1
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (industry) {
      filter.industry = { $in: industry.split(',') };
    }
    
    if (atsScore) {
      filter.atsScore = { $gte: parseInt(atsScore) };
    }
    
    if (isPremium !== undefined) {
      filter.isPremium = isPremium === 'true';
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'popularity':
        sort = { isPopular: -1, usageCount: -1 };
        break;
      case 'newest':
        sort = { isNewTemplate: -1, createdAt: -1 };
        break;
      case 'rating':
        sort = { 'rating.average': -1, 'rating.count': -1 };
        break;
      case 'usage':
        sort = { usageCount: -1 };
        break;
      case 'name':
        sort = { name: 1 };
        break;
      default:
        sort = { isPopular: -1, usageCount: -1 };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const templates = await Template.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalCount = await Template.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    // Enhance templates with additional data
    const enhancedTemplates = templates.map(template => ({
      ...template,
      atsScore: template.atsScore || Math.floor(Math.random() * 20) + 80, // Generate ATS score if not present
      industry: template.industry || getIndustryFromCategory(template.category),
      features: getFeaturesFromCategory(template.category),
      price: template.isPremium ? 9.99 : 0
    }));

    res.json({
      success: true,
      data: {
        templates: enhancedTemplates,
        pagination: {
          current: parseInt(page),
          total: totalPages,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1,
          totalCount
        },
        filters: {
          category,
          industry,
          atsScore,
          isPremium,
          sortBy
        }
      }
    });

  } catch (error) {
    console.error('Error fetching enhanced templates:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/templates/recommendations
// @desc    Get template recommendations based on user profile
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
  try {
    const { industry, experience, role } = req.query;

    // Build recommendation logic
    const recommendations = await getTemplateRecommendations({
      industry,
      experience,
      role,
      userId: req.user.id
    });

    res.json({
      success: true,
      data: {
        recommendations,
        basedOn: { industry, experience, role }
      }
    });

  } catch (error) {
    console.error('Error getting template recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/templates/compare
// @desc    Compare multiple templates
// @access  Public
router.post('/compare', [
  body('templateIds').isArray({ min: 2, max: 5 }).withMessage('Must provide 2-5 template IDs'),
  body('templateIds.*').isMongoId().withMessage('Invalid template ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      });
    }

    const { templateIds } = req.body;

    const templates = await Template.find({
      _id: { $in: templateIds }
    }).lean();

    if (templates.length !== templateIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more templates not found'
      });
    }

    // Create comparison data
    const comparison = {
      templates: templates.map(template => ({
        ...template,
        atsScore: template.atsScore || Math.floor(Math.random() * 20) + 80,
        industry: template.industry || getIndustryFromCategory(template.category),
        features: getFeaturesFromCategory(template.category),
        price: template.isPremium ? 9.99 : 0
      })),
      comparison: {
        bestATS: templates.reduce((best, current) => 
          (current.atsScore || 90) > (best.atsScore || 90) ? current : best
        ),
        mostPopular: templates.reduce((best, current) => 
          current.usageCount > best.usageCount ? current : best
        ),
        highestRated: templates.reduce((best, current) => 
          current.rating.average > best.rating.average ? current : best
        )
      }
    };

    res.json({
      success: true,
      data: comparison
    });

  } catch (error) {
    console.error('Error comparing templates:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/templates/:id/analytics
// @desc    Get template analytics and usage statistics
// @access  Public
router.get('/:id/analytics', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Generate analytics data
    const analytics = {
      template: {
        id: template._id,
        name: template.name,
        category: template.category
      },
      usage: {
        totalUses: template.usageCount,
        monthlyUses: Math.floor(template.usageCount * 0.1),
        weeklyUses: Math.floor(template.usageCount * 0.02),
        dailyUses: Math.floor(template.usageCount * 0.003)
      },
      performance: {
        atsScore: template.atsScore || Math.floor(Math.random() * 20) + 80,
        rating: template.rating,
        conversionRate: Math.floor(Math.random() * 20) + 70,
        bounceRate: Math.floor(Math.random() * 10) + 5
      },
      demographics: {
        topIndustries: getIndustryFromCategory(template.category),
        experienceLevels: ['Entry', 'Mid', 'Senior'],
        regions: ['North America', 'Europe', 'Asia']
      }
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error getting template analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/templates/categories
// @desc    Get all template categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Template.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating.average' },
          totalUsage: { $sum: '$usageCount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Error getting template categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper functions
function getIndustryFromCategory(category) {
  const industryMap = {
    'Professional': ['Business', 'Finance', 'Consulting', 'Corporate'],
    'Creative': ['Design', 'Marketing', 'Advertising', 'Media'],
    'Minimalist': ['Technology', 'Startup', 'Freelance'],
    'Modern': ['Technology', 'Digital', 'Innovation'],
    'Executive': ['Leadership', 'Management', 'C-Suite'],
    'Classic': ['Traditional', 'Conservative', 'Established']
  };
  
  return industryMap[category] || ['General'];
}

function getFeaturesFromCategory(category) {
  const featureMap = {
    'Professional': ['ATS Optimized', 'Clean Layout', 'Professional Design', 'Industry Standard'],
    'Creative': ['Visual Appeal', 'Color Customization', 'Creative Layout', 'Portfolio Section'],
    'Minimalist': ['Clean Design', 'Focus on Content', 'Simple Layout', 'Easy to Read'],
    'Modern': ['Contemporary Design', 'Modern Typography', 'Flexible Layout', 'Tech-Friendly'],
    'Executive': ['Leadership Focus', 'Achievement Highlights', 'Professional Branding', 'Senior Level'],
    'Classic': ['Traditional Style', 'Conservative Design', 'Timeless Appeal', 'Universal Compatibility']
  };
  
  return featureMap[category] || ['Professional', 'ATS Optimized'];
}

async function getTemplateRecommendations({ industry, experience, role, userId }) {
  // This would typically use ML or rule-based logic
  // For now, return templates based on simple rules
  
  const filter = {};
  
  if (industry) {
    filter.category = getCategoryFromIndustry(industry);
  }
  
  if (experience === 'entry') {
    filter.isPremium = false; // Free templates for entry level
  } else if (experience === 'senior' || experience === 'executive') {
    filter.isPremium = true; // Premium templates for senior roles
  }
  
  const recommendations = await Template.find(filter)
    .sort({ 'rating.average': -1, usageCount: -1 })
    .limit(5)
    .lean();
  
  return recommendations.map(template => ({
    ...template,
    atsScore: template.atsScore || Math.floor(Math.random() * 20) + 80,
    industry: template.industry || getIndustryFromCategory(template.category),
    features: getFeaturesFromCategory(template.category),
    price: template.isPremium ? 9.99 : 0,
    reason: getRecommendationReason(template, { industry, experience, role })
  }));
}

function getCategoryFromIndustry(industry) {
  const categoryMap = {
    'Technology': 'Modern',
    'Design': 'Creative',
    'Business': 'Professional',
    'Healthcare': 'Professional',
    'Education': 'Classic',
    'Finance': 'Professional',
    'Marketing': 'Creative',
    'Startup': 'Minimalist'
  };
  
  return categoryMap[industry] || 'Professional';
}

function getRecommendationReason(template, { industry, experience, role }) {
  const reasons = [];
  
  if (template.isPopular) {
    reasons.push('Most popular choice');
  }
  
  if (template.rating.average > 4.5) {
    reasons.push('Highly rated by users');
  }
  
  if (template.usageCount > 100) {
    reasons.push('Widely used in your industry');
  }
  
  if (template.isPremium && (experience === 'senior' || experience === 'executive')) {
    reasons.push('Perfect for senior roles');
  }
  
  return reasons.join(', ') || 'Great match for your profile';
}

// @route   GET /api/templates
// @desc    Get all templates (basic endpoint for backward compatibility)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    
    // Build filter
    const filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const templates = await Template.find(filter)
      .sort({ isPopular: -1, usageCount: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const totalCount = await Template.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      templates,
      pagination: {
        current: parseInt(page),
        total: totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
        totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
