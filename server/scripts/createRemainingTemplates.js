const mongoose = require('mongoose');
const Template = require('../models/Template');

// MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://balwinder_cvgenix_1998:mAxGheQuqWAyvmzc@cvgenixdb.vrkl6u1.mongodb.net/?retryWrites=true&w=majority&appName=cvgenixdb';

async function createRemainingTemplates() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const templates = [
      {
        name: 'Graphic Designer Resume',
        description: 'Creative hybrid layout with artistic elements',
        category: 'Creative',
        renderEngine: 'canvas',
        thumbnail: 'https://via.placeholder.com/300x400/e74c3c/ffffff?text=Graphic+Designer',
        preview: 'https://via.placeholder.com/800x1000/e74c3c/ffffff?text=Graphic+Designer+Resume',
        metadata: {
          colorScheme: 'colorful',
          layout: 'hybrid',
          complexity: 'moderate'
        },
        canvasData: {
          version: '5.1.0',
          objects: [
            // Background
            {
              type: 'rect',
              left: 0,
              top: 0,
              width: 800,
              height: 1000,
              fill: '#ffffff',
              stroke: null,
              strokeWidth: 0,
              selectable: false,
              evented: false
            },
            // Header background
            {
              type: 'rect',
              left: 0,
              top: 0,
              width: 800,
              height: 100,
              fill: '#e74c3c',
              stroke: null,
              strokeWidth: 0,
              selectable: false,
              evented: false
            },
            // Left sidebar background
            {
              type: 'rect',
              left: 0,
              top: 100,
              width: 300,
              height: 900,
              fill: '#f8f9fa',
              stroke: null,
              strokeWidth: 0,
              selectable: false,
              evented: false
            },
            // Name
            {
              type: 'text',
              left: 400,
              top: 30,
              width: 400,
              height: 40,
              text: 'MIA RODRIGUEZ',
              fontSize: 26,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#ffffff',
              textAlign: 'center',
              selectable: true,
              evented: true
            },
            // Title
            {
              type: 'text',
              left: 400,
              top: 70,
              width: 400,
              height: 20,
              text: 'Graphic Designer & Creative Director',
              fontSize: 14,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#ffffff',
              textAlign: 'center',
              selectable: true,
              evented: true
            },
            // Contact Info
            {
              type: 'text',
              left: 30,
              top: 130,
              width: 250,
              height: 20,
              text: 'CONTACT INFO',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 30,
              top: 160,
              width: 250,
              height: 80,
              text: 'mia.rodriguez@email.com\n(555) 456-7890\nPortland, OR\nbehance.net/miarodriguez\ninstagram.com/miarodriguez',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#34495e',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            // Design Skills
            {
              type: 'text',
              left: 30,
              top: 270,
              width: 250,
              height: 20,
              text: 'DESIGN SKILLS',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 30,
              top: 300,
              width: 250,
              height: 100,
              text: 'Adobe Creative Suite\nPhotoshop, Illustrator\nInDesign, After Effects\nFigma, Sketch\nUI/UX Design\nBrand Identity\nPrint Design\nWeb Design',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#34495e',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            // Software
            {
              type: 'text',
              left: 30,
              top: 430,
              width: 250,
              height: 20,
              text: 'SOFTWARE',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 30,
              top: 460,
              width: 250,
              height: 60,
              text: 'Adobe Creative Cloud\nFigma, Sketch\nBlender, Cinema 4D\nHTML/CSS\nWordPress',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#34495e',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            // Right side content
            {
              type: 'text',
              left: 350,
              top: 130,
              width: 400,
              height: 20,
              text: 'PROFESSIONAL SUMMARY',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 350,
              top: 160,
              width: 400,
              height: 60,
              text: 'Creative graphic designer with 6+ years of experience in brand identity, digital design, and print media. Passionate about creating visually compelling designs that communicate effectively and engage audiences.',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#34495e',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 350,
              top: 240,
              width: 400,
              height: 20,
              text: 'EXPERIENCE',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 350,
              top: 270,
              width: 400,
              height: 40,
              text: 'Senior Graphic Designer | Creative Studio Co. | 2020-Present',
              fontSize: 14,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 350,
              top: 310,
              width: 400,
              height: 80,
              text: '• Led design projects for 50+ clients across various industries\n• Created comprehensive brand identities and style guides\n• Managed junior designers and mentored team members\n• Increased client satisfaction scores by 25%',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#34495e',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 350,
              top: 410,
              width: 400,
              height: 40,
              text: 'Graphic Designer | Digital Agency Pro | 2018-2020',
              fontSize: 14,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 350,
              top: 450,
              width: 400,
              height: 80,
              text: '• Designed websites and mobile apps for tech startups\n• Created marketing materials and social media graphics\n• Collaborated with developers to ensure design feasibility\n• Won 3 design awards for outstanding creative work',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#34495e',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 350,
              top: 550,
              width: 400,
              height: 20,
              text: 'EDUCATION',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 350,
              top: 580,
              width: 400,
              height: 40,
              text: 'Bachelor of Fine Arts in Graphic Design\nArt Institute of Portland | 2018',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#34495e',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 350,
              top: 640,
              width: 400,
              height: 20,
              text: 'AWARDS & RECOGNITION',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 350,
              top: 670,
              width: 400,
              height: 60,
              text: '• AIGA Design Excellence Award 2022\n• Adobe Creative Suite Certified Professional\n• Featured in Design Magazine "Rising Stars" 2021',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#34495e',
              textAlign: 'left',
              selectable: true,
              evented: true
            }
          ]
        }
      },
      {
        name: 'Financial Analyst Resume',
        description: 'Clean corporate finance resume',
        category: 'Executive',
        renderEngine: 'canvas',
        thumbnail: 'https://via.placeholder.com/300x400/34495e/ffffff?text=Financial+Analyst',
        preview: 'https://via.placeholder.com/800x1000/34495e/ffffff?text=Financial+Analyst+Resume',
        metadata: {
          colorScheme: 'light',
          layout: 'single-column',
          complexity: 'moderate'
        },
        canvasData: {
          version: '5.1.0',
          objects: [
            // Background
            {
              type: 'rect',
              left: 0,
              top: 0,
              width: 800,
              height: 1000,
              fill: '#ffffff',
              stroke: null,
              strokeWidth: 0,
              selectable: false,
              evented: false
            },
            // Header background
            {
              type: 'rect',
              left: 0,
              top: 0,
              width: 800,
              height: 80,
              fill: '#34495e',
              stroke: null,
              strokeWidth: 0,
              selectable: false,
              evented: false
            },
            // Name
            {
              type: 'text',
              left: 400,
              top: 25,
              width: 400,
              height: 30,
              text: 'MICHAEL THOMPSON',
              fontSize: 24,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#ffffff',
              textAlign: 'center',
              selectable: true,
              evented: true
            },
            // Title
            {
              type: 'text',
              left: 400,
              top: 55,
              width: 400,
              height: 20,
              text: 'Financial Analyst',
              fontSize: 14,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#ecf0f1',
              textAlign: 'center',
              selectable: true,
              evented: true
            },
            // Professional Summary
            {
              type: 'text',
              left: 50,
              top: 100,
              width: 700,
              height: 20,
              text: 'PROFESSIONAL SUMMARY',
              fontSize: 18,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 50,
              top: 130,
              width: 700,
              height: 60,
              text: 'Detail-oriented financial analyst with 5+ years of experience in financial modeling, budgeting, and investment analysis. Strong analytical skills and expertise in Excel, SQL, and financial software.',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#34495e',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            // Experience
            {
              type: 'text',
              left: 50,
              top: 210,
              width: 700,
              height: 20,
              text: 'EXPERIENCE',
              fontSize: 18,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 50,
              top: 240,
              width: 700,
              height: 40,
              text: 'Senior Financial Analyst | Fortune 500 Corp | 2020-Present',
              fontSize: 14,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 50,
              top: 280,
              width: 700,
              height: 80,
              text: '• Developed financial models for $50M+ investment decisions\n• Led quarterly budget reviews and variance analysis\n• Created automated reporting dashboards reducing analysis time by 40%\n• Collaborated with cross-functional teams on strategic planning',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#34495e',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 50,
              top: 380,
              width: 700,
              height: 40,
              text: 'Financial Analyst | Investment Bank Ltd | 2018-2020',
              fontSize: 14,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 50,
              top: 420,
              width: 700,
              height: 80,
              text: '• Analyzed financial statements and market trends for investment recommendations\n• Prepared pitch books and presentations for client meetings\n• Supported M&A transactions worth over $100M\n• Maintained relationships with key stakeholders and clients',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#34495e',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            // Education
            {
              type: 'text',
              left: 50,
              top: 520,
              width: 700,
              height: 20,
              text: 'EDUCATION',
              fontSize: 18,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 50,
              top: 550,
              width: 700,
              height: 40,
              text: 'Master of Business Administration (MBA) - Finance\nUniversity of Chicago, Booth School of Business | 2018',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#34495e',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            // Certifications
            {
              type: 'text',
              left: 50,
              top: 610,
              width: 700,
              height: 20,
              text: 'CERTIFICATIONS',
              fontSize: 18,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 50,
              top: 640,
              width: 700,
              height: 60,
              text: '• Chartered Financial Analyst (CFA) Level II\n• Certified Public Accountant (CPA)\n• Financial Modeling & Valuation Analyst (FMVA)',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#34495e',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            // Technical Skills
            {
              type: 'text',
              left: 50,
              top: 720,
              width: 700,
              height: 20,
              text: 'TECHNICAL SKILLS',
              fontSize: 18,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 50,
              top: 750,
              width: 700,
              height: 60,
              text: 'Excel (Advanced), SQL, Python, Tableau, Power BI, Bloomberg Terminal, SAP, QuickBooks, Financial Modeling, Risk Analysis, Investment Analysis',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#34495e',
              textAlign: 'left',
              selectable: true,
              evented: true
            }
          ]
        }
      },
      {
        name: 'Nurse Resume',
        description: 'Professional healthcare resume with medical focus',
        category: 'Professional',
        renderEngine: 'canvas',
        thumbnail: 'https://via.placeholder.com/300x400/27ae60/ffffff?text=Registered+Nurse',
        preview: 'https://via.placeholder.com/800x1000/27ae60/ffffff?text=Nurse+Resume',
        metadata: {
          colorScheme: 'light',
          layout: 'single-column',
          complexity: 'simple'
        },
        canvasData: {
          version: '5.1.0',
          objects: [
            // Background
            {
              type: 'rect',
              left: 0,
              top: 0,
              width: 800,
              height: 1000,
              fill: '#ffffff',
              stroke: null,
              strokeWidth: 0,
              selectable: false,
              evented: false
            },
            // Header background
            {
              type: 'rect',
              left: 0,
              top: 0,
              width: 800,
              height: 100,
              fill: '#27ae60',
              stroke: null,
              strokeWidth: 0,
              selectable: false,
              evented: false
            },
            // Name
            {
              type: 'text',
              left: 400,
              top: 30,
              width: 400,
              height: 40,
              text: 'JENNIFER MARTINEZ',
              fontSize: 24,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#ffffff',
              textAlign: 'center',
              selectable: true,
              evented: true
            },
            // Title
            {
              type: 'text',
              left: 400,
              top: 70,
              width: 400,
              height: 20,
              text: 'Registered Nurse',
              fontSize: 14,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#ffffff',
              textAlign: 'center',
              selectable: true,
              evented: true
            },
            // Professional Summary
            {
              type: 'text',
              left: 50,
              top: 120,
              width: 700,
              height: 20,
              text: 'PROFESSIONAL SUMMARY',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 50,
              top: 150,
              width: 700,
              height: 60,
              text: 'Compassionate and dedicated Registered Nurse with 8+ years of experience in patient care, medical procedures, and healthcare coordination. Committed to providing exceptional patient care and improving health outcomes.',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#34495e',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            // Experience
            {
              type: 'text',
              left: 50,
              top: 230,
              width: 700,
              height: 20,
              text: 'EXPERIENCE',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 50,
              top: 260,
              width: 700,
              height: 40,
              text: 'Senior Registered Nurse | City General Hospital | 2019-Present',
              fontSize: 14,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 50,
              top: 300,
              width: 700,
              height: 80,
              text: '• Provide direct patient care for 20+ patients daily in medical-surgical unit\n• Mentor new nursing staff and conduct training sessions\n• Collaborate with healthcare team to develop patient care plans\n• Maintain accurate medical records and documentation',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#34495e',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 50,
              top: 400,
              width: 700,
              height: 40,
              text: 'Registered Nurse | Community Health Center | 2016-2019',
              fontSize: 14,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 50,
              top: 440,
              width: 700,
              height: 80,
              text: '• Administered medications and treatments according to physician orders\n• Conducted patient assessments and vital sign monitoring\n• Educated patients and families on health management\n• Participated in quality improvement initiatives',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#34495e',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            // Education & Certifications
            {
              type: 'text',
              left: 50,
              top: 540,
              width: 700,
              height: 20,
              text: 'EDUCATION & CERTIFICATIONS',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 50,
              top: 570,
              width: 700,
              height: 60,
              text: 'Bachelor of Science in Nursing (BSN)\nUniversity of California, Los Angeles | 2016\n\nLicensed Registered Nurse (RN) - California\nBasic Life Support (BLS) Certified\nAdvanced Cardiac Life Support (ACLS) Certified',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#34495e',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            // Skills
            {
              type: 'text',
              left: 50,
              top: 650,
              width: 700,
              height: 20,
              text: 'SKILLS',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 50,
              top: 680,
              width: 700,
              height: 60,
              text: 'Patient Care, Medical Procedures, Medication Administration, Electronic Health Records (EHR), Patient Assessment, IV Therapy, Wound Care, Emergency Response, Team Collaboration, Patient Education',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#34495e',
              textAlign: 'left',
              selectable: true,
              evented: true
            }
          ]
        }
      }
    ];

    // Insert templates
    for (const template of templates) {
      const newTemplate = new Template(template);
      await newTemplate.save();
      console.log(`✅ Created template: ${template.name}`);
    }

    console.log(`🎉 Successfully created ${templates.length} additional properly designed resume templates!`);
    
  } catch (error) {
    console.error('❌ Error creating templates:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createRemainingTemplates();
