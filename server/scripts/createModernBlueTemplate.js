const mongoose = require('mongoose');
const Template = require('../models/Template');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const modernBlueTemplate = {
  name: "Modern Blue",
  description: "A clean, single-column resume template with professional modern aesthetic. Features a distinctive blue accent design with skill proficiency indicators and clean typography.",
  category: "Modern",
  tags: ["modern", "blue", "single-column", "professional", "clean", "skills-indicators"],
  thumbnail: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzI1NjNlYiIgcng9IjQiLz4KPHJlY3QgeD0iMjAiIHk9IjEwMCIgd2lkdGg9IjI2MCIgaGVpZ2h0PSIyMDAiIGZpbGw9IndoaXRlIiByeD0iNCIvPgo8L3N2Zz4K",
  preview: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjgwMCIgdmlld0JveD0iMCAwIDYwMCA4MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iODAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjUyMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiMyNTYzZWIiIHJ4PSI4Ii8+CjxyZWN0IHg9IjQwIiB5PSIyMDAiIHdpZHRoPSI1MjAiIGhlaWdodD0iNDAwIiBmaWxsPSJ3aGl0ZSIgcng9IjgiLz4KPC9zdmc+Cg==",
  html: `
<div class="resume-container">
  <!-- Header Section -->
  <header class="resume-header">
    <h1 class="candidate-name">{{personalInfo.firstName}} {{personalInfo.lastName}}</h1>
    {{#if personalInfo.title}}
    <div class="title-container">
      <div class="title-line-left"></div>
      <div class="candidate-title">{{personalInfo.title}}</div>
      <div class="title-line-right"></div>
    </div>
    {{/if}}
  </header>

  <div class="resume-content">
    <!-- Contact Section -->
    <section class="resume-section">
      <h3 class="section-title">Contact</h3>
      <div class="section-content">
        <div class="contact-details">
          {{#if personalInfo.phone}}
          <div class="contact-item">
            <span class="contact-icon">📞</span>
            <span class="contact-text">{{personalInfo.phone}}</span>
          </div>
          {{/if}}
          {{#if personalInfo.email}}
          <div class="contact-item">
            <span class="contact-icon">✉️</span>
            <span class="contact-text">{{personalInfo.email}}</span>
          </div>
          {{/if}}
          {{#if personalInfo.address}}
          <div class="contact-item">
            <span class="contact-icon">📍</span>
            <span class="contact-text">{{personalInfo.address}}{{#if personalInfo.city}}, {{personalInfo.city}}{{/if}}{{#if personalInfo.province}}, {{personalInfo.province}}{{/if}}</span>
          </div>
          {{/if}}
        </div>
      </div>
    </section>

    <!-- Summary Section -->
    {{#if personalInfo.summary}}
    <section class="resume-section">
      <h3 class="section-title">Summary</h3>
      <div class="section-content">
        <p class="summary-text">{{personalInfo.summary}}</p>
      </div>
    </section>
    {{/if}}

    <!-- Skills Section -->
    {{#if skills}}
    <section class="resume-section">
      <h3 class="section-title">Skills</h3>
      <div class="section-content">
        <div class="skills-container">
          {{#each skills}}
          <div class="skill-item">
            <span class="skill-name">{{name}}</span>
            <div class="skill-indicators">
              <div class="skill-dot {{#if (gte level 1)}}filled{{/if}}"></div>
              <div class="skill-dot {{#if (gte level 2)}}filled{{/if}}"></div>
              <div class="skill-dot {{#if (gte level 3)}}filled{{/if}}"></div>
              <div class="skill-dot {{#if (gte level 4)}}filled{{/if}}"></div>
              <div class="skill-dot {{#if (gte level 5)}}filled{{/if}}"></div>
              <div class="skill-dot {{#if (gte level 6)}}filled{{/if}}"></div>
              <div class="skill-dot {{#if (gte level 7)}}filled{{/if}}"></div>
              <div class="skill-dot {{#if (gte level 8)}}filled{{/if}}"></div>
              <div class="skill-dot {{#if (gte level 9)}}filled{{/if}}"></div>
              <div class="skill-dot {{#if (gte level 10)}}filled{{/if}}"></div>
            </div>
          </div>
          {{/each}}
        </div>
      </div>
    </section>
    {{/if}}

    <!-- Professional Experience Section -->
    {{#if experience}}
    <section class="resume-section">
      <h3 class="section-title">Professional Experience</h3>
      <div class="section-content">
        {{#each experience}}
        <div class="experience-item">
          <div class="experience-header">
            <div class="job-info">
              <span class="job-title">{{position}}</span>
              <span class="company-location">{{company}}{{#if location}} — {{location}}{{/if}}</span>
            </div>
            <div class="job-dates">
              {{#if current}}{{startDate}} – Present{{else}}{{startDate}} - {{endDate}}{{/if}}
            </div>
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

    <!-- Education Section -->
    {{#if education}}
    <section class="resume-section">
      <h3 class="section-title">Education</h3>
      <div class="section-content">
        {{#each education}}
        <div class="education-item">
          <div class="education-header">
            <div class="degree-info">
              <span class="degree-name">{{degree}}</span>
              {{#if honors}}<span class="degree-honors">{{honors}}</span>{{/if}}
            </div>
            <div class="education-details">
              {{#if endDate}}{{endDate}}{{/if}}{{#if endDate}}{{#if institution}} | {{/if}}{{/if}}{{institution}}{{#if location}} — {{location}}{{/if}}
            </div>
          </div>
        </div>
        {{/each}}
      </div>
    </section>
    {{/if}}

    <!-- Languages Section -->
    {{#if languages}}
    <section class="resume-section">
      <h3 class="section-title">Languages</h3>
      <div class="section-content">
        <div class="languages-container">
          {{#each languages}}
          <div class="language-item">
            <span class="language-name">{{language}}</span>
            <div class="language-indicators">
              <div class="language-dot {{#if (gte proficiency 1)}}filled{{/if}}"></div>
              <div class="language-dot {{#if (gte proficiency 2)}}filled{{/if}}"></div>
              <div class="language-dot {{#if (gte proficiency 3)}}filled{{/if}}"></div>
              <div class="language-dot {{#if (gte proficiency 4)}}filled{{/if}}"></div>
              <div class="language-dot {{#if (gte proficiency 5)}}filled{{/if}}"></div>
              <div class="language-dot {{#if (gte proficiency 6)}}filled{{/if}}"></div>
              <div class="language-dot {{#if (gte proficiency 7)}}filled{{/if}}"></div>
              <div class="language-dot {{#if (gte proficiency 8)}}filled{{/if}}"></div>
              <div class="language-dot {{#if (gte proficiency 9)}}filled{{/if}}"></div>
              <div class="language-dot {{#if (gte proficiency 10)}}filled{{/if}}"></div>
            </div>
          </div>
          {{/each}}
        </div>
      </div>
    </section>
    {{/if}}

    <!-- Certifications Section -->
    {{#if certifications}}
    <section class="resume-section">
      <h3 class="section-title">Certifications</h3>
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
  font-family: 'Arial', 'Helvetica', sans-serif;
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
}

.candidate-name {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.title-line-left,
.title-line-right {
  flex: 1;
  height: 2px;
  background-color: #2563eb;
  margin: 0 1rem;
}

.candidate-title {
  background-color: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

/* Content Styles */
.resume-content {
  padding: 0 2rem 2rem 2rem;
}

/* Section Styles */
.resume-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  text-transform: uppercase;
  margin-bottom: 1rem;
  padding-bottom: 0.25rem;
  border-bottom: 2px solid #2563eb;
  letter-spacing: 0.05em;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  right: 0;
  width: 60%;
  height: 2px;
  background-color: #2563eb;
}

.section-content {
  line-height: 1.6;
}

/* Contact Styles */
.contact-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.contact-icon {
  font-size: 1rem;
  width: 1.5rem;
  text-align: center;
}

.contact-text {
  font-size: 0.875rem;
  color: #4b5563;
}

/* Summary Styles */
.summary-text {
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.6;
  text-align: justify;
}

/* Skills Styles */
.skills-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.skill-name {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
  min-width: 8rem;
}

.skill-indicators {
  display: flex;
  gap: 0.25rem;
}

.skill-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e5e7eb;
  border: 1px solid #d1d5db;
}

.skill-dot.filled {
  background-color: #2563eb;
  border-color: #2563eb;
}

/* Experience Styles */
.experience-item {
  margin-bottom: 1.5rem;
}

.experience-item:last-child {
  margin-bottom: 0;
}

.experience-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.job-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.job-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
}

.company-location {
  font-size: 0.875rem;
  color: #4b5563;
  font-weight: 500;
}

.job-dates {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
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
  color: #9ca3af;
  font-weight: bold;
  font-size: 1rem;
}

/* Education Styles */
.education-item {
  margin-bottom: 1rem;
}

.education-item:last-child {
  margin-bottom: 0;
}

.education-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.degree-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.degree-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  text-transform: uppercase;
}

.degree-honors {
  font-size: 0.875rem;
  color: #4b5563;
  font-style: italic;
}

.education-details {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
}

/* Languages Styles */
.languages-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.language-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.language-name {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
  min-width: 8rem;
}

.language-indicators {
  display: flex;
  gap: 0.25rem;
}

.language-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e5e7eb;
  border: 1px solid #d1d5db;
}

.language-dot.filled {
  background-color: #2563eb;
  border-color: #2563eb;
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
  color: #9ca3af;
  font-weight: bold;
  font-size: 1rem;
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
    font-size: 0.875rem;
    padding: 0.375rem 0.75rem;
  }
  
  .title-line-left,
  .title-line-right {
    margin: 0 0.5rem;
  }
  
  .resume-content {
    padding: 0 1rem 1.5rem 1rem;
  }
  
  .experience-header,
  .education-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .job-dates,
  .education-details {
    white-space: normal;
  }
  
  .skill-item,
  .language-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .skill-name,
  .language-name {
    min-width: auto;
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
  
  .candidate-title {
    background-color: #2563eb !important;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
  
  .title-line-left,
  .title-line-right,
  .section-title,
  .section-title::after {
    background-color: #2563eb !important;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
  
  .skill-dot.filled,
  .language-dot.filled {
    background-color: #2563eb !important;
    border-color: #2563eb !important;
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
      heading: "Arial",
      body: "Arial"
    },
    spacing: "normal"
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
    atsScore: 92
  },
  industry: ["Administrative", "Business", "Technology", "Healthcare", "Education", "Finance"],
  features: ["ATS-friendly", "Single-column layout", "Modern design", "Skill indicators", "Print optimized", "Mobile responsive"],
  previewImages: [],
  downloadCount: 0,
  price: 0,
  mobile: true,
  print: true,
  metadata: {
    colorScheme: "light",
    layout: "single-column",
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
    
    const template = new Template(modernBlueTemplate);
    await template.save();
    
    console.log('✅ Modern Blue template created successfully!');
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
