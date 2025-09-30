const mongoose = require('mongoose');
const Template = require('../models/Template');

// Modern Creative Resume Template
const modernResumeData = {
  version: "5.3.0",
  objects: [
    // Header Section with Modern Design
    { type: "rect", left: 0, top: 0, width: 800, height: 120, fill: "#2563eb", stroke: "", strokeWidth: 0, id: "header_bg" },
    { type: "text", left: 50, top: 20, width: 300, height: 40, fill: "#ffffff", text: "SARAH JOHNSON", fontSize: 32, fontWeight: "bold", fontFamily: "Arial", id: "name" },
    { type: "text", left: 50, top: 60, width: 300, height: 25, fill: "#e0e7ff", text: "UX/UI Designer & Frontend Developer", fontSize: 16, fontFamily: "Arial", id: "title" },
    { type: "text", left: 50, top: 85, width: 300, height: 20, fill: "#c7d2fe", text: "Creating beautiful, user-centered digital experiences", fontSize: 12, fontFamily: "Arial", id: "tagline" },
    
    // Contact Information in Header
    { type: "text", left: 450, top: 25, width: 300, height: 20, fill: "#ffffff", text: "sarah.johnson@email.com", fontSize: 12, fontFamily: "Arial", id: "email" },
    { type: "text", left: 450, top: 45, width: 300, height: 20, fill: "#ffffff", text: "(555) 987-6543", fontSize: 12, fontFamily: "Arial", id: "phone" },
    { type: "text", left: 450, top: 65, width: 300, height: 20, fill: "#ffffff", text: "Portland, OR", fontSize: 12, fontFamily: "Arial", id: "location" },
    { type: "text", left: 450, top: 85, width: 300, height: 20, fill: "#ffffff", text: "linkedin.com/in/sarahjohnson", fontSize: 12, fontFamily: "Arial", id: "linkedin" },
    
    // Skills Section with Modern Layout
    { type: "rect", left: 0, top: 140, width: 200, height: 400, fill: "#f8fafc", stroke: "#e2e8f0", strokeWidth: 1, id: "skills_bg" },
    { type: "text", left: 20, top: 160, width: 160, height: 30, fill: "#1e293b", text: "SKILLS", fontSize: 18, fontWeight: "bold", fontFamily: "Arial", id: "skills_header" },
    
    // Technical Skills
    { type: "text", left: 20, top: 200, width: 160, height: 20, fill: "#2563eb", text: "Design Tools", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "skills_design_header" },
    { type: "text", left: 20, top: 220, width: 160, height: 40, fill: "#475569", text: "Figma, Adobe XD, Sketch, InVision, Principle", fontSize: 11, fontFamily: "Arial", id: "skills_design" },
    
    { type: "text", left: 20, top: 270, width: 160, height: 20, fill: "#2563eb", text: "Frontend", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "skills_frontend_header" },
    { type: "text", left: 20, top: 290, width: 160, height: 40, fill: "#475569", text: "React, Vue.js, TypeScript, CSS3, HTML5", fontSize: 11, fontFamily: "Arial", id: "skills_frontend" },
    
    { type: "text", left: 20, top: 340, width: 160, height: 20, fill: "#2563eb", text: "Prototyping", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "skills_proto_header" },
    { type: "text", left: 20, top: 360, width: 160, height: 40, fill: "#475569", text: "Framer, ProtoPie, Marvel, Axure", fontSize: 11, fontFamily: "Arial", id: "skills_proto" },
    
    { type: "text", left: 20, top: 410, width: 160, height: 20, fill: "#2563eb", text: "Research", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "skills_research_header" },
    { type: "text", left: 20, top: 430, width: 160, height: 40, fill: "#475569", text: "User Testing, A/B Testing, Analytics", fontSize: 11, fontFamily: "Arial", id: "skills_research" },
    
    // Languages
    { type: "text", left: 20, top: 480, width: 160, height: 20, fill: "#2563eb", text: "Languages", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "skills_lang_header" },
    { type: "text", left: 20, top: 500, width: 160, height: 20, fill: "#475569", text: "English (Native), Spanish (Fluent)", fontSize: 11, fontFamily: "Arial", id: "skills_lang" },
    
    // Main Content Area
    { type: "text", left: 220, top: 160, width: 500, height: 30, fill: "#1e293b", text: "PROFESSIONAL EXPERIENCE", fontSize: 18, fontWeight: "bold", fontFamily: "Arial", id: "experience_header" },
    
    // Job 1
    { type: "text", left: 220, top: 200, width: 400, height: 20, fill: "#1e293b", text: "Senior UX Designer", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "job1_title" },
    { type: "text", left: 620, top: 200, width: 100, height: 20, fill: "#64748b", text: "2022 - Present", fontSize: 12, fontFamily: "Arial", id: "job1_dates" },
    { type: "text", left: 220, top: 220, width: 500, height: 20, fill: "#2563eb", text: "DesignCo | Portland, OR", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "job1_company" },
    { type: "text", left: 220, top: 245, width: 500, height: 40, fill: "#475569", text: "• Led design system development for 50+ product features", fontSize: 11, fontFamily: "Arial", id: "job1_bullet1" },
    { type: "text", left: 220, top: 265, width: 500, height: 40, fill: "#475569", text: "• Increased user engagement by 35% through improved UX flows", fontSize: 11, fontFamily: "Arial", id: "job1_bullet2" },
    { type: "text", left: 220, top: 285, width: 500, height: 40, fill: "#475569", text: "• Collaborated with 8-person cross-functional team", fontSize: 11, fontFamily: "Arial", id: "job1_bullet3" },
    
    // Job 2
    { type: "text", left: 220, top: 340, width: 400, height: 20, fill: "#1e293b", text: "UX Designer", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "job2_title" },
    { type: "text", left: 620, top: 340, width: 100, height: 20, fill: "#64748b", text: "2020 - 2022", fontSize: 12, fontFamily: "Arial", id: "job2_dates" },
    { type: "text", left: 220, top: 360, width: 500, height: 20, fill: "#2563eb", text: "TechStart Inc. | Seattle, WA", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "job2_company" },
    { type: "text", left: 220, top: 385, width: 500, height: 40, fill: "#475569", text: "• Designed mobile-first interfaces for SaaS platform", fontSize: 11, fontFamily: "Arial", id: "job2_bullet1" },
    { type: "text", left: 220, top: 405, width: 500, height: 40, fill: "#475569", text: "• Conducted user research with 200+ participants", fontSize: 11, fontFamily: "Arial", id: "job2_bullet2" },
    { type: "text", left: 220, top: 425, width: 500, height: 40, fill: "#475569", text: "• Reduced support tickets by 40% through better UX", fontSize: 11, fontFamily: "Arial", id: "job2_bullet3" },
    
    // Education Section
    { type: "text", left: 220, top: 480, width: 500, height: 30, fill: "#1e293b", text: "EDUCATION", fontSize: 18, fontWeight: "bold", fontFamily: "Arial", id: "education_header" },
    { type: "text", left: 220, top: 520, width: 400, height: 20, fill: "#1e293b", text: "Master of Fine Arts in Digital Design", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "degree" },
    { type: "text", left: 620, top: 520, width: 100, height: 20, fill: "#64748b", text: "2018 - 2020", fontSize: 12, fontFamily: "Arial", id: "education_dates" },
    { type: "text", left: 220, top: 540, width: 500, height: 20, fill: "#2563eb", text: "Art Institute of Portland | Portland, OR", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "university" },
    { type: "text", left: 220, top: 560, width: 500, height: 20, fill: "#475569", text: "GPA: 3.9/4.0 | Magna Cum Laude", fontSize: 12, fontFamily: "Arial", id: "gpa" },
    
    // Certifications
    { type: "text", left: 220, top: 600, width: 500, height: 30, fill: "#1e293b", text: "CERTIFICATIONS", fontSize: 18, fontWeight: "bold", fontFamily: "Arial", id: "certifications_header" },
    { type: "text", left: 220, top: 640, width: 500, height: 20, fill: "#475569", text: "Google UX Design Certificate (2021)", fontSize: 12, fontFamily: "Arial", id: "cert1" },
    { type: "text", left: 220, top: 660, width: 500, height: 20, fill: "#475569", text: "Adobe Certified Expert - XD (2020)", fontSize: 12, fontFamily: "Arial", id: "cert2" },
    { type: "text", left: 220, top: 680, width: 500, height: 20, fill: "#475569", text: "Certified Usability Analyst (CUA) (2019)", fontSize: 12, fontFamily: "Arial", id: "cert3" },
    
    // Portfolio Link
    { type: "text", left: 220, top: 720, width: 500, height: 30, fill: "#1e293b", text: "PORTFOLIO", fontSize: 18, fontWeight: "bold", fontFamily: "Arial", id: "portfolio_header" },
    { type: "text", left: 220, top: 760, width: 500, height: 20, fill: "#2563eb", text: "sarahjohnson.design | behance.net/sarahjohnson", fontSize: 12, fontFamily: "Arial", id: "portfolio_link" }
  ]
};

async function createModernTemplate() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect('mongodb+srv://balwinder_cvgenix_1998:mAxGheQuqWAyvmzc@cvgenixdb.vrkl6u1.mongodb.net/?retryWrites=true&w=majority&appName=cvgenixdb');
    console.log('✅ Connected to MongoDB');

    // Create the modern template
    const modernTemplate = new Template({
      name: "Modern UX Designer Resume",
      description: "Contemporary resume template perfect for UX/UI designers, featuring a modern blue color scheme, sidebar layout, and clean typography",
      category: "Creative",
      thumbnail: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      preview: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      renderEngine: "canvas",
      isActive: true,
      isPremium: false,
      isPopular: true,
      isNewTemplate: true,
      tags: ["modern", "ux-designer", "creative", "blue", "sidebar"],
      metadata: {
        colorScheme: "colorful",
        layout: "two-column",
        complexity: "moderate",
        sections: ["header", "skills", "experience", "education", "certifications", "portfolio"]
      },
      canvasData: modernResumeData
    });

    // Save to database
    await modernTemplate.save();
    console.log('✅ Modern template created successfully!');
    console.log('📋 Template ID:', modernTemplate._id);
    console.log('📋 Template Name:', modernTemplate.name);
    console.log('📋 Objects Count:', modernTemplate.canvasData.objects.length);

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error creating modern template:', error);
    process.exit(1);
  }
}

// Run the script
createModernTemplate();
