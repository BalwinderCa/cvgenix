const mongoose = require('mongoose')
const Template = require('../models/Template')
require('dotenv').config()

const recreateSamiraTemplate = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to database...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to database')

    // Delete the current Mechanical Engineer template
    await Template.deleteOne({ name: "Mechanical Engineer Template" })
    console.log('🗑️ Deleted existing Samira Alcaraz template')

    // Create new Samira Alcaraz template from scratch with proper spacing
    const samiraTemplate = new Template({
      name: "Samira Alcaraz Template",
      description: "Professional resume template for Samira Alcaraz - Mechanical Engineer with clean two-column layout",
      category: "Professional",
      thumbnail: "/assets/images/templates/samira-alcaraz-thumbnail.jpg",
      preview: "/assets/images/templates/samira-alcaraz-preview.jpg",
      renderEngine: "canvas",
      isActive: true,
      isPremium: false,
      isPopular: true,
      isNewTemplate: false,
      tags: ["mechanical-engineering", "professional", "technical", "engineer", "samira-alcaraz"],
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
            type: "textbox", 
            left: 50, 
            top: 30, 
            width: 300, 
            height: 50, 
            fill: "#1a1a1a", 
            text: "Samira Alcaraz", 
            fontSize: 28, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "name" 
          },
          { 
            type: "textbox", 
            left: 400, 
            top: 30, 
            width: 300, 
            height: 50, 
            fill: "#333333", 
            text: "Mechanical Engineer", 
            fontSize: 16, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "title" 
          },
          
          // Contact Section (Left Column)
          { 
            type: "textbox", 
            left: 50, 
            top: 100, 
            width: 200, 
            height: 30, 
            fill: "#1a1a1a", 
            text: "CONTACT", 
            fontSize: 16, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "contact_header" 
          },
          { 
            type: "textbox", 
            left: 50, 
            top: 140, 
            width: 200, 
            height: 20, 
            fill: "#333333", 
            text: "Phone: +123-456-7890", 
            fontSize: 12, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "phone" 
          },
          { 
            type: "textbox", 
            left: 50, 
            top: 170, 
            width: 200, 
            height: 20, 
            fill: "#333333", 
            text: "Email: hello@reallygreatsite.com", 
            fontSize: 12, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "email" 
          },
          { 
            type: "textbox", 
            left: 50, 
            top: 200, 
            width: 200, 
            height: 20, 
            fill: "#333333", 
            text: "Address: 123 Anywhere St., Any City, ST 12345", 
            fontSize: 12, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "address" 
          },
          { 
            type: "textbox", 
            left: 50, 
            top: 230, 
            width: 200, 
            height: 20, 
            fill: "#333333", 
            text: "Portfolio: www.reallygreatsite.com", 
            fontSize: 12, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "portfolio" 
          },
          
          // Professional Experience Section (Left Column)
          { 
            type: "textbox", 
            left: 50, 
            top: 270, 
            width: 200, 
            height: 30, 
            fill: "#1a1a1a", 
            text: "PROFESSIONAL EXPERIENCE", 
            fontSize: 16, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "experience_header" 
          },
          
          // Job 1 - Research and Development Engineer
          { 
            type: "textbox", 
            left: 300, 
            top: 270, 
            width: 450, 
            height: 20, 
            fill: "#1a1a1a", 
            text: "Research and Development Engineer | 2030-2035", 
            fontSize: 14, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "job1_title" 
          },
          { 
            type: "textbox", 
            left: 300, 
            top: 300, 
            width: 450, 
            height: 20, 
            fill: "#333333", 
            text: "The Innovation Lab", 
            fontSize: 12, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "job1_company" 
          },
          { 
            type: "textbox", 
            left: 300, 
            top: 330, 
            width: 450, 
            height: 20, 
            fill: "#333333", 
            text: "• Spearheaded the development of advanced materials, resulting in a 15% increase in product efficiency", 
            fontSize: 11, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "job1_bullet1" 
          },
          { 
            type: "textbox", 
            left: 300, 
            top: 360, 
            width: 450, 
            height: 20, 
            fill: "#333333", 
            text: "• Conducted comprehensive experiments and data analysis, leading to three published journal papers", 
            fontSize: 11, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "job1_bullet2" 
          },
          { 
            type: "textbox", 
            left: 300, 
            top: 390, 
            width: 450, 
            height: 20, 
            fill: "#333333", 
            text: "• Collaborated with cross-functional teams to ideate and prototype innovative solutions", 
            fontSize: 11, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "job1_bullet3" 
          },
          
          // Job 2 - Mechanical Engineer
          { 
            type: "textbox", 
            left: 300, 
            top: 430, 
            width: 450, 
            height: 20, 
            fill: "#1a1a1a", 
            text: "Mechanical Engineer | 2027-2030", 
            fontSize: 14, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "job2_title" 
          },
          { 
            type: "textbox", 
            left: 300, 
            top: 460, 
            width: 450, 
            height: 20, 
            fill: "#333333", 
            text: "Science and Tech Co.", 
            fontSize: 12, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "job2_company" 
          },
          { 
            type: "textbox", 
            left: 300, 
            top: 490, 
            width: 450, 
            height: 20, 
            fill: "#333333", 
            text: "• Assisted in optimizing mechanical systems for manufacturing processes, improving production speed by 20%", 
            fontSize: 11, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "job2_bullet1" 
          },
          { 
            type: "textbox", 
            left: 300, 
            top: 520, 
            width: 450, 
            height: 20, 
            fill: "#333333", 
            text: "• Drafted and implemented quality control procedures, reducing defects and inconsistencies by 30%", 
            fontSize: 11, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "job2_bullet2" 
          },
          { 
            type: "textbox", 
            left: 300, 
            top: 550, 
            width: 450, 
            height: 20, 
            fill: "#333333", 
            text: "• Supported the creation of detailed project reports and documentation for senior stakeholders", 
            fontSize: 11, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "job2_bullet3" 
          },
          
          // Education Section (Left Column)
          { 
            type: "textbox", 
            left: 50, 
            top: 590, 
            width: 200, 
            height: 30, 
            fill: "#1a1a1a", 
            text: "EDUCATION", 
            fontSize: 16, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "education_header" 
          },
          
          // Master's Degree
          { 
            type: "textbox", 
            left: 300, 
            top: 590, 
            width: 450, 
            height: 20, 
            fill: "#1a1a1a", 
            text: "Master of Science in Mechanical Engineering", 
            fontSize: 14, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "masters_degree" 
          },
          { 
            type: "textbox", 
            left: 300, 
            top: 620, 
            width: 450, 
            height: 20, 
            fill: "#333333", 
            text: "North State University | 2025-2027", 
            fontSize: 12, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "masters_school" 
          },
          { 
            type: "textbox", 
            left: 300, 
            top: 650, 
            width: 450, 
            height: 20, 
            fill: "#333333", 
            text: "• GPA: 3.8", 
            fontSize: 11, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "masters_gpa" 
          },
          { 
            type: "textbox", 
            left: 300, 
            top: 680, 
            width: 450, 
            height: 20, 
            fill: "#333333", 
            text: "• Best Thesis Awardee", 
            fontSize: 11, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "masters_award1" 
          },
          { 
            type: "textbox", 
            left: 300, 
            top: 710, 
            width: 450, 
            height: 20, 
            fill: "#333333", 
            text: "• Recognition for Extended Research Paper", 
            fontSize: 11, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "masters_award2" 
          },
          
          // Bachelor's Degree
          { 
            type: "textbox", 
            left: 300, 
            top: 750, 
            width: 450, 
            height: 20, 
            fill: "#1a1a1a", 
            text: "Bachelor of Science in Mechanical Engineering", 
            fontSize: 14, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "bachelors_degree" 
          },
          { 
            type: "textbox", 
            left: 300, 
            top: 780, 
            width: 450, 
            height: 20, 
            fill: "#333333", 
            text: "South City College | 2021-2025", 
            fontSize: 12, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "bachelors_school" 
          },
          { 
            type: "textbox", 
            left: 300, 
            top: 810, 
            width: 450, 
            height: 20, 
            fill: "#333333", 
            text: "• GPA: 3.8", 
            fontSize: 11, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "bachelors_gpa" 
          },
          { 
            type: "textbox", 
            left: 300, 
            top: 840, 
            width: 450, 
            height: 20, 
            fill: "#333333", 
            text: "• Editor-in-Chief, SCC Newsletter", 
            fontSize: 11, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "bachelors_activity1" 
          },
          { 
            type: "textbox", 
            left: 300, 
            top: 870, 
            width: 450, 
            height: 20, 
            fill: "#333333", 
            text: "• President, The Innovation Society", 
            fontSize: 11, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "bachelors_activity2" 
          },
          
          // Certificates Section (Left Column)
          { 
            type: "textbox", 
            left: 50, 
            top: 910, 
            width: 200, 
            height: 30, 
            fill: "#1a1a1a", 
            text: "CERTIFICATES", 
            fontSize: 16, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "certificates_header" 
          },
          
          // Certificate 1
          { 
            type: "textbox", 
            left: 300, 
            top: 910, 
            width: 450, 
            height: 20, 
            fill: "#1a1a1a", 
            text: "Project Management | 2027", 
            fontSize: 14, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "cert1_title" 
          },
          { 
            type: "textbox", 
            left: 300, 
            top: 940, 
            width: 450, 
            height: 20, 
            fill: "#333333", 
            text: "The Project Management Institute", 
            fontSize: 12, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "cert1_issuer" 
          },
          
          // Certificate 2
          { 
            type: "textbox", 
            left: 300, 
            top: 970, 
            width: 450, 
            height: 20, 
            fill: "#1a1a1a", 
            text: "System Optimization | 2028", 
            fontSize: 14, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "cert2_title" 
          },
          { 
            type: "textbox", 
            left: 300, 
            top: 1000, 
            width: 450, 
            height: 20, 
            fill: "#333333", 
            text: "Scrum Learning Society", 
            fontSize: 12, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "cert2_issuer" 
          },
          
          // Certificate 3
          { 
            type: "textbox", 
            left: 300, 
            top: 1030, 
            width: 450, 
            height: 20, 
            fill: "#1a1a1a", 
            text: "Risk Management and Mitigation | 2028", 
            fontSize: 14, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "cert3_title" 
          },
          { 
            type: "textbox", 
            left: 300, 
            top: 1060, 
            width: 450, 
            height: 20, 
            fill: "#333333", 
            text: "Internal Auditors Team", 
            fontSize: 12, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "cert3_issuer" 
          },
          
          // Certificate 4
          { 
            type: "textbox", 
            left: 300, 
            top: 1090, 
            width: 450, 
            height: 20, 
            fill: "#1a1a1a", 
            text: "Vendor Relations | 2030", 
            fontSize: 14, 
            fontWeight: "bold", 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "cert4_title" 
          },
          { 
            type: "textbox", 
            left: 300, 
            top: 1120, 
            width: 450, 
            height: 20, 
            fill: "#333333", 
            text: "South City College", 
            fontSize: 12, 
            fontFamily: "Arial", 
            splitByGrapheme: true,
            id: "cert4_issuer" 
          }
        ]
      }
    })

    await samiraTemplate.save()
    console.log('✅ Samira Alcaraz Template created from scratch')
    console.log(`📊 Template ID: ${samiraTemplate._id}`)

    console.log('✅ Samira Alcaraz template recreated successfully!')

  } catch (error) {
    console.error('❌ Error recreating Samira template:', error.message)
    process.exit(1)
  } finally {
    // Close database connection
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
    process.exit(0)
  }
}

// Run the script
recreateSamiraTemplate()
