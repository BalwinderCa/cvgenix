const mongoose = require('mongoose');
const Template = require('../models/Template');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

// Sample data for updating templates
const templateUpdates = [
  {
    name: 'Modern Clean',
    updates: {
      atsScore: 98,
      industry: ['Technology', 'Marketing', 'Design'],
      features: [
        'ATS Optimized',
        'Clean Typography',
        'Modern Layout',
        'Color Customizable',
        'Mobile Responsive'
      ],
      metadata: {
        colorScheme: 'light',
        layout: 'single-column',
        complexity: 'simple'
      }
    }
  },
  {
    name: 'Professional Classic',
    updates: {
      atsScore: 96,
      industry: ['Finance', 'Consulting', 'Corporate'],
      features: [
        'Professional Design',
        'Traditional Layout',
        'High ATS Score',
        'Executive Ready',
        'Print Optimized'
      ],
      metadata: {
        colorScheme: 'light',
        layout: 'two-column',
        complexity: 'moderate'
      }
    }
  },
  {
    name: 'Creative Modern',
    updates: {
      atsScore: 92,
      industry: ['Creative', 'Design', 'Marketing'],
      features: [
        'Creative Layout',
        'Visual Elements',
        'Portfolio Ready',
        'Colorful Design',
        'Unique Style'
      ],
      metadata: {
        colorScheme: 'colorful',
        layout: 'hybrid',
        complexity: 'complex'
      }
    }
  },
  {
    name: 'Minimalist',
    updates: {
      atsScore: 94,
      industry: ['Technology', 'Startup', 'Consulting'],
      features: [
        'Minimal Design',
        'Clean Layout',
        'Focus on Content',
        'Modern Typography',
        'ATS Friendly'
      ],
      metadata: {
        colorScheme: 'light',
        layout: 'single-column',
        complexity: 'simple'
      }
    }
  },
  {
    name: 'Executive',
    updates: {
      atsScore: 97,
      industry: ['Executive', 'Management', 'Corporate'],
      features: [
        'Executive Design',
        'Professional Layout',
        'High-End Styling',
        'Leadership Focus',
        'Premium Quality'
      ],
      metadata: {
        colorScheme: 'dark',
        layout: 'two-column',
        complexity: 'moderate'
      }
    }
  }
];

async function updateTemplateFields() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-builder');
    console.log('✅ Connected to MongoDB');

    // Update each template
    for (const templateUpdate of templateUpdates) {
      const template = await Template.findOne({ name: templateUpdate.name });
      
      if (template) {
        // Update the template with new fields
        Object.assign(template, templateUpdate.updates);
        
        // Set default values for new fields if they don't exist
        if (!template.compatibility?.atsScore) {
          if (!template.compatibility) template.compatibility = {};
          template.compatibility.atsScore = templateUpdate.updates.atsScore || 95;
        }
        if (!template.industry) template.industry = ['General'];
        if (!template.features) template.features = ['Professional Design'];
        if (!template.downloadCount) template.downloadCount = 0;
        if (!template.metadata) {
          template.metadata = {
            colorScheme: 'light',
            layout: 'single-column',
            complexity: 'moderate'
          };
        }
        
        await template.save();
        console.log(`✅ Updated template: ${template.name}`);
      } else {
        console.log(`❌ Template not found: ${templateUpdate.name}`);
      }
    }

    // Add some sample preview images
    const templates = await Template.find({});
    for (const template of templates) {
      if (!template.previewImages || template.previewImages.length === 0) {
        template.previewImages = [
          `/assets/images/templates/${template.name.toLowerCase().replace(/\s+/g, '-')}-preview-1.jpg`,
          `/assets/images/templates/${template.name.toLowerCase().replace(/\s+/g, '-')}-preview-2.jpg`
        ];
        await template.save();
        console.log(`✅ Added preview images for: ${template.name}`);
      }
    }

    console.log('🎉 Template fields update completed successfully!');
    
    // Display updated templates
    const updatedTemplates = await Template.find({}).select('name compatibility.atsScore industry features metadata');
    console.log('\n📊 Updated Templates:');
    updatedTemplates.forEach(template => {
      console.log(`\n📄 ${template.name}:`);
      console.log(`   ATS Score: ${template.compatibility?.atsScore || 'N/A'}%`);
      console.log(`   Industries: ${template.industry?.join(', ') || 'N/A'}`);
      console.log(`   Features: ${template.features?.slice(0, 3).join(', ') || 'N/A'}...`);
      console.log(`   Layout: ${template.metadata?.layout || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Error updating template fields:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the update
updateTemplateFields();
