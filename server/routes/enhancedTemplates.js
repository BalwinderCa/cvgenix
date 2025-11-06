const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Template = require('../models/Template');
const auth = require('../middleware/auth');
const handlebars = require('handlebars');
const axios = require('axios');

// AWS S3 Client (optional - only if credentials are available)
let s3Client = null;
let S3Client = null;
let GetObjectCommand = null;

try {
  const awsSdk = require('@aws-sdk/client-s3');
  S3Client = awsSdk.S3Client;
  GetObjectCommand = awsSdk.GetObjectCommand;
  
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ca-central-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    console.log('[S3] AWS S3 client initialized with credentials');
  } else {
    console.log('[S3] AWS credentials not found, will use public URL access');
  }
} catch (error) {
  console.log('[S3] AWS SDK not available, using fallback method:', error.message);
}

// Register Handlebars helpers
handlebars.registerHelper('formatDate', function(dateString, format = 'YYYY-MM') {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Return original if invalid date
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // Months are 0-indexed
  const monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];

  if (format === 'MMMM YYYY') {
    return `${monthNames[date.getMonth()]} ${year}`;
  }
  return `${year}-${month.toString().padStart(2, '0')}`;
});

handlebars.registerHelper('eq', function(arg1, arg2, options) {
  // If options is provided and has fn method, it's a block helper
  if (options && typeof options.fn === 'function') {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  }
  // Otherwise, it's a simple comparison helper
  return arg1 == arg2;
});

handlebars.registerHelper('mod', function(a, b) {
  return a % b === 0;
});

handlebars.registerHelper('unless', function(condition, options) {
  return !condition ? options.fn(this) : options.inverse(this);
});

handlebars.registerHelper('times', function(n, options) {
  let result = '';
  for (let i = 0; i < n; i++) {
    result += options.fn({ ...this, index: i });
  }
  return result;
});

handlebars.registerHelper('lt', function(a, b) {
  return a < b;
});

handlebars.registerHelper('gte', function(a, b) {
  return a >= b;
});

const router = express.Router();

// @route   GET /api/templates
// @desc    Get all active templates with optional filtering
// @access  Public
router.get('/', [
  query('category').optional().isIn(['Professional', 'Creative', 'Minimalist', 'Modern', 'Classic', 'Executive']),
  query('isPremium').optional().isBoolean(),
  query('isPopular').optional().isBoolean(),
  query('isNewTemplate').optional().isBoolean(),
  query('search').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const {
      category,
      isPremium,
      isPopular,
      isNewTemplate,
      search,
      limit = 20,
      page = 1
    } = req.query

    // Build filter object
    const filter = { isActive: true }

    if (category) filter.category = category
    if (isPremium !== undefined) filter.isPremium = isPremium === 'true'
    if (isPopular !== undefined) filter.isPopular = isPopular === 'true'
    if (isNewTemplate !== undefined) filter.isNewTemplate = isNewTemplate === 'true'

    // Search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute query
    const templates = await Template.find(filter)
      .select('name description category thumbnail tags isPremium isPopular isNewTemplate usageCount rating renderEngine canvasData')
      .sort({ isPopular: -1, isNewTemplate: -1, usageCount: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)

    // Get total count for pagination
    const total = await Template.countDocuments(filter)

    res.json({
      templates,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + templates.length < total,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

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

// @route   GET /api/templates/:id
// @desc    Get template by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching template with ID:', req.params.id);
    const template = await Template.findById(req.params.id)

    if (!template) {
      console.log('Template not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Template not found' })
    }

    if (!template.isActive) {
      console.log('Template is inactive for ID:', req.params.id);
      return res.status(404).json({ message: 'Template not found' })
    }

    console.log('Template found:', {
      id: template._id,
      name: template.name,
      renderEngine: template.renderEngine,
      hasCanvasData: !!template.canvasData,
      hasBuilderData: !!template.builderData,
      isActive: template.isActive
    });

    res.json(template)
  } catch (error) {
    console.error('Error fetching template:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Template not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/templates/:id/preview
// @desc    Get template preview with sample data
// @access  Public
router.get('/:id/preview', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    if (!template.isActive) {
      return res.status(404).json({ message: 'Template not found' })
    }

    // Use template's own sample data
    const sampleData = template.sampleData || {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main Street',
        city: 'New York',
        province: 'NY',
        postalCode: '10001',
        linkedin: 'linkedin.com/in/johndoe',
        website: 'johndoe.com',
        summary: 'Experienced software engineer with 5+ years of expertise in full-stack development, cloud architecture, and team leadership. Passionate about building scalable applications and mentoring junior developers.'
      },
      experience: [],
      education: [],
      skills: [],
      languages: [],
      certifications: [],
      socialLinks: [],
      customSections: []
    }

    // Generate HTML with sample data
    const handlebars = require('handlebars')
    const compiledTemplate = handlebars.compile(template.html)
    const htmlContent = compiledTemplate(sampleData)

    // Combine with CSS
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume Preview - ${template.name}</title>
    <style>${template.css}</style>
</head>
<body>
    ${htmlContent}
</body>
</html>`

    res.setHeader('Content-Type', 'text/html')
    res.send(fullHtml)
  } catch (error) {
    console.error('Error generating template preview:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Template not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/templates/:id/preview
// @desc    Generate template preview with custom data
// @access  Public
router.post('/:id/preview', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    if (!template.isActive) {
      return res.status(404).json({ message: 'Template not found' })
    }

    // Use provided data or fallback to template-specific sample data
    const userData = req.body || template.sampleData || {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main Street',
        city: 'New York',
        province: 'NY',
        postalCode: '10001',
        linkedin: 'linkedin.com/in/johndoe',
        website: 'johndoe.com',
        summary: 'Experienced software engineer with 5+ years of expertise in full-stack development, cloud architecture, and team leadership. Passionate about building scalable applications and mentoring junior developers.'
      },
      experience: [
        {
          id: 'exp1',
          company: 'Tech Solutions Inc.',
          position: 'Senior Software Engineer',
          startDate: '2022-01',
          endDate: '2024-12',
          current: true,
          description: 'Lead development of microservices architecture and mentor junior developers.',
          achievements: [
            'Improved system performance by 40% through optimization',
            'Led a team of 5 developers on critical projects',
            'Implemented CI/CD pipeline reducing deployment time by 60%'
          ]
        }
      ],
      education: [
        {
          id: 'edu1',
          institution: 'University of Technology',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2016-09',
          endDate: '2020-05',
          gpa: '3.8'
        }
      ],
      skills: [
        { id: 'skill1', name: 'JavaScript', level: 'Expert', category: 'Technical Skills' },
        { id: 'skill2', name: 'React', level: 'Advanced', category: 'Technical Skills' },
        { id: 'skill3', name: 'Node.js', level: 'Advanced', category: 'Technical Skills' }
      ],
      languages: [
        { id: 'lang1', language: 'English', proficiency: 'Native' }
      ],
      certifications: [],
      socialLinks: [],
      customSections: []
    }

    // Generate HTML with user data
    const compiledTemplate = handlebars.compile(template.html)
    const htmlContent = compiledTemplate(userData)

    // Combine with CSS
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume Preview - ${template.name}</title>
    <style>${template.css}</style>
</head>
<body>
    ${htmlContent}
</body>
</html>`

    res.setHeader('Content-Type', 'text/html')
    res.send(fullHtml)
  } catch (error) {
    console.error('Error generating template preview:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Template not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

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

// @route   POST /api/templates
// @desc    Create a new template
// @access  Public
router.post('/', [
  body('name').notEmpty().withMessage('Template name is required'),
  body('description').notEmpty().withMessage('Template description is required'),
  body('category').isIn(['Professional', 'Creative', 'Minimalist', 'Modern', 'Classic', 'Executive']).withMessage('Invalid category'),
  body('thumbnail').notEmpty().withMessage('Thumbnail is required'),
  body('preview').notEmpty().withMessage('Preview is required'),
  body('renderEngine').isIn(['html', 'builder', 'canvas', 'jsx']).withMessage('Invalid render engine')
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.error('Template validation failed:', errors.array())
    return res.status(400).json({ 
      message: 'Template validation failed',
      errors: errors.array() 
    })
  }

  try {
    console.log('Creating template with data:', {
      name: req.body.name,
      renderEngine: req.body.renderEngine,
      hasCanvasData: !!req.body.canvasData,
      hasBuilderData: !!req.body.builderData
    });

    const template = new Template(req.body)
    await template.save()
    
    console.log('Template created successfully:', template._id);
    res.status(201).json({
      message: 'Template created successfully',
      template
    })
  } catch (error) {
    console.error('Template creation error:', error)
    res.status(500).json({ message: 'Failed to create template' })
  }
})

// @route   DELETE /api/templates
// @desc    Delete all templates
// @access  Public
router.delete('/', async (req, res) => {
  try {
    const result = await Template.deleteMany({})
    
    res.json({
      message: `Deleted ${result.deletedCount} templates successfully`,
      deletedCount: result.deletedCount
    })
  } catch (error) {
    console.error('Error deleting templates:', error)
    res.status(500).json({ message: 'Failed to delete templates' })
  }
})

// Save demo resume template
router.post('/save-demo', async (req, res) => {
  try {
    console.log('📝 Save demo template endpoint called');
    
    // Delete all existing templates first
    console.log('🗑️ Deleting all existing templates...');
    await Template.deleteMany({});
    console.log('🗑️ Deleted all existing templates');

    // Demo resume data
    const demoResumeData = {
      version: "5.3.0",
      objects: [
        // Header Section
        { type: "text", left: 50, top: 30, width: 700, height: 50, fill: "#1a1a1a", text: "JOHN SMITH", fontSize: 36, fontWeight: "bold", fontFamily: "Arial", id: "name" },
        { type: "text", left: 50, top: 80, width: 700, height: 30, fill: "#333333", text: "Senior Software Engineer", fontSize: 20, fontFamily: "Arial", id: "title" },
        
        // Contact Information
        { type: "text", left: 50, top: 120, width: 200, height: 20, fill: "#555555", text: "john.smith@email.com", fontSize: 12, fontFamily: "Arial", id: "email" },
        { type: "text", left: 270, top: 120, width: 200, height: 20, fill: "#555555", text: "(555) 123-4567", fontSize: 12, fontFamily: "Arial", id: "phone" },
        { type: "text", left: 490, top: 120, width: 200, height: 20, fill: "#555555", text: "San Francisco, CA", fontSize: 12, fontFamily: "Arial", id: "location" },
        { type: "text", left: 50, top: 140, width: 200, height: 20, fill: "#555555", text: "linkedin.com/in/johnsmith", fontSize: 12, fontFamily: "Arial", id: "linkedin" },
        { type: "text", left: 270, top: 140, width: 200, height: 20, fill: "#555555", text: "github.com/johnsmith", fontSize: 12, fontFamily: "Arial", id: "github" },
        
        // Professional Summary
        { type: "text", left: 50, top: 180, width: 700, height: 30, fill: "#1a1a1a", text: "PROFESSIONAL SUMMARY", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "summary_header" },
        { type: "text", left: 50, top: 210, width: 700, height: 60, fill: "#333333", text: "Experienced software engineer with 8+ years of expertise in full-stack development, cloud architecture, and team leadership. Proven track record of delivering scalable solutions and mentoring junior developers.", fontSize: 12, fontFamily: "Arial", id: "summary_text" },
        
        // Technical Skills
        { type: "text", left: 50, top: 290, width: 700, height: 30, fill: "#1a1a1a", text: "TECHNICAL SKILLS", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "skills_header" },
        { type: "text", left: 50, top: 320, width: 700, height: 40, fill: "#333333", text: "Languages: JavaScript, TypeScript, Python, Java, Go, SQL", fontSize: 12, fontFamily: "Arial", id: "skills_languages" },
        { type: "text", left: 50, top: 340, width: 700, height: 40, fill: "#333333", text: "Frameworks: React, Node.js, Express, Django, Spring Boot, Next.js", fontSize: 12, fontFamily: "Arial", id: "skills_frameworks" },
        { type: "text", left: 50, top: 360, width: 700, height: 40, fill: "#333333", text: "Cloud & Tools: AWS, Docker, Kubernetes, Git, Jenkins, MongoDB, PostgreSQL", fontSize: 12, fontFamily: "Arial", id: "skills_tools" },
        
        // Professional Experience
        { type: "text", left: 50, top: 420, width: 700, height: 30, fill: "#1a1a1a", text: "PROFESSIONAL EXPERIENCE", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "experience_header" },
        
        // Job 1
        { type: "text", left: 50, top: 450, width: 500, height: 20, fill: "#1a1a1a", text: "Senior Software Engineer", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "job1_title" },
        { type: "text", left: 560, top: 450, width: 150, height: 20, fill: "#555555", text: "2021 - Present", fontSize: 12, fontFamily: "Arial", id: "job1_dates" },
        { type: "text", left: 50, top: 470, width: 700, height: 20, fill: "#333333", text: "TechCorp Inc. | San Francisco, CA", fontSize: 12, fontFamily: "Arial", id: "job1_company" },
        { type: "text", left: 50, top: 490, width: 700, height: 40, fill: "#333333", text: "• Led development of microservices architecture serving 1M+ users", fontSize: 11, fontFamily: "Arial", id: "job1_bullet1" },
        { type: "text", left: 50, top: 510, width: 700, height: 40, fill: "#333333", text: "• Mentored 5 junior developers and improved team productivity by 40%", fontSize: 11, fontFamily: "Arial", id: "job1_bullet2" },
        { type: "text", left: 50, top: 530, width: 700, height: 40, fill: "#333333", text: "• Implemented CI/CD pipelines reducing deployment time by 60%", fontSize: 11, fontFamily: "Arial", id: "job1_bullet3" },
        
        // Job 2
        { type: "text", left: 50, top: 580, width: 500, height: 20, fill: "#1a1a1a", text: "Software Engineer", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "job2_title" },
        { type: "text", left: 560, top: 580, width: 150, height: 20, fill: "#555555", text: "2019 - 2021", fontSize: 12, fontFamily: "Arial", id: "job2_dates" },
        { type: "text", left: 50, top: 600, width: 700, height: 20, fill: "#333333", text: "StartupXYZ | San Francisco, CA", fontSize: 12, fontFamily: "Arial", id: "job2_company" },
        { type: "text", left: 50, top: 620, width: 700, height: 40, fill: "#333333", text: "• Built scalable web applications using React and Node.js", fontSize: 11, fontFamily: "Arial", id: "job2_bullet1" },
        { type: "text", left: 50, top: 640, width: 700, height: 40, fill: "#333333", text: "• Designed and implemented RESTful APIs handling 100K+ requests/day", fontSize: 11, fontFamily: "Arial", id: "job2_bullet2" },
        { type: "text", left: 50, top: 660, width: 700, height: 40, fill: "#333333", text: "• Collaborated with cross-functional teams to deliver features on time", fontSize: 11, fontFamily: "Arial", id: "job2_bullet3" },
        
        // Education
        { type: "text", left: 50, top: 720, width: 700, height: 30, fill: "#1a1a1a", text: "EDUCATION", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "education_header" },
        { type: "text", left: 50, top: 750, width: 500, height: 20, fill: "#1a1a1a", text: "Bachelor of Science in Computer Science", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "degree" },
        { type: "text", left: 560, top: 750, width: 150, height: 20, fill: "#555555", text: "2015 - 2019", fontSize: 12, fontFamily: "Arial", id: "education_dates" },
        { type: "text", left: 50, top: 770, width: 700, height: 20, fill: "#333333", text: "University of California, Berkeley | Berkeley, CA", fontSize: 12, fontFamily: "Arial", id: "university" },
        { type: "text", left: 50, top: 790, width: 700, height: 20, fill: "#333333", text: "GPA: 3.8/4.0 | Magna Cum Laude", fontSize: 12, fontFamily: "Arial", id: "gpa" },
        
        // Certifications
        { type: "text", left: 50, top: 830, width: 700, height: 30, fill: "#1a1a1a", text: "CERTIFICATIONS", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "certifications_header" },
        { type: "text", left: 50, top: 860, width: 700, height: 20, fill: "#333333", text: "AWS Certified Solutions Architect - Professional (2023)", fontSize: 12, fontFamily: "Arial", id: "cert1" },
        { type: "text", left: 50, top: 880, width: 700, height: 20, fill: "#333333", text: "Google Cloud Professional Cloud Architect (2022)", fontSize: 12, fontFamily: "Arial", id: "cert2" },
        { type: "text", left: 50, top: 900, width: 700, height: 20, fill: "#333333", text: "Certified Kubernetes Administrator (CKA) (2021)", fontSize: 12, fontFamily: "Arial", id: "cert3" }
      ]
    };

    // Create demo resume template
    console.log('💾 Creating demo resume template...');
    const demoResumeTemplate = new Template({
      name: "Professional Software Engineer Resume",
      description: "Complete professional resume template with all sections including contact info, summary, skills, experience, education, and certifications",
      category: "Professional",
      thumbnail: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", // Placeholder thumbnail
      preview: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", // Placeholder preview
      renderEngine: "canvas",
      isActive: true,
      isPremium: false,
      isPopular: true,
      isNewTemplate: true,
      tags: ["professional", "software-engineer", "complete", "demo"],
      metadata: {
        colorScheme: "light",
        layout: "single-column",
        complexity: "complex",
        sections: ["header", "summary", "skills", "experience", "education", "certifications"]
      },
      canvasData: demoResumeData
    });

    console.log('💾 Saving template to database...');
    await demoResumeTemplate.save();
    console.log('✅ Demo resume template saved successfully!');
    console.log('📋 Template ID:', demoResumeTemplate._id);

    res.json({
      success: true,
      message: 'Demo resume template saved successfully',
      template: {
        id: demoResumeTemplate._id,
        name: demoResumeTemplate.name,
        objectsCount: demoResumeTemplate.canvasData.objects.length
      }
    });

  } catch (error) {
    console.error('❌ Error saving demo template:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save demo template',
      error: error.message,
      details: error.stack
    });
  }
});

// @route   GET /api/templates/thumbnail/:templateId
// @desc    Proxy endpoint to serve template thumbnails (handles S3/CORS issues)
// @access  Public
router.get('/thumbnail/:templateId', async (req, res) => {
  try {
    const template = await Template.findById(req.params.templateId).select('thumbnail name');
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    if (!template.thumbnail) {
      return res.status(404).json({ error: 'Template thumbnail not found' });
    }

    // If thumbnail is a URL, try to proxy it
    if (template.thumbnail.startsWith('http://') || template.thumbnail.startsWith('https://')) {
      // Check if it's an S3 URL and we have AWS credentials
      const isS3Url = template.thumbnail.includes('s3.') || template.thumbnail.includes('s3.amazonaws.com') || template.thumbnail.includes('amazonaws.com');
      
      if (isS3Url && s3Client) {
        try {
          // Extract bucket and key from S3 URL
          // Format: https://bucket.s3.region.amazonaws.com/key or https://s3.region.amazonaws.com/bucket/key
          const url = new URL(template.thumbnail);
          let bucket, key;
          
          if (url.hostname.includes('.s3.')) {
            // Format: bucket.s3.region.amazonaws.com (e.g., cvgenixbucket.s3.ca-central-1.amazonaws.com)
            bucket = url.hostname.split('.')[0];
            key = url.pathname.substring(1); // Remove leading slash
          } else if (url.hostname.startsWith('s3.')) {
            // Format: s3.region.amazonaws.com/bucket/key
            const parts = url.pathname.substring(1).split('/');
            bucket = parts[0];
            key = parts.slice(1).join('/');
          } else {
            throw new Error('Unable to parse S3 URL');
          }
          
          if (!GetObjectCommand) {
            throw new Error('AWS SDK not available');
          }
          const command = new GetObjectCommand({ Bucket: bucket, Key: key });
          const response = await s3Client.send(command);
          
          // Set appropriate headers including CORS
          res.setHeader('Content-Type', response.ContentType || 'image/png');
          res.setHeader('Cache-Control', 'public, max-age=31536000');
          res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
          res.setHeader('Access-Control-Allow-Methods', 'GET');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          if (response.ContentLength) {
            res.setHeader('Content-Length', response.ContentLength);
          }
          
          // AWS SDK v3 returns Body as a Readable stream
          // Handle stream errors
          response.Body.on('error', (err) => {
            console.error(`[Thumbnail Proxy] Stream error:`, err);
            if (!res.headersSent) {
              res.status(500).json({ error: 'Failed to stream image' });
            } else {
              res.end();
            }
          });
          
          // Handle response errors
          res.on('error', (err) => {
            console.error(`[Thumbnail Proxy] Response error:`, err);
          });
          
          // Handle stream end
          response.Body.on('end', () => {
            // Stream completed successfully
          });
          
          // Pipe the stream to response
          response.Body.pipe(res);
          return;
        } catch (s3Error) {
          console.error(`[Thumbnail Proxy] S3 error for ${template.name}:`, s3Error.message);
          console.error(`[Thumbnail Proxy] S3 error stack:`, s3Error.stack);
          // Fall through to try axios as fallback
        }
      }
      
      // Fallback: Try axios for non-S3 URLs or if S3 fails
      try {
        const imageResponse = await axios.get(template.thumbnail, {
          responseType: 'stream',
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0'
          },
          validateStatus: function (status) {
            return status >= 200 && status < 400; // Accept 2xx and 3xx
          }
        });
        
        // Set appropriate content type and CORS headers
        const contentType = imageResponse.headers['content-type'] || 'image/png';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        imageResponse.data.pipe(res);
      } catch (proxyError) {
        console.error(`[Thumbnail Proxy] Error fetching thumbnail for ${template.name}:`, proxyError.message);
        console.error(`[Thumbnail Proxy] Error details:`, proxyError.response?.status, proxyError.response?.statusText);
        // If proxy fails, redirect to the original URL (browser will try to load it)
        return res.redirect(template.thumbnail);
      }
    } else if (template.thumbnail.startsWith('data:image')) {
      // If it's a base64 image, decode and serve it
      const base64Data = template.thumbnail.split(',')[1];
      const imageBuffer = Buffer.from(base64Data, 'base64');
      const contentType = template.thumbnail.match(/data:image\/([^;]+)/)?.[1] || 'png';
      
      res.setHeader('Content-Type', `image/${contentType}`);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.send(imageBuffer);
    } else {
      return res.status(400).json({ error: 'Invalid thumbnail format' });
    }
  } catch (error) {
    console.error('[Thumbnail Proxy] Error:', error);
    res.status(500).json({ error: 'Failed to serve thumbnail' });
  }
});

module.exports = router;
