const mongoose = require('mongoose');
const Template = require('../models/Template');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const responsiveTemplate = {
  name: "Modern Professional",
  description: "A clean, modern resume template optimized for digital viewing and ATS compatibility. Features responsive design and proper scaling.",
  category: "Professional",
  tags: ["modern", "professional", "ats-friendly", "responsive", "clean"],
  thumbnail: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzM2NjNGRiIgcng9IjQiLz4KPHJlY3QgeD0iMjAiIHk9IjEwMCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IndoaXRlIiByeD0iNCIvPgo8cmVjdCB4PSIxNjAiIHk9IjEwMCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IndoaXRlIiByeD0iNCIvPgo8L3N2Zz4K",
  preview: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjgwMCIgdmlld0JveD0iMCAwIDYwMCA4MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iODAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjUyMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiMzNjYzRkYiIHJ4PSI4Ii8+CjxyZWN0IHg9IjQwIiB5PSIyMDAiIHdpZHRoPSIyNDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ3aGl0ZSIgcng9IjgiLz4KPHJlY3QgeD0iMzIwIiB5PSIyMDAiIHdpZHRoPSIyNDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ3aGl0ZSIgcng9IjgiLz4KPC9zdmc+Cg==",
  html: `
<div class="resume-container">
  <!-- Header Section -->
  <header class="resume-header">
    <div class="header-content">
      <h1 class="name">{{personalInfo.firstName}} {{personalInfo.lastName}}</h1>
      <div class="contact-info">
        {{#if personalInfo.email}}
        <div class="contact-item">
          <span class="contact-label">Email:</span>
          <span class="contact-value">{{personalInfo.email}}</span>
        </div>
        {{/if}}
        {{#if personalInfo.phone}}
        <div class="contact-item">
          <span class="contact-label">Phone:</span>
          <span class="contact-value">{{personalInfo.phone}}</span>
        </div>
        {{/if}}
        {{#if personalInfo.linkedin}}
        <div class="contact-item">
          <span class="contact-label">LinkedIn:</span>
          <span class="contact-value">{{personalInfo.linkedin}}</span>
        </div>
        {{/if}}
        {{#if personalInfo.website}}
        <div class="contact-item">
          <span class="contact-label">Website:</span>
          <span class="contact-value">{{personalInfo.website}}</span>
        </div>
        {{/if}}
        {{#if personalInfo.address}}
        <div class="contact-item">
          <span class="contact-label">Location:</span>
          <span class="contact-value">{{personalInfo.address}}{{#if personalInfo.city}}, {{personalInfo.city}}{{/if}}{{#if personalInfo.province}}, {{personalInfo.province}}{{/if}}</span>
        </div>
        {{/if}}
      </div>
    </div>
  </header>

  <div class="resume-body">
    <!-- Left Column -->
    <div class="left-column">
      <!-- Professional Summary -->
      {{#if personalInfo.summary}}
      <section class="section">
        <h2 class="section-title">Professional Summary</h2>
        <div class="section-content">
          <p class="summary-text">{{personalInfo.summary}}</p>
        </div>
      </section>
      {{/if}}

      <!-- Skills -->
      {{#if skills}}
      <section class="section">
        <h2 class="section-title">Skills</h2>
        <div class="section-content">
          <div class="skills-grid">
            {{#each skills}}
            <div class="skill-item">
              <span class="skill-name">{{name}}</span>
              <div class="skill-level">
                <div class="skill-bar">
                  <div class="skill-fill skill-{{level}}"></div>
                </div>
                <span class="skill-label">{{level}}</span>
              </div>
            </div>
            {{/each}}
          </div>
        </div>
      </section>
      {{/if}}

      <!-- Languages -->
      {{#if languages}}
      <section class="section">
        <h2 class="section-title">Languages</h2>
        <div class="section-content">
          {{#each languages}}
          <div class="language-item">
            <span class="language-name">{{language}}</span>
            <span class="language-level">{{proficiency}}</span>
          </div>
          {{/each}}
        </div>
      </section>
      {{/if}}

      <!-- Certifications -->
      {{#if certifications}}
      <section class="section">
        <h2 class="section-title">Certifications</h2>
        <div class="section-content">
          {{#each certifications}}
          <div class="certification-item">
            <h3 class="certification-name">{{name}}</h3>
            <p class="certification-issuer">{{issuer}}</p>
            <p class="certification-date">{{date}}</p>
          </div>
          {{/each}}
        </div>
      </section>
      {{/if}}
    </div>

    <!-- Right Column -->
    <div class="right-column">
      <!-- Work Experience -->
      {{#if experience}}
      <section class="section">
        <h2 class="section-title">Work Experience</h2>
        <div class="section-content">
          {{#each experience}}
          <div class="experience-item">
            <div class="experience-header">
              <h3 class="job-title">{{position}}</h3>
              <div class="company-info">
                <span class="company-name">{{company}}</span>
                <span class="job-dates">{{startDate}} - {{#if current}}Present{{else}}{{endDate}}{{/if}}</span>
              </div>
            </div>
            {{#if description}}
            <p class="job-description">{{description}}</p>
            {{/if}}
            {{#if achievements}}
            <ul class="achievements-list">
              {{#each achievements}}
              <li class="achievement-item">{{this}}</li>
              {{/each}}
            </ul>
            {{/if}}
          </div>
          {{/each}}
        </div>
      </section>
      {{/if}}

      <!-- Education -->
      {{#if education}}
      <section class="section">
        <h2 class="section-title">Education</h2>
        <div class="section-content">
          {{#each education}}
          <div class="education-item">
            <div class="education-header">
              <h3 class="degree-name">{{degree}}</h3>
              <div class="education-info">
                <span class="institution-name">{{institution}}</span>
                <span class="education-dates">{{startDate}} - {{endDate}}</span>
              </div>
            </div>
            {{#if field}}
            <p class="field-of-study">{{field}}</p>
            {{/if}}
            {{#if gpa}}
            <p class="gpa">GPA: {{gpa}}</p>
            {{/if}}
          </div>
          {{/each}}
        </div>
      </section>
      {{/if}}

      <!-- Custom Sections -->
      {{#if customSections}}
      {{#each customSections}}
      <section class="section">
        <h2 class="section-title">{{title}}</h2>
        <div class="section-content">
          {{#if content}}
          <p class="custom-content">{{content}}</p>
          {{/if}}
          {{#if items}}
          <ul class="custom-items">
            {{#each items}}
            <li class="custom-item">{{this}}</li>
            {{/each}}
          </ul>
          {{/if}}
        </div>
      </section>
      {{/each}}
      {{/if}}
    </div>
  </div>
</div>`,
  css: `
/* Reset and Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
  color: #1f2937;
  background-color: #f9fafb;
  font-size: 14px;
}

.resume-container {
  max-width: 8.5in;
  margin: 0 auto;
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  min-height: 11in;
}

/* Header Styles */
.resume-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 1.5rem;
  text-align: center;
}

.header-content h1.name {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  letter-spacing: -0.025em;
}

.contact-info {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.contact-label {
  font-weight: 600;
  font-size: 0.75rem;
  opacity: 0.9;
}

.contact-value {
  font-size: 0.75rem;
}

/* Body Layout */
.resume-body {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
  padding: 1.5rem;
  min-height: calc(11in - 6rem);
}

/* Section Styles */
.section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.75rem;
  padding-bottom: 0.25rem;
  border-bottom: 2px solid #3b82f6;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 2rem;
  height: 2px;
  background: #1d4ed8;
}

.section-content {
  line-height: 1.6;
}

/* Left Column Styles */
.left-column {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

/* Skills Styles */
.skills-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skill-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.skill-name {
  font-weight: 600;
  color: #374151;
  font-size: 0.75rem;
}

.skill-level {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.skill-bar {
  flex: 1;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.skill-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.skill-Beginner { width: 25%; background: #ef4444; }
.skill-Intermediate { width: 50%; background: #f59e0b; }
.skill-Advanced { width: 75%; background: #3b82f6; }
.skill-Expert { width: 100%; background: #10b981; }

.skill-label {
  font-size: 0.625rem;
  color: #6b7280;
  min-width: 3rem;
  text-align: right;
}

/* Language Styles */
.language-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.language-item:last-child {
  border-bottom: none;
}

.language-name {
  font-weight: 600;
  color: #374151;
  font-size: 0.75rem;
}

.language-level {
  font-size: 0.625rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.125rem;
}

/* Certification Styles */
.certification-item {
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.certification-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.certification-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.125rem;
}

.certification-issuer {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.125rem;
}

.certification-date {
  font-size: 0.625rem;
  color: #9ca3af;
}

/* Right Column Styles */
.right-column {
  padding-left: 0.75rem;
}

/* Experience Styles */
.experience-item {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.experience-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.experience-header {
  margin-bottom: 0.5rem;
}

.job-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.125rem;
}

.company-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.company-name {
  font-weight: 600;
  color: #3b82f6;
  font-size: 0.75rem;
}

.job-dates {
  font-size: 0.75rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.125rem;
}

.job-description {
  color: #4b5563;
  margin-bottom: 0.5rem;
  line-height: 1.5;
  font-size: 0.75rem;
}

.achievements-list {
  list-style: none;
  padding-left: 0;
}

.achievement-item {
  position: relative;
  padding-left: 1rem;
  margin-bottom: 0.25rem;
  color: #4b5563;
  line-height: 1.4;
  font-size: 0.75rem;
}

.achievement-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #3b82f6;
  font-weight: bold;
  font-size: 1rem;
}

/* Education Styles */
.education-item {
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.education-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.education-header {
  margin-bottom: 0.25rem;
}

.degree-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.125rem;
}

.education-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.institution-name {
  font-weight: 600;
  color: #3b82f6;
  font-size: 0.75rem;
}

.education-dates {
  font-size: 0.75rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.125rem;
}

.field-of-study {
  color: #6b7280;
  font-size: 0.75rem;
  margin-bottom: 0.125rem;
}

.gpa {
  color: #9ca3af;
  font-size: 0.625rem;
}

/* Custom Sections */
.custom-content {
  color: #4b5563;
  margin-bottom: 0.5rem;
  line-height: 1.5;
  font-size: 0.75rem;
}

.custom-items {
  list-style: none;
  padding-left: 0;
}

.custom-item {
  position: relative;
  padding-left: 1rem;
  margin-bottom: 0.25rem;
  color: #4b5563;
  line-height: 1.4;
  font-size: 0.75rem;
}

.custom-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #3b82f6;
  font-weight: bold;
  font-size: 1rem;
}

/* Summary Styles */
.summary-text {
  color: #4b5563;
  line-height: 1.6;
  font-size: 0.75rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .resume-body {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
  
  .left-column {
    padding: 0.75rem;
  }
  
  .right-column {
    padding-left: 0;
  }
  
  .header-content h1.name {
    font-size: 1.5rem;
  }
  
  .contact-info {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .company-info,
  .education-info {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Print Styles */
@media print {
  body {
    background: white;
  }
  
  .resume-container {
    box-shadow: none;
    max-width: none;
    margin: 0;
  }
  
  .resume-header {
    background: #3b82f6 !important;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
  
  .section-title {
    border-bottom-color: #3b82f6 !important;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
  
  .section-title::after {
    background: #1d4ed8 !important;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
  
  .skill-fill {
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
  
  .company-name,
  .institution-name {
    color: #3b82f6 !important;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
  
  .achievement-item::before,
  .custom-item::before {
    color: #3b82f6 !important;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
}`,
  config: {
    sections: [
      { name: "personalInfo", required: true, order: 0 },
      { name: "experience", required: true, order: 1 },
      { name: "education", required: true, order: 2 },
      { name: "skills", required: true, order: 3 },
      { name: "summary", required: false, order: 4 },
      { name: "languages", required: false, order: 5 },
      { name: "certifications", required: false, order: 6 },
      { name: "customSections", required: false, order: 7 }
    ],
    colors: {
      primary: "#3b82f6",
      secondary: "#6b7280",
      accent: "#10b981"
    },
    fonts: {
      heading: "Inter",
      body: "Inter"
    },
    spacing: "compact"
  },
  isPremium: false,
  isActive: true,
  isPopular: true,
  isNewTemplate: true,
  usageCount: 0,
  rating: {
    average: 4.8,
    count: 0
  },
  compatibility: {
    ats: true,
    atsScore: 98
  },
  industry: ["Technology", "Business", "Healthcare", "Education", "Finance"],
  features: ["ATS-friendly", "Two-column layout", "Modern design", "Print optimized", "Mobile responsive", "Compact sizing"],
  previewImages: [],
  downloadCount: 0,
  price: 0,
  mobile: true,
  print: true,
  metadata: {
    colorScheme: "light",
    layout: "two-column",
    complexity: "moderate",
    author: "Resume4Me",
    version: "1.0.0",
    lastUpdated: new Date()
  }
};

async function createTemplate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume4me');
    console.log('Connected to MongoDB');
    
    const template = new Template(responsiveTemplate);
    await template.save();
    
    console.log('✅ Responsive template created successfully!');
    console.log('Template ID:', template._id);
    console.log('Template Name:', template.name);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error creating template:', error);
    process.exit(1);
  }
}

createTemplate();
