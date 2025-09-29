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

async function addBuilderChemistTemplate() {
  try {
    await connectDB();

    // Emma Ahearn template using builder framework
    const templateData = {
      name: 'Chemist Professional Builder',
      description: 'A clean, professional resume template designed for chemistry professionals using builder framework',
      category: 'Professional',
      tags: ['chemistry', 'science', 'professional', 'academic', 'clean'],
      thumbnail: '/templates/chemist-thumbnail.png',
      preview: '/templates/chemist-preview.png',
      renderEngine: 'builder',
      
      builderData: {
        components: [
          {
            type: 'wrapper',
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
                    content: '{{firstName}} {{lastName}}',
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
                    content: '{{jobTitle}}',
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
                  // Contact Info Grid
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
                        style: { textAlign: 'center' },
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
                            content: '{{phone}}'
                          }
                        ]
                      },
                      {
                        type: 'contact-item',
                        tagName: 'div',
                        style: { textAlign: 'center' },
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
                            content: '{{email}}'
                          }
                        ]
                      },
                      {
                        type: 'contact-item',
                        tagName: 'div',
                        style: { textAlign: 'center' },
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
                            content: '{{address}}, {{city}}, {{province}} {{postalCode}}'
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              
              // Professional Summary Section
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
                    content: '{{summary}}',
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
              
              // Education Section
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
                    type: 'education-list',
                    tagName: 'div',
                    content: '{{#each education}}',
                    components: [
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
                                content: '{{degree}} in {{field}}',
                                style: {
                                  fontWeight: 'bold',
                                  color: '#333',
                                  fontSize: '0.9rem'
                                }
                              },
                              {
                                type: 'dates',
                                tagName: 'span',
                                content: '{{startDate}} - {{endDate}}',
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
                            content: '{{institution}}',
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
                            content: '• Relevant Coursework: {{coursework}}',
                            style: {
                              fontSize: '0.85rem',
                              color: '#333',
                              marginBottom: '5px'
                            }
                          },
                          {
                            type: 'gpa',
                            tagName: 'div',
                            content: '• GPA: {{gpa}}',
                            style: {
                              fontSize: '0.85rem',
                              color: '#333',
                              fontWeight: 'bold'
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              
              // Research Experience Section
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
                    type: 'experience-list',
                    tagName: 'div',
                    content: '{{#each experience}}',
                    components: [
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
                                content: '{{position}}',
                                style: {
                                  fontWeight: 'bold',
                                  color: '#333',
                                  fontSize: '0.9rem'
                                }
                              },
                              {
                                type: 'dates',
                                tagName: 'span',
                                content: '{{startDate}} - {{endDate}}',
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
                            content: '{{company}}',
                            style: {
                              color: '#333',
                              fontStyle: 'italic',
                              marginBottom: '8px',
                              fontSize: '0.9rem'
                            }
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
                                  fontSize: '0.85rem',
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
              }
            ]
          }
        ],
        style: `
          /* Global styles for the template */
          .resume-container * {
            box-sizing: border-box;
          }
        `
      },
      
      // Keep legacy fields for backward compatibility
      html: '',
      css: '',
      isPremium: false,
      isActive: true,
      rating: {
        average: 4.2,
        count: 8
      },
      features: ['Builder Framework', 'Visual Editor', 'Component-based', 'Customizable'],
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

addBuilderChemistTemplate();
