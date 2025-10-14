const DynamicKeywordService = require('./dynamicKeywordService');
const EnhancedResumeParser = require('./enhancedResumeParser');
const AnalysisLogger = require('./analysisLogger');
const KeywordExtractor = require('./keywordExtractor');

class SimpleATSAnalyzer {
  constructor() {
    // Initialize Groq API for GPT-OSS-120b
    this.groqApiKey = process.env.GROQ_API_KEY;
    this.groqBaseUrl = 'https://api.groq.com/openai/v1';
    
    // Initialize Dynamic Keyword Service
    this.keywordService = new DynamicKeywordService();
    
    // Initialize Enhanced Resume Parser
    this.parser = new EnhancedResumeParser();
    
    // Initialize Analysis Logger
    this.logger = new AnalysisLogger();
    
    // Initialize Keyword Extractor
    this.keywordExtractor = new KeywordExtractor();
    
  }


  async analyzeResume(resumeData, targetIndustry = 'technology', targetRole = 'Senior', analysisId = null) {
    try {
      console.log('🚀 Starting ATS analysis with GPT-OSS-120b (Groq)...');
      
      let resumeText = resumeData.text || resumeData.rawText || '';
      let resumeJsonData = resumeData.jsonData || null;
      
      // If no text provided but file path is available, parse the file
      if (!resumeText.trim() && resumeData.filePath) {
        console.log('📄 No text provided, parsing file...');
        const parseResult = await this.parser.parseResume(resumeData.filePath, resumeData.mimeType);
        
        if (parseResult.success) {
          resumeText = parseResult.text;
          resumeJsonData = parseResult.jsonData;
          console.log(`✅ File parsed successfully using ${parseResult.parsingMethod} method`);
        } else {
          throw new Error(`File parsing failed: ${parseResult.error}`);
        }
      }
      
      if (!resumeText.trim()) {
        throw new Error('No resume text found');
      }

      // Get dynamic keywords for the target industry
      const industryKeywords = await this.keywordService.getIndustryKeywords(targetIndustry, targetRole);
      
      // Create the comprehensive prompt with dynamic keywords
      const analysisPrompt = this.createAnalysisPrompt(resumeText, targetIndustry, targetRole, industryKeywords, resumeJsonData);
      
      // Log the prompt to file if analysisId is provided
      if (analysisId) {
        this.logger.logAnalysisPrompt(analysisId, analysisPrompt);
      }
      
      const analysis = await this.getGroqAnalysis(analysisPrompt, analysisId);
      
      // Log the final analysis summary to file if analysisId is provided
      if (analysisId) {
        this.logger.logAnalysisSummary(analysisId, analysis, targetIndustry, targetRole);
      }
      
      return analysis;

    } catch (error) {
      console.error('❌ ATS analysis failed:', error);
      throw error;
    }
  }


  createAnalysisPrompt(resumeText, targetIndustry, targetRole, industryKeywords = [], resumeJsonData = null) {
    return `
You are an expert ATS (Applicant Tracking System) analyst with 20 years of experience and resume optimization specialist. Analyze this resume with the precision of a professional recruiter and ATS system.

RESUME TEXT (EXTRACTED FROM PDF):
${resumeText}

${resumeJsonData ? `STRUCTURED RESUME DATA (JSON from LlamaParse):
${JSON.stringify(resumeJsonData, null, 2)}

IMPORTANT CONTEXT: The above includes both the extracted text and structured JSON data from LlamaParse. Use both sources to provide a comprehensive analysis. The JSON data provides structured information about sections, fields, and content organization.` : 'IMPORTANT CONTEXT: The above text has been extracted from a PDF resume using LlamaParse AI and converted to clean plain text format. The text you see is the actual content from the resume without any markdown formatting or HTML entities. Focus on analyzing the content quality, structure, and ATS compatibility of this clean text.'}

TARGET POSITION: ${targetRole} ${targetIndustry}

INDUSTRY KEYWORDS TO FOCUS ON: ${industryKeywords.slice(0, 20).join(', ')}

ANALYSIS REQUIREMENTS:
Provide a comprehensive ATS compatibility assessment in the following JSON format.

IMPORTANT: All text content in the JSON response must be in PLAIN TEXT format. Do NOT use any markdown formatting, HTML entities, or special symbols like:
- No markdown symbols: **bold**, *italic*, # headers, - lists, etc.
- No HTML entities: &amp;, &lt;, &gt;, etc.
- No tables or complex formatting
- No special characters or symbols

Use only plain text with standard punctuation and line breaks for readability.

{
  "atsScore": <number between 0-100>,
  "overallGrade": "<A+, A, B+, B, C+, C, D, F>",
  "detailedMetrics": {
    "sectionCompleteness": <number between 0-100>,
    "keywordDensity": <number between 0-100>,
    "structureConsistency": <number between 0-100>,
    "actionVerbs": <number between 0-100>,
    "quantifiedAchievements": <number between 0-100>
  },
  "quickStats": {
    "wordCount": <number>,
    "sectionsFound": <number>,
    "keywordsMatched": <number>,
    "improvementAreas": <number>
  },
  "yearsOfExperience": {
    "years": <number>,
    "source": "<how the years were determined>",
    "confidence": <number between 0-100>
  },
  "strengths": ["<detailed_strength1>", "<detailed_strength2>", "<detailed_strength3>", "<detailed_strength4>", "<detailed_strength5>"],
  "weaknesses": ["<detailed_weakness1>", "<detailed_weakness2>", "<detailed_weakness3>", "<detailed_weakness4>", "<detailed_weakness5>"],
  "sectionAnalysis": {
    "contactInfo": "<analysis of contact information completeness and ATS compatibility>",
    "professionalSummary": "<analysis of summary section presence, quality, and keyword usage>",
    "experience": "<analysis of work experience section including action verbs, quantification, and relevance>",
    "education": "<analysis of education section completeness and relevance>",
    "skills": "<analysis of skills section organization, keyword coverage, and ATS compatibility>",
    "certifications": "<analysis of certifications and additional qualifications>",
    "achievements": "<analysis of quantified achievements and measurable results>"
  },
  "sectionCompleteness": {
    "contactInfo": <number between 0-100>,
    "professionalSummary": <number between 0-100>,
    "experience": <number between 0-100>,
    "education": <number between 0-100>,
    "skills": <number between 0-100>,
    "certifications": <number between 0-100>,
    "achievements": <number between 0-100>
  },
  "industryAlignment": <number between 0-100>,
  "contentQuality": <number between 0-100>,
  "actionPlan": {
    "highPriority": [
      {
        "title": "<action title>",
        "description": "<detailed description of the action>",
        "estimatedImpact": "<number of points this could improve the score>",
        "reason": "<why this is high priority>"
      }
    ],
    "mediumPriority": [
      {
        "title": "<action title>",
        "description": "<detailed description of the action>",
        "estimatedImpact": "<number of points this could improve the score>",
        "reason": "<why this is medium priority>"
      }
    ],
    "lowPriority": [
      {
        "title": "<action title>",
        "description": "<detailed description of the action>",
        "estimatedImpact": "<number of points this could improve the score>",
        "reason": "<why this is low priority>"
      }
    ]
  }
}

DETAILED SCORING CRITERIA:

ATS SCORE (0-100):
- 90-100: Exceptional ATS optimization, perfect structure, industry keywords, quantified achievements
- 80-89: Strong ATS compatibility, minor improvements needed
- 70-79: Good ATS compatibility, several areas for improvement
- 60-69: Moderate ATS compatibility, significant improvements needed
- 50-59: Poor ATS compatibility, major restructuring required
- 0-49: Very poor ATS compatibility, complete overhaul needed

SECTION COMPLETENESS (0-100):
Required sections: Contact Info, Professional Summary, Experience, Education, Skills
Optional sections: Certifications, Projects, Achievements, Languages
Score based on presence and quality of each section.

KEYWORD DENSITY (0-100):
- Industry-specific keywords relevant to ${targetIndustry}
- Role-level keywords appropriate for ${targetRole} position
- Technical skills and competencies
- Action verbs and power words
- Job posting language alignment

STRUCTURE CONSISTENCY (0-100):
- Consistent structure throughout
- Proper use of headers and subheaders
- Clean, ATS-friendly layout
- Standard fonts and spacing
- Proper bullet points and numbering

ACTION VERBS (0-100):
- Strong action verbs (led, developed, implemented, optimized, etc.)
- Past tense for previous roles
- Present tense for current role
- Variety and impact of verbs used

QUANTIFIED ACHIEVEMENTS (0-100):
- Specific metrics and numbers (where applicable to the role/industry)
- Percentage improvements
- Dollar amounts saved/generated
- Team sizes managed (for leadership roles)
- Project scopes and timelines
- Measurable business impact (where relevant)

INDUSTRY ALIGNMENT (0-100):
- Relevance to ${targetIndustry} sector
- Appropriate for ${targetRole} level
- Industry-specific terminology
- Current trends and technologies
- Market knowledge demonstration

CONTENT QUALITY (0-100):
- Professional tone and language
- Clear, concise communication
- No spelling or grammar errors
- Logical flow and organization
- Compelling value proposition
- Professional presentation

ANALYSIS FOCUS:
1. ATS parsing compatibility (can the system read and categorize the content?)
2. Keyword optimization for ${targetIndustry} ${targetRole} positions
3. Structure that passes ATS filters
4. Content quality and professional presentation
5. Industry relevance and role-level appropriateness
6. Quantified achievements and measurable impact (where applicable)
7. Action-oriented language and strong verbs (appropriate for role level)
8. Complete sections with comprehensive information (relevant to the role)

TEXT ANALYSIS INSTRUCTIONS:
- The text you are analyzing has been extracted from a PDF and converted to clean plain text
- Focus on the actual content quality, structure, and ATS compatibility of the resume information
- Analyze the resume as it would appear to ATS systems and human recruiters
- DO NOT analyze or mention formatting, spacing, visual presentation, or how text appears
- Treat the text as perfectly formatted and focus only on content quality

SCORING GUIDELINES:
- Be realistic but thorough in assessment
- Consider both ATS compatibility and human readability
- Focus on actionable improvements
- Provide specific, constructive feedback with examples
- Consider industry standards and best practices for ${targetIndustry}
- Evaluate against ${targetRole} level expectations
- Provide detailed explanations for each score
- Include specific examples from the resume
- Suggest exact improvements with before/after examples
- Analyze keyword density and suggest specific keywords relevant to ${targetIndustry} ${targetRole} positions
- Include specific action verbs appropriate for the role level
- Suggest quantified achievements where applicable to the industry/role

DETAILED ANALYSIS REQUIREMENTS:
- Extract years of experience from the resume (look for explicit mentions like "X+ years of experience" or calculate from work experience dates)
- Provide 5+ detailed strengths with specific examples
- Provide 5+ detailed weaknesses with specific improvements
- Provide 5+ detailed recommendations with actionable steps
- Include comprehensive keyword analysis with specific suggestions
- Include detailed content analysis with examples
- Analyze industry alignment with specific recommendations
- Provide detailed ATS compatibility analysis
- Provide section-by-section analysis for each resume section (contactInfo, professionalSummary, experience, education, skills, certifications, achievements)
- Generate a prioritized action plan with specific, actionable steps to improve the ATS score
- Calculate section completeness scores (0-100) for each section based on:
  * Presence of the section in the resume
  * Quality and depth of content in each section
  * ATS compatibility and completeness for the target role/industry
  * Industry-specific requirements for each section

ACTION PLAN REQUIREMENTS:
- Create 2-3 high priority actions that will have immediate impact on the ATS score
- Create 2-3 medium priority actions for short-term improvements
- Create 2-3 low priority actions for long-term enhancements
- Each action should include:
  * Clear, specific title
  * Detailed description of what to do
  * Estimated impact on the overall score (realistic number of points)
  * Reason why this priority level was assigned
- Base priorities on actual scores and weaknesses identified in the analysis
- Make actions specific to the resume content and target role/industry
- Focus on actionable, concrete steps rather than vague suggestions

IMPORTANT: When identifying weaknesses, focus on actual resume content issues like:
- Missing sections that are relevant to the target role/industry
- Poor keyword usage for the specific industry
- Lack of quantified achievements (where applicable)
- Weak action verbs or passive language
- Incomplete information for the role level
- Poor content organization

Be role-appropriate and industry-specific in your assessment.

CRITICAL: DO NOT mention any formatting, spacing, visual, or presentation issues such as:
- "Inconsistent formatting"
- "Run-on sentences with irregular spacing"
- "Bullet point formatting"
- "Line breaks" or "spacing issues"
- "Visual presentation" problems
- Any mention of how text appears visually

Focus ONLY on content quality, not how it looks or is formatted.

SECTION-BY-SECTION ANALYSIS REQUIREMENTS:
For each section in sectionAnalysis, provide:
- Assessment of section presence and completeness (if applicable to the role/industry)
- Quality of content within the section
- ATS compatibility and keyword usage
- Specific recommendations for improvement
- Examples of what's working well or needs improvement

IMPORTANT: Be flexible and industry-appropriate. Not all sections are required for every role:
- Entry-level roles may not need extensive experience sections
- Academic roles may prioritize education and publications
- Creative roles may focus on portfolio and projects
- Technical roles may emphasize skills and certifications
- Leadership roles may highlight management experience

DO NOT mention formatting, spacing, or visual presentation in any section analysis.

Return only valid JSON. No additional text or explanations outside the JSON structure.

RESPONSE FORMAT REQUIREMENTS:
- All text content in your JSON response must be in plain text format
- Use simple bullet points (•) for lists in your analysis output
- Keep all analysis text clean and professional
- This is especially important for the detailedInsights fields which will be displayed to users
`;
  }

  async getGroqAnalysis(prompt, analysisId = null) {
    try {
      console.log('🤖 Calling Groq API for GPT-OSS-120b analysis...');
      
      if (!this.groqApiKey) {
        throw new Error('GROQ_API_KEY environment variable not set');
      }

      const response = await fetch(`${this.groqBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [{ 
            role: 'user', 
            content: prompt 
          }],
          max_completion_tokens: 8192,
          temperature: 0.1,
          top_p: 0.9,
          reasoning_effort: 'medium', // Use medium reasoning effort to avoid empty responses
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      const content = data.choices[0].message.content;
      
      // Log the raw GPT-OSS-120b response to file if analysisId is provided
      if (analysisId) {
        this.logger.logGptResponse(analysisId, content);
      }
      
      // Check if response is empty
      if (!content || content.trim().length === 0) {
        throw new Error('GPT-OSS-120b returned empty response. This might be due to prompt length or reasoning_effort parameter.');
      }
      
      // Parse JSON response directly (GPT-OSS-120b should return clean JSON)
      const analysis = JSON.parse(content);
      
      return analysis;
    } catch (error) {
      console.error('❌ GPT-OSS-120b analysis failed:', error);
      throw error;
    }
  }
}

module.exports = SimpleATSAnalyzer;