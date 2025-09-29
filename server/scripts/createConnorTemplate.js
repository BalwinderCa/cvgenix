const mongoose = require('mongoose');
const Template = require('../models/Template');
require('dotenv').config({ path: '../.env' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

async function createConnorTemplate() {
  try {
    await connectDB();

    // Connor Hamilton - Clean Real Estate Template
    const templateData = {
      name: 'Connor Hamilton - Real Estate',
      description: 'Modern professional resume template for real estate professionals',
      category: 'Professional',
      tags: ['real-estate', 'modern', 'professional', 'sales'],
      thumbnail: '/templates/connor-thumbnail.png',
      preview: '/templates/connor-preview.png',
      renderEngine: 'builder',
      
      builderData: {
        components: [
          {
            type: 'resume-container',
            tagName: 'div',
            style: {
              fontFamily: 'Arial, sans-serif',
              lineHeight: '1.5',
              color: '#333',
              background: '#fff',
              padding: '40px',
              maxWidth: '800px',
              margin: '0 auto'
            },
            components: [
              // Header Section
              {
                type: 'header',
                tagName: 'header',
                style: {
                  textAlign: 'center',
                  marginBottom: '30px',
                  paddingBottom: '20px'
                },
                components: [
                  {
                    type: 'name-box',
                    tagName: 'div',
                    style: {
                      padding: '15px 30px',
                      marginBottom: '10px',
                      display: 'inline-block'
                    },
                    components: [
                      {
                        type: 'name',
                        tagName: 'h1',
                        content: 'CONNOR HAMILTON',
                        style: {
                          fontSize: '1.8rem',
                          fontWeight: 'bold',
                          color: '#333',
                          letterSpacing: '3px',
                          textTransform: 'uppercase',
                          margin: '0'
                        }
                      }
                    ]
                  },
                  {
                    type: 'job-title',
                    tagName: 'div',
                    content: 'Real Estate Agent',
                    style: {
                      fontSize: '1rem',
                      color: '#333',
                      fontWeight: 'normal',
                      marginBottom: '20px'
                    }
                  },
                  {
                    type: 'contact-info',
                    tagName: 'div',
                    content: '123-456-7890 | hello@reallygreatsite.com | reallygreatsite.com',
                    style: {
                      fontSize: '0.9rem',
                      color: '#333'
                    }
                  }
                ]
              },
              
              // Profile Section
              {
                type: 'section',
                tagName: 'section',
                style: { marginBottom: '25px' },
                components: [
                  {
                    type: 'section-title',
                    tagName: 'h2',
                    content: 'PROFILE',
                    style: {
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      color: '#333',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      marginBottom: '15px',
                      paddingBottom: '5px',
                      borderBottom: '1px solid #ccc',
                      margin: '0 0 15px 0'
                    }
                  },
                  {
                    type: 'profile-text',
                    tagName: 'p',
                    content: 'I am an experienced Real Estate Agent with a passion for helping clients find their dream homes. I have extensive experience in the industry, including more than 5 years working as a real estate agent. I am knowledgeable about the latest market trends and understand the nuances of the real estate market. I pride myself on my ability to negotiate the best deals for my clients and to navigate complex real estate agreements. I am highly organized, detail-oriented, and have strong communication skills.',
                    style: {
                      fontSize: '0.85rem',
                      lineHeight: '1.6',
                      color: '#333',
                      textAlign: 'justify',
                      margin: '0'
                    }
                  }
                ]
              },
              
              // Work Experience
              {
                type: 'section',
                tagName: 'section',
                style: { marginBottom: '25px' },
                components: [
                  {
                    type: 'section-title',
                    tagName: 'h2',
                    content: 'WORK EXPERIENCE',
                    style: {
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      color: '#333',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      marginBottom: '15px',
                      paddingBottom: '5px',
                      borderBottom: '1px solid #ccc',
                      margin: '0 0 15px 0'
                    }
                  },
                  {
                    type: 'work-item',
                    tagName: 'div',
                    style: { marginBottom: '20px' },
                    components: [
                      {
                        type: 'job-header',
                        tagName: 'div',
                        style: { marginBottom: '10px' },
                        components: [
                          {
                            type: 'company-name',
                            tagName: 'div',
                            content: 'Really Great Company',
                            style: {
                              fontWeight: 'bold',
                              color: '#333',
                              fontSize: '0.9rem',
                              marginBottom: '3px'
                            }
                          },
                          {
                            type: 'job-dates',
                            tagName: 'div',
                            content: 'June 2015 - Present',
                            style: {
                              color: '#333',
                              fontSize: '0.85rem',
                              marginBottom: '3px'
                            }
                          },
                          {
                            type: 'job-title-work',
                            tagName: 'div',
                            content: 'REAL ESTATE AGENT',
                            style: {
                              fontWeight: 'bold',
                              color: '#333',
                              fontSize: '0.85rem',
                              textTransform: 'uppercase',
                              marginBottom: '8px'
                            }
                          }
                        ]
                      },
                      {
                        type: 'achievements',
                        tagName: 'div',
                        components: [
                          {
                            type: 'achievement',
                            tagName: 'div',
                            content: '• Negotiate contracts and complex real estate transactions',
                            style: {
                              fontSize: '0.8rem',
                              color: '#333',
                              marginBottom: '3px'
                            }
                          },
                          {
                            type: 'achievement',
                            tagName: 'div',
                            content: '• Provide excellent customer service to clients',
                            style: {
                              fontSize: '0.8rem',
                              color: '#333',
                              marginBottom: '3px'
                            }
                          },
                          {
                            type: 'achievement',
                            tagName: 'div',
                            content: '• Update and maintain client files',
                            style: {
                              fontSize: '0.8rem',
                              color: '#333',
                              marginBottom: '3px'
                            }
                          },
                          {
                            type: 'achievement',
                            tagName: 'div',
                            content: '• Research and monitor the local real estate market',
                            style: {
                              fontSize: '0.8rem',
                              color: '#333',
                              marginBottom: '3px'
                            }
                          },
                          {
                            type: 'achievement',
                            tagName: 'div',
                            content: '• Utilize social media platforms to market properties',
                            style: {
                              fontSize: '0.8rem',
                              color: '#333',
                              marginBottom: '3px'
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              
              // Two Column Layout for Education and Skills
              {
                type: 'two-column-container',
                tagName: 'div',
                style: {
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '30px',
                  marginBottom: '25px'
                },
                components: [
                  // Education Column
                  {
                    type: 'section',
                    tagName: 'section',
                    style: { marginBottom: '25px' },
                    components: [
                      {
                        type: 'section-title',
                        tagName: 'h2',
                        content: 'EDUCATION',
                        style: {
                          fontSize: '0.9rem',
                          fontWeight: 'bold',
                          color: '#333',
                          textTransform: 'uppercase',
                          letterSpacing: '2px',
                          marginBottom: '15px',
                          paddingBottom: '5px',
                          borderBottom: '1px solid #ccc',
                          margin: '0 0 15px 0'
                        }
                      },
                      {
                        type: 'education-item',
                        tagName: 'div',
                        style: { marginBottom: '10px' },
                        components: [
                          {
                            type: 'institution',
                            tagName: 'div',
                            content: 'University',
                            style: {
                              fontWeight: 'bold',
                              color: '#333',
                              fontSize: '0.85rem',
                              marginBottom: '3px'
                            }
                          },
                          {
                            type: 'education-dates',
                            tagName: 'div',
                            content: '2010 - 2014',
                            style: {
                              color: '#333',
                              fontSize: '0.8rem',
                              marginBottom: '3px'
                            }
                          },
                          {
                            type: 'degree',
                            tagName: 'div',
                            content: 'B.A. in Business Administration',
                            style: {
                              color: '#333',
                              fontSize: '0.8rem'
                            }
                          }
                        ]
                      }
                    ]
                  },
                  
                  // Skills Column
                  {
                    type: 'section',
                    tagName: 'section',
                    style: { marginBottom: '25px' },
                    components: [
                      {
                        type: 'section-title',
                        tagName: 'h2',
                        content: 'SKILLS',
                        style: {
                          fontSize: '0.9rem',
                          fontWeight: 'bold',
                          color: '#333',
                          textTransform: 'uppercase',
                          letterSpacing: '2px',
                          marginBottom: '15px',
                          paddingBottom: '5px',
                          borderBottom: '1px solid #ccc',
                          margin: '0 0 15px 0'
                        }
                      },
                      {
                        type: 'skills-list',
                        tagName: 'div',
                        components: [
                          {
                            type: 'skill',
                            tagName: 'div',
                            content: '• Knowledge of the local real estate market',
                            style: {
                              fontSize: '0.8rem',
                              color: '#333',
                              marginBottom: '3px'
                            }
                          },
                          {
                            type: 'skill',
                            tagName: 'div',
                            content: '• Communication skills',
                            style: {
                              fontSize: '0.8rem',
                              color: '#333',
                              marginBottom: '3px'
                            }
                          },
                          {
                            type: 'skill',
                            tagName: 'div',
                            content: '• Negotiation skills',
                            style: {
                              fontSize: '0.8rem',
                              color: '#333',
                              marginBottom: '3px'
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              
              // Certifications
              {
                type: 'section',
                tagName: 'section',
                style: { marginBottom: '25px' },
                components: [
                  {
                    type: 'section-title',
                    tagName: 'h2',
                    content: 'CERTIFICATIONS',
                    style: {
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      color: '#333',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      marginBottom: '15px',
                      paddingBottom: '5px',
                      borderBottom: '1px solid #ccc',
                      margin: '0 0 15px 0'
                    }
                  },
                  {
                    type: 'certifications-list',
                    tagName: 'div',
                    components: [
                      {
                        type: 'certification',
                        tagName: 'div',
                        content: '• Licensed Real Estate Agent',
                        style: {
                          fontSize: '0.8rem',
                          color: '#333',
                          marginBottom: '3px'
                        }
                      },
                      {
                        type: 'certification',
                        tagName: 'div',
                        content: '• Certified Real Estate Negotiator',
                        style: {
                          fontSize: '0.8rem',
                          color: '#333',
                          marginBottom: '3px'
                        }
                      },
                      {
                        type: 'certification',
                        tagName: 'div',
                        content: '• Top Sales Agent Award 2016',
                        style: {
                          fontSize: '0.8rem',
                          color: '#333',
                          marginBottom: '3px'
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      
      isPremium: false,
      isActive: true,
      rating: {
        average: 4.6,
        count: 22
      },
      features: ['Real Estate', 'Modern', 'Professional', 'Two-Column Layout'],
      downloadCount: 0
    };

    // Create new template
    const template = new Template(templateData);
    await template.save();
    console.log('✅ Connor Hamilton template created successfully');

    // Verify the template
    const totalTemplates = await Template.countDocuments();
    console.log(`📊 Total templates in database: ${totalTemplates}`);
    console.log(`📝 Template ID: ${template._id}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

createConnorTemplate();
