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

async function createEmmaTemplate() {
  try {
    await connectDB();

    // Emma Ahearn - Clean Chemist Template
    const templateData = {
      name: 'Emma Ahearn - Chemist',
      description: 'Professional chemistry resume template with clean academic layout',
      category: 'Professional',
      tags: ['chemistry', 'science', 'academic', 'professional'],
      thumbnail: '/templates/emma-thumbnail.png',
      preview: '/templates/emma-preview.png',
      renderEngine: 'builder',
      
      builderData: {
        components: [
          {
            type: 'resume-container',
            tagName: 'div',
            style: {
              fontFamily: 'Times New Roman, serif',
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
                    type: 'name',
                    tagName: 'h1',
                    content: 'Emma Ahearn',
                    style: {
                      fontSize: '2.5rem',
                      fontWeight: 'normal',
                      color: '#333',
                      margin: '0 0 8px 0'
                    }
                  },
                  {
                    type: 'job-title',
                    tagName: 'div',
                    content: 'CHEMIST',
                    style: {
                      fontSize: '1.1rem',
                      color: '#333',
                      fontWeight: 'normal',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      marginBottom: '20px'
                    }
                  },
                  {
                    type: 'divider',
                    tagName: 'div',
                    style: {
                      width: '100%',
                      height: '1px',
                      background: '#333',
                      margin: '20px 0'
                    }
                  },
                  // Contact Info
                  {
                    type: 'contact-grid',
                    tagName: 'div',
                    style: {
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '20px',
                      fontSize: '0.9rem',
                      color: '#333',
                      marginBottom: '20px',
                      textAlign: 'center'
                    },
                    components: [
                      {
                        type: 'contact-item',
                        tagName: 'div',
                        components: [
                          {
                            type: 'contact-label',
                            tagName: 'div',
                            content: 'Phone:',
                            style: { fontWeight: 'bold', color: '#333' }
                          },
                          {
                            type: 'contact-value',
                            tagName: 'div',
                            content: '+123-456-7890'
                          }
                        ]
                      },
                      {
                        type: 'contact-item',
                        tagName: 'div',
                        components: [
                          {
                            type: 'contact-label',
                            tagName: 'div',
                            content: 'Email:',
                            style: { fontWeight: 'bold', color: '#333' }
                          },
                          {
                            type: 'contact-value',
                            tagName: 'div',
                            content: 'hello@reallygreatsite.com'
                          }
                        ]
                      },
                      {
                        type: 'contact-item',
                        tagName: 'div',
                        components: [
                          {
                            type: 'contact-label',
                            tagName: 'div',
                            content: 'Address:',
                            style: { fontWeight: 'bold', color: '#333' }
                          },
                          {
                            type: 'contact-value',
                            tagName: 'div',
                            content: '123 Anywhere St., Any City, ST 12345'
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              
              // Professional Summary
              {
                type: 'section',
                tagName: 'section',
                style: { marginBottom: '25px' },
                components: [
                  {
                    type: 'section-title',
                    tagName: 'h2',
                    content: 'Professional Summary',
                    style: {
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      color: '#333',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '15px',
                      paddingBottom: '5px',
                      borderBottom: '1px solid #333',
                      margin: '0 0 15px 0'
                    }
                  },
                  {
                    type: 'summary-text',
                    tagName: 'p',
                    content: 'I am a chemistry graduate seeking to apply my extensive academic background and laboratory experience in an organization with an innovative vision. I am looking forward to contributing to a dynamic team and supporting research and development efforts.',
                    style: {
                      fontSize: '0.9rem',
                      lineHeight: '1.6',
                      color: '#333',
                      textAlign: 'justify',
                      fontStyle: 'italic',
                      margin: '0'
                    }
                  }
                ]
              },
              
              // Education
              {
                type: 'section',
                tagName: 'section',
                style: { marginBottom: '25px' },
                components: [
                  {
                    type: 'section-title',
                    tagName: 'h2',
                    content: 'Education',
                    style: {
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      color: '#333',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '15px',
                      paddingBottom: '5px',
                      borderBottom: '1px solid #333',
                      margin: '0 0 15px 0'
                    }
                  },
                  {
                    type: 'education-item',
                    tagName: 'div',
                    style: { marginBottom: '15px' },
                    components: [
                      {
                        type: 'degree-header',
                        tagName: 'div',
                        style: {
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          marginBottom: '5px'
                        },
                        components: [
                          {
                            type: 'degree-title',
                            tagName: 'span',
                            content: 'Bachelor of Science in Chemistry',
                            style: {
                              fontWeight: 'bold',
                              color: '#333',
                              fontSize: '0.9rem'
                            }
                          },
                          {
                            type: 'dates',
                            tagName: 'span',
                            content: '2026-2030',
                            style: {
                              color: '#333',
                              fontSize: '0.9rem'
                            }
                          }
                        ]
                      },
                      {
                        type: 'institution',
                        tagName: 'div',
                        content: 'East State University, Valley City',
                        style: {
                          color: '#333',
                          fontStyle: 'italic',
                          marginBottom: '8px',
                          fontSize: '0.9rem'
                        }
                      },
                      {
                        type: 'coursework',
                        tagName: 'div',
                        content: '• Relevant Coursework: Organic Chemistry, Inorganic Chemistry, Physical Chemistry, Analytical Chemistry, Chemical Engineering Principles, Thermodynamics, Material Science',
                        style: {
                          fontSize: '0.85rem',
                          color: '#333',
                          marginBottom: '5px'
                        }
                      },
                      {
                        type: 'gpa',
                        tagName: 'div',
                        content: '• GPA: 3.8',
                        style: {
                          fontSize: '0.85rem',
                          color: '#333',
                          fontWeight: 'bold'
                        }
                      }
                    ]
                  }
                ]
              },
              
              // Research Experience
              {
                type: 'section',
                tagName: 'section',
                style: { marginBottom: '25px' },
                components: [
                  {
                    type: 'section-title',
                    tagName: 'h2',
                    content: 'Research Experience',
                    style: {
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      color: '#333',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '15px',
                      paddingBottom: '5px',
                      borderBottom: '1px solid #333',
                      margin: '0 0 15px 0'
                    }
                  },
                  {
                    type: 'experience-item',
                    tagName: 'div',
                    style: { marginBottom: '15px' },
                    components: [
                      {
                        type: 'job-header',
                        tagName: 'div',
                        style: {
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          marginBottom: '5px'
                        },
                        components: [
                          {
                            type: 'job-title',
                            tagName: 'span',
                            content: 'Undergraduate Research Assistant',
                            style: {
                              fontWeight: 'bold',
                              color: '#333',
                              fontSize: '0.9rem'
                            }
                          },
                          {
                            type: 'dates',
                            tagName: 'span',
                            content: '2029-2030',
                            style: {
                              color: '#333',
                              fontSize: '0.9rem'
                            }
                          }
                        ]
                      },
                      {
                        type: 'company',
                        tagName: 'div',
                        content: 'Chemistry Department of East State University',
                        style: {
                          color: '#333',
                          fontStyle: 'italic',
                          marginBottom: '8px',
                          fontSize: '0.9rem'
                        }
                      },
                      {
                        type: 'achievements',
                        tagName: 'div',
                        components: [
                          {
                            type: 'achievement',
                            tagName: 'div',
                            content: '• Collaborated with a research team to study the synthesis of novel organic compounds',
                            style: {
                              fontSize: '0.85rem',
                              color: '#333',
                              marginBottom: '3px'
                            }
                          },
                          {
                            type: 'achievement',
                            tagName: 'div',
                            content: '• Conducted experiments using chromatography, spectroscopy, and other analytical techniques',
                            style: {
                              fontSize: '0.85rem',
                              color: '#333',
                              marginBottom: '3px'
                            }
                          },
                          {
                            type: 'achievement',
                            tagName: 'div',
                            content: '• Analyzed and interpreted data, contributing to a research paper submitted for publication',
                            style: {
                              fontSize: '0.85rem',
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
              
              // Projects
              {
                type: 'section',
                tagName: 'section',
                style: { marginBottom: '25px' },
                components: [
                  {
                    type: 'section-title',
                    tagName: 'h2',
                    content: 'Projects',
                    style: {
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      color: '#333',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '15px',
                      paddingBottom: '5px',
                      borderBottom: '1px solid #333',
                      margin: '0 0 15px 0'
                    }
                  },
                  {
                    type: 'project-item',
                    tagName: 'div',
                    style: { marginBottom: '15px' },
                    components: [
                      {
                        type: 'project-title',
                        tagName: 'div',
                        content: 'Fabrication of a Miniature Chemical Reactor',
                        style: {
                          fontWeight: 'bold',
                          color: '#333',
                          fontSize: '0.9rem',
                          marginBottom: '5px'
                        }
                      },
                      {
                        type: 'project-context',
                        tagName: 'div',
                        content: 'Chemical Engineering Course, Second Semester of 2028',
                        style: {
                          color: '#333',
                          fontStyle: 'italic',
                          marginBottom: '8px',
                          fontSize: '0.9rem'
                        }
                      },
                      {
                        type: 'project-achievements',
                        tagName: 'div',
                        components: [
                          {
                            type: 'achievement',
                            tagName: 'div',
                            content: '• Engineered a small-scale chemical reactor using principles of chemical engineering',
                            style: {
                              fontSize: '0.85rem',
                              color: '#333',
                              marginBottom: '3px'
                            }
                          },
                          {
                            type: 'achievement',
                            tagName: 'div',
                            content: '• Conducted performance tests and optimization checks to ensure efficiency and safety',
                            style: {
                              fontSize: '0.85rem',
                              color: '#333',
                              marginBottom: '3px'
                            }
                          },
                          {
                            type: 'achievement',
                            tagName: 'div',
                            content: '• Presented findings to faculty and peers and received excellent marks for innovation',
                            style: {
                              fontSize: '0.85rem',
                              color: '#333',
                              marginBottom: '3px'
                            }
                          }
                        ]
                      }
                    ]
                  },
                  {
                    type: 'project-item',
                    tagName: 'div',
                    style: { marginBottom: '15px' },
                    components: [
                      {
                        type: 'project-title',
                        tagName: 'div',
                        content: 'The Green Thumb Chemist',
                        style: {
                          fontWeight: 'bold',
                          color: '#333',
                          fontSize: '0.9rem',
                          marginBottom: '5px'
                        }
                      },
                      {
                        type: 'project-context',
                        tagName: 'div',
                        content: 'Chemistry Club, First Semester of 2029',
                        style: {
                          color: '#333',
                          fontStyle: 'italic',
                          marginBottom: '8px',
                          fontSize: '0.9rem'
                        }
                      },
                      {
                        type: 'project-achievements',
                        tagName: 'div',
                        components: [
                          {
                            type: 'achievement',
                            tagName: 'div',
                            content: '• Developed a project aimed at implementing environmentally-friendly lab practices',
                            style: {
                              fontSize: '0.85rem',
                              color: '#333',
                              marginBottom: '3px'
                            }
                          },
                          {
                            type: 'achievement',
                            tagName: 'div',
                            content: '• Researched and implemented sustainable alternatives to hazardous chemicals',
                            style: {
                              fontSize: '0.85rem',
                              color: '#333',
                              marginBottom: '3px'
                            }
                          },
                          {
                            type: 'achievement',
                            tagName: 'div',
                            content: '• Educated peers on the importance of green chemistry through workshops and forums',
                            style: {
                              fontSize: '0.85rem',
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
              
              // Notable Awards
              {
                type: 'section',
                tagName: 'section',
                style: { marginBottom: '25px' },
                components: [
                  {
                    type: 'section-title',
                    tagName: 'h2',
                    content: 'Notable Awards',
                    style: {
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      color: '#333',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '15px',
                      paddingBottom: '5px',
                      borderBottom: '1px solid #333',
                      margin: '0 0 15px 0'
                    }
                  },
                  {
                    type: 'awards-list',
                    tagName: 'div',
                    components: [
                      {
                        type: 'award',
                        tagName: 'div',
                        content: '• Dean\'s List, East State University, 2026-2030',
                        style: {
                          fontSize: '0.85rem',
                          color: '#333',
                          marginBottom: '3px'
                        }
                      },
                      {
                        type: 'award',
                        tagName: 'div',
                        content: '• Gold Award, Chemistry Olympiad, 2027',
                        style: {
                          fontSize: '0.85rem',
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
        average: 4.8,
        count: 15
      },
      features: ['Chemistry', 'Academic', 'Professional', 'Clean Layout'],
      downloadCount: 0
    };

    // Create new template
    const template = new Template(templateData);
    await template.save();
    console.log('✅ Emma Ahearn template created successfully');

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

createEmmaTemplate();
