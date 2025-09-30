const mongoose = require('mongoose');
const Template = require('../models/Template');
const axios = require('axios');
const sharp = require('sharp');

async function createRealEstateTemplate() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://balwinder_cvgenix_1998:mAxGheQuqWAyvmzc@cvgenixdb.vrkl6u1.mongodb.net/?retryWrites=true&w=majority&appName=cvgenixdb');

    console.log('Connected to MongoDB');

    // Download and process the thumbnail image
    console.log('Downloading thumbnail image...');
    const imageUrl = 'https://marketplace.canva.com/EAFqM-si0PA/2/0/1131w/canva-6NmyGFO0pBE.jpg';
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    
    // Convert to base64 and resize for thumbnail
    const thumbnailBuffer = await sharp(Buffer.from(response.data))
      .resize(300, 400, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();
    
    const thumbnailBase64 = `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;
    
    // Create preview image (larger)
    const previewBuffer = await sharp(Buffer.from(response.data))
      .resize(600, 800, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toBuffer();
    
    const previewBase64 = `data:image/jpeg;base64,${previewBuffer.toString('base64')}`;

    console.log('Creating Real Estate Agent template...');

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
      canvasData: {
        version: "5.3.0",
        objects: [
          // Header Section - Centered
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
            "stroke": null,
            "strokeWidth": 1,
            "strokeDashArray": null,
            "strokeLineCap": "butt",
            "strokeDashOffset": 0,
            "strokeLineJoin": "miter",
            "strokeMiterLimit": 4,
            "scaleX": 1,
            "scaleY": 1,
            "angle": 0,
            "flipX": false,
            "flipY": false,
            "opacity": 1,
            "shadow": null,
            "visible": true,
            "backgroundColor": "",
            "fillRule": "nonzero",
            "paintFirst": "fill",
            "globalCompositeOperation": "source-over",
            "skewX": 0,
            "skewY": 0,
            "text": "CONNOR HAMILTON",
            "fontSize": 48,
            "fontWeight": "900",
            "fontFamily": "Montserrat",
            "fontStyle": "normal",
            "lineHeight": 1,
            "underline": false,
            "overline": false,
            "linethrough": false,
            "textAlign": "center",
            "textBackgroundColor": "",
            "charSpacing": 12,
            "styles": [],
            "path": null,
            "pathStartOffset": 0,
            "pathSide": "left",
            "pathAlign": "baseline",
            "direction": "ltr",
            "minWidth": 20,
            "splitByGrapheme": false,
            "id": "header_name"
          },
          {
            id: "header_title",
            type: "text",
            x: 80,
            y: 135,
            width: 640,
            height: 30,
            text: "Real Estate Agent",
            fontSize: 18,
            fontFamily: "Montserrat",
            fontWeight: "600",
            fill: "#000000",
            align: "center",
            letterSpacing: 4,
            draggable: true
          },
          {
            id: "header_contact",
            type: "text",
            x: 80,
            y: 175,
            width: 640,
            height: 25,
            text: "123-456-7890 / hello@reallygreatsite.com | reallygreatsite.com",
            fontSize: 13,
            fontFamily: "Montserrat",
            fill: "#333333",
            align: "center",
            fontStyle: "italic",
            letterSpacing: 1,
            draggable: true
          },
          
          // Profile Section
          {
            id: "profile_title",
            type: "text",
            x: 80,
            y: 225,
            width: 200,
            height: 25,
            text: "PROFILE",
            fontSize: 16,
            fontFamily: "Montserrat",
            fontWeight: "900",
            fill: "#000000",
            letterSpacing: 4,
            draggable: true
          },
          {
            id: "profile_text",
            type: "text",
            x: 80,
            y: 250,
            width: 640,
            height: 90,
            text: "I am an experienced Real Estate Agent with a passion for helping clients find their dream homes. I have extensive experience in the industry, including more than 5 years working as a real estate agent.\n\nI am knowledgeable about the latest market trends and understand the nuances of the real estate market. I pride myself on my ability to negotiate the best deals for my clients and to navigate complex real estate agreements.\n\nI am highly organized, detail-oriented, and have strong communication skills.",
            fontSize: 14,
            fontFamily: "Montserrat",
            fill: "#333333",
            lineHeight: 1.5,
            textBaseline: "alphabetic",
            draggable: true
          },
          
          // Work Experience Section
          {
            id: "work_experience_title",
            type: "text",
            x: 80,
            y: 360,
            width: 300,
            height: 25,
            text: "WORK EXPERIENCE",
            fontSize: 16,
            fontFamily: "Montserrat",
            fontWeight: "900",
            fill: "#000000",
            letterSpacing: 4,
            draggable: true
          },
          {
            id: "work_job_title",
            type: "text",
            x: 80,
            y: 385,
            width: 400,
            height: 20,
            text: "REAL ESTATE AGENT",
            fontSize: 12,
            fontFamily: "Montserrat",
            fontWeight: "600",
            fill: "#666666",
            letterSpacing: 2,
            draggable: true
          },
          {
            id: "work_company",
            type: "text",
            x: 80,
            y: 407,
            width: 400,
            height: 25,
            text: "Really Great Company",
            fontSize: 15,
            fontFamily: "Montserrat",
            fontWeight: "700",
            fill: "#000000",
            draggable: true
          },
          {
            id: "work_dates",
            type: "text",
            x: 80,
            y: 430,
            width: 400,
            height: 20,
            text: "June 2015 - Present",
            fontSize: 13,
            fontFamily: "Montserrat",
            fill: "#666666",
            fontStyle: "italic",
            draggable: true
          },
          {
            id: "work_bullet_1",
            type: "text",
            x: 100,
            y: 455,
            width: 620,
            height: 20,
            text: "• Negotiate contracts and complex real estate transactions",
            fontSize: 13,
            fontFamily: "Montserrat",
            fill: "#333333",
            lineHeight: 1.6,
            draggable: true
          },
          {
            id: "work_bullet_2",
            type: "text",
            x: 100,
            y: 475,
            width: 620,
            height: 20,
            text: "• Provide excellent customer service to clients",
            fontSize: 13,
            fontFamily: "Montserrat",
            fill: "#333333",
            lineHeight: 1.6,
            draggable: true
          },
          {
            id: "work_bullet_3",
            type: "text",
            x: 100,
            y: 495,
            width: 620,
            height: 20,
            text: "• Update and maintain client files",
            fontSize: 13,
            fontFamily: "Montserrat",
            fill: "#333333",
            lineHeight: 1.6,
            draggable: true
          },
          {
            id: "work_bullet_4",
            type: "text",
            x: 100,
            y: 515,
            width: 620,
            height: 20,
            text: "• Research and monitor the local real estate market",
            fontSize: 13,
            fontFamily: "Montserrat",
            fill: "#333333",
            lineHeight: 1.6,
            draggable: true
          },
          {
            id: "work_bullet_5",
            type: "text",
            x: 100,
            y: 535,
            width: 620,
            height: 20,
            text: "• Develop marketing campaigns for properties",
            fontSize: 13,
            fontFamily: "Montserrat",
            fill: "#333333",
            lineHeight: 1.6,
            draggable: true
          },
          {
            id: "work_bullet_6",
            type: "text",
            x: 100,
            y: 555,
            width: 620,
            height: 20,
            text: "• Utilize social media platforms to market properties",
            fontSize: 13,
            fontFamily: "Montserrat",
            fill: "#333333",
            lineHeight: 1.6,
            draggable: true
          },
          {
            id: "work_bullet_7",
            type: "text",
            x: 100,
            y: 575,
            width: 620,
            height: 20,
            text: "• Participate in open houses and home tours",
            fontSize: 13,
            fontFamily: "Montserrat",
            fill: "#333333",
            lineHeight: 1.6,
            draggable: true
          },
          
          // Education Section (Left Column)
          {
            id: "education_title",
            type: "text",
            x: 80,
            y: 610,
            width: 200,
            height: 25,
            text: "EDUCATION",
            fontSize: 16,
            fontFamily: "Montserrat",
            fontWeight: "900",
            fill: "#000000",
            letterSpacing: 4,
            draggable: true
          },
          {
            id: "education_school",
            type: "text",
            x: 80,
            y: 640,
            width: 280,
            height: 25,
            text: "University",
            fontSize: 15,
            fontFamily: "Montserrat",
            fontWeight: "700",
            fill: "#000000",
            draggable: true
          },
          {
            id: "education_dates",
            type: "text",
            x: 80,
            y: 665,
            width: 280,
            height: 20,
            text: "2010 - 2014",
            fontSize: 13,
            fontFamily: "Montserrat",
            fill: "#666666",
            fontStyle: "italic",
            draggable: true
          },
          {
            id: "education_degree",
            type: "text",
            x: 80,
            y: 685,
            width: 280,
            height: 20,
            text: "B.A. in Business Administration",
            fontSize: 13,
            fontFamily: "Montserrat",
            fill: "#333333",
            draggable: true
          },
          
          // Certifications Section (Left Column)
          {
            id: "certifications_title",
            type: "text",
            x: 80,
            y: 720,
            width: 250,
            height: 25,
            text: "CERTIFICATIONS",
            fontSize: 16,
            fontFamily: "Montserrat",
            fontWeight: "900",
            fill: "#000000",
            letterSpacing: 4,
            draggable: true
          },
          {
            id: "cert_bullet_1",
            type: "text",
            x: 100,
            y: 745,
            width: 260,
            height: 20,
            text: "• Licensed Real Estate Agent",
            fontSize: 13,
            fontFamily: "Montserrat",
            fill: "#333333",
            draggable: true
          },
          {
            id: "cert_bullet_2",
            type: "text",
            x: 100,
            y: 765,
            width: 260,
            height: 20,
            text: "• Certified Real Estate Negotiator",
            fontSize: 13,
            fontFamily: "Montserrat",
            fill: "#333333",
            draggable: true
          },
          {
            id: "cert_bullet_3",
            type: "text",
            x: 100,
            y: 785,
            width: 260,
            height: 20,
            text: "• Top Sales Agent Award 2016",
            fontSize: 13,
            fontFamily: "Montserrat",
            fill: "#333333",
            draggable: true
          },
          
          // Skills Section (Right Column)
          {
            id: "skills_title",
            type: "text",
            x: 430,
            y: 610,
            width: 200,
            height: 25,
            text: "SKILLS",
            fontSize: 16,
            fontFamily: "Montserrat",
            fontWeight: "900",
            fill: "#000000",
            letterSpacing: 4,
            draggable: true
          },
          {
            id: "skill_bullet_1",
            type: "text",
            x: 450,
            y: 640,
            width: 270,
            height: 20,
            text: "• Knowledge of the local real estate market",
            fontSize: 13,
            fontFamily: "Montserrat",
            fill: "#333333",
            draggable: true
          },
          {
            id: "skill_bullet_2",
            type: "text",
            x: 450,
            y: 660,
            width: 270,
            height: 20,
            text: "• Communication skills",
            fontSize: 13,
            fontFamily: "Montserrat",
            fill: "#333333",
            draggable: true
          },
          {
            id: "skill_bullet_3",
            type: "text",
            x: 450,
            y: 680,
            width: 270,
            height: 20,
            text: "• Negotiation skills",
            fontSize: 13,
            fontFamily: "Montserrat",
            fill: "#333333",
            draggable: true
          },
          {
            id: "skill_bullet_4",
            type: "text",
            x: 450,
            y: 700,
            width: 270,
            height: 20,
            text: "• Problem-solving skills",
            fontSize: 13,
            fontFamily: "Montserrat",
            fill: "#333333",
            draggable: true
          },
          {
            id: "skill_bullet_5",
            type: "text",
            x: 450,
            y: 720,
            width: 270,
            height: 20,
            text: "• Organization and time management skills",
            fontSize: 13,
            fontFamily: "Montserrat",
            fill: "#333333",
            draggable: true
          }
        ],
        stageConfig: {
          width: 800,
          height: 850
        }
      }
    });

    await realEstateTemplate.save();
    console.log('✅ Real Estate Agent template created successfully');

    // Verify the template
    const totalTemplates = await Template.countDocuments();
    console.log(`📊 Total templates in database: ${totalTemplates}`);
    console.log(`📝 Template ID: ${realEstateTemplate._id}`);
    console.log(`📝 Template Name: ${realEstateTemplate.name}`);
    console.log(`📝 Canvas Elements: ${realEstateTemplate.canvasData.elements.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

createRealEstateTemplate();
