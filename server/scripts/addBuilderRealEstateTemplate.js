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

async function addBuilderRealEstateTemplate() {
  try {
    await connectDB();

    // Connor Hamilton Real Estate template using builder framework
    const templateData = {
      name: 'Real Estate Professional Builder',
      description: 'A modern, professional resume template designed for real estate agents using builder framework',
      category: 'Professional',
      tags: ['real-estate', 'agent', 'professional', 'modern', 'clean'],
      thumbnail: '/templates/realestate-thumbnail.png',
      preview: '/templates/realestate-preview.png',
      renderEngine: 'builder',
      
      builderData: {
        components: [
          {
            type: 'wrapper',
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
                      border: '3px solid #7b68ee',
                      padding: '15px 30px',
                      marginBottom: '15px',
                      display: 'inline-block'
                    },
                    components: [
                      {
                        type: 'name',
                        tagName: 'h1',
                        content: '{{firstName}} {{lastName}}',
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
                    content: '{{jobTitle}}',
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
                    content: '{{phone}} | {{email}} | {{website}}',
                    style: {
                      fontSize: '0.9rem',
                      color: '#333',
                      marginBottom: '20px'
                    }
                  },
                  {
                    type: 'divider',
                    tagName: 'div',
                    style: {
                      width: '80%',
                      height: '1px',
                      background: '#ccc',
                      margin: '20px auto'
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
                    content: '{{summary}}',
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
              
              // Work Experience Section
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
                    type: 'experience-list',
                    tagName: 'div',
                    content: '{{#each experience}}',
                    components: [
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
                                content: '{{company}}',
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
                                content: '{{startDate}} - {{endDate}}',
                                style: {
                                  color: '#333',
                                  fontSize: '0.85rem',
                                  marginBottom: '3px'
                                }
                              },
                              {
                                type: 'job-title-work',
                                tagName: 'div',
                                content: '{{position}}',
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
                            type: 'achievements-list',
                            tagName: 'ul',
                            content: '{{#each achievements}}',
                            style: {
                              listStyle: 'none',
                              paddingLeft: '0',
                              margin: '0'
                            },
                            components: [
                              {
                                type: 'achievement-item',
                                tagName: 'li',
                                content: '• {{this}}',
                                style: {
                                  fontSize: '0.8rem',
                                  color: '#333',
                                  marginBottom: '3px',
                                  paddingLeft: '15px',
                                  position: 'relative'
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
                        type: 'education-list',
                        tagName: 'div',
                        content: '{{#each education}}',
                        components: [
                          {
                            type: 'education-item',
                            tagName: 'div',
                            style: { marginBottom: '10px' },
                            components: [
                              {
                                type: 'institution',
                                tagName: 'div',
                                content: '{{institution}}',
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
                                content: '{{startDate}} - {{endDate}}',
                                style: {
                                  color: '#333',
                                  fontSize: '0.8rem',
                                  marginBottom: '3px'
                                }
                              },
                              {
                                type: 'degree',
                                tagName: 'div',
                                content: '{{degree}} in {{field}}',
                                style: {
                                  color: '#333',
                                  fontSize: '0.8rem'
                                }
                              }
                            ]
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
                        tagName: 'ul',
                        content: '{{#each skills}}',
                        style: {
                          listStyle: 'none',
                          paddingLeft: '0',
                          margin: '0'
                        },
                        components: [
                          {
                            type: 'skill-item',
                            tagName: 'li',
                            content: '• {{name}}',
                            style: {
                              fontSize: '0.8rem',
                              color: '#333',
                              marginBottom: '3px',
                              paddingLeft: '15px',
                              position: 'relative'
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              
              // Certifications Section
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
                    tagName: 'ul',
                    content: '{{#each certifications}}',
                    style: {
                      listStyle: 'none',
                      paddingLeft: '0',
                      margin: '0'
                    },
                    components: [
                      {
                        type: 'certification-item',
                        tagName: 'li',
                        content: '• {{name}}',
                        style: {
                          fontSize: '0.8rem',
                          color: '#333',
                          marginBottom: '3px',
                          paddingLeft: '15px',
                          position: 'relative'
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        style: `
          /* Global styles for the template */
          .resume-container * {
            box-sizing: border-box;
          }
          
          /* Grid responsive behavior */
          @media (max-width: 768px) {
            .two-column-container {
              grid-template-columns: 1fr !important;
              gap: 20px !important;
            }
          }
        `
      },
      
      // Keep legacy fields for backward compatibility
      html: '',
      css: '',
      isPremium: false,
      isActive: true,
      rating: {
        average: 4.5,
        count: 12
      },
      features: ['Builder Framework', 'Two-column layout', 'Visual Editor', 'Purple accent'],
      downloadCount: 0
    };

    // Check if template already exists
    const existingTemplate = await Template.findOne({ name: templateData.name });
    if (existingTemplate) {
      console.log('⚠️ Template already exists. Updating...');
      await Template.findByIdAndUpdate(existingTemplate._id, templateData);
      console.log('✅ Template updated successfully');
    } else {
      // Create new template
      const template = new Template(templateData);
      await template.save();
      console.log('✅ Template added successfully');
    }

    // Verify the template was added
    const totalTemplates = await Template.countDocuments();
    console.log(`📊 Total templates in database: ${totalTemplates}`);

    const newTemplate = await Template.findOne({ name: templateData.name });
    console.log(`📝 Template details:`);
    console.log(`   Name: ${newTemplate.name}`);
    console.log(`   Category: ${newTemplate.category}`);
    console.log(`   Render Engine: ${newTemplate.renderEngine}`);
    console.log(`   Builder Components: ${newTemplate.builderData.components.length}`);
    console.log(`   ID: ${newTemplate._id}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

addBuilderRealEstateTemplate();
