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

async function addRealEstateTemplate() {
  try {
    await connectDB();

    // Create the template data matching the Real Estate design
    const templateData = {
      name: 'Real Estate Professional',
      description: 'A modern, professional resume template designed for real estate agents and property professionals',
      category: 'Professional',
      tags: ['real-estate', 'agent', 'professional', 'modern', 'clean'],
      thumbnail: '/templates/realestate-thumbnail.png',
      preview: '/templates/realestate-preview.png',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connor Hamilton - Resume</title>
</head>
<body style="margin: 0; padding: 40px; font-family: 'Arial', sans-serif; line-height: 1.5; color: #333; background: #fff; max-width: 800px; margin: 0 auto;">
    <div style="background: #fff;">
        <!-- Header -->
        <header style="text-align: center; margin-bottom: 30px; padding-bottom: 20px;">
            <div style="border: 3px solid #7b68ee; padding: 15px 30px; margin-bottom: 15px; display: inline-block;">
                <h1 style="font-size: 1.8rem; font-weight: bold; color: #333; letter-spacing: 3px; text-transform: uppercase; margin: 0;">CONNOR HAMILTON</h1>
            </div>
            <div style="font-size: 1rem; color: #333; font-weight: normal; margin-bottom: 20px;">Real Estate Agent</div>
            <div style="font-size: 0.9rem; color: #333; margin-bottom: 20px;">123-456-7890 | hello@reallygreatsite.com | reallygreatsite.com</div>
            <div style="width: 80%; height: 1px; background: #ccc; margin: 20px auto;"></div>
        </header>

        <!-- Profile -->
        <section style="margin-bottom: 25px;">
            <h2 style="font-size: 0.9rem; font-weight: bold; color: #333; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #ccc; margin: 0 0 15px 0;">PROFILE</h2>
            <p style="font-size: 0.85rem; line-height: 1.6; color: #333; text-align: justify; margin: 0;">I am an experienced Real Estate Agent with a passion for helping clients find their dream homes. I have extensive experience in the industry, including more than 5 years working as a real estate agent. I am knowledgeable about the latest market trends and understand the nuances of the real estate market. I pride myself on my ability to negotiate the best deals for my clients and to navigate complex real estate agreements. I am highly organized, detail-oriented, and have strong communication skills.</p>
        </section>

        <!-- Work Experience -->
        <section style="margin-bottom: 25px;">
            <h2 style="font-size: 0.9rem; font-weight: bold; color: #333; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #ccc; margin: 0 0 15px 0;">WORK EXPERIENCE</h2>
            <div style="margin-bottom: 20px;">
                <div style="margin-bottom: 10px;">
                    <div style="font-weight: bold; color: #333; font-size: 0.9rem; margin-bottom: 3px;">Really Great Company</div>
                    <div style="color: #333; font-size: 0.85rem; margin-bottom: 3px;">June 2015 - Present</div>
                    <div style="font-weight: bold; color: #333; font-size: 0.85rem; text-transform: uppercase; margin-bottom: 8px;">REAL ESTATE AGENT</div>
                </div>
                <ul style="list-style: none; padding-left: 0; margin: 0;">
                    <li style="font-size: 0.8rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Negotiate contracts and complex real estate transactions</li>
                    <li style="font-size: 0.8rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Provide excellent customer service to clients</li>
                    <li style="font-size: 0.8rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Update and maintain client files</li>
                    <li style="font-size: 0.8rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Research and monitor the local real estate market</li>
                    <li style="font-size: 0.8rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Develop marketing campaigns for properties</li>
                    <li style="font-size: 0.8rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Utilize social media platforms to market properties</li>
                    <li style="font-size: 0.8rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Participate in open houses and home tours</li>
                </ul>
            </div>
        </section>

        <!-- Education and Skills in two columns -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 25px;">
            <!-- Education -->
            <section style="margin-bottom: 25px;">
                <h2 style="font-size: 0.9rem; font-weight: bold; color: #333; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #ccc; margin: 0 0 15px 0;">EDUCATION</h2>
                <div style="margin-bottom: 10px;">
                    <div style="font-weight: bold; color: #333; font-size: 0.85rem; margin-bottom: 3px;">University</div>
                    <div style="color: #333; font-size: 0.8rem; margin-bottom: 3px;">2010 - 2014</div>
                    <div style="color: #333; font-size: 0.8rem;">B.A. in Business Administration</div>
                </div>
            </section>

            <!-- Skills -->
            <section style="margin-bottom: 25px;">
                <h2 style="font-size: 0.9rem; font-weight: bold; color: #333; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #ccc; margin: 0 0 15px 0;">SKILLS</h2>
                <ul style="list-style: none; padding-left: 0; margin: 0;">
                    <li style="font-size: 0.8rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Knowledge of the local real estate market</li>
                    <li style="font-size: 0.8rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Communication skills</li>
                    <li style="font-size: 0.8rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Negotiation skills</li>
                    <li style="font-size: 0.8rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Problem-solving skills</li>
                    <li style="font-size: 0.8rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Organization and time management skills</li>
                </ul>
            </section>
        </div>

        <!-- Certifications -->
        <section style="margin-bottom: 25px;">
            <h2 style="font-size: 0.9rem; font-weight: bold; color: #333; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #ccc; margin: 0 0 15px 0;">CERTIFICATIONS</h2>
            <ul style="list-style: none; padding-left: 0; margin: 0;">
                <li style="font-size: 0.8rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Licensed Real Estate Agent</li>
                <li style="font-size: 0.8rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Certified Real Estate Negotiator</li>
                <li style="font-size: 0.8rem; color: #333; margin-bottom: 3px; padding-left: 15px; position: relative;">• Top Sales Agent Award 2016</li>
            </ul>
        </section>
    </div>
</body>
</html>`,
      css: `/* Minimal CSS - styles are inline */`,
      isPremium: false,
      isActive: true,
      rating: {
        average: 4.5,
        count: 12
      },
      features: ['Modern design', 'Two-column layout', 'Professional', 'Purple accent'],
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

addRealEstateTemplate();
