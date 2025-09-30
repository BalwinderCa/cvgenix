const mongoose = require('mongoose')
const Template = require('../models/Template')
require('dotenv').config()

const addMechanicalEngineerTemplate = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to database...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to database')

    // Mechanical Engineer template data with Fabric.js canvas structure
    const templateData = {
      name: "Mechanical Engineer Template",
      description: "Professional resume template for mechanical engineers with two-column layout design",
      category: "Professional",
      thumbnail: "/assets/images/templates/mechanical-engineer-thumbnail.jpg",
      preview: "/assets/images/templates/mechanical-engineer-preview.jpg",
      renderEngine: "canvas",
      isActive: true,
      isPremium: false,
      isPopular: true,
      isNewTemplate: false,
      tags: ["mechanical-engineering", "professional", "technical", "engineer"],
      metadata: {
        colorScheme: "light",
        layout: "two-column",
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
            width: 300, 
            height: 50, 
            fill: "#1a1a1a", 
            text: "Samira Alcaraz", 
            fontSize: 32, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            id: "name" 
          },
          { 
            type: "text", 
            left: 450, 
            top: 30, 
            width: 300, 
            height: 50, 
            fill: "#333333", 
            text: "Mechanical Engineer", 
            fontSize: 18, 
            fontFamily: "Arial", 
            id: "title" 
          },
          
          // Contact Section (Left Column)
          { 
            type: "text", 
            left: 50, 
            top: 100, 
            width: 200, 
            height: 30, 
            fill: "#1a1a1a", 
            text: "CONTACT", 
            fontSize: 16, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            id: "contact_header" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 130, 
            width: 200, 
            height: 20, 
            fill: "#333333", 
            text: "Phone: +123-456-7890", 
            fontSize: 12, 
            fontFamily: "Arial", 
            id: "phone" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 150, 
            width: 200, 
            height: 20, 
            fill: "#333333", 
            text: "Email: hello@reallygreatsite.com", 
            fontSize: 12, 
            fontFamily: "Arial", 
            id: "email" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 170, 
            width: 200, 
            height: 20, 
            fill: "#333333", 
            text: "Address: 123 Anywhere St., Any City, ST 12345", 
            fontSize: 12, 
            fontFamily: "Arial", 
            id: "address" 
          },
          { 
            type: "text", 
            left: 50, 
            top: 190, 
            width: 200, 
            height: 20, 
            fill: "#333333", 
            text: "Portfolio: www.reallygreatsite.com", 
            fontSize: 12, 
            fontFamily: "Arial", 
            id: "portfolio" 
          },
          
          // Professional Experience Section (Left Column)
          { 
            type: "text", 
            left: 50, 
            top: 230, 
            width: 200, 
            height: 30, 
            fill: "#1a1a1a", 
            text: "PROFESSIONAL EXPERIENCE", 
            fontSize: 16, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            id: "experience_header" 
          },
          
          // Job 1 - Research and Development Engineer
          { 
            type: "text", 
            left: 300, 
            top: 230, 
            width: 400, 
            height: 20, 
            fill: "#1a1a1a", 
            text: "Research and Development Engineer | 2030-2035", 
            fontSize: 14, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            id: "job1_title" 
          },
          { 
            type: "text", 
            left: 300, 
            top: 250, 
            width: 400, 
            height: 20, 
            fill: "#333333", 
            text: "The Innovation Lab", 
            fontSize: 12, 
            fontFamily: "Arial", 
            id: "job1_company" 
          },
          { 
            type: "text", 
            left: 300, 
            top: 270, 
            width: 400, 
            height: 20, 
            fill: "#333333", 
            text: "• Spearheaded the development of advanced materials, resulting in a 15% increase in product efficiency", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "job1_bullet1" 
          },
          { 
            type: "text", 
            left: 300, 
            top: 290, 
            width: 400, 
            height: 20, 
            fill: "#333333", 
            text: "• Conducted comprehensive experiments and data analysis, leading to three published journal papers", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "job1_bullet2" 
          },
          { 
            type: "text", 
            left: 300, 
            top: 310, 
            width: 400, 
            height: 20, 
            fill: "#333333", 
            text: "• Collaborated with cross-functional teams to ideate and prototype innovative solutions for industry-specific challenges", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "job1_bullet3" 
          },
          
          // Job 2 - Mechanical Engineer
          { 
            type: "text", 
            left: 300, 
            top: 350, 
            width: 400, 
            height: 20, 
            fill: "#1a1a1a", 
            text: "Mechanical Engineer | 2027-2030", 
            fontSize: 14, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            id: "job2_title" 
          },
          { 
            type: "text", 
            left: 300, 
            top: 370, 
            width: 400, 
            height: 20, 
            fill: "#333333", 
            text: "Science and Tech Co.", 
            fontSize: 12, 
            fontFamily: "Arial", 
            id: "job2_company" 
          },
          { 
            type: "text", 
            left: 300, 
            top: 390, 
            width: 400, 
            height: 20, 
            fill: "#333333", 
            text: "• Assisted in optimizing mechanical systems for manufacturing processes, improving production speed by 20%", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "job2_bullet1" 
          },
          { 
            type: "text", 
            left: 300, 
            top: 410, 
            width: 400, 
            height: 20, 
            fill: "#333333", 
            text: "• Drafted and implemented quality control procedures, reducing defects and inconsistencies by 30%", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "job2_bullet2" 
          },
          { 
            type: "text", 
            left: 300, 
            top: 430, 
            width: 400, 
            height: 20, 
            fill: "#333333", 
            text: "• Supported the creation of detailed project reports and documentation for senior stakeholders", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "job2_bullet3" 
          },
          
          // Education Section (Left Column)
          { 
            type: "text", 
            left: 50, 
            top: 470, 
            width: 200, 
            height: 30, 
            fill: "#1a1a1a", 
            text: "EDUCATION", 
            fontSize: 16, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            id: "education_header" 
          },
          
          // Master's Degree
          { 
            type: "text", 
            left: 300, 
            top: 470, 
            width: 400, 
            height: 20, 
            fill: "#1a1a1a", 
            text: "Master of Science in Mechanical Engineering", 
            fontSize: 14, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            id: "masters_degree" 
          },
          { 
            type: "text", 
            left: 300, 
            top: 490, 
            width: 400, 
            height: 20, 
            fill: "#333333", 
            text: "North State University | 2025-2027", 
            fontSize: 12, 
            fontFamily: "Arial", 
            id: "masters_school" 
          },
          { 
            type: "text", 
            left: 300, 
            top: 510, 
            width: 400, 
            height: 20, 
            fill: "#333333", 
            text: "• GPA: 3.8", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "masters_gpa" 
          },
          { 
            type: "text", 
            left: 300, 
            top: 530, 
            width: 400, 
            height: 20, 
            fill: "#333333", 
            text: "• Best Thesis Awardee", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "masters_award1" 
          },
          { 
            type: "text", 
            left: 300, 
            top: 550, 
            width: 400, 
            height: 20, 
            fill: "#333333", 
            text: "• Recognition for Extended Research Paper", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "masters_award2" 
          },
          
          // Bachelor's Degree
          { 
            type: "text", 
            left: 300, 
            top: 580, 
            width: 400, 
            height: 20, 
            fill: "#1a1a1a", 
            text: "Bachelor of Science in Mechanical Engineering", 
            fontSize: 14, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            id: "bachelors_degree" 
          },
          { 
            type: "text", 
            left: 300, 
            top: 600, 
            width: 400, 
            height: 20, 
            fill: "#333333", 
            text: "South City College | 2021-2025", 
            fontSize: 12, 
            fontFamily: "Arial", 
            id: "bachelors_school" 
          },
          { 
            type: "text", 
            left: 300, 
            top: 620, 
            width: 400, 
            height: 20, 
            fill: "#333333", 
            text: "• GPA: 3.8", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "bachelors_gpa" 
          },
          { 
            type: "text", 
            left: 300, 
            top: 640, 
            width: 400, 
            height: 20, 
            fill: "#333333", 
            text: "• Editor-in-Chief, SCC Newsletter", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "bachelors_activity1" 
          },
          { 
            type: "text", 
            left: 300, 
            top: 660, 
            width: 400, 
            height: 20, 
            fill: "#333333", 
            text: "• President, The Innovation Society", 
            fontSize: 11, 
            fontFamily: "Arial", 
            id: "bachelors_activity2" 
          },
          
          // Certificates Section (Left Column)
          { 
            type: "text", 
            left: 50, 
            top: 700, 
            width: 200, 
            height: 30, 
            fill: "#1a1a1a", 
            text: "CERTIFICATES", 
            fontSize: 16, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            id: "certificates_header" 
          },
          
          // Certificate 1
          { 
            type: "text", 
            left: 300, 
            top: 700, 
            width: 400, 
            height: 20, 
            fill: "#1a1a1a", 
            text: "Project Management | 2027", 
            fontSize: 14, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            id: "cert1_title" 
          },
          { 
            type: "text", 
            left: 300, 
            top: 720, 
            width: 400, 
            height: 20, 
            fill: "#333333", 
            text: "The Project Management Institute", 
            fontSize: 12, 
            fontFamily: "Arial", 
            id: "cert1_issuer" 
          },
          
          // Certificate 2
          { 
            type: "text", 
            left: 300, 
            top: 750, 
            width: 400, 
            height: 20, 
            fill: "#1a1a1a", 
            text: "System Optimization | 2028", 
            fontSize: 14, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            id: "cert2_title" 
          },
          { 
            type: "text", 
            left: 300, 
            top: 770, 
            width: 400, 
            height: 20, 
            fill: "#333333", 
            text: "Scrum Learning Society", 
            fontSize: 12, 
            fontFamily: "Arial", 
            id: "cert2_issuer" 
          },
          
          // Certificate 3
          { 
            type: "text", 
            left: 300, 
            top: 800, 
            width: 400, 
            height: 20, 
            fill: "#1a1a1a", 
            text: "Risk Management and Mitigation | 2028", 
            fontSize: 14, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            id: "cert3_title" 
          },
          { 
            type: "text", 
            left: 300, 
            top: 820, 
            width: 400, 
            height: 20, 
            fill: "#333333", 
            text: "Internal Auditors Team", 
            fontSize: 12, 
            fontFamily: "Arial", 
            id: "cert3_issuer" 
          },
          
          // Certificate 4
          { 
            type: "text", 
            left: 300, 
            top: 850, 
            width: 400, 
            height: 20, 
            fill: "#1a1a1a", 
            text: "Vendor Relations | 2030", 
            fontSize: 14, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            id: "cert4_title" 
          },
          { 
            type: "text", 
            left: 300, 
            top: 870, 
            width: 400, 
            height: 20, 
            fill: "#333333", 
            text: "South City College", 
            fontSize: 12, 
            fontFamily: "Arial", 
            id: "cert4_issuer" 
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
    console.log('📝 Creating Mechanical Engineer template...')
    const template = new Template(templateData)
    await template.save()

    console.log('✅ Mechanical Engineer template created successfully!')
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
addMechanicalEngineerTemplate()
