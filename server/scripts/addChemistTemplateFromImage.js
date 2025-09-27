const mongoose = require('mongoose');
const Template = require('../models/Template');
require('dotenv').config({ path: '../.env' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

async function addChemistTemplate() {
  try {
    await connectDB();

    // Create the template data matching the design shown
    const templateData = {
      name: 'Chemist Professional',
      description: 'A clean, professional resume template designed specifically for chemistry professionals',
      category: 'Professional',
      tags: ['chemistry', 'science', 'professional', 'academic', 'clean'],
      thumbnail: '/templates/chemist-thumbnail.png',
      preview: '/templates/chemist-preview.png',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Emma Ahearn - Resume</title>
</head>
<body style="margin: 0; padding: 40px; font-family: 'Times New Roman', serif; line-height: 1.5; color: #333; background: #fff; max-width: 800px; margin: 0 auto;">
    <div style="background: #fff;">
        <!-- Header -->
        <header style="text-align: center; margin-bottom: 30px; padding-bottom: 20px;">
            <h1 style="font-size: 2.5rem; font-weight: normal; color: #333; margin-bottom: 8px; margin: 0 0 8px 0;">Emma Ahearn</h1>
            <div style="font-size: 1.1rem; color: #333; font-weight: normal; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">CHEMIST</div>
            <div style="width: 100%; height: 1px; background: #333; margin: 20px 0;"></div>
            
            <!-- Contact Information -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; font-size: 0.9rem; color: #333; margin-bottom: 20px; text-align: center;">
                <div style="text-align: center;">
                    <div style="font-weight: bold; color: #333;">Phone:</div>
                    <div>+123-456-7890</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-weight: bold; color: #333;">Email:</div>
                    <div>hello@reallygreatsite.com</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-weight: bold; color: #333;">Address:</div>
                    <div>123 Anywhere St., Any City, ST 12345</div>
                </div>
            </div>
        </header>

        <!-- Professional Summary -->
        <section style="margin-bottom: 25px;">
            <h2 style="font-size: 1rem; font-weight: bold; color: #333; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #333; margin: 0 0 15px 0;">Professional Summary</h2>
            <p style="font-size: 0.9rem; line-height: 1.6; color: #333; text-align: justify; font-style: italic; margin: 0;">I am a chemistry graduate seeking to apply my extensive academic background and laboratory experience in an organization with an innovative vision. I am looking forward to contributing to a dynamic team and supporting research and development efforts.</p>
        </section>

        <!-- Education -->
        <section style="margin-bottom: 25px;">
            <h2 style="font-size: 1rem; font-weight: bold; color: #333; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #333; margin: 0 0 15px 0;">Education</h2>
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px;">
                    <span style="font-weight: bold; color: #333; font-size: 0.9rem;">Bachelor of Science in Chemistry</span>
                    <span style="color: #333; font-size: 0.9rem;">2026-2030</span>
                </div>
                <div style="color: #333; font-style: italic; margin-bottom: 8px; font-size: 0.9rem;">East State University, Valley City</div>
                <div style="font-size: 0.85rem; color: #333; margin-bottom: 5px;">• Relevant Coursework: Organic Chemistry, Inorganic Chemistry, Physical Chemistry, Analytical Chemistry, Chemical Engineering Principles, Thermodynamics, Material Science</div>
                <div style="font-size: 0.85rem; color: #333; font-weight: bold;">• GPA: 3.8</div>
            </div>
        </section>

        <!-- Research Experience -->
        <section style="margin-bottom: 25px;">
            <h2 style="font-size: 1rem; font-weight: bold; color: #333; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #333; margin: 0 0 15px 0;">Research Experience</h2>
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px;">
                    <span style="font-weight: bold; color: #333; font-size: 0.9rem;">Undergraduate Research Assistant</span>
                    <span style="color: #333; font-size: 0.9rem;">2029-2030</span>
                </div>
                <div style="color: #333; font-style: italic; margin-bottom: 8px; font-size: 0.9rem;">Chemistry Department of East State University</div>
                <ul style="list-style: none; padding-left: 0; margin: 0;">
                    <li style="font-size: 0.85rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Collaborated with a research team to study the synthesis of novel organic compounds</li>
                    <li style="font-size: 0.85rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Conducted experiments using chromatography, spectroscopy, and other analytical techniques</li>
                    <li style="font-size: 0.85rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Analyzed and interpreted data, contributing to a research paper submitted for publication</li>
                </ul>
            </div>
        </section>

        <!-- Projects -->
        <section style="margin-bottom: 25px;">
            <h2 style="font-size: 1rem; font-weight: bold; color: #333; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #333; margin: 0 0 15px 0;">Projects</h2>
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px;">
                    <span style="font-weight: bold; color: #333; font-size: 0.9rem;">Fabrication of a Miniature Chemical Reactor</span>
                </div>
                <div style="color: #333; font-style: italic; margin-bottom: 8px; font-size: 0.9rem;">Chemical Engineering Course, Second Semester of 2028</div>
                <ul style="list-style: none; padding-left: 0; margin: 0;">
                    <li style="font-size: 0.85rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Engineered a small-scale chemical reactor using principles of chemical engineering</li>
                    <li style="font-size: 0.85rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Conducted performance tests and optimization checks to ensure efficiency and safety</li>
                    <li style="font-size: 0.85rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Presented findings to faculty and peers and received excellent marks for innovation</li>
                </ul>
            </div>
            
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px;">
                    <span style="font-weight: bold; color: #333; font-size: 0.9rem;">The Green Thumb Chemist</span>
                </div>
                <div style="color: #333; font-style: italic; margin-bottom: 8px; font-size: 0.9rem;">Chemistry Club, First Semester of 2029</div>
                <ul style="list-style: none; padding-left: 0; margin: 0;">
                    <li style="font-size: 0.85rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Developed a project aimed at implementing environmentally-friendly lab practices</li>
                    <li style="font-size: 0.85rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Researched and implemented sustainable alternatives to hazardous chemicals</li>
                    <li style="font-size: 0.85rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Educated peers on the importance of green chemistry through workshops and forums</li>
                </ul>
            </div>
        </section>

        <!-- Notable Awards -->
        <section style="margin-bottom: 25px;">
            <h2 style="font-size: 1rem; font-weight: bold; color: #333; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #333; margin: 0 0 15px 0;">Notable Awards</h2>
            <ul style="list-style: none; padding-left: 0; margin: 0;">
                <li style="font-size: 0.85rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Dean's List, East State University, 2026-2030</li>
                <li style="font-size: 0.85rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Gold Award, Chemistry Olympiad, 2027</li>
            </ul>
        </section>
    </div>
</body>
</html>`,
      css: `/* Minimal CSS - styles are inline */`,
      isPremium: false,
      isActive: true,
      rating: {
        average: 4.2,
        count: 8
      },
      features: ['ATS-friendly', 'Professional design', 'Academic format', 'Clean layout'],
      downloadCount: 0
    };

    // Check if template already exists
    const existingTemplate = await Template.findOne({ name: templateData.name });
    if (existingTemplate) {
      console.log('⚠️ Template already exists. Updating...');
      await Template.findByIdAndUpdate(existingTemplate._id, templateData);
      console.log('✅ Template updated successfully');
    } else {
      // Create new template
      const template = new Template(templateData);
      await template.save();
      console.log('✅ Template added successfully');
    }

    // Verify the template was added
    const totalTemplates = await Template.countDocuments();
    console.log(`📊 Total templates in database: ${totalTemplates}`);

    const newTemplate = await Template.findOne({ name: templateData.name });
    console.log(`📝 Template details:`);
    console.log(`   Name: ${newTemplate.name}`);
    console.log(`   Category: ${newTemplate.category}`);
    console.log(`   Active: ${newTemplate.isActive}`);
    console.log(`   Premium: ${newTemplate.isPremium}`);
    console.log(`   ID: ${newTemplate._id}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

addChemistTemplate();
