const mongoose = require('mongoose');
const Template = require('../models/Template');

async function saveEmmaTemplate() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://balwinder_cvgenix_1998:mAxGheQuqWAyvmzc@cvgenixdb.vrkl6u1.mongodb.net/?retryWrites=true&w=majority&appName=cvgenixdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Delete existing templates first
    await Template.deleteMany({});
    console.log('Deleted existing templates');

    // Create Emma Ahearn template
    const emmaTemplate = new Template({
      name: "Emma Ahearn Chemistry Resume",
      description: "Professional chemistry resume template with Emma Ahearn sample data",
      category: "Professional",
      thumbnail: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      preview: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      renderEngine: "canvas",
      isActive: true,
      isPremium: false,
      tags: ["chemistry", "professional", "sample"],
      canvasData: {
        elements: [
          {
            id: "name",
            type: "text",
            x: 300,
            y: 30,
            width: 200,
            height: 40,
            text: "Emma Ahearn",
            fontSize: 28,
            fontFamily: "Times New Roman",
            fill: "#1a1a1a",
            draggable: true
          },
          {
            id: "title",
            type: "text",
            x: 350,
            y: 70,
            width: 100,
            height: 25,
            text: "CHEMIST",
            fontSize: 16,
            fontFamily: "Arial",
            fill: "#1a1a1a",
            draggable: true
          },
          {
            id: "phone",
            type: "text",
            x: 50,
            y: 110,
            width: 200,
            height: 20,
            text: "Phone: +123-456-7890",
            fontSize: 13,
            fontFamily: "Arial",
            fill: "#333333",
            draggable: true
          },
          {
            id: "email",
            type: "text",
            x: 300,
            y: 110,
            width: 250,
            height: 20,
            text: "Email: hello@reallygreatsite.com",
            fontSize: 13,
            fontFamily: "Arial",
            fill: "#333333",
            draggable: true
          },
          {
            id: "address",
            type: "text",
            x: 50,
            y: 130,
            width: 500,
            height: 20,
            text: "Address: 123 Anywhere St., Any City, ST 12345",
            fontSize: 13,
            fontFamily: "Arial",
            fill: "#333333",
            draggable: true
          },
          {
            id: "summary_title",
            type: "text",
            x: 50,
            y: 160,
            width: 200,
            height: 25,
            text: "PROFESSIONAL SUMMARY",
            fontSize: 14,
            fontFamily: "Arial",
            fill: "#2d5a27",
            fontWeight: "bold",
            draggable: true
          },
          {
            id: "summary_text",
            type: "text",
            x: 50,
            y: 185,
            width: 700,
            height: 40,
            text: "I am a chemistry graduate seeking to apply my extensive academic background and laboratory experience in an organization with an innovative vision. I am looking forward to contributing to a dynamic team and supporting research and development efforts.",
            fontSize: 13,
            fontFamily: "Times New Roman",
            fontStyle: "italic",
            fill: "#333333",
            draggable: true
          },
          {
            id: "research_title",
            type: "text",
            x: 50,
            y: 240,
            width: 200,
            height: 25,
            text: "RESEARCH EXPERIENCE",
            fontSize: 14,
            fontFamily: "Arial",
            fill: "#2d5a27",
            fontWeight: "bold",
            draggable: true
          },
          {
            id: "research_position",
            type: "text",
            x: 50,
            y: 270,
            width: 300,
            height: 20,
            text: "Undergraduate Research Assistant",
            fontSize: 12,
            fontFamily: "Arial",
            fontWeight: "bold",
            fill: "#1a1a1a",
            draggable: true
          },
          {
            id: "research_duration",
            type: "text",
            x: 600,
            y: 270,
            width: 150,
            height: 20,
            text: "2029-2030",
            fontSize: 12,
            fontFamily: "Arial",
            fill: "#666666",
            draggable: true
          },
          {
            id: "research_company",
            type: "text",
            x: 50,
            y: 290,
            width: 400,
            height: 18,
            text: "Chemistry Department of East State University",
            fontSize: 13,
            fontFamily: "Arial",
            fontStyle: "italic",
            fill: "#333333",
            draggable: true
          },
          {
            id: "research_achievements",
            type: "text",
            x: 50,
            y: 315,
            width: 700,
            height: 60,
            text: "• Collaborated with a research team to study the synthesis of novel organic compounds\n• Conducted experiments using chromatography, spectroscopy, and other analytical techniques\n• Analyzed and interpreted data, contributing to a research paper submitted for publication",
            fontSize: 12,
            fontFamily: "Arial",
            fill: "#333333",
            draggable: true
          },
          {
            id: "education_title",
            type: "text",
            x: 50,
            y: 390,
            width: 200,
            height: 25,
            text: "EDUCATION",
            fontSize: 14,
            fontFamily: "Arial",
            fill: "#2d5a27",
            fontWeight: "bold",
            draggable: true
          },
          {
            id: "edu_degree",
            type: "text",
            x: 50,
            y: 420,
            width: 400,
            height: 20,
            text: "Bachelor of Science in Chemistry | 2026-2030",
            fontSize: 12,
            fontFamily: "Arial",
            fontWeight: "bold",
            fill: "#1a1a1a",
            draggable: true
          },
          {
            id: "edu_institution",
            type: "text",
            x: 50,
            y: 440,
            width: 400,
            height: 18,
            text: "East State University, Valley City",
            fontSize: 12,
            fontFamily: "Arial",
            fontStyle: "italic",
            fill: "#333333",
            draggable: true
          },
          {
            id: "edu_coursework",
            type: "text",
            x: 50,
            y: 465,
            width: 700,
            height: 20,
            text: "Relevant Coursework: Organic Chemistry, Inorganic Chemistry, Physical Chemistry, Analytical Chemistry, Chemical Engineering Principles, Thermodynamics, Material Science",
            fontSize: 12,
            fontFamily: "Arial",
            fill: "#333333",
            draggable: true
          },
          {
            id: "edu_gpa",
            type: "text",
            x: 50,
            y: 485,
            width: 200,
            height: 20,
            text: "GPA: 3.8",
            fontSize: 12,
            fontFamily: "Arial",
            fill: "#333333",
            draggable: true
          },
          {
            id: "projects_title",
            type: "text",
            x: 50,
            y: 520,
            width: 200,
            height: 25,
            text: "PROJECTS",
            fontSize: 14,
            fontFamily: "Arial",
            fill: "#2d5a27",
            fontWeight: "bold",
            draggable: true
          },
          {
            id: "project1_title",
            type: "text",
            x: 50,
            y: 550,
            width: 400,
            height: 20,
            text: "Fabrication of a Miniature Chemical Reactor",
            fontSize: 12,
            fontFamily: "Arial",
            fontWeight: "bold",
            fill: "#1a1a1a",
            draggable: true
          },
          {
            id: "project1_context",
            type: "text",
            x: 50,
            y: 570,
            width: 400,
            height: 18,
            text: "Chemical Engineering Course, Second Semester of 2028",
            fontSize: 12,
            fontFamily: "Arial",
            fontStyle: "italic",
            fill: "#333333",
            draggable: true
          },
          {
            id: "project1_details",
            type: "text",
            x: 50,
            y: 590,
            width: 700,
            height: 60,
            text: "• Engineered a small-scale chemical reactor using principles of chemical engineering\n• Conducted performance tests and optimization checks to ensure efficiency and safety\n• Presented findings to faculty and peers and received excellent marks for innovation",
            fontSize: 12,
            fontFamily: "Arial",
            fill: "#333333",
            draggable: true
          },
          {
            id: "project2_title",
            type: "text",
            x: 50,
            y: 660,
            width: 400,
            height: 20,
            text: "The Green Thumb Chemist",
            fontSize: 12,
            fontFamily: "Arial",
            fontWeight: "bold",
            fill: "#1a1a1a",
            draggable: true
          },
          {
            id: "project2_context",
            type: "text",
            x: 50,
            y: 680,
            width: 400,
            height: 18,
            text: "Chemistry Club, First Semester of 2029",
            fontSize: 12,
            fontFamily: "Arial",
            fontStyle: "italic",
            fill: "#333333",
            draggable: true
          },
          {
            id: "project2_details",
            type: "text",
            x: 50,
            y: 700,
            width: 700,
            height: 60,
            text: "• Developed a project aimed at implementing environmentally-friendly lab practices\n• Researched and implemented sustainable alternatives to hazardous chemicals\n• Educated peers on the importance of green chemistry through workshops and forums",
            fontSize: 12,
            fontFamily: "Arial",
            fill: "#333333",
            draggable: true
          },
          {
            id: "awards_title",
            type: "text",
            x: 50,
            y: 780,
            width: 200,
            height: 25,
            text: "NOTABLE AWARDS",
            fontSize: 14,
            fontFamily: "Arial",
            fill: "#2d5a27",
            fontWeight: "bold",
            draggable: true
          },
          {
            id: "award1",
            type: "text",
            x: 50,
            y: 810,
            width: 700,
            height: 20,
            text: "• Dean's List, East State University, 2026-2030",
            fontSize: 12,
            fontFamily: "Arial",
            fill: "#333333",
            draggable: true
          },
          {
            id: "award2",
            type: "text",
            x: 50,
            y: 830,
            width: 700,
            height: 20,
            text: "• Gold Award, Chemistry Olympiad, 2027",
            fontSize: 12,
            fontFamily: "Arial",
            fill: "#333333",
            draggable: true
          }
        ],
        stageConfig: {
          width: 800,
          height: 1000
        }
      },
      metadata: {
        colorScheme: "light",
        layout: "single-column",
        complexity: "moderate",
        author: "System",
        version: "1.0.0"
      }
    });

    await emmaTemplate.save();
    console.log('Emma Ahearn template saved successfully!');
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error saving template:', error);
    process.exit(1);
  }
}

// Run the script
saveEmmaTemplate();
