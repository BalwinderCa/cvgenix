const mongoose = require('mongoose')
const Template = require('../models/Template')
require('dotenv').config()

const fixTextOverlapping = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to database...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to database')

    // Update Real Estate Agent Template
    const realEstateTemplate = await Template.findOne({ name: "Real Estate Agent Template" })
    if (realEstateTemplate) {
      console.log('🔧 Fixing text overlapping in Real Estate Agent Template...')
      
      // Recreate with proper spacing
      realEstateTemplate.canvasData.objects = [
        // Header Section
        { 
          type: "textbox", 
          left: 50, 
          top: 30, 
          width: 700, 
          height: 50, 
          fill: "#1a1a1a", 
          text: "CONNOR HAMILTON", 
          fontSize: 32, 
          fontWeight: "bold", 
          fontFamily: "Arial", 
          textAlign: "center",
          splitByGrapheme: true,
          id: "name" 
        },
        { 
          type: "textbox", 
          left: 50, 
          top: 90, 
          width: 700, 
          height: 30, 
          fill: "#333333", 
          text: "Real Estate Agent", 
          fontSize: 18, 
          fontFamily: "Arial", 
          textAlign: "center",
          splitByGrapheme: true,
          id: "title" 
        },
        
        // Contact Information
        { 
          type: "textbox", 
          left: 50, 
          top: 130, 
          width: 700, 
          height: 20, 
          fill: "#555555", 
          text: "123-456-7890 | hello@reallygreatsite.com | reallygreatsite.com", 
          fontSize: 12, 
          fontFamily: "Arial", 
          textAlign: "center",
          splitByGrapheme: true,
          id: "contact" 
        },
        
        // Profile Section
        { 
          type: "textbox", 
          left: 50, 
          top: 170, 
          width: 700, 
          height: 30, 
          fill: "#1a1a1a", 
          text: "PROFILE", 
          fontSize: 16, 
          fontWeight: "bold", 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "profile_header" 
        },
        { 
          type: "textbox", 
          left: 50, 
          top: 210, 
          width: 700, 
          height: 100, 
          fill: "#333333", 
          text: "I am an experienced Real Estate Agent with a passion for helping clients find their dream homes. I have extensive experience in the industry, including more than 5 years working as a real estate agent. I am knowledgeable about the latest market trends and understand the nuances of the real estate market. I pride myself on my ability to negotiate the best deals for my clients and to navigate complex real estate agreements. I am highly organized, detail-oriented, and have strong communication skills.", 
          fontSize: 12, 
          fontFamily: "Arial", 
          textAlign: "left",
          splitByGrapheme: true,
          lineHeight: 1.3,
          id: "profile_text" 
        },
        
        // Work Experience Section
        { 
          type: "textbox", 
          left: 50, 
          top: 330, 
          width: 700, 
          height: 30, 
          fill: "#1a1a1a", 
          text: "WORK EXPERIENCE", 
          fontSize: 16, 
          fontWeight: "bold", 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "experience_header" 
        },
        
        // Job 1
        { 
          type: "textbox", 
          left: 50, 
          top: 370, 
          width: 500, 
          height: 20, 
          fill: "#1a1a1a", 
          text: "Really Great Company", 
          fontSize: 14, 
          fontWeight: "bold", 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "job1_company" 
        },
        { 
          type: "textbox", 
          left: 560, 
          top: 370, 
          width: 150, 
          height: 20, 
          fill: "#555555", 
          text: "June 2015 - Present", 
          fontSize: 12, 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "job1_dates" 
        },
        { 
          type: "textbox", 
          left: 50, 
          top: 400, 
          width: 700, 
          height: 20, 
          fill: "#333333", 
          text: "Real Estate Agent", 
          fontSize: 12, 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "job1_title" 
        },
        { 
          type: "textbox", 
          left: 50, 
          top: 430, 
          width: 700, 
          height: 20, 
          fill: "#333333", 
          text: "• Negotiate contracts and complex real estate transactions", 
          fontSize: 11, 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "job1_bullet1" 
        },
        { 
          type: "textbox", 
          left: 50, 
          top: 460, 
          width: 700, 
          height: 20, 
          fill: "#333333", 
          text: "• Provide excellent customer service to clients", 
          fontSize: 11, 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "job1_bullet2" 
        },
        { 
          type: "textbox", 
          left: 50, 
          top: 490, 
          width: 700, 
          height: 20, 
          fill: "#333333", 
          text: "• Update and maintain client files", 
          fontSize: 11, 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "job1_bullet3" 
        },
        { 
          type: "textbox", 
          left: 50, 
          top: 520, 
          width: 700, 
          height: 20, 
          fill: "#333333", 
          text: "• Research and monitor the local real estate market", 
          fontSize: 11, 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "job1_bullet4" 
        },
        { 
          type: "textbox", 
          left: 50, 
          top: 550, 
          width: 700, 
          height: 20, 
          fill: "#333333", 
          text: "• Develop marketing campaigns for properties", 
          fontSize: 11, 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "job1_bullet5" 
        },
        { 
          type: "textbox", 
          left: 50, 
          top: 580, 
          width: 700, 
          height: 20, 
          fill: "#333333", 
          text: "• Utilize social media platforms to market properties", 
          fontSize: 11, 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "job1_bullet6" 
        },
        { 
          type: "textbox", 
          left: 50, 
          top: 610, 
          width: 700, 
          height: 20, 
          fill: "#333333", 
          text: "• Participate in open houses and home tours", 
          fontSize: 11, 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "job1_bullet7" 
        },
        
        // Education Section
        { 
          type: "textbox", 
          left: 50, 
          top: 650, 
          width: 700, 
          height: 30, 
          fill: "#1a1a1a", 
          text: "EDUCATION", 
          fontSize: 16, 
          fontWeight: "bold", 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "education_header" 
        },
        { 
          type: "textbox", 
          left: 50, 
          top: 690, 
          width: 500, 
          height: 20, 
          fill: "#1a1a1a", 
          text: "University", 
          fontSize: 14, 
          fontWeight: "bold", 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "university" 
        },
        { 
          type: "textbox", 
          left: 560, 
          top: 690, 
          width: 150, 
          height: 20, 
          fill: "#555555", 
          text: "2010 - 2014", 
          fontSize: 12, 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "education_dates" 
        },
        { 
          type: "textbox", 
          left: 50, 
          top: 720, 
          width: 700, 
          height: 20, 
          fill: "#333333", 
          text: "B.A. in Business Administration", 
          fontSize: 12, 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "degree" 
        },
        
        // Skills Section
        { 
          type: "textbox", 
          left: 50, 
          top: 760, 
          width: 700, 
          height: 30, 
          fill: "#1a1a1a", 
          text: "SKILLS", 
          fontSize: 16, 
          fontWeight: "bold", 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "skills_header" 
        },
        { 
          type: "textbox", 
          left: 50, 
          top: 800, 
          width: 700, 
          height: 20, 
          fill: "#333333", 
          text: "• Knowledge of the local real estate market", 
          fontSize: 11, 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "skill1" 
        },
        { 
          type: "textbox", 
          left: 50, 
          top: 830, 
          width: 700, 
          height: 20, 
          fill: "#333333", 
          text: "• Communication skills", 
          fontSize: 11, 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "skill2" 
        },
        { 
          type: "textbox", 
          left: 50, 
          top: 860, 
          width: 700, 
          height: 20, 
          fill: "#333333", 
          text: "• Negotiation skills", 
          fontSize: 11, 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "skill3" 
        },
        { 
          type: "textbox", 
          left: 50, 
          top: 890, 
          width: 700, 
          height: 20, 
          fill: "#333333", 
          text: "• Problem-solving skills", 
          fontSize: 11, 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "skill4" 
        },
        { 
          type: "textbox", 
          left: 50, 
          top: 920, 
          width: 700, 
          height: 20, 
          fill: "#333333", 
          text: "• Organization and time management skills", 
          fontSize: 11, 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "skill5" 
        },
        
        // Certifications Section
        { 
          type: "textbox", 
          left: 50, 
          top: 960, 
          width: 700, 
          height: 30, 
          fill: "#1a1a1a", 
          text: "CERTIFICATIONS", 
          fontSize: 16, 
          fontWeight: "bold", 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "certifications_header" 
        },
        { 
          type: "textbox", 
          left: 50, 
          top: 1000, 
          width: 700, 
          height: 20, 
          fill: "#333333", 
          text: "• Licensed Real Estate Agent", 
          fontSize: 11, 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "cert1" 
        },
        { 
          type: "textbox", 
          left: 50, 
          top: 1030, 
          width: 700, 
          height: 20, 
          fill: "#333333", 
          text: "• Certified Real Estate Negotiator", 
          fontSize: 11, 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "cert2" 
        },
        { 
          type: "textbox", 
          left: 50, 
          top: 1060, 
          width: 700, 
          height: 20, 
          fill: "#333333", 
          text: "• Top Sales Agent Award 2016", 
          fontSize: 11, 
          fontFamily: "Arial", 
          splitByGrapheme: true,
          id: "cert3" 
        }
      ]
      
      await realEstateTemplate.save()
      console.log('✅ Real Estate Agent Template overlapping fixed')
    }

    // Update Mechanical Engineer Template
    const mechanicalTemplate = await Template.findOne({ name: "Mechanical Engineer Template" })
    if (mechanicalTemplate) {
      console.log('🔧 Fixing text overlapping in Mechanical Engineer Template...')
      
      // Recreate with proper spacing
      mechanicalTemplate.canvasData.objects = [
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
      
      await mechanicalTemplate.save()
      console.log('✅ Mechanical Engineer Template overlapping fixed')
    }

    console.log('✅ All templates text overlapping fixed successfully!')

  } catch (error) {
    console.error('❌ Error fixing text overlapping:', error.message)
    process.exit(1)
  } finally {
    // Close database connection
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
    process.exit(0)
  }
}

// Run the script
fixTextOverlapping()
