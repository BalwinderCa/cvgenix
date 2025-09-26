const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const loggerService = require('./loggerService');

/**
 * Centralized AI Service
 * Manages OpenAI and Anthropic API interactions with enhanced error handling and logging
 */
class AIService {
  constructor() {
    this.initializeServices();
    this.rateLimits = {
      openai: { requests: 0, lastReset: Date.now() },
      anthropic: { requests: 0, lastReset: Date.now() }
    };
    this.maxRequestsPerMinute = {
      openai: 60,
      anthropic: 30
    };
  }

  /**
   * Initialize AI services with proper error handling
   */
  initializeServices() {
    try {
      // Initialize OpenAI
      if (process.env.OPENAI_API_KEY) {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          timeout: 30000, // 30 seconds timeout
          maxRetries: 3
        });
        // OpenAI service initialized
      } else {
        loggerService.warn('OpenAI API key not found - OpenAI features disabled');
      }

      // Initialize Anthropic
      if (process.env.ANTHROPIC_API_KEY) {
        this.anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
          timeout: 30000, // 30 seconds timeout
        });
        // Anthropic service initialized
      } else {
        loggerService.warn('Anthropic API key not found - Anthropic features disabled');
      }

      if (!this.openai && !this.anthropic) {
        throw new Error('No AI services available - check API keys');
      }

    } catch (error) {
      loggerService.error('Failed to initialize AI services', { error: error.message });
      throw error;
    }
  }

  /**
   * Check rate limits for AI services
   */
  checkRateLimit(service) {
    const now = Date.now();
    const rateLimit = this.rateLimits[service];
    
    // Reset counter every minute
    if (now - rateLimit.lastReset > 60000) {
      rateLimit.requests = 0;
      rateLimit.lastReset = now;
    }
    
    if (rateLimit.requests >= this.maxRequestsPerMinute[service]) {
      throw new Error(`Rate limit exceeded for ${service}. Please try again in a moment.`);
    }
    
    rateLimit.requests++;
  }

  /**
   * Generate resume content using AI
   */
  async generateResumeContent(type, data, options = {}) {
    const startTime = Date.now();
    
    try {
      loggerService.info('Generating resume content with AI', { 
        type, 
        userId: data.userId,
        options: Object.keys(options)
      });

      let result;
      
      switch (type) {
        case 'summary':
          result = await this.generateSummary(data, options);
          break;
        case 'experience':
          result = await this.generateExperience(data, options);
          break;
        case 'skills':
          result = await this.generateSkills(data, options);
          break;
        case 'ats_optimization':
          result = await this.optimizeForATS(data, options);
          break;
        default:
          throw new Error(`Unknown content type: ${type}`);
      }

      const duration = Date.now() - startTime;
      loggerService.info('AI content generation completed', { 
        type, 
        duration,
        success: true
      });

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      loggerService.error('AI content generation failed', { 
        type, 
        duration,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Generate professional summary
   */
  async generateSummary(data, options = {}) {
    const { experience, skills, targetRole, industry } = data;
    const { provider = 'openai', tone = 'professional' } = options;

    const prompt = `Generate a professional summary for a resume based on the following information:

Experience: ${experience}
Skills: ${skills}
Target Role: ${targetRole}
Industry: ${industry}
Tone: ${tone}

Requirements:
- 3-4 sentences maximum
- Highlight key achievements and skills
- Use action verbs and quantifiable results
- Match the target role and industry
- Professional and compelling tone

Generate only the summary text, no additional formatting or explanations.`;

    if (provider === 'anthropic' && this.anthropic) {
      return await this.callAnthropic(prompt, 'summary');
    } else if (this.openai) {
      return await this.callOpenAI(prompt, 'summary');
    } else {
      throw new Error('No AI service available');
    }
  }

  /**
   * Generate experience descriptions
   */
  async generateExperience(data, options = {}) {
    const { role, company, duration, achievements, skills } = data;
    const { provider = 'openai', format = 'bullet_points' } = options;

    const prompt = `Generate professional experience descriptions for a resume:

Role: ${role}
Company: ${company}
Duration: ${duration}
Key Achievements: ${achievements}
Relevant Skills: ${skills}

Requirements:
- Use strong action verbs
- Include quantifiable results where possible
- Focus on impact and value delivered
- Format as ${format}
- 3-5 points maximum
- Professional tone

Generate only the experience descriptions, no additional formatting.`;

    if (provider === 'anthropic' && this.anthropic) {
      return await this.callAnthropic(prompt, 'experience');
    } else if (this.openai) {
      return await this.callOpenAI(prompt, 'experience');
    } else {
      throw new Error('No AI service available');
    }
  }

  /**
   * Generate skills section
   */
  async generateSkills(data, options = {}) {
    const { experience, targetRole, industry, currentSkills } = data;
    const { provider = 'openai', format = 'categorized' } = options;

    const prompt = `Generate a comprehensive skills section for a resume:

Current Skills: ${currentSkills}
Target Role: ${targetRole}
Industry: ${industry}
Experience Level: ${experience}

Requirements:
- Include both technical and soft skills
- Match industry standards for the role
- Format as ${format}
- Include proficiency levels where appropriate
- Focus on relevant and in-demand skills
- Professional categorization

Generate only the skills section, no additional formatting.`;

    if (provider === 'anthropic' && this.anthropic) {
      return await this.callAnthropic(prompt, 'skills');
    } else if (this.openai) {
      return await this.callOpenAI(prompt, 'skills');
    } else {
      throw new Error('No AI service available');
    }
  }


  /**
   * Optimize resume for ATS
   */
  async optimizeForATS(data, options = {}) {
    const { resumeContent, jobDescription, targetRole, industry } = data;
    const { provider = 'openai' } = options;

    const prompt = `Optimize this resume content for ATS (Applicant Tracking System) compatibility:

Resume Content: ${resumeContent}
Job Description: ${jobDescription}
Target Role: ${targetRole}
Industry: ${industry}

Requirements:
- Identify missing keywords from job description
- Suggest improvements for ATS compatibility
- Maintain professional formatting
- Preserve original meaning and impact
- Focus on relevant industry terminology
- Provide specific recommendations

Return a JSON object with:
{
  "optimizedContent": "improved resume content",
  "missingKeywords": ["keyword1", "keyword2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "atsScore": 85
}`;

    if (provider === 'anthropic' && this.anthropic) {
      return await this.callAnthropic(prompt, 'ats_optimization');
    } else if (this.openai) {
      return await this.callOpenAI(prompt, 'ats_optimization');
    } else {
      throw new Error('No AI service available');
    }
  }

  /**
   * Call OpenAI API
   */
  async callOpenAI(prompt, context) {
    if (!this.openai) {
      throw new Error('OpenAI service not available');
    }

    this.checkRateLimit('openai');

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: prompt
        }],
        temperature: 0.3,
        max_tokens: 2000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });

      const content = response.choices[0].message.content.trim();
      
      loggerService.info('OpenAI API call successful', { 
        context,
        tokensUsed: response.usage?.total_tokens || 0
      });

      return this.parseResponse(content, context);

    } catch (error) {
      loggerService.error('OpenAI API call failed', { 
        context,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Call Anthropic API
   */
  async callAnthropic(prompt, context) {
    if (!this.anthropic) {
      throw new Error('Anthropic service not available');
    }

    this.checkRateLimit('anthropic');

    try {
      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 2000,
        temperature: 0.3,
        messages: [{
          role: "user",
          content: prompt
        }]
      });

      const content = response.content[0].text.trim();
      
      loggerService.info('Anthropic API call successful', { 
        context,
        tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens || 0
      });

      return this.parseResponse(content, context);

    } catch (error) {
      loggerService.error('Anthropic API call failed', { 
        context,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Parse AI response based on context
   */
  parseResponse(content, context) {
    try {
      // For JSON responses (ATS optimization)
      if (context === 'ats_optimization' && content.includes('{')) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
      
      // For other contexts, return the content as-is
      return content;
      
    } catch (error) {
      loggerService.warn('Failed to parse AI response as JSON, returning raw content', { 
        context,
        error: error.message
      });
      return content;
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      openai: {
        available: !!this.openai,
        rateLimit: this.rateLimits.openai
      },
      anthropic: {
        available: !!this.anthropic,
        rateLimit: this.rateLimits.anthropic
      }
    };
  }

  /**
   * Test AI services
   */
  async testServices() {
    const results = {
      openai: { available: false, error: null },
      anthropic: { available: false, error: null }
    };

    // Test OpenAI
    if (this.openai) {
      try {
        await this.callOpenAI('Say "OpenAI test successful"', 'test');
        results.openai.available = true;
      } catch (error) {
        results.openai.error = error.message;
      }
    }

    // Test Anthropic
    if (this.anthropic) {
      try {
        await this.callAnthropic('Say "Anthropic test successful"', 'test');
        results.anthropic.available = true;
      } catch (error) {
        results.anthropic.error = error.message;
      }
    }

    return results;
  }
}

module.exports = new AIService();
