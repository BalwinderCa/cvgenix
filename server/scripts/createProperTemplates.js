const mongoose = require('mongoose');
const Template = require('../models/Template');

// MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://balwinder_cvgenix_1998:mAxGheQuqWAyvmzc@cvgenixdb.vrkl6u1.mongodb.net/?retryWrites=true&w=majority&appName=cvgenixdb';

async function createProperTemplates() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing templates
    await Template.deleteMany({});
    console.log('🗑️ Cleared existing templates');

    const templates = [
      {
        name: 'Software Engineer Resume',
        description: 'Clean two-column tech resume with professional layout',
        category: 'Professional',
        renderEngine: 'canvas',
        thumbnail: 'https://via.placeholder.com/300x400/2c3e50/ffffff?text=Software+Engineer',
        preview: 'https://via.placeholder.com/800x1000/2c3e50/ffffff?text=Software+Engineer+Resume',
        metadata: {
          colorScheme: 'light',
          layout: 'two-column',
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
            // Left sidebar background
            {
              type: 'rect',
              left: 0,
              top: 0,
              width: 250,
              height: 1000,
              fill: '#2c3e50',
              stroke: null,
              strokeWidth: 0,
              selectable: false,
              evented: false
            },
            // Name
            {
              type: 'text',
              left: 125,
              top: 50,
              width: 200,
              height: 40,
              text: 'JOHN SMITH',
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
              left: 125,
              top: 90,
              width: 200,
              height: 20,
              text: 'Software Engineer',
              fontSize: 14,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#ecf0f1',
              textAlign: 'center',
              selectable: true,
              evented: true
            },
            // Contact section
            {
              type: 'text',
              left: 125,
              top: 150,
              width: 200,
              height: 20,
              text: 'CONTACT',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#ffffff',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 125,
              top: 180,
              width: 200,
              height: 80,
              text: 'john.smith@email.com\n(555) 123-4567\nSan Francisco, CA\nlinkedin.com/in/johnsmith',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#ecf0f1',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            // Skills section
            {
              type: 'text',
              left: 125,
              top: 280,
              width: 200,
              height: 20,
              text: 'SKILLS',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#ffffff',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 125,
              top: 310,
              width: 200,
              height: 100,
              text: 'JavaScript, Python, React\nNode.js, MongoDB, AWS\nGit, Docker, Kubernetes\nAgile, Scrum, CI/CD',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#ecf0f1',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            // Right side content
            {
              type: 'text',
              left: 300,
              top: 50,
              width: 450,
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
              left: 300,
              top: 80,
              width: 450,
              height: 60,
              text: 'Experienced software engineer with 5+ years developing scalable web applications. Passionate about clean code, agile methodologies, and continuous learning.',
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
              left: 300,
              top: 160,
              width: 450,
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
              left: 300,
              top: 190,
              width: 450,
              height: 40,
              text: 'Senior Software Engineer | TechCorp Inc. | 2020-Present',
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
              left: 300,
              top: 230,
              width: 450,
              height: 60,
              text: '• Led development of microservices architecture serving 1M+ users\n• Improved application performance by 40% through code optimization\n• Mentored 3 junior developers and conducted code reviews',
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
              left: 300,
              top: 320,
              width: 450,
              height: 40,
              text: 'Software Engineer | StartupXYZ | 2018-2020',
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
              left: 300,
              top: 360,
              width: 450,
              height: 60,
              text: '• Developed full-stack web applications using React and Node.js\n• Implemented automated testing reducing bugs by 30%\n• Collaborated with design team to improve user experience',
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
              left: 300,
              top: 450,
              width: 450,
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
              left: 300,
              top: 480,
              width: 450,
              height: 40,
              text: 'Bachelor of Science in Computer Science\nUniversity of California, Berkeley | 2018',
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
        name: 'Marketing Manager Resume',
        description: 'Professional single-column marketing resume',
        category: 'Professional',
        renderEngine: 'canvas',
        thumbnail: 'https://via.placeholder.com/300x400/3498db/ffffff?text=Marketing+Manager',
        preview: 'https://via.placeholder.com/800x1000/3498db/ffffff?text=Marketing+Manager+Resume',
        metadata: {
          colorScheme: 'colorful',
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
              height: 100,
              fill: '#3498db',
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
              text: 'SARAH JOHNSON',
              fontSize: 28,
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
              text: 'Marketing Manager',
              fontSize: 16,
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
              top: 130,
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
              top: 160,
              width: 700,
              height: 60,
              text: 'Results-driven marketing professional with 8+ years of experience in digital marketing, brand management, and team leadership. Proven track record of increasing brand awareness and driving revenue growth.',
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
              top: 240,
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
              top: 270,
              width: 700,
              height: 40,
              text: 'Senior Marketing Manager | Global Brands Inc. | 2019-Present',
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
              top: 310,
              width: 700,
              height: 80,
              text: '• Led digital marketing campaigns resulting in 150% increase in online sales\n• Managed team of 5 marketing specialists and coordinated with cross-functional teams\n• Developed and executed social media strategy growing followers by 200%\n• Implemented marketing automation tools improving lead conversion by 35%',
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
              top: 410,
              width: 700,
              height: 40,
              text: 'Marketing Manager | TechStart Solutions | 2016-2019',
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
              top: 450,
              width: 700,
              height: 80,
              text: '• Launched successful product marketing campaigns for 3 new product lines\n• Increased brand awareness by 80% through strategic content marketing\n• Managed $500K annual marketing budget and achieved 120% ROI\n• Collaborated with sales team to generate $2M in qualified leads',
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
              top: 550,
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
              top: 580,
              width: 700,
              height: 40,
              text: 'Master of Business Administration (MBA)\nNorthwestern University, Kellogg School of Management | 2016',
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
              top: 640,
              width: 700,
              height: 20,
              text: 'SKILLS',
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
              top: 670,
              width: 700,
              height: 60,
              text: 'Digital Marketing, Brand Management, Team Leadership, Marketing Analytics, SEO/SEM, Social Media Marketing, Content Strategy, Marketing Automation, CRM Management, Project Management',
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
        name: 'Data Scientist Resume',
        description: 'Technical two-column data science resume',
        category: 'Professional',
        renderEngine: 'canvas',
        thumbnail: 'https://via.placeholder.com/300x400/1a1a1a/ffffff?text=Data+Scientist',
        preview: 'https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Data+Scientist+Resume',
        metadata: {
          colorScheme: 'dark',
          layout: 'two-column',
          complexity: 'complex'
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
            // Left sidebar background
            {
              type: 'rect',
              left: 0,
              top: 0,
              width: 200,
              height: 1000,
              fill: '#1a1a1a',
              stroke: null,
              strokeWidth: 0,
              selectable: false,
              evented: false
            },
            // Name
            {
              type: 'text',
              left: 100,
              top: 40,
              width: 150,
              height: 40,
              text: 'DR. ALEX CHEN',
              fontSize: 20,
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
              left: 100,
              top: 80,
              width: 150,
              height: 20,
              text: 'Data Scientist',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#bdc3c7',
              textAlign: 'center',
              selectable: true,
              evented: true
            },
            // Contact
            {
              type: 'text',
              left: 100,
              top: 130,
              width: 150,
              height: 20,
              text: 'CONTACT',
              fontSize: 14,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#ffffff',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 100,
              top: 160,
              width: 150,
              height: 80,
              text: 'alex.chen@email.com\n(555) 987-6543\nSeattle, WA\nlinkedin.com/in/alexchen',
              fontSize: 10,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#bdc3c7',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            // Technical Skills
            {
              type: 'text',
              left: 100,
              top: 270,
              width: 150,
              height: 20,
              text: 'TECHNICAL SKILLS',
              fontSize: 14,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#ffffff',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 100,
              top: 300,
              width: 150,
              height: 120,
              text: 'Python, R, SQL\nMachine Learning\nTensorFlow, PyTorch\nPandas, NumPy, Scikit-learn\nAWS, GCP, Azure\nDocker, Kubernetes\nGit, Jupyter Notebooks',
              fontSize: 10,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#bdc3c7',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            // Right side content
            {
              type: 'text',
              left: 250,
              top: 40,
              width: 500,
              height: 20,
              text: 'PROFESSIONAL SUMMARY',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#1a1a1a',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 250,
              top: 70,
              width: 500,
              height: 60,
              text: 'Senior Data Scientist with 7+ years of experience in machine learning, statistical analysis, and big data processing. Expert in Python, R, and cloud platforms with a track record of delivering impactful data-driven solutions.',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 250,
              top: 150,
              width: 500,
              height: 20,
              text: 'EXPERIENCE',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#1a1a1a',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 250,
              top: 180,
              width: 500,
              height: 40,
              text: 'Senior Data Scientist | DataCorp Analytics | 2020-Present',
              fontSize: 14,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#1a1a1a',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 250,
              top: 220,
              width: 500,
              height: 80,
              text: '• Developed ML models improving prediction accuracy by 25% and reducing costs by $2M annually\n• Led team of 4 data scientists and mentored junior analysts\n• Built end-to-end data pipelines processing 10TB+ daily data\n• Presented findings to C-level executives and stakeholders',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 250,
              top: 320,
              width: 500,
              height: 40,
              text: 'Data Scientist | TechStart AI | 2017-2020',
              fontSize: 14,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#1a1a1a',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 250,
              top: 360,
              width: 500,
              height: 80,
              text: '• Created recommendation systems increasing user engagement by 40%\n• Implemented A/B testing framework improving conversion rates by 15%\n• Developed real-time fraud detection models with 99.5% accuracy\n• Collaborated with engineering teams to deploy models in production',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 250,
              top: 460,
              width: 500,
              height: 20,
              text: 'EDUCATION',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#1a1a1a',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 250,
              top: 490,
              width: 500,
              height: 40,
              text: 'Ph.D. in Statistics | Stanford University | 2017\nM.S. in Computer Science | MIT | 2015',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#2c3e50',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 250,
              top: 550,
              width: 500,
              height: 20,
              text: 'PUBLICATIONS',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              fill: '#1a1a1a',
              textAlign: 'left',
              selectable: true,
              evented: true
            },
            {
              type: 'text',
              left: 250,
              top: 580,
              width: 500,
              height: 60,
              text: '• "Advanced Deep Learning Techniques for Time Series Forecasting" - Journal of Machine Learning Research, 2022\n• "Scalable Machine Learning Pipelines for Big Data" - IEEE Transactions on Knowledge and Data Engineering, 2021',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'Arial',
              fill: '#2c3e50',
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

    console.log(`🎉 Successfully created ${templates.length} properly designed resume templates!`);
    
  } catch (error) {
    console.error('❌ Error creating templates:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createProperTemplates();
