const mongoose = require('mongoose')
const Template = require('../models/Template')
require('dotenv').config()

const addRealEstateTemplate = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to database...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to database')

    // Real Estate Agent template data with Fabric.js canvas structure
    const templateData = {
      name: "Real Estate Agent Template",
      description: "Professional resume template for real estate agents with clean, minimalist design",
      category: "Professional",
      thumbnail: "/assets/images/templates/real-estate-thumbnail.jpg",
      preview: "/assets/images/templates/real-estate-preview.jpg",
      renderEngine: "canvas",
      isActive: true,
      isPremium: false,
      isPopular: true,
      isNewTemplate: false,
      tags: ["real-estate", "professional", "sales", "agent"],
      metadata: {
        colorScheme: "light",
        layout: "single-column",
        complexity: "moderate"
      },
      canvasData: {
        version: "5.3.0",
        objects: [
          // Header Section
          { 
            type: "text", 
            left: 50, 
            top: 30, 
            width: 700, 
            height: 50, 
            fill: "#1a1a1a", 
            text: "CONNOR HAMILTON", 
            fontSize: 36, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            textAlign: "center",
            id: "name" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 80, 
            width: 700, 
            height: 30, 
            fill: "#333333", 
            text: "Real Estate Agent", 
            fontSize: 20, 
            fontFamily: "Arial", 
            textAlign: "center",
            id: "title" 
          },
          
          // Contact Information
          { 
            type: "text", 
            left: 50, 
            top: 120, 
            width: 700, 
            height: 20, 
            fill: "#555555", 
            text: "123-456-7890 | hello@reallygreatsite.com | reallygreatsite.com", 
            fontSize: 12, 
            fontFamily: "Arial", 
            textAlign: "center",
            id: "contact" 
          },
          
          // Profile Section
          { 
            type: "text", 
            left: 50, 
            top: 180, 
            width: 700, 
            height: 30, 
            fill: "#1a1a1a", 
            text: "PROFILE", 
            fontSize: 16, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            id: "profile_header" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 210, 
            width: 700, 
            height: 80, 
            fill: "#333333", 
            text: "I am an experienced Real Estate Agent with a passion for helping clients find their dream homes. I have extensive experience in the industry, including more than 5 years working as a real estate agent. I am knowledgeable about the latest market trends and understand the nuances of the real estate market. I pride myself on my ability to negotiate the best deals for my clients and to navigate complex real estate agreements. I am highly organized, detail-oriented, and have strong communication skills.", 
            fontSize: 12, 
            fontFamily: "Arial", 
            id: "profile_text" 
          },
          
          // Work Experience Section
          { 
            type: "text", 
            left: 50, 
            top: 310, 
            width: 700, 
            height: 30, 
            fill: "#1a1a1a", 
            text: "WORK EXPERIENCE", 
            fontSize: 16, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            id: "experience_header" 
          },
          
          // Job 1
          { 
            type: "text", 
            left: 50, 
            top: 340, 
            width: 500, 
            height: 20, 
            fill: "#1a1a1a", 
            text: "Really Great Company", 
            fontSize: 14, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            id: "job1_company" 
          },
          { 
            type: "text", 
            left: 560, 
            top: 340, 
            width: 150, 
            height: 20, 
            fill: "#555555", 
            text: "June 2015 - Present", 
            fontSize: 12, 
            fontFamily: "Arial", 
            id: "job1_dates" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 360, 
            width: 700, 
            height: 20, 
            fill: "#333333", 
            text: "Real Estate Agent", 
            fontSize: 12, 
            fontFamily: "Arial", 
            id: "job1_title" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 380, 
            width: 700, 
            height: 20, 
            fill: "#333333", 
            text: "• Negotiate contracts and complex real estate transactions", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "job1_bullet1" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 400, 
            width: 700, 
            height: 20, 
            fill: "#333333", 
            text: "• Provide excellent customer service to clients", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "job1_bullet2" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 420, 
            width: 700, 
            height: 20, 
            fill: "#333333", 
            text: "• Update and maintain client files", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "job1_bullet3" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 440, 
            width: 700, 
            height: 20, 
            fill: "#333333", 
            text: "• Research and monitor the local real estate market", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "job1_bullet4" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 460, 
            width: 700, 
            height: 20, 
            fill: "#333333", 
            text: "• Develop marketing campaigns for properties", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "job1_bullet5" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 480, 
            width: 700, 
            height: 20, 
            fill: "#333333", 
            text: "• Utilize social media platforms to market properties", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "job1_bullet6" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 500, 
            width: 700, 
            height: 20, 
            fill: "#333333", 
            text: "• Participate in open houses and home tours", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "job1_bullet7" 
          },
          
          // Education Section
          { 
            type: "text", 
            left: 50, 
            top: 540, 
            width: 700, 
            height: 30, 
            fill: "#1a1a1a", 
            text: "EDUCATION", 
            fontSize: 16, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            id: "education_header" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 570, 
            width: 500, 
            height: 20, 
            fill: "#1a1a1a", 
            text: "University", 
            fontSize: 14, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            id: "university" 
          },
          { 
            type: "text", 
            left: 560, 
            top: 570, 
            width: 150, 
            height: 20, 
            fill: "#555555", 
            text: "2010 - 2014", 
            fontSize: 12, 
            fontFamily: "Arial", 
            id: "education_dates" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 590, 
            width: 700, 
            height: 20, 
            fill: "#333333", 
            text: "B.A. in Business Administration", 
            fontSize: 12, 
            fontFamily: "Arial", 
            id: "degree" 
          },
          
          // Skills Section
          { 
            type: "text", 
            left: 50, 
            top: 630, 
            width: 700, 
            height: 30, 
            fill: "#1a1a1a", 
            text: "SKILLS", 
            fontSize: 16, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            id: "skills_header" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 660, 
            width: 700, 
            height: 20, 
            fill: "#333333", 
            text: "• Knowledge of the local real estate market", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "skill1" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 680, 
            width: 700, 
            height: 20, 
            fill: "#333333", 
            text: "• Communication skills", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "skill2" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 700, 
            width: 700, 
            height: 20, 
            fill: "#333333", 
            text: "• Negotiation skills", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "skill3" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 720, 
            width: 700, 
            height: 20, 
            fill: "#333333", 
            text: "• Problem-solving skills", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "skill4" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 740, 
            width: 700, 
            height: 20, 
            fill: "#333333", 
            text: "• Organization and time management skills", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "skill5" 
          },
          
          // Certifications Section
          { 
            type: "text", 
            left: 50, 
            top: 780, 
            width: 700, 
            height: 30, 
            fill: "#1a1a1a", 
            text: "CERTIFICATIONS", 
            fontSize: 16, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            id: "certifications_header" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 810, 
            width: 700, 
            height: 20, 
            fill: "#333333", 
            text: "• Licensed Real Estate Agent", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "cert1" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 830, 
            width: 700, 
            height: 20, 
            fill: "#333333", 
            text: "• Certified Real Estate Negotiator", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "cert2" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 850, 
            width: 700, 
            height: 20, 
            fill: "#333333", 
            text: "• Top Sales Agent Award 2016", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "cert3" 
          }
        ]
      }
    }

    // Check if template already exists
    const existingTemplate = await Template.findOne({ name: templateData.name })
    if (existingTemplate) {
      console.log('⚠️  Template already exists with this name')
      return
    }

    // Create the template
    console.log('📝 Creating Real Estate Agent template...')
    const template = new Template(templateData)
    await template.save()

    console.log('✅ Real Estate Agent template created successfully!')
    console.log(`📊 Template ID: ${template._id}`)

  } catch (error) {
    console.error('❌ Error creating template:', error.message)
    process.exit(1)
  } finally {
    // Close database connection
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
    process.exit(0)
  }
}

// Run the script
addRealEstateTemplate()