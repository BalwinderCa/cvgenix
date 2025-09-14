const User = require('../models/User');
const Resume = require('../models/Resume');
const Template = require('../models/Template');

class DashboardService {
  constructor() {
    this.analyticsCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Get user dashboard overview
  async getUserDashboard(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Get user's resumes with template info
      const resumes = await Resume.find({ user: userId })
        .populate('template', 'name category thumbnail')
        .sort({ updatedAt: -1 })
        .limit(10);

      // Get user statistics
      const stats = await this.getUserStats(userId);

      // Get recent activity
      const recentActivity = await this.getRecentActivity(userId);

      // Get template recommendations
      const recommendations = await this.getTemplateRecommendations(userId);

      return {
        success: true,
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar,
            credits: user.credits,
            role: user.role,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
          },
          resumes: resumes.map(resume => ({
            id: resume._id,
            title: `${resume.personalInfo.firstName} ${resume.personalInfo.lastName} - Resume`,
            template: resume.template,
            isPublic: resume.isPublic,
            createdAt: resume.createdAt,
            updatedAt: resume.updatedAt,
            lastModified: resume.lastModified
          })),
          stats,
          recentActivity,
          recommendations
        }
      };
    } catch (error) {
      console.error('Dashboard service error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user statistics
  async getUserStats(userId) {
    try {
      const cacheKey = `stats_${userId}`;
      const cached = this.analyticsCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      const [
        totalResumes,
        publicResumes,
        totalTemplates,
        recentResumes
      ] = await Promise.all([
        Resume.countDocuments({ user: userId }),
        Resume.countDocuments({ user: userId, isPublic: true }),
        Template.countDocuments({ isActive: true }),
        Resume.countDocuments({ 
          user: userId, 
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        })
      ]);

      const stats = {
        totalResumes,
        publicResumes,
        privateResumes: totalResumes - publicResumes,
        totalTemplates,
        recentResumes,
        completionRate: totalResumes > 0 ? Math.round((publicResumes / totalResumes) * 100) : 0
      };

      // Cache the results
      this.analyticsCache.set(cacheKey, {
        data: stats,
        timestamp: Date.now()
      });

      return stats;
    } catch (error) {
      console.error('User stats error:', error);
      return {
        totalResumes: 0,
        publicResumes: 0,
        privateResumes: 0,
        totalTemplates: 0,
        recentResumes: 0,
        completionRate: 0
      };
    }
  }

  // Get recent activity
  async getRecentActivity(userId, limit = 10) {
    try {
      const activities = await Resume.find({ user: userId })
        .populate('template', 'name category')
        .sort({ updatedAt: -1 })
        .limit(limit)
        .select('personalInfo template isPublic createdAt updatedAt lastModified');

      return activities.map(resume => ({
        id: resume._id,
        type: 'resume',
        action: resume.updatedAt > resume.createdAt ? 'updated' : 'created',
        title: `${resume.personalInfo.firstName} ${resume.personalInfo.lastName} Resume`,
        template: resume.template,
        timestamp: resume.updatedAt,
        isPublic: resume.isPublic
      }));
    } catch (error) {
      console.error('Recent activity error:', error);
      return [];
    }
  }

  // Get template recommendations based on user's resume history
  async getTemplateRecommendations(userId) {
    try {
      // Get user's most used template categories
      const userResumes = await Resume.find({ user: userId })
        .populate('template', 'category')
        .select('template');

      const categoryCounts = {};
      userResumes.forEach(resume => {
        if (resume.template && resume.template.category) {
          categoryCounts[resume.template.category] = (categoryCounts[resume.template.category] || 0) + 1;
        }
      });

      // Get popular templates in user's preferred categories
      const preferredCategories = Object.keys(categoryCounts).sort((a, b) => 
        categoryCounts[b] - categoryCounts[a]
      ).slice(0, 2);

      let recommendations = [];
      
      if (preferredCategories.length > 0) {
        recommendations = await Template.find({
          category: { $in: preferredCategories },
          isActive: true,
          isPopular: true
        })
        .select('name description category thumbnail tags isPremium rating usageCount')
        .sort({ rating: -1, usageCount: -1 })
        .limit(4);
      } else {
        // If no history, recommend popular templates
        recommendations = await Template.find({
          isActive: true,
          isPopular: true
        })
        .select('name description category thumbnail tags isPremium rating usageCount')
        .sort({ rating: -1, usageCount: -1 })
        .limit(4);
      }

      return recommendations.map(template => ({
        id: template._id,
        name: template.name,
        description: template.description,
        category: template.category,
        thumbnail: template.thumbnail,
        tags: template.tags,
        isPremium: template.isPremium,
        rating: template.rating,
        usageCount: template.usageCount
      }));
    } catch (error) {
      console.error('Template recommendations error:', error);
      return [];
    }
  }

  // Get user's resume analytics
  async getResumeAnalytics(userId, resumeId = null) {
    try {
      const filter = { user: userId };
      if (resumeId) {
        filter._id = resumeId;
      }

      const resumes = await Resume.find(filter)
        .populate('template', 'name category')
        .select('personalInfo template isPublic createdAt updatedAt lastModified');

      const analytics = {
        totalResumes: resumes.length,
        categories: {},
        templates: {},
        monthlyStats: {},
        completionStats: {
          complete: 0,
          incomplete: 0
        }
      };

      // Analyze by category and template
      resumes.forEach(resume => {
        if (resume.template) {
          const category = resume.template.category;
          const templateName = resume.template.name;
          
          analytics.categories[category] = (analytics.categories[category] || 0) + 1;
          analytics.templates[templateName] = (analytics.templates[templateName] || 0) + 1;
        }

        // Check completion status
        const hasRequiredFields = resume.personalInfo.firstName && 
                                 resume.personalInfo.lastName && 
                                 resume.personalInfo.email &&
                                 (resume.experience.length > 0 || resume.education.length > 0);
        
        if (hasRequiredFields) {
          analytics.completionStats.complete++;
        } else {
          analytics.completionStats.incomplete++;
        }

        // Monthly stats
        const month = resume.createdAt.toISOString().substring(0, 7); // YYYY-MM
        analytics.monthlyStats[month] = (analytics.monthlyStats[month] || 0) + 1;
      });

      return {
        success: true,
        data: analytics
      };
    } catch (error) {
      console.error('Resume analytics error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user preferences
  async getUserPreferences(userId) {
    try {
      const user = await User.findById(userId).select('preferences');
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      return {
        success: true,
        data: user.preferences || {
          emailNotifications: true,
          marketingEmails: false,
          theme: 'light',
          language: 'en',
          timezone: 'UTC'
        }
      };
    } catch (error) {
      console.error('User preferences error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update user preferences
  async updateUserPreferences(userId, preferences) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { preferences },
        { new: true, runValidators: true }
      ).select('preferences');

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      return {
        success: true,
        data: user.preferences
      };
    } catch (error) {
      console.error('Update preferences error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's resume management data
  async getResumeManagement(userId, page = 1, limit = 10, sortBy = 'updatedAt', sortOrder = 'desc') {
    try {
      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const [resumes, total] = await Promise.all([
        Resume.find({ user: userId })
          .populate('template', 'name category thumbnail')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .select('personalInfo template isPublic createdAt updatedAt lastModified'),
        Resume.countDocuments({ user: userId })
      ]);

      const resumeData = resumes.map(resume => ({
        id: resume._id,
        title: `${resume.personalInfo.firstName} ${resume.personalInfo.lastName} - Resume`,
        template: resume.template,
        isPublic: resume.isPublic,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
        lastModified: resume.lastModified,
        completion: this.calculateResumeCompletion(resume)
      }));

      return {
        success: true,
        data: {
          resumes: resumeData,
          pagination: {
            current: page,
            total: Math.ceil(total / limit),
            hasNext: skip + resumes.length < total,
            hasPrev: page > 1,
            totalResumes: total
          }
        }
      };
    } catch (error) {
      console.error('Resume management error:', error);
      return { success: false, error: error.message };
    }
  }

  // Calculate resume completion percentage
  calculateResumeCompletion(resume) {
    const fields = [
      'personalInfo.firstName',
      'personalInfo.lastName',
      'personalInfo.email',
      'personalInfo.phone',
      'personalInfo.about',
      'experience',
      'education',
      'skills'
    ];

    let completedFields = 0;
    
    fields.forEach(field => {
      const value = this.getNestedValue(resume, field);
      if (value && (Array.isArray(value) ? value.length > 0 : value.toString().trim())) {
        completedFields++;
      }
    });

    return Math.round((completedFields / fields.length) * 100);
  }

  // Helper to get nested object values
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  // Clear analytics cache
  clearCache(userId = null) {
    if (userId) {
      this.analyticsCache.delete(`stats_${userId}`);
    } else {
      this.analyticsCache.clear();
    }
  }
}

module.exports = new DashboardService();
