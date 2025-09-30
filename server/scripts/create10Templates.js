const mongoose = require('mongoose');
const Template = require('../models/Template');

// Template 1: Executive Resume (Dark Theme)
const executiveResume = {
  version: "5.3.0",
  objects: [
    { type: "rect", left: 0, top: 0, width: 800, height: 1000, fill: "#1a1a1a", stroke: "", strokeWidth: 0, id: "bg" },
    { type: "text", left: 50, top: 30, width: 300, height: 40, fill: "#ffffff", text: "MICHAEL CHEN", fontSize: 28, fontWeight: "bold", fontFamily: "Arial", id: "name" },
    { type: "text", left: 50, top: 70, width: 300, height: 25, fill: "#cccccc", text: "Chief Technology Officer", fontSize: 16, fontFamily: "Arial", id: "title" },
    { type: "text", left: 400, top: 30, width: 350, height: 20, fill: "#ffffff", text: "michael.chen@techcorp.com", fontSize: 12, fontFamily: "Arial", id: "email" },
    { type: "text", left: 400, top: 50, width: 350, height: 20, fill: "#ffffff", text: "(555) 123-4567 | San Francisco, CA", fontSize: 12, fontFamily: "Arial", id: "contact" },
    { type: "text", left: 400, top: 70, width: 350, height: 20, fill: "#ffffff", text: "linkedin.com/in/michaelchen", fontSize: 12, fontFamily: "Arial", id: "linkedin" },
    { type: "text", left: 50, top: 120, width: 700, height: 30, fill: "#ffffff", text: "EXECUTIVE SUMMARY", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "summary_header" },
    { type: "text", left: 50, top: 150, width: 700, height: 60, fill: "#cccccc", text: "Seasoned technology executive with 15+ years of experience leading engineering teams and driving digital transformation initiatives.", fontSize: 12, fontFamily: "Arial", id: "summary_text" }
  ]
};

// Template 2: Creative Designer Resume (Colorful)
const creativeResume = {
  version: "5.3.0",
  objects: [
    { type: "rect", left: 0, top: 0, width: 800, height: 80, fill: "#ff6b6b", stroke: "", strokeWidth: 0, id: "header_bg" },
    { type: "rect", left: 0, top: 80, width: 200, height: 920, fill: "#4ecdc4", stroke: "", strokeWidth: 0, id: "sidebar_bg" },
    { type: "text", left: 50, top: 20, width: 300, height: 40, fill: "#ffffff", text: "ALEX RIVERA", fontSize: 24, fontWeight: "bold", fontFamily: "Arial", id: "name" },
    { type: "text", left: 50, top: 50, width: 300, height: 25, fill: "#ffffff", text: "Creative Director", fontSize: 14, fontFamily: "Arial", id: "title" },
    { type: "text", left: 220, top: 100, width: 500, height: 30, fill: "#2c3e50", text: "PORTFOLIO", fontSize: 18, fontWeight: "bold", fontFamily: "Arial", id: "portfolio_header" }
  ]
};

// Template 3: Minimalist Resume (Clean)
const minimalistResume = {
  version: "5.3.0",
  objects: [
    { type: "text", left: 50, top: 30, width: 700, height: 40, fill: "#2c3e50", text: "EMMA WILSON", fontSize: 24, fontWeight: "bold", fontFamily: "Arial", id: "name" },
    { type: "text", left: 50, top: 70, width: 700, height: 25, fill: "#7f8c8d", text: "Product Manager", fontSize: 14, fontFamily: "Arial", id: "title" },
    { type: "text", left: 50, top: 100, width: 700, height: 20, fill: "#7f8c8d", text: "emma.wilson@email.com | (555) 987-6543 | New York, NY", fontSize: 12, fontFamily: "Arial", id: "contact" },
    { type: "text", left: 50, top: 140, width: 700, height: 30, fill: "#2c3e50", text: "EXPERIENCE", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "exp_header" }
  ]
};

// Template 4: Medical Professional Resume
const medicalResume = {
  version: "5.3.0",
  objects: [
    { type: "rect", left: 0, top: 0, width: 800, height: 120, fill: "#2c5aa0", stroke: "", strokeWidth: 0, id: "header_bg" },
    { type: "text", left: 50, top: 30, width: 300, height: 40, fill: "#ffffff", text: "DR. JESSICA MARTINEZ", fontSize: 24, fontWeight: "bold", fontFamily: "Arial", id: "name" },
    { type: "text", left: 50, top: 70, width: 300, height: 25, fill: "#ffffff", text: "Cardiologist", fontSize: 16, fontFamily: "Arial", id: "title" },
    { type: "text", left: 50, top: 90, width: 300, height: 20, fill: "#ffffff", text: "MD, FACC, Board Certified", fontSize: 12, fontFamily: "Arial", id: "credentials" },
    { type: "text", left: 50, top: 150, width: 700, height: 30, fill: "#2c5aa0", text: "EDUCATION", fontSize: 18, fontWeight: "bold", fontFamily: "Arial", id: "education_header" }
  ]
};

// Template 5: Tech Startup Resume
const startupResume = {
  version: "5.3.0",
  objects: [
    { type: "rect", left: 0, top: 0, width: 800, height: 100, fill: "#00d4aa", stroke: "", strokeWidth: 0, id: "header_bg" },
    { type: "text", left: 50, top: 20, width: 300, height: 40, fill: "#ffffff", text: "DAVID KIM", fontSize: 26, fontWeight: "bold", fontFamily: "Arial", id: "name" },
    { type: "text", left: 50, top: 60, width: 300, height: 25, fill: "#ffffff", text: "Full Stack Developer & Founder", fontSize: 14, fontFamily: "Arial", id: "title" },
    { type: "text", left: 50, top: 130, width: 700, height: 30, fill: "#00d4aa", text: "PROJECTS", fontSize: 18, fontWeight: "bold", fontFamily: "Arial", id: "projects_header" }
  ]
};

// Template 6: Academic Resume
const academicResume = {
  version: "5.3.0",
  objects: [
    { type: "text", left: 50, top: 30, width: 700, height: 40, fill: "#1a365d", text: "PROF. ROBERT TAYLOR", fontSize: 22, fontWeight: "bold", fontFamily: "Arial", id: "name" },
    { type: "text", left: 50, top: 70, width: 700, height: 25, fill: "#2d3748", text: "Professor of Computer Science", fontSize: 14, fontFamily: "Arial", id: "title" },
    { type: "text", left: 50, top: 100, width: 700, height: 20, fill: "#4a5568", text: "Stanford University | rtaylor@stanford.edu", fontSize: 12, fontFamily: "Arial", id: "contact" },
    { type: "text", left: 50, top: 140, width: 700, height: 30, fill: "#1a365d", text: "PUBLICATIONS", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "publications_header" }
  ]
};

// Template 7: Marketing Resume
const marketingResume = {
  version: "5.3.0",
  objects: [
    { type: "rect", left: 0, top: 0, width: 800, height: 90, fill: "#e53e3e", stroke: "", strokeWidth: 0, id: "header_bg" },
    { type: "text", left: 50, top: 20, width: 300, height: 40, fill: "#ffffff", text: "LISA PARKER", fontSize: 24, fontWeight: "bold", fontFamily: "Arial", id: "name" },
    { type: "text", left: 50, top: 60, width: 300, height: 25, fill: "#ffffff", text: "Marketing Director", fontSize: 14, fontFamily: "Arial", id: "title" },
    { type: "text", left: 50, top: 120, width: 700, height: 30, fill: "#e53e3e", text: "CAMPAIGNS", fontSize: 18, fontWeight: "bold", fontFamily: "Arial", id: "campaigns_header" }
  ]
};

// Template 8: Finance Resume
const financeResume = {
  version: "5.3.0",
  objects: [
    { type: "rect", left: 0, top: 0, width: 800, height: 110, fill: "#2d3748", stroke: "", strokeWidth: 0, id: "header_bg" },
    { type: "text", left: 50, top: 30, width: 300, height: 40, fill: "#ffffff", text: "JAMES ANDERSON", fontSize: 24, fontWeight: "bold", fontFamily: "Arial", id: "name" },
    { type: "text", left: 50, top: 70, width: 300, height: 25, fill: "#ffffff", text: "Investment Banker", fontSize: 14, fontFamily: "Arial", id: "title" },
    { type: "text", left: 50, top: 90, width: 300, height: 20, fill: "#ffffff", text: "CFA, CPA", fontSize: 12, fontFamily: "Arial", id: "credentials" },
    { type: "text", left: 50, top: 140, width: 700, height: 30, fill: "#2d3748", text: "FINANCIAL ANALYSIS", fontSize: 18, fontWeight: "bold", fontFamily: "Arial", id: "analysis_header" }
  ]
};

// Template 9: Legal Resume
const legalResume = {
  version: "5.3.0",
  objects: [
    { type: "text", left: 50, top: 30, width: 700, height: 40, fill: "#1a202c", text: "ATTORNEY SARAH JOHNSON", fontSize: 20, fontWeight: "bold", fontFamily: "Arial", id: "name" },
    { type: "text", left: 50, top: 70, width: 700, height: 25, fill: "#2d3748", text: "Corporate Law Partner", fontSize: 14, fontFamily: "Arial", id: "title" },
    { type: "text", left: 50, top: 100, width: 700, height: 20, fill: "#4a5568", text: "Johnson & Associates | sjohnson@lawfirm.com", fontSize: 12, fontFamily: "Arial", id: "contact" },
    { type: "text", left: 50, top: 140, width: 700, height: 30, fill: "#1a202c", text: "CASE EXPERIENCE", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "cases_header" }
  ]
};

// Template 10: Creative Writer Resume
const writerResume = {
  version: "5.3.0",
  objects: [
    { type: "rect", left: 0, top: 0, width: 800, height: 100, fill: "#805ad5", stroke: "", strokeWidth: 0, id: "header_bg" },
    { type: "text", left: 50, top: 20, width: 300, height: 40, fill: "#ffffff", text: "MARCUS WRIGHT", fontSize: 24, fontWeight: "bold", fontFamily: "Arial", id: "name" },
    { type: "text", left: 50, top: 60, width: 300, height: 25, fill: "#ffffff", text: "Content Writer & Editor", fontSize: 14, fontFamily: "Arial", id: "title" },
    { type: "text", left: 50, top: 130, width: 700, height: 30, fill: "#805ad5", text: "PUBLISHED WORKS", fontSize: 18, fontWeight: "bold", fontFamily: "Arial", id: "works_header" }
  ]
};

const templates = [
  {
    name: "Executive Leadership Resume",
    description: "Professional dark-themed resume for C-level executives and senior leadership positions",
    category: "Executive",
    colorScheme: "dark",
    layout: "single-column",
    complexity: "complex",
    data: executiveResume
  },
  {
    name: "Creative Designer Portfolio",
    description: "Colorful and vibrant resume template for creative professionals and designers",
    category: "Creative",
    colorScheme: "colorful",
    layout: "two-column",
    complexity: "moderate",
    data: creativeResume
  },
  {
    name: "Minimalist Professional",
    description: "Clean and simple resume template with focus on typography and white space",
    category: "Minimalist",
    colorScheme: "light",
    layout: "single-column",
    complexity: "simple",
    data: minimalistResume
  },
  {
    name: "Medical Professional",
    description: "Formal resume template designed for healthcare professionals and medical practitioners",
    category: "Professional",
    colorScheme: "light",
    layout: "single-column",
    complexity: "moderate",
    data: medicalResume
  },
  {
    name: "Tech Startup Founder",
    description: "Modern and energetic resume template for tech entrepreneurs and startup founders",
    category: "Modern",
    colorScheme: "colorful",
    layout: "hybrid",
    complexity: "moderate",
    data: startupResume
  },
  {
    name: "Academic Scholar",
    description: "Traditional resume template for academic professionals, professors, and researchers",
    category: "Classic",
    colorScheme: "light",
    layout: "single-column",
    complexity: "complex",
    data: academicResume
  },
  {
    name: "Marketing Director",
    description: "Dynamic resume template for marketing professionals with focus on campaigns and results",
    category: "Creative",
    colorScheme: "colorful",
    layout: "two-column",
    complexity: "moderate",
    data: marketingResume
  },
  {
    name: "Finance Professional",
    description: "Conservative and professional resume template for finance and banking professionals",
    category: "Professional",
    colorScheme: "dark",
    layout: "single-column",
    complexity: "moderate",
    data: financeResume
  },
  {
    name: "Legal Attorney",
    description: "Formal and traditional resume template for legal professionals and attorneys",
    category: "Classic",
    colorScheme: "light",
    layout: "single-column",
    complexity: "complex",
    data: legalResume
  },
  {
    name: "Creative Writer",
    description: "Artistic resume template for writers, editors, and content creators",
    category: "Creative",
    colorScheme: "colorful",
    layout: "hybrid",
    complexity: "simple",
    data: writerResume
  }
];

async function createAllTemplates() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect('mongodb+srv://balwinder_cvgenix_1998:mAxGheQuqWAyvmzc@cvgenixdb.vrkl6u1.mongodb.net/?retryWrites=true&w=majority&appName=cvgenixdb');
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing templates first
    await Template.deleteMany({});
    console.log('🗑️ Cleared existing templates');

    // Create all templates
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const newTemplate = new Template({
        name: template.name,
        description: template.description,
        category: template.category,
        thumbnail: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        preview: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        renderEngine: "canvas",
        isActive: true,
        isPremium: i < 3, // First 3 are premium
        isPopular: i < 5, // First 5 are popular
        isNewTemplate: true,
        tags: [template.category.toLowerCase(), template.colorScheme, template.layout],
        metadata: {
          colorScheme: template.colorScheme,
          layout: template.layout,
          complexity: template.complexity
        },
        canvasData: template.data
      });

      await newTemplate.save();
      console.log(`✅ Template ${i + 1}/10 created: ${template.name}`);
    }

    console.log('🎉 All 10 templates created successfully!');
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error creating templates:', error);
    process.exit(1);
  }
}

// Run the script
createAllTemplates();
