const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class ResumePdfService {
  constructor() {
    this.templatesPath = path.join(__dirname, '../templates/resume');
    this.tempPath = path.join(__dirname, '../temp');
    this.ensureTempDir();
    this.registerHandlebarsHelpers();
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempPath)) {
      fs.mkdirSync(this.tempPath, { recursive: true });
    }
  }

  registerHandlebarsHelpers() {
    // Helper for conditional rendering
    handlebars.registerHelper('if', function(conditional, options) {
      if (conditional) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });

    // Helper for formatting dates
    handlebars.registerHelper('formatDate', function(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString();
    });

    // Helper for joining arrays
    handlebars.registerHelper('join', function(array, separator) {
      if (!Array.isArray(array)) return '';
      return array.join(separator || ', ');
    });
  }

  // Get available templates
  getAvailableTemplates() {
    try {
      // Check if templates directory exists
      if (!fs.existsSync(this.templatesPath)) {
        console.warn(`Templates directory does not exist: ${this.templatesPath}`);
        // Create the directory if it doesn't exist
        fs.mkdirSync(this.templatesPath, { recursive: true });
        console.log(`Created templates directory: ${this.templatesPath}`);
        return [];
      }

      const templates = [];
      const files = fs.readdirSync(this.templatesPath);
      
      files.forEach(file => {
        if (file.endsWith('.html')) {
          const templateName = file.replace('.html', '');
          templates.push({
            id: templateName,
            name: this.formatTemplateName(templateName),
            path: path.join(this.templatesPath, file)
          });
        }
      });
      
      return templates;
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  }

  formatTemplateName(templateName) {
    return templateName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Load template
  async loadTemplate(templateId) {
    try {
      // Handle both MongoDB ObjectId and template name
      let templateName = templateId;
      
      // If it's a MongoDB ObjectId (24 hex characters), get template from database
      if (/^[0-9a-fA-F]{24}$/.test(templateId)) {
        const Template = require('../models/Template');
        const template = await Template.findById(templateId);
        if (!template) {
          throw new Error(`Template with ID ${templateId} not found in database`);
        }
        // Use the template's HTML and CSS directly
        const combinedHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Resume</title>
            <style>${template.css}</style>
          </head>
          <body>
            ${template.html}
          </body>
          </html>
        `;
        return handlebars.compile(combinedHtml);
      }
      
      // Otherwise, try to load from file system
      const templatePath = path.join(this.templatesPath, `${templateName}.html`);
      
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template ${templateName} not found`);
      }
      
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      return handlebars.compile(templateContent);
    } catch (error) {
      console.error('Error loading template:', error);
      throw error;
    }
  }

  // Generate PDF from resume data
  async generatePdf(resumeData, templateId = 'professional-classic', options = {}) {
    let browser = null;
    
    try {
      console.log('🚀 Starting PDF generation...');
      console.log(`📄 Template: ${templateId}`);
      console.log(`👤 Resume: ${resumeData.personalInfo?.firstName} ${resumeData.personalInfo?.lastName}`);

      // Load template
      const template = await this.loadTemplate(templateId);
      
      // Compile template with data
      const html = template(resumeData);
      
      // Save HTML to temp file
      const tempHtmlPath = path.join(this.tempPath, `resume-${uuidv4()}.html`);
      fs.writeFileSync(tempHtmlPath, html);
      
      // Launch browser
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      
      const page = await browser.newPage();
      
      // Set viewport
      await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: 2
      });
      
      // Load HTML
      await page.goto(`file://${tempHtmlPath}`, {
        waitUntil: 'networkidle0'
      });
      
      // Wait for fonts to load
      await page.evaluateHandle('document.fonts.ready');
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        },
        preferCSSPageSize: true,
        ...options
      });
      
      // Clean up temp file
      fs.unlinkSync(tempHtmlPath);
      
      console.log('✅ PDF generated successfully');
      
      return {
        success: true,
        pdfBuffer,
        size: pdfBuffer.length
      };
      
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // Generate PNG from resume data
  async generatePng(resumeData, templateId = 'professional-classic', options = {}) {
    let browser = null;
    
    try {
      console.log('🖼️ Starting PNG generation...');
      
      // Load template
      const template = await this.loadTemplate(templateId);
      
      // Compile template with data
      const html = template(resumeData);
      
      // Save HTML to temp file
      const tempHtmlPath = path.join(this.tempPath, `resume-${uuidv4()}.html`);
      fs.writeFileSync(tempHtmlPath, html);
      
      // Launch browser
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });
      
      const page = await browser.newPage();
      
      // Set viewport for A4 size
      await page.setViewport({
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
        deviceScaleFactor: 2
      });
      
      // Load HTML
      await page.goto(`file://${tempHtmlPath}`, {
        waitUntil: 'networkidle0'
      });
      
      // Wait for fonts to load
      await page.evaluateHandle('document.fonts.ready');
      
      // Generate PNG
      const pngBuffer = await page.screenshot({
        type: 'png',
        fullPage: true,
        ...options
      });
      
      // Clean up temp file
      fs.unlinkSync(tempHtmlPath);
      
      console.log('✅ PNG generated successfully');
      
      return {
        success: true,
        pngBuffer,
        size: pngBuffer.length
      };
      
    } catch (error) {
      console.error('❌ PNG generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // Generate Word document (HTML format)
  async generateWord(resumeData, templateId = 'professional-classic') {
    try {
      console.log('📝 Starting Word document generation...');
      
      // Load template
      const template = await this.loadTemplate(templateId);
      
      // Compile template with data
      const html = template(resumeData);
      
      // Convert to Word-compatible HTML
      const wordHtml = this.convertToWordHtml(html);
      
      console.log('✅ Word document generated successfully');
      
      return {
        success: true,
        html: wordHtml,
        size: Buffer.byteLength(wordHtml, 'utf8')
      };
      
    } catch (error) {
      console.error('❌ Word document generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Convert HTML to Word-compatible format
  convertToWordHtml(html) {
    // Add Word-specific meta tags and styles
    const wordHtml = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="utf-8">
    <meta name="ProgId" content="Word.Document">
    <meta name="Generator" content="Microsoft Word 15">
    <meta name="Originator" content="Microsoft Word 15">
    <style>
        @page {
            size: 8.5in 11in;
            margin: 0.5in;
        }
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
    </style>
</head>
<body>
    ${html}
</body>
</html>`;
    
    return wordHtml;
  }

  // Get template preview
  async getTemplatePreview(templateId, sampleData = null) {
    try {
      if (!sampleData) {
        sampleData = this.getSampleResumeData();
      }
      
      const template = await this.loadTemplate(templateId);
      const html = template(sampleData);
      
      return {
        success: true,
        html
      };
    } catch (error) {
      console.error('Error generating template preview:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get sample resume data for previews
  getSampleResumeData() {
    return {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        address: 'New York, NY',
        website: 'www.johndoe.com',
        about: 'Experienced software engineer with 5+ years of expertise in full-stack development, cloud architecture, and team leadership. Passionate about creating scalable solutions and mentoring junior developers.'
      },
      experience: [
        {
          company: 'Tech Corp',
          position: 'Senior Software Engineer',
          startDate: '2020',
          endDate: 'Present',
          description: 'Led development of microservices architecture serving 1M+ users. Mentored 3 junior developers and improved system performance by 40%.'
        },
        {
          company: 'StartupXYZ',
          position: 'Full Stack Developer',
          startDate: '2018',
          endDate: '2020',
          description: 'Built and maintained web applications using React, Node.js, and PostgreSQL. Collaborated with cross-functional teams to deliver features on time.'
        }
      ],
      education: [
        {
          school: 'University of Technology',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2014',
          endDate: '2018',
          description: 'Graduated Magna Cum Laude with focus on software engineering and algorithms.'
        }
      ],
      skills: [
        { name: 'JavaScript', level: 'Expert', category: 'Programming' },
        { name: 'React', level: 'Advanced', category: 'Frontend' },
        { name: 'Node.js', level: 'Advanced', category: 'Backend' },
        { name: 'Python', level: 'Intermediate', category: 'Programming' },
        { name: 'AWS', level: 'Intermediate', category: 'Cloud' }
      ],
      projects: [
        {
          name: 'E-commerce Platform',
          description: 'Built a full-stack e-commerce platform with React and Node.js',
          technologies: 'React, Node.js, MongoDB, Stripe'
        }
      ],
      certifications: [
        {
          name: 'AWS Certified Developer',
          issuer: 'Amazon Web Services',
          date: '2021'
        }
      ],
      languages: [
        { name: 'English', proficiency: 'Native' },
        { name: 'Spanish', proficiency: 'Fluent' }
      ]
    };
  }

  // Clean up temp files
  cleanupTempFiles() {
    try {
      const files = fs.readdirSync(this.tempPath);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      files.forEach(file => {
        const filePath = path.join(this.tempPath, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }
}

module.exports = new ResumePdfService();
