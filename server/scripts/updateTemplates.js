const mongoose = require('mongoose');
const Template = require('../models/Template');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const updateTemplates = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume4me');
    console.log('📦 Connected to MongoDB');

    // Get available HTML templates
    const templatesPath = path.join(__dirname, '../templates/resume');
    const templateFiles = fs.readdirSync(templatesPath).filter(file => file.endsWith('.html'));

    console.log(`📄 Found ${templateFiles.length} template files`);

    for (const file of templateFiles) {
      const templateId = file.replace('.html', '');
      const templatePath = path.join(templatesPath, file);
      const htmlContent = fs.readFileSync(templatePath, 'utf8');

      // Extract CSS from HTML
      const cssMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
      const css = cssMatch ? cssMatch[1] : '';

      // Remove style tags from HTML for cleaner storage
      const cleanHtml = htmlContent.replace(/<style>[\s\S]*?<\/style>/, '');

      // Template configuration based on template ID
      const templateConfig = getTemplateConfig(templateId);

      // Check if template exists
      let template = await Template.findOne({ name: templateConfig.name });

      if (template) {
        // Update existing template
        template.html = cleanHtml;
        template.css = css;
        template.config = templateConfig.config;
        template.thumbnail = templateConfig.thumbnail;
        template.preview = templateConfig.preview;
        await template.save();
        console.log(`✅ Updated template: ${templateConfig.name}`);
      } else {
        // Create new template
        template = new Template({
          name: templateConfig.name,
          description: templateConfig.description,
          category: templateConfig.category,
          tags: templateConfig.tags,
          thumbnail: templateConfig.thumbnail,
          preview: templateConfig.preview,
          html: cleanHtml,
          css: css,
          config: templateConfig.config,
          isPremium: templateConfig.isPremium,
          isActive: true,
          isPopular: templateConfig.isPopular,
          isNewTemplate: templateConfig.isNewTemplate,
          usageCount: 0,
          rating: { average: 0, count: 0 }
        });
        await template.save();
        console.log(`✅ Created template: ${templateConfig.name}`);
      }
    }

    console.log('\n🎉 Template update completed successfully!');

  } catch (error) {
    console.error('❌ Template update failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
    process.exit(0);
  }
};

const getTemplateConfig = (templateId) => {
  const configs = {
    'professional-classic': {
      name: 'Professional Classic',
      description: 'A clean and professional template perfect for corporate environments',
      category: 'Professional',
      tags: ['corporate', 'clean', 'professional', 'ats-friendly'],
      thumbnail: 'https://via.placeholder.com/300x400/3B82F6/FFFFFF?text=Professional+Classic',
      preview: 'https://via.placeholder.com/800x600/3B82F6/FFFFFF?text=Professional+Classic+Preview',
      isPremium: false,
      isPopular: true,
      isNewTemplate: false,
      config: {
        sections: [
          { name: 'personalInfo', required: true, order: 1 },
          { name: 'about', required: false, order: 2 },
          { name: 'experience', required: true, order: 3 },
          { name: 'education', required: true, order: 4 },
          { name: 'skills', required: true, order: 5 },
          { name: 'projects', required: false, order: 6 },
          { name: 'certifications', required: false, order: 7 },
          { name: 'languages', required: false, order: 8 }
        ],
        colors: {
          primary: '#2c3e50',
          secondary: '#34495e',
          accent: '#3498db'
        },
        fonts: {
          heading: 'Arial',
          body: 'Arial'
        },
        spacing: 'normal'
      }
    },
    'modern-clean': {
      name: 'Modern Clean',
      description: 'A modern template with gradient header and clean layout',
      category: 'Modern',
      tags: ['modern', 'clean', 'gradient', 'contemporary'],
      thumbnail: 'https://via.placeholder.com/300x400/667eea/FFFFFF?text=Modern+Clean',
      preview: 'https://via.placeholder.com/800x600/667eea/FFFFFF?text=Modern+Clean+Preview',
      isPremium: true,
      isPopular: true,
      isNewTemplate: true,
      config: {
        sections: [
          { name: 'personalInfo', required: true, order: 1 },
          { name: 'about', required: false, order: 2 },
          { name: 'experience', required: true, order: 3 },
          { name: 'education', required: true, order: 4 },
          { name: 'skills', required: true, order: 5 },
          { name: 'projects', required: false, order: 6 },
          { name: 'certifications', required: false, order: 7 },
          { name: 'languages', required: false, order: 8 }
        ],
        colors: {
          primary: '#667eea',
          secondary: '#764ba2',
          accent: '#f093fb'
        },
        fonts: {
          heading: 'Segoe UI',
          body: 'Segoe UI'
        },
        spacing: 'normal'
      }
    }
  };

  return configs[templateId] || {
    name: templateId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: `A ${templateId} template`,
    category: 'Professional',
    tags: [templateId],
    thumbnail: 'https://via.placeholder.com/300x400/6B7280/FFFFFF?text=Template',
    preview: 'https://via.placeholder.com/800x600/6B7280/FFFFFF?text=Template+Preview',
    isPremium: false,
    isPopular: false,
    isNewTemplate: false,
    config: {
      sections: [
        { name: 'personalInfo', required: true, order: 1 },
        { name: 'experience', required: true, order: 2 },
        { name: 'education', required: true, order: 3 },
        { name: 'skills', required: true, order: 4 }
      ],
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        accent: '#10B981'
      },
      fonts: {
        heading: 'Arial',
        body: 'Arial'
      },
      spacing: 'normal'
    }
  };
};

updateTemplates();
