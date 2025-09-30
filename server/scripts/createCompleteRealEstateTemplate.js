const mongoose = require('mongoose');
const Template = require('../models/Template');
const axios = require('axios');

async function createCompleteRealEstateTemplate() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing templates
    await Template.deleteMany({});
    console.log('Deleted existing templates from database');

    // Download and process thumbnail
    console.log('Downloading thumbnail image...');
    const thumbnailResponse = await axios.get('https://marketplace.canva.com/EAFqM-si0PA/2/0/1131w/canva-6NmyGFO0pBE.jpg', {
      responseType: 'arraybuffer'
    });
    const thumbnailBuffer = Buffer.from(thumbnailResponse.data);
    const thumbnailBase64 = `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;
    
    // Create preview (same as thumbnail for now)
    const previewBase64 = thumbnailBase64;

    console.log('Creating complete Real Estate Agent template with Fabric.js format...');

    // Create Fabric.js canvas data with ALL sections
    const fabricCanvasData = {
      version: "5.3.0",
      objects: [
        // Header Section
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 80,
          "top": 60,
          "width": 640,
          "height": 60,
          "fill": "#000000",
          "text": "CONNOR HAMILTON",
          "fontSize": 48,
          "fontWeight": "900",
          "fontFamily": "Montserrat",
          "textAlign": "center",
          "charSpacing": 12,
          "id": "header_name"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 80,
          "top": 135,
          "width": 640,
          "height": 30,
          "fill": "#000000",
          "text": "Real Estate Agent",
          "fontSize": 18,
          "fontWeight": "600",
          "fontFamily": "Montserrat",
          "textAlign": "center",
          "charSpacing": 4,
          "id": "header_title"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 80,
          "top": 175,
          "width": 640,
          "height": 25,
          "fill": "#333333",
          "text": "123-456-7890 / hello@reallygreatsite.com | reallygreatsite.com",
          "fontSize": 13,
          "fontWeight": "normal",
          "fontFamily": "Montserrat",
          "fontStyle": "italic",
          "textAlign": "center",
          "charSpacing": 1,
          "id": "header_contact"
        },
        
        // Profile Section
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 80,
          "top": 225,
          "width": 200,
          "height": 25,
          "fill": "#000000",
          "text": "PROFILE",
          "fontSize": 16,
          "fontWeight": "900",
          "fontFamily": "Montserrat",
          "charSpacing": 4,
          "id": "profile_title"
        },
        {
          "type": "textbox",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 80,
          "top": 250,
          "width": 640,
          "height": 90,
          "fill": "#333333",
          "text": "I am an experienced Real Estate Agent with a passion for helping clients find their dream homes. I have extensive experience in the industry, including more than 5 years working as a real estate agent.\n\nI am knowledgeable about the latest market trends and understand the nuances of the real estate market. I pride myself on my ability to negotiate the best deals for my clients and to navigate complex real estate agreements.\n\nI am highly organized, detail-oriented, and have strong communication skills.",
          "fontSize": 14,
          "fontWeight": "normal",
          "fontFamily": "Montserrat",
          "lineHeight": 1.5,
          "id": "profile_text"
        },
        
        // Work Experience Section
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 80,
          "top": 360,
          "width": 300,
          "height": 25,
          "fill": "#000000",
          "text": "WORK EXPERIENCE",
          "fontSize": 16,
          "fontWeight": "900",
          "fontFamily": "Montserrat",
          "charSpacing": 4,
          "id": "work_experience_title"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 80,
          "top": 385,
          "width": 400,
          "height": 20,
          "fill": "#666666",
          "text": "REAL ESTATE AGENT",
          "fontSize": 12,
          "fontWeight": "600",
          "fontFamily": "Montserrat",
          "charSpacing": 2,
          "id": "work_job_title"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 80,
          "top": 407,
          "width": 400,
          "height": 25,
          "fill": "#000000",
          "text": "Really Great Company",
          "fontSize": 15,
          "fontWeight": "700",
          "fontFamily": "Montserrat",
          "id": "work_company"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 80,
          "top": 430,
          "width": 400,
          "height": 20,
          "fill": "#666666",
          "text": "June 2015 - Present",
          "fontSize": 13,
          "fontWeight": "normal",
          "fontFamily": "Montserrat",
          "fontStyle": "italic",
          "id": "work_dates"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 100,
          "top": 455,
          "width": 620,
          "height": 20,
          "fill": "#333333",
          "text": "• Negotiate contracts and complex real estate transactions",
          "fontSize": 13,
          "fontWeight": "normal",
          "fontFamily": "Montserrat",
          "lineHeight": 1.6,
          "id": "work_bullet_1"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 100,
          "top": 475,
          "width": 620,
          "height": 20,
          "fill": "#333333",
          "text": "• Provide excellent customer service to clients",
          "fontSize": 13,
          "fontWeight": "normal",
          "fontFamily": "Montserrat",
          "lineHeight": 1.6,
          "id": "work_bullet_2"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 100,
          "top": 495,
          "width": 620,
          "height": 20,
          "fill": "#333333",
          "text": "• Update and maintain client files",
          "fontSize": 13,
          "fontWeight": "normal",
          "fontFamily": "Montserrat",
          "lineHeight": 1.6,
          "id": "work_bullet_3"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 100,
          "top": 515,
          "width": 620,
          "height": 20,
          "fill": "#333333",
          "text": "• Research and monitor the local real estate market",
          "fontSize": 13,
          "fontWeight": "normal",
          "fontFamily": "Montserrat",
          "lineHeight": 1.6,
          "id": "work_bullet_4"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 100,
          "top": 535,
          "width": 620,
          "height": 20,
          "fill": "#333333",
          "text": "• Develop marketing campaigns for properties",
          "fontSize": 13,
          "fontWeight": "normal",
          "fontFamily": "Montserrat",
          "lineHeight": 1.6,
          "id": "work_bullet_5"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 100,
          "top": 555,
          "width": 620,
          "height": 20,
          "fill": "#333333",
          "text": "• Utilize social media platforms to market properties",
          "fontSize": 13,
          "fontWeight": "normal",
          "fontFamily": "Montserrat",
          "lineHeight": 1.6,
          "id": "work_bullet_6"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 100,
          "top": 575,
          "width": 620,
          "height": 20,
          "fill": "#333333",
          "text": "• Participate in open houses and home tours",
          "fontSize": 13,
          "fontWeight": "normal",
          "fontFamily": "Montserrat",
          "lineHeight": 1.6,
          "id": "work_bullet_7"
        },
        
        // Education Section (Left Column)
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 80,
          "top": 610,
          "width": 200,
          "height": 25,
          "fill": "#000000",
          "text": "EDUCATION",
          "fontSize": 16,
          "fontWeight": "900",
          "fontFamily": "Montserrat",
          "charSpacing": 4,
          "id": "education_title"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 80,
          "top": 640,
          "width": 280,
          "height": 25,
          "fill": "#000000",
          "text": "University",
          "fontSize": 15,
          "fontWeight": "700",
          "fontFamily": "Montserrat",
          "id": "education_school"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 80,
          "top": 665,
          "width": 280,
          "height": 20,
          "fill": "#666666",
          "text": "2010 - 2014",
          "fontSize": 13,
          "fontWeight": "normal",
          "fontFamily": "Montserrat",
          "fontStyle": "italic",
          "id": "education_dates"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 80,
          "top": 685,
          "width": 280,
          "height": 20,
          "fill": "#333333",
          "text": "B.A. in Business Administration",
          "fontSize": 13,
          "fontWeight": "normal",
          "fontFamily": "Montserrat",
          "id": "education_degree"
        },
        
        // Certifications Section (Left Column)
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 80,
          "top": 720,
          "width": 250,
          "height": 25,
          "fill": "#000000",
          "text": "CERTIFICATIONS",
          "fontSize": 16,
          "fontWeight": "900",
          "fontFamily": "Montserrat",
          "charSpacing": 4,
          "id": "certifications_title"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 100,
          "top": 745,
          "width": 260,
          "height": 20,
          "fill": "#333333",
          "text": "• Licensed Real Estate Agent",
          "fontSize": 13,
          "fontWeight": "normal",
          "fontFamily": "Montserrat",
          "id": "cert_bullet_1"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 100,
          "top": 765,
          "width": 260,
          "height": 20,
          "fill": "#333333",
          "text": "• Certified Real Estate Negotiator",
          "fontSize": 13,
          "fontWeight": "normal",
          "fontFamily": "Montserrat",
          "id": "cert_bullet_2"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 100,
          "top": 785,
          "width": 260,
          "height": 20,
          "fill": "#333333",
          "text": "• Top Sales Agent Award 2016",
          "fontSize": 13,
          "fontWeight": "normal",
          "fontFamily": "Montserrat",
          "id": "cert_bullet_3"
        },
        
        // Skills Section (Right Column)
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 430,
          "top": 610,
          "width": 200,
          "height": 25,
          "fill": "#000000",
          "text": "SKILLS",
          "fontSize": 16,
          "fontWeight": "900",
          "fontFamily": "Montserrat",
          "charSpacing": 4,
          "id": "skills_title"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 450,
          "top": 640,
          "width": 270,
          "height": 20,
          "fill": "#333333",
          "text": "• Knowledge of the local real estate market",
          "fontSize": 13,
          "fontWeight": "normal",
          "fontFamily": "Montserrat",
          "id": "skill_bullet_1"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 450,
          "top": 660,
          "width": 270,
          "height": 20,
          "fill": "#333333",
          "text": "• Communication skills",
          "fontSize": 13,
          "fontWeight": "normal",
          "fontFamily": "Montserrat",
          "id": "skill_bullet_2"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 450,
          "top": 680,
          "width": 270,
          "height": 20,
          "fill": "#333333",
          "text": "• Negotiation skills",
          "fontSize": 13,
          "fontWeight": "normal",
          "fontFamily": "Montserrat",
          "id": "skill_bullet_3"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 450,
          "top": 700,
          "width": 270,
          "height": 20,
          "fill": "#333333",
          "text": "• Problem-solving skills",
          "fontSize": 13,
          "fontWeight": "normal",
          "fontFamily": "Montserrat",
          "id": "skill_bullet_4"
        },
        {
          "type": "text",
          "version": "5.3.0",
          "originX": "left",
          "originY": "top",
          "left": 450,
          "top": 720,
          "width": 270,
          "height": 20,
          "fill": "#333333",
          "text": "• Organization and time management skills",
          "fontSize": 13,
          "fontWeight": "normal",
          "fontFamily": "Montserrat",
          "id": "skill_bullet_5"
        }
      ]
    };

    // Create the Real Estate Agent template
    const realEstateTemplate = new Template({
      name: "Real Estate Agent Template",
      description: "Professional resume template designed specifically for real estate agents and property professionals",
      category: "Professional",
      thumbnail: thumbnailBase64,
      preview: previewBase64,
      renderEngine: "canvas",
      isActive: true,
      isPremium: false,
      isPopular: true,
      isNewTemplate: true,
      tags: ["real-estate", "professional", "sales", "property", "agent"],
      metadata: {
        colorScheme: "light",
        layout: "single-column",
        complexity: "moderate"
      },
      canvasData: fabricCanvasData
    });

    await realEstateTemplate.save();
    console.log('✅ Complete Real Estate Agent template created successfully with Fabric.js format');

    // Verify the template
    const totalTemplates = await Template.countDocuments();
    console.log(`📊 Total templates in database: ${totalTemplates}`);
    console.log(`📝 Template ID: ${realEstateTemplate._id}`);
    console.log(`📝 Template Name: ${realEstateTemplate.name}`);
    console.log(`📝 Canvas Objects: ${realEstateTemplate.canvasData.objects.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

createCompleteRealEstateTemplate();
