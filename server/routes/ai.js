const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { errorService, ValidationError } = require('../services/errorService');
const loggerService = require('../services/loggerService');
const aiService = require('../services/aiService');
const { authSchemas } = require('../validation/schemas');
const securityMiddleware = require('../middleware/security');

/**
 * @swagger
 * /api/ai/generate/summary:
 *   post:
 *     summary: Generate professional resume summary
 *     tags: [AI Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [experience, skills, targetRole, industry]
 *             properties:
 *               experience:
 *                 type: string
 *                 example: "5+ years in software development"
 *               skills:
 *                 type: string
 *                 example: "JavaScript, React, Node.js, Python"
 *               targetRole:
 *                 type: string
 *                 example: "Senior Software Engineer"
 *               industry:
 *                 type: string
 *                 example: "Technology"
 *               tone:
 *                 type: string
 *                 enum: [professional, creative, technical]
 *                 example: "professional"
 *               provider:
 *                 type: string
 *                 enum: [openai, anthropic]
 *                 example: "openai"
 *     responses:
 *       200:
 *         description: Summary generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 content:
 *                   type: string
 *                   example: "Experienced software engineer with 5+ years of expertise..."
 *                 provider:
 *                   type: string
 *                   example: "openai"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: AI service error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/generate/summary', 
  auth,
  errorService.asyncHandler(async (req, res) => {
    const { experience, skills, targetRole, industry, tone = 'professional', provider = 'openai' } = req.body;

    // Validate required fields
    if (!experience || !skills || !targetRole || !industry) {
      throw new ValidationError('Missing required fields: experience, skills, targetRole, industry');
    }

    loggerService.userAction('AI summary generation requested', {
      userId: req.user.id,
      targetRole,
      industry,
      provider
    });

    const result = await aiService.generateResumeContent('summary', {
      experience,
      skills,
      targetRole,
      industry,
      userId: req.user.id
    }, { tone, provider });

    res.json({
      success: true,
      content: result,
      provider,
      generatedAt: new Date().toISOString()
    });
  })
);

/**
 * @swagger
 * /api/ai/generate/experience:
 *   post:
 *     summary: Generate professional experience descriptions
 *     tags: [AI Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role, company, duration, achievements]
 *             properties:
 *               role:
 *                 type: string
 *                 example: "Software Engineer"
 *               company:
 *                 type: string
 *                 example: "Tech Corp"
 *               duration:
 *                 type: string
 *                 example: "2 years"
 *               achievements:
 *                 type: string
 *                 example: "Led development of web applications, improved performance by 50%"
 *               skills:
 *                 type: string
 *                 example: "JavaScript, React, Node.js"
 *               format:
 *                 type: string
 *                 enum: [bullet_points, paragraph, numbered]
 *                 example: "bullet_points"
 *               provider:
 *                 type: string
 *                 enum: [openai, anthropic]
 *                 example: "openai"
 *     responses:
 *       200:
 *         description: Experience descriptions generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 content:
 *                   type: string
 *                   example: "• Led development of scalable web applications..."
 *                 provider:
 *                   type: string
 *                   example: "openai"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: AI service error
 */
router.post('/generate/experience',
  auth,
  errorService.asyncHandler(async (req, res) => {
    const { role, company, duration, achievements, skills = '', format = 'bullet_points', provider = 'openai' } = req.body;

    if (!role || !company || !duration || !achievements) {
      throw new ValidationError('Missing required fields: role, company, duration, achievements');
    }

    loggerService.userAction('AI experience generation requested', {
      userId: req.user.id,
      role,
      company,
      provider
    });

    const result = await aiService.generateResumeContent('experience', {
      role,
      company,
      duration,
      achievements,
      skills,
      userId: req.user.id
    }, { format, provider });

    res.json({
      success: true,
      content: result,
      provider,
      generatedAt: new Date().toISOString()
    });
  })
);

/**
 * @swagger
 * /api/ai/generate/skills:
 *   post:
 *     summary: Generate comprehensive skills section
 *     tags: [AI Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [experience, targetRole, industry, currentSkills]
 *             properties:
 *               experience:
 *                 type: string
 *                 example: "5+ years"
 *               targetRole:
 *                 type: string
 *                 example: "Senior Software Engineer"
 *               industry:
 *                 type: string
 *                 example: "Technology"
 *               currentSkills:
 *                 type: string
 *                 example: "JavaScript, React, Node.js"
 *               format:
 *                 type: string
 *                 enum: [categorized, list, detailed]
 *                 example: "categorized"
 *               provider:
 *                 type: string
 *                 enum: [openai, anthropic]
 *                 example: "openai"
 *     responses:
 *       200:
 *         description: Skills section generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 content:
 *                   type: string
 *                   example: "Programming Languages: JavaScript, Python, Java..."
 *                 provider:
 *                   type: string
 *                   example: "openai"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: AI service error
 */
router.post('/generate/skills',
  auth,
  errorService.asyncHandler(async (req, res) => {
    const { experience, targetRole, industry, currentSkills, format = 'categorized', provider = 'openai' } = req.body;

    if (!experience || !targetRole || !industry || !currentSkills) {
      throw new ValidationError('Missing required fields: experience, targetRole, industry, currentSkills');
    }

    loggerService.userAction('AI skills generation requested', {
      userId: req.user.id,
      targetRole,
      industry,
      provider
    });

    const result = await aiService.generateResumeContent('skills', {
      experience,
      targetRole,
      industry,
      currentSkills,
      userId: req.user.id
    }, { format, provider });

    res.json({
      success: true,
      content: result,
      provider,
      generatedAt: new Date().toISOString()
    });
  })
);

/**
 * @swagger
 * /api/ai/generate/cover-letter:
 *   post:
 *     summary: Generate professional cover letter
 *     tags: [AI Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [jobDescription, company, role, resumeData]
 *             properties:
 *               jobDescription:
 *                 type: string
 *                 example: "We are looking for a Senior Software Engineer..."
 *               company:
 *                 type: string
 *                 example: "Tech Corp"
 *               role:
 *                 type: string
 *                 example: "Senior Software Engineer"
 *               resumeData:
 *                 type: object
 *                 example: {"experience": "5+ years", "skills": "JavaScript, React"}
 *               tone:
 *                 type: string
 *                 enum: [professional, enthusiastic, formal]
 *                 example: "professional"
 *               length:
 *                 type: string
 *                 enum: [short, medium, long]
 *                 example: "medium"
 *               provider:
 *                 type: string
 *                 enum: [openai, anthropic]
 *                 example: "openai"
 *     responses:
 *       200:
 *         description: Cover letter generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 content:
 *                   type: string
 *                   example: "Dear Hiring Manager, I am writing to express..."
 *                 provider:
 *                   type: string
 *                   example: "openai"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: AI service error
 */
router.post('/generate/cover-letter',
  auth,
  errorService.asyncHandler(async (req, res) => {
    const { jobDescription, company, role, resumeData, tone = 'professional', length = 'medium', provider = 'openai' } = req.body;

    if (!jobDescription || !company || !role || !resumeData) {
      throw new ValidationError('Missing required fields: jobDescription, company, role, resumeData');
    }

    loggerService.userAction('AI cover letter generation requested', {
      userId: req.user.id,
      company,
      role,
      provider
    });

    const result = await aiService.generateResumeContent('cover_letter', {
      jobDescription,
      company,
      role,
      resumeData,
      userId: req.user.id
    }, { tone, length, provider });

    res.json({
      success: true,
      content: result,
      provider,
      generatedAt: new Date().toISOString()
    });
  })
);

/**
 * @swagger
 * /api/ai/optimize/ats:
 *   post:
 *     summary: Optimize resume for ATS compatibility
 *     tags: [AI Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resumeContent, jobDescription, targetRole, industry]
 *             properties:
 *               resumeContent:
 *                 type: string
 *                 example: "John Doe - Software Engineer..."
 *               jobDescription:
 *                 type: string
 *                 example: "We are looking for a Senior Software Engineer..."
 *               targetRole:
 *                 type: string
 *                 example: "Senior Software Engineer"
 *               industry:
 *                 type: string
 *                 example: "Technology"
 *               provider:
 *                 type: string
 *                 enum: [openai, anthropic]
 *                 example: "openai"
 *     responses:
 *       200:
 *         description: Resume optimized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 optimizedContent:
 *                   type: string
 *                   example: "Optimized resume content..."
 *                 missingKeywords:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["TypeScript", "Docker"]
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Add more technical skills", "Include industry keywords"]
 *                 atsScore:
 *                   type: integer
 *                   minimum: 0
 *                   maximum: 100
 *                   example: 85
 *                 provider:
 *                   type: string
 *                   example: "openai"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: AI service error
 */
router.post('/optimize/ats',
  auth,
  errorService.asyncHandler(async (req, res) => {
    const { resumeContent, jobDescription, targetRole, industry, provider = 'openai' } = req.body;

    if (!resumeContent || !jobDescription || !targetRole || !industry) {
      throw new ValidationError('Missing required fields: resumeContent, jobDescription, targetRole, industry');
    }

    loggerService.userAction('AI ATS optimization requested', {
      userId: req.user.id,
      targetRole,
      industry,
      provider
    });

    const result = await aiService.generateResumeContent('ats_optimization', {
      resumeContent,
      jobDescription,
      targetRole,
      industry,
      userId: req.user.id
    }, { provider });

    res.json({
      success: true,
      ...result,
      provider,
      optimizedAt: new Date().toISOString()
    });
  })
);

/**
 * @swagger
 * /api/ai/status:
 *   get:
 *     summary: Get AI services status
 *     tags: [AI Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI services status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 services:
 *                   type: object
 *                   properties:
 *                     openai:
 *                       type: object
 *                       properties:
 *                         available:
 *                           type: boolean
 *                           example: true
 *                         rateLimit:
 *                           type: object
 *                           properties:
 *                             requests:
 *                               type: integer
 *                               example: 5
 *                             lastReset:
 *                               type: integer
 *                               example: 1634567890000
 *                     anthropic:
 *                       type: object
 *                       properties:
 *                         available:
 *                           type: boolean
 *                           example: true
 *                         rateLimit:
 *                           type: object
 *                           properties:
 *                             requests:
 *                               type: integer
 *                               example: 3
 *                             lastReset:
 *                               type: integer
 *                               example: 1634567890000
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/status',
  auth,
  errorService.asyncHandler(async (req, res) => {
    const status = aiService.getStatus();
    
    res.json({
      success: true,
      services: status,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * @swagger
 * /api/ai/test:
 *   post:
 *     summary: Test AI services connectivity
 *     tags: [AI Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI services test completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 results:
 *                   type: object
 *                   properties:
 *                     openai:
 *                       type: object
 *                       properties:
 *                         available:
 *                           type: boolean
 *                           example: true
 *                         error:
 *                           type: string
 *                           example: null
 *                     anthropic:
 *                       type: object
 *                       properties:
 *                         available:
 *                           type: boolean
 *                           example: true
 *                         error:
 *                           type: string
 *                           example: null
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Test failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/test',
  auth,
  errorService.asyncHandler(async (req, res) => {
    loggerService.userAction('AI services test requested', {
      userId: req.user.id
    });

    const results = await aiService.testServices();
    
    res.json({
      success: true,
      results,
      testedAt: new Date().toISOString()
    });
  })
);

module.exports = router;
