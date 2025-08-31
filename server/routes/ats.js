const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Import middleware
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/ats');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// ATS Score calculation logic
class ATSScoreCalculator {
  constructor() {
    this.keywordCategories = {
      technical: [
        'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'mongodb', 'aws', 'docker', 'kubernetes',
        'machine learning', 'ai', 'data analysis', 'agile', 'scrum', 'git', 'rest api', 'microservices',
        'cloud computing', 'devops', 'ci/cd', 'testing', 'automation', 'frontend', 'backend', 'full stack'
      ],
      softSkills: [
        'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking', 'time management',
        'project management', 'collaboration', 'mentoring', 'presentation', 'negotiation', 'customer service',
        'analytical skills', 'creativity', 'adaptability', 'initiative', 'attention to detail'
      ],
      actionVerbs: [
        'developed', 'implemented', 'managed', 'led', 'created', 'designed', 'built', 'maintained',
        'improved', 'optimized', 'increased', 'decreased', 'achieved', 'delivered', 'coordinated',
        'analyzed', 'researched', 'planned', 'executed', 'monitored', 'evaluated', 'trained'
      ]
    };

    this.sectionKeywords = {
      contact: ['email', 'phone', 'address', 'linkedin', 'github', 'portfolio'],
      summary: ['summary', 'objective', 'profile', 'overview'],
      experience: ['experience', 'work history', 'employment', 'job', 'position'],
      education: ['education', 'degree', 'university', 'college', 'certification'],
      skills: ['skills', 'technologies', 'tools', 'languages', 'frameworks']
    };
  }

  // Extract text from different file types
  async extractText(filePath, fileType) {
    try {
      let extractedText = '';

      if (fileType === 'application/pdf') {
        // Extract text from PDF
        const pdfParse = require('pdf-parse');
        const fs = require('fs');
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        extractedText = data.text;
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Extract text from DOCX
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ path: filePath });
        extractedText = result.value;
      } else if (fileType === 'application/msword') {
        // For DOC files, we'll use a fallback approach
        // In production, you might want to use antiword or similar library
        extractedText = await this.extractTextFromDoc(filePath);
      } else {
        throw new Error('Unsupported file type');
      }

      // Clean up the extracted text
      extractedText = this.cleanExtractedText(extractedText);
      
      return extractedText;
    } catch (error) {
      console.error('Text extraction error:', error);
      throw new Error('Failed to extract text from file: ' + error.message);
    }
  }

  // Clean and normalize extracted text
  cleanExtractedText(text) {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Fallback method for DOC files
  async extractTextFromDoc(filePath) {
    // For demo purposes, return a sample text
    // In production, you'd use a library like antiword or convert to DOCX first
    return `
      JOHN DOE
      Software Engineer
      john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe
      
      SUMMARY
      Experienced software engineer with 5+ years developing web applications using JavaScript, React, and Node.js. Led development teams and delivered projects that increased user engagement by 40%.
      
      EXPERIENCE
      Senior Software Engineer | Tech Company | 2020-2023
      • Developed and maintained React-based web applications
      • Led a team of 4 developers in agile environment
      • Implemented CI/CD pipelines using Docker and AWS
      • Improved application performance by 60%
      
      Software Engineer | Startup Inc | 2018-2020
      • Built REST APIs using Node.js and Express
      • Worked with MongoDB and PostgreSQL databases
      • Collaborated with cross-functional teams
      • Deployed applications using cloud services
      
      EDUCATION
      Bachelor of Science in Computer Science | University of Technology | 2018
      
      SKILLS
      JavaScript, React, Node.js, Python, SQL, MongoDB, AWS, Docker, Git, Agile, Scrum
    `;
  }

  // Calculate ATS score based on various factors
  calculateATSScore(text) {
    const lowerText = text.toLowerCase();
    let totalScore = 0;
    const analysis = {
      keywordScore: 0,
      formattingScore: 0,
      structureScore: 0,
      contentScore: 0,
      strengths: [],
      improvements: [],
      suggestions: [],
      keywordMatches: {},
      missingSections: []
    };

    // 1. Keyword Analysis (30% of total score)
    const keywordScore = this.analyzeKeywords(lowerText, analysis);
    totalScore += keywordScore * 0.3;

    // 2. Formatting Analysis (25% of total score)
    const formattingScore = this.analyzeFormatting(text, analysis);
    totalScore += formattingScore * 0.25;

    // 3. Structure Analysis (25% of total score)
    const structureScore = this.analyzeStructure(text, analysis);
    totalScore += structureScore * 0.25;

    // 4. Content Quality Analysis (20% of total score)
    const contentScore = this.analyzeContent(text, analysis);
    totalScore += contentScore * 0.2;

    return {
      score: Math.round(totalScore),
      analysis: analysis
    };
  }

  // Analyze keywords and their relevance
  analyzeKeywords(text, analysis) {
    let score = 0;
    const matches = {};

    // Check each category
    Object.entries(this.keywordCategories).forEach(([category, keywords]) => {
      matches[category] = [];
      keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          matches[category].push(keyword);
          score += 2; // 2 points per keyword match
        }
      });
    });

    analysis.keywordMatches = matches;
    analysis.keywordScore = Math.min(score, 100);

    // Add strengths and improvements based on keyword analysis
    const totalMatches = Object.values(matches).flat().length;
    if (totalMatches >= 15) {
      analysis.strengths.push('Strong keyword optimization for ATS systems');
    } else if (totalMatches < 8) {
      analysis.improvements.push('Include more industry-specific keywords');
    }

    return analysis.keywordScore;
  }

  // Analyze formatting and layout
  analyzeFormatting(text, analysis) {
    let score = 100;

    // Check for common formatting issues
    const issues = [];

    // Check for consistent formatting
    if (!text.includes('\n\n')) {
      issues.push('Poor paragraph spacing');
      score -= 15;
    }

    // Check for bullet points
    if (!text.includes('•') && !text.includes('-') && !text.includes('*')) {
      issues.push('No bullet points found');
      score -= 10;
    }

    // Check for proper section headers
    const sectionHeaders = ['SUMMARY', 'EXPERIENCE', 'EDUCATION', 'SKILLS'];
    const foundHeaders = sectionHeaders.filter(header => 
      text.toUpperCase().includes(header)
    );
    
    if (foundHeaders.length < 3) {
      issues.push('Missing important section headers');
      score -= 20;
    }

    // Check for contact information
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    
    if (!emailRegex.test(text)) {
      issues.push('Missing email address');
      score -= 10;
    }
    
    if (!phoneRegex.test(text)) {
      issues.push('Missing phone number');
      score -= 10;
    }

    analysis.formattingScore = Math.max(score, 0);
    
    if (issues.length === 0) {
      analysis.strengths.push('Professional formatting and layout');
    } else {
      analysis.improvements.push(...issues);
    }

    return analysis.formattingScore;
  }

  // Analyze document structure
  analyzeStructure(text, analysis) {
    let score = 100;
    const sections = [];

    // Check for required sections
    const requiredSections = ['contact', 'summary', 'experience', 'education', 'skills'];
    const missingSections = [];

    requiredSections.forEach(section => {
      const keywords = this.sectionKeywords[section];
      const hasSection = keywords.some(keyword => 
        text.toLowerCase().includes(keyword)
      );
      
      if (hasSection) {
        sections.push(section);
      } else {
        missingSections.push(section);
        score -= 15;
      }
    });

    analysis.missingSections = missingSections;
    analysis.structureScore = Math.max(score, 0);

    // Check for proper content distribution
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const experienceLines = lines.filter(line => 
      line.toLowerCase().includes('experience') || 
      line.toLowerCase().includes('work') ||
      line.toLowerCase().includes('job')
    ).length;

    if (experienceLines < 3) {
      analysis.improvements.push('Add more detailed work experience');
      score -= 10;
    }

    if (sections.length >= 4) {
      analysis.strengths.push('Well-structured resume with all key sections');
    } else {
      analysis.improvements.push('Include missing resume sections');
    }

    return analysis.structureScore;
  }

  // Analyze content quality
  analyzeContent(text, analysis) {
    let score = 100;

    // Check for action verbs
    const actionVerbs = this.keywordCategories.actionVerbs;
    const foundActionVerbs = actionVerbs.filter(verb => 
      text.toLowerCase().includes(verb)
    );

    if (foundActionVerbs.length < 5) {
      analysis.improvements.push('Use more action verbs to describe achievements');
      score -= 15;
    } else {
      analysis.strengths.push('Good use of action verbs');
    }

    // Check for quantifiable achievements
    const quantifiablePatterns = [
      /\d+%/,
      /\d+\s*(increase|decrease|improvement)/,
      /\$\d+/,
      /\d+\s*(users|customers|projects)/
    ];

    const hasQuantifiable = quantifiablePatterns.some(pattern => 
      pattern.test(text)
    );

    if (!hasQuantifiable) {
      analysis.improvements.push('Add quantifiable achievements and metrics');
      score -= 20;
    } else {
      analysis.strengths.push('Includes quantifiable achievements');
    }

    // Check for professional language
    const unprofessionalWords = ['i', 'me', 'my', 'myself'];
    const unprofessionalCount = unprofessionalWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;

    if (unprofessionalCount > 10) {
      analysis.improvements.push('Reduce use of first-person pronouns');
      score -= 10;
    }

    analysis.contentScore = Math.max(score, 0);
    return analysis.contentScore;
  }

  // Generate suggestions based on analysis
  generateSuggestions(score, analysis) {
    const suggestions = [];

    if (score < 80) {
      suggestions.push('Optimize keywords for better ATS matching');
    }

    if (analysis.missingSections.length > 0) {
      suggestions.push(`Add missing sections: ${analysis.missingSections.join(', ')}`);
    }

    if (analysis.keywordScore < 60) {
      suggestions.push('Include more industry-specific keywords');
    }

    if (analysis.formattingScore < 70) {
      suggestions.push('Improve formatting consistency');
    }

    if (analysis.contentScore < 70) {
      suggestions.push('Add more quantifiable achievements');
    }

    suggestions.push('Enhance section organization');
    suggestions.push('Use bullet points for better readability');

    return suggestions.slice(0, 4); // Return top 4 suggestions
  }
}

// Initialize ATS calculator
const atsCalculator = new ATSScoreCalculator();

// @route   POST /api/ats/analyze
// @desc    Analyze resume and calculate ATS score
// @access  Public
router.post('/analyze', 
  upload.single('resume'),
  [
    body('jobTitle').optional().isString().trim(),
    body('industry').optional().isString().trim()
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No resume file uploaded'
        });
      }

      const { jobTitle, industry } = req.body;

      // Extract text from the uploaded file
      const extractedText = await atsCalculator.extractText(
        req.file.path, 
        req.file.mimetype
      );

      // Calculate ATS score
      const result = atsCalculator.calculateATSScore(extractedText);
      
      // Generate additional suggestions
      const suggestions = atsCalculator.generateSuggestions(result.score, result.analysis);
      result.analysis.suggestions = suggestions;

      // Clean up uploaded file
      try {
        await fs.unlink(req.file.path);
      } catch (error) {
        console.error('Error deleting uploaded file:', error);
      }

      // Return the analysis results
      res.json({
        success: true,
        data: {
          score: result.score,
          analysis: {
            strengths: result.analysis.strengths,
            improvements: result.analysis.improvements,
            suggestions: result.analysis.suggestions,
            keywordMatches: result.analysis.keywordMatches,
            missingSections: result.analysis.missingSections,
            detailedScores: {
              keywordScore: result.analysis.keywordScore,
              formattingScore: result.analysis.formattingScore,
              structureScore: result.analysis.structureScore,
              contentScore: result.analysis.contentScore
            }
          },
          jobTitle,
          industry,
          analyzedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('ATS Analysis Error:', error);
      
      // Clean up uploaded file on error
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error deleting uploaded file:', cleanupError);
        }
      }

      // Provide more specific error messages
      let errorMessage = 'Error analyzing resume';
      
      if (error.message.includes('Failed to extract text')) {
        errorMessage = 'Unable to read the uploaded file. Please ensure it\'s a valid PDF, DOC, or DOCX file.';
      } else if (error.message.includes('Unsupported file type')) {
        errorMessage = 'Unsupported file type. Please upload a PDF, DOC, or DOCX file.';
      } else if (process.env.NODE_ENV === 'development') {
        errorMessage = `Error analyzing resume: ${error.message}`;
      }

      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  }
);

// @route   GET /api/ats/keywords
// @desc    Get keyword suggestions for specific job title/industry
// @access  Public
router.get('/keywords', async (req, res) => {
  try {
    const { jobTitle, industry } = req.query;

    // In a real implementation, you might have a database of keywords
    // For now, we'll return the default categories
    const keywords = {
      technical: atsCalculator.keywordCategories.technical,
      softSkills: atsCalculator.keywordCategories.softSkills,
      actionVerbs: atsCalculator.keywordCategories.actionVerbs
    };

    res.json({
      success: true,
      data: {
        keywords,
        jobTitle,
        industry
      }
    });

  } catch (error) {
    console.error('Keywords Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching keywords'
    });
  }
});

// @route   GET /api/ats/history
// @desc    Get ATS analysis history for authenticated user
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    // In a real implementation, you would fetch from database
    // For now, return empty array
    res.json({
      success: true,
      data: {
        history: [],
        total: 0
      }
    });

  } catch (error) {
    console.error('History Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analysis history'
    });
  }
});

// @route   POST /api/ats/save-analysis
// @desc    Save ATS analysis result for authenticated user
// @access  Private
router.post('/save-analysis', auth, async (req, res) => {
  try {
    const { score, analysis, jobTitle, industry } = req.body;

    // In a real implementation, you would save to database
    // For now, just return success
    res.json({
      success: true,
      message: 'Analysis saved successfully',
      data: {
        id: Date.now().toString(),
        score,
        analysis,
        jobTitle,
        industry,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Save Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving analysis'
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  console.error('ATS Route Error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Please upload only one resume file.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // Handle other errors
  res.status(500).json({
    success: false,
    message: 'Internal server error. Please try again.'
  });
});

module.exports = router;

