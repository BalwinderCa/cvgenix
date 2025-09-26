const mongoose = require('mongoose');
const Template = require('../models/Template');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const professionalClassicTemplate = {
  name: "Professional Classic",
  description: "A clean, single-column resume template with professional and traditional aesthetic. Features clear information hierarchy and excellent readability for various industries.",
  category: "Professional",
  tags: ["classic", "professional", "single-column", "traditional", "clean", "readable"],
  thumbnail: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzI1NjNlYiIgcng9IjQiLz4KPHJlY3QgeD0iMjAiIHk9IjEwMCIgd2lkdGg9IjI2MCIgaGVpZ2h0PSIyMDAiIGZpbGw9IndoaXRlIiByeD0iNCIvPgo8L3N2Zz4K",
  preview: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjgwMCIgdmlld0JveD0iMCAwIDYwMCA4MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iODAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjUyMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiMyNTYzZWIiIHJ4PSI4Ii8+CjxyZWN0IHg9IjQwIiB5PSIyMDAiIHdpZHRoPSI1MjAiIGhlaWdodD0iNDAwIiBmaWxsPSJ3aGl0ZSIgcng9IjgiLz4KPC9zdmc+Cg==",
  html: `
<div class="resume-container">
  <!-- Header Section -->
  <header class="resume-header">
    <h1 class="candidate-name">{{personalInfo.firstName}} {{personalInfo.lastName}}</h1>
    {{#if personalInfo.title}}
    <h2 class="candidate-title">{{personalInfo.title}}</h2>
    {{/if}}
    
    <div class="contact-info">
      {{#if personalInfo.phone}}<span class="contact-item">{{personalInfo.phone}}</span>{{/if}}
      {{#if personalInfo.email}}<span class="contact-item">{{personalInfo.email}}</span>{{/if}}
      {{#if personalInfo.address}}<span class="contact-item">{{personalInfo.address}}{{#if personalInfo.city}}, {{personalInfo.city}}{{/if}}{{#if personalInfo.province}}, {{personalInfo.province}}{{/if}}</span>{{/if}}
      {{#if personalInfo.website}}<span class="contact-item">{{personalInfo.website}}</span>{{/if}}
      {{#if personalInfo.linkedin}}<span class="contact-item">{{personalInfo.linkedin}}</span>{{/if}}
      {{#if personalInfo.twitter}}<span class="contact-item">{{personalInfo.twitter}}</span>{{/if}}
    </div>
  </header>

  <div class="resume-content">
    <!-- Professional Summary -->
    {{#if personalInfo.summary}}
    <section class="resume-section">
      <h3 class="section-title">SUMMARY</h3>
      <div class="section-content">
        <p class="summary-text">{{personalInfo.summary}}</p>
      </div>
    </section>
    {{/if}}

    <!-- Professional Experience -->
    {{#if experience}}
    <section class="resume-section">
      <h3 class="section-title">PROFESSIONAL EXPERIENCE</h3>
      <div class="section-content">
        {{#each experience}}
        <div class="experience-item">
          <div class="company-name">{{company}}</div>
          <div class="position-info">
            {{position}}{{#if location}} | {{location}}{{/if}}{{#if startDate}} | {{#if current}}{{startDate}} - Present{{else}}{{startDate}} - {{endDate}}{{/if}}{{/if}}
          </div>
          {{#if description}}
          <div class="job-description">{{description}}</div>
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
    <section class="resume-section">
      <h3 class="section-title">EDUCATION</h3>
      <div class="section-content">
        {{#each education}}
        <div class="education-item">
          <div class="degree-name">{{degree}}</div>
          <div class="institution-info">{{institution}}{{#if location}}, {{location}}{{/if}}</div>
          {{#if gpa}}<div class="gpa-info">GPA: {{gpa}}</div>{{/if}}
          {{#if endDate}}<div class="graduation-date">{{#if current}}Expected Graduation {{endDate}}{{else}}Graduated {{endDate}}{{/if}}</div>{{/if}}
        </div>
        {{/each}}
      </div>
    </section>
    {{/if}}

    <!-- Skills -->
    {{#if skills}}
    <section class="resume-section">
      <h3 class="section-title">SKILLS</h3>
      <div class="section-content">
        <div class="skills-container">
          <div class="skills-column">
            <ul class="skills-list">
              {{#each skills}}
              {{#if (mod @index 2)}}
              <li class="skill-item">{{name}}</li>
              {{/if}}
              {{/each}}
            </ul>
          </div>
          <div class="skills-column">
            <ul class="skills-list">
              {{#each skills}}
              {{#unless (mod @index 2)}}
              <li class="skill-item">{{name}}</li>
              {{/unless}}
              {{/each}}
            </ul>
          </div>
        </div>
      </div>
    </section>
    {{/if}}

    <!-- Languages -->
    {{#if languages}}
    <section class="resume-section">
      <h3 class="section-title">LANGUAGES</h3>
      <div class="section-content">
        <div class="languages-list">
          {{#each languages}}
          <span class="language-item">{{language}}{{#if proficiency}} ({{proficiency}}){{/if}}</span>{{#unless @last}}, {{/unless}}
          {{/each}}
        </div>
      </div>
    </section>
    {{/if}}

    <!-- Certifications -->
    {{#if certifications}}
    <section class="resume-section">
      <h3 class="section-title">CERTIFICATIONS</h3>
      <div class="section-content">
        {{#each certifications}}
        <div class="certification-item">
          <div class="certification-name">{{name}}</div>
          {{#if issuer}}<div class="certification-issuer">{{issuer}}</div>{{/if}}
          {{#if date}}<div class="certification-date">{{date}}</div>{{/if}}
        </div>
        {{/each}}
      </div>
    </section>
    {{/if}}

    <!-- Custom Sections -->
    {{#if customSections}}
    {{#each customSections}}
    <section class="resume-section">
      <h3 class="section-title">{{title}}</h3>
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
  line-height: 1.4;
  color: #1f2937;
  background-color: #ffffff;
  font-size: 14px;
}

.resume-container {
  max-width: 8.5in;
  margin: 0 auto;
  background: white;
  padding: 0;
  min-height: 11in;
}

/* Header Styles */
.resume-header {
  text-align: center;
  padding: 2rem 2rem 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.candidate-name {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 0.5rem;
  letter-spacing: -0.025em;
}

.candidate-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  text-transform: uppercase;
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
}

.contact-info {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.contact-item {
  position: relative;
}

.contact-item:not(:last-child)::after {
  content: '|';
  margin-left: 0.5rem;
  color: #9ca3af;
}

/* Content Styles */
.resume-content {
  padding: 2rem;
}

/* Section Styles */
.resume-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2563eb;
  text-transform: uppercase;
  margin-bottom: 1rem;
  padding-bottom: 0.25rem;
  border-bottom: 2px solid #2563eb;
  letter-spacing: 0.05em;
}

.section-content {
  line-height: 1.6;
}

/* Experience Styles */
.experience-item {
  margin-bottom: 1.5rem;
}

.experience-item:last-child {
  margin-bottom: 0;
}

.company-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.position-info {
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.job-description {
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 0.5rem;
  line-height: 1.5;
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
  line-height: 1.5;
  font-size: 0.875rem;
}

.achievement-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #2563eb;
  font-weight: bold;
}

/* Education Styles */
.education-item {
  margin-bottom: 1rem;
}

.education-item:last-child {
  margin-bottom: 0;
}

.degree-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.institution-info {
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 0.25rem;
}

.gpa-info {
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 0.25rem;
}

.graduation-date {
  font-size: 0.875rem;
  color: #4b5563;
}

/* Skills Styles */
.skills-container {
  display: flex;
  gap: 2rem;
}

.skills-column {
  flex: 1;
}

.skills-list {
  list-style: none;
  padding-left: 0;
}

.skill-item {
  position: relative;
  padding-left: 1rem;
  margin-bottom: 0.25rem;
  color: #4b5563;
  line-height: 1.5;
  font-size: 0.875rem;
}

.skill-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #2563eb;
  font-weight: bold;
}

/* Languages Styles */
.languages-list {
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
}

.language-item {
  font-weight: 500;
}

/* Certification Styles */
.certification-item {
  margin-bottom: 0.75rem;
}

.certification-item:last-child {
  margin-bottom: 0;
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
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Custom Sections */
.custom-content {
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 0.5rem;
  line-height: 1.5;
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
  line-height: 1.5;
  font-size: 0.875rem;
}

.custom-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #2563eb;
  font-weight: bold;
}

/* Summary Styles */
.summary-text {
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .resume-container {
    padding: 0;
  }
  
  .resume-header {
    padding: 1.5rem 1rem 1rem 1rem;
  }
  
  .candidate-name {
    font-size: 2rem;
  }
  
  .candidate-title {
    font-size: 1rem;
  }
  
  .contact-info {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .contact-item:not(:last-child)::after {
    display: none;
  }
  
  .resume-content {
    padding: 1.5rem 1rem;
  }
  
  .skills-container {
    flex-direction: column;
    gap: 1rem;
  }
}

/* Print Styles */
@media print {
  body {
    background: white;
  }
  
  .resume-container {
    max-width: none;
    margin: 0;
    box-shadow: none;
  }
  
  .candidate-name {
    color: #2563eb !important;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
  
  .section-title {
    color: #2563eb !important;
    border-bottom-color: #2563eb !important;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
  
  .achievement-item::before,
  .skill-item::before,
  .custom-item::before {
    color: #2563eb !important;
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
      primary: "#2563eb",
      secondary: "#4b5563",
      accent: "#1f2937"
    },
    fonts: {
      heading: "Inter",
      body: "Inter"
    },
    spacing: "normal"
  },
  isPremium: false,
  isActive: true,
  isPopular: true,
  isNewTemplate: false,
  usageCount: 0,
  rating: {
    average: 4.9,
    count: 0
  },
  compatibility: {
    ats: true,
    atsScore: 95
  },
  industry: ["Finance", "Business", "Technology", "Healthcare", "Education", "Consulting"],
  features: ["ATS-friendly", "Single-column layout", "Classic design", "Print optimized", "Mobile responsive", "Professional styling"],
  previewImages: [],
  downloadCount: 0,
  price: 0,
  mobile: true,
  print: true,
  metadata: {
    colorScheme: "light",
    layout: "single-column",
    complexity: "simple",
    author: "Resume4Me",
    version: "1.0.0",
    lastUpdated: new Date()
  }
};

async function createTemplate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume4me');
    console.log('Connected to MongoDB');
    
    const template = new Template(professionalClassicTemplate);
    await template.save();
    
    console.log('✅ Professional Classic template created successfully!');
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
