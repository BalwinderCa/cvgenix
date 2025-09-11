const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const IndustryBenchmarks = require('./industryBenchmarks');
const DynamicKeywordService = require('./dynamicKeywordService');
const EnhancedResumeParser = require('./enhancedResumeParser');

class SimpleATSAnalyzer {
  constructor() {
    // Initialize OpenAI
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Initialize Anthropic
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    // Initialize Industry Benchmarks
    this.benchmarks = new IndustryBenchmarks();
    
    // Initialize Dynamic Keyword Service
    this.keywordService = new DynamicKeywordService();
    
    // Initialize Enhanced Resume Parser
    this.parser = new EnhancedResumeParser();
  }

  async analyzeResume(resumeData, targetIndustry = 'technology', targetRole = 'Senior') {
    try {
      console.log('🤖 Starting dual-model ATS analysis (Claude Sonnet 4 + GPT-4o)...');
      
      let resumeText = resumeData.text || resumeData.rawText || '';
      
      // If no text provided but file path is available, parse the file
      if (!resumeText.trim() && resumeData.filePath) {
        console.log('📄 No text provided, parsing file...');
        const parseResult = await this.parser.parseResume(resumeData.filePath, resumeData.mimeType);
        
        if (parseResult.success) {
          resumeText = parseResult.text;
          console.log(`✅ File parsed successfully using ${parseResult.parsingMethod} method`);
          console.log(`📊 Parsing confidence: ${parseResult.confidence}/100`);
        } else {
          throw new Error(`File parsing failed: ${parseResult.error}`);
        }
      }
      
      if (!resumeText.trim()) {
        throw new Error('No resume text found');
      }

      // Get dynamic keywords for the target industry
      const industryKeywords = await this.keywordService.getIndustryKeywords(targetIndustry, targetRole);
      console.log(`📋 Using ${industryKeywords.length} dynamic keywords for ${targetIndustry} ${targetRole}`);
      
      // Create the same comprehensive prompt for both models with dynamic keywords
      const analysisPrompt = this.createAnalysisPrompt(resumeText, targetIndustry, targetRole, industryKeywords);
      
      // Log the prompt being sent to both AI models
      console.log('🤖 COMPREHENSIVE ANALYSIS PROMPT (Used by both Claude Sonnet 4 and GPT-4o):');
      console.log('=' .repeat(100));
      console.log(analysisPrompt);
      console.log('=' .repeat(100));
      
      // Run both analyses in parallel using the same comprehensive prompt
      console.log('🤖 Running Claude Sonnet 4 and GPT-4o with comprehensive analysis prompt in parallel...');
      const [claudeAnalysis, gpt4oAnalysis] = await Promise.allSettled([
        this.getClaudeSonnetAnalysis(analysisPrompt),
        this.getGPT4oAnalysis(analysisPrompt)
      ]);

      // Process results
      const claudeResult = claudeAnalysis.status === 'fulfilled' ? claudeAnalysis.value : null;
      const gpt4oResult = gpt4oAnalysis.status === 'fulfilled' ? gpt4oAnalysis.value : null;

      console.log('📊 Analysis Results:', {
        claudeSuccess: !!claudeResult,
        gpt4oSuccess: !!gpt4oResult,
        claudeScore: claudeResult?.atsScore,
        gpt4oScore: gpt4oResult?.atsScore
      });

      // Combine and average the results
      const combinedAnalysis = this.combineAnalysisResults(claudeResult, gpt4oResult, targetIndustry, targetRole);
      
      // Add industry benchmarking
      const benchmarkData = this.benchmarks.compareWithBenchmark(combinedAnalysis, targetIndustry, targetRole);
      combinedAnalysis.industryBenchmark = benchmarkData;
      
      console.log('✅ Dual-model analysis completed');
      console.log('📊 Final Combined Analysis Summary:', {
        atsScore: combinedAnalysis.atsScore,
        overallGrade: combinedAnalysis.overallGrade,
        modelsUsed: combinedAnalysis.modelsUsed,
        hasStrengths: !!combinedAnalysis.strengths?.length,
        hasWeaknesses: !!combinedAnalysis.weaknesses?.length,
        hasRecommendations: !!combinedAnalysis.recommendations?.length
      });
      console.log('📊 Industry Benchmarking:', {
        score: combinedAnalysis.atsScore,
        industryAverage: benchmarkData.comparison.industryAverage,
        percentile: benchmarkData.comparison.percentile,
        performance: benchmarkData.comparison.performance
      });
      
      return combinedAnalysis;

    } catch (error) {
      console.error('❌ Dual-model ATS analysis failed:', error);
      throw error;
    }
  }


  createAnalysisPrompt(resumeText, targetIndustry, targetRole, industryKeywords = []) {
    return `
You are an expert ATS (Applicant Tracking System) analyst and resume optimization specialist. Analyze this resume with the precision of a professional recruiter and ATS system.

RESUME TEXT:
${resumeText}

TARGET POSITION: ${targetRole} ${targetIndustry}

INDUSTRY KEYWORDS TO FOCUS ON: ${industryKeywords.slice(0, 20).join(', ')}

ANALYSIS REQUIREMENTS:
Provide a comprehensive ATS compatibility assessment in the following JSON format:

{
  "atsScore": <number between 0-100>,
  "overallGrade": "<A+, A, B+, B, C+, C, D, F>",
  "detailedMetrics": {
    "sectionCompleteness": <number between 0-100>,
    "keywordDensity": <number between 0-100>,
    "formatConsistency": <number between 0-100>,
    "actionVerbs": <number between 0-100>,
    "quantifiedAchievements": <number between 0-100>
  },
  "quickStats": {
    "wordCount": <number>,
    "sectionsFound": <number>,
    "keywordsMatched": <number>,
    "improvementAreas": <number>
  },
  "strengths": ["<detailed_strength1>", "<detailed_strength2>", "<detailed_strength3>", "<detailed_strength4>", "<detailed_strength5>"],
  "weaknesses": ["<detailed_weakness1>", "<detailed_weakness2>", "<detailed_weakness3>", "<detailed_weakness4>", "<detailed_weakness5>"],
  "recommendations": ["<detailed_recommendation1>", "<detailed_recommendation2>", "<detailed_recommendation3>", "<detailed_recommendation4>", "<detailed_recommendation5>"],
  "detailedInsights": {
    "keywordAnalysis": "<detailed analysis of keyword usage and optimization opportunities>",
    "formatAnalysis": "<detailed analysis of resume formatting and structure>",
    "contentAnalysis": "<detailed analysis of content quality and impact>",
    "industryAlignment": "<detailed analysis of industry-specific alignment>",
    "atsCompatibility": "<detailed analysis of ATS system compatibility>"
  },
  "industryAlignment": <number between 0-100>,
  "contentQuality": <number between 0-100>
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

FORMAT CONSISTENCY (0-100):
- Consistent formatting throughout
- Proper use of headers and subheaders
- Clean, ATS-friendly layout
- No graphics, tables, or complex formatting
- Standard fonts and spacing
- Proper bullet points and numbering

ACTION VERBS (0-100):
- Strong action verbs (led, developed, implemented, optimized, etc.)
- Past tense for previous roles
- Present tense for current role
- Variety and impact of verbs used

QUANTIFIED ACHIEVEMENTS (0-100):
- Specific metrics and numbers
- Percentage improvements
- Dollar amounts saved/generated
- Team sizes managed
- Project scopes and timelines
- Measurable business impact

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
3. Structure and formatting that passes ATS filters
4. Content quality and professional presentation
5. Industry relevance and role-level appropriateness
6. Quantified achievements and measurable impact
7. Action-oriented language and strong verbs
8. Complete sections with comprehensive information

SCORING GUIDELINES:
- Be realistic but thorough in assessment
- Consider both ATS compatibility and human readability
- Focus on actionable improvements
- Provide specific, constructive feedback with examples
- Consider industry standards and best practices
- Evaluate against ${targetRole} level expectations
- Provide detailed explanations for each score
- Include specific examples from the resume
- Suggest exact improvements with before/after examples
- Analyze keyword density and suggest specific keywords to add
- Provide detailed formatting recommendations
- Include specific action verbs to use
- Suggest quantified achievements to add

DETAILED ANALYSIS REQUIREMENTS:
- Provide 5+ detailed strengths with specific examples
- Provide 5+ detailed weaknesses with specific improvements
- Provide 5+ detailed recommendations with actionable steps
- Include comprehensive keyword analysis with specific suggestions
- Provide detailed format analysis with specific improvements
- Include detailed content analysis with examples
- Analyze industry alignment with specific recommendations
- Provide detailed ATS compatibility analysis

Return only valid JSON. No additional text or explanations outside the JSON structure.
`;
  }

  async getClaudeSonnetAnalysis(prompt) {
    try {
      console.log('🤖 Calling Claude Sonnet 4 API for high-quality analysis...');
      console.log('📤 Sending to Claude Sonnet 4 - Prompt length:', prompt.length, 'characters');
      const response = await this.anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 3000,
        temperature: 0.1,
        messages: [{
          role: "user",
          content: prompt
        }]
      });

      const content = response.content[0].text;
      console.log('📥 Claude Sonnet 4 Response received - Length:', content.length, 'characters');
      
      // Extract JSON from markdown code blocks if present
      const jsonContent = this.extractJSONFromResponse(content);
      
      // Parse JSON response
      const analysis = JSON.parse(jsonContent);
      console.log('✅ Claude Sonnet 4 analysis parsed successfully');
      console.log('📊 Claude Analysis Summary:', {
        atsScore: analysis.atsScore,
        overallGrade: analysis.overallGrade,
        strengthsCount: analysis.strengths?.length || 0,
        weaknessesCount: analysis.weaknesses?.length || 0,
        recommendationsCount: analysis.recommendations?.length || 0
      });
      
      return analysis;
    } catch (error) {
      console.error('❌ Claude Sonnet 4 analysis failed:', error);
      throw error;
    }
  }

  async getGPT4oAnalysis(prompt) {
    try {
      console.log('🤖 Calling GPT-4o API for numeric analysis...');
      console.log('📤 Sending to GPT-4o - Prompt length:', prompt.length, 'characters');
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: prompt
        }],
        temperature: 0.1,
        max_tokens: 1000
      });

      const content = response.choices[0].message.content;
      console.log('📥 GPT-4o Response received - Length:', content.length, 'characters');
      
      // Extract JSON from markdown code blocks if present
      const jsonContent = this.extractJSONFromResponse(content);
      
      // Parse JSON response
      const analysis = JSON.parse(jsonContent);
      console.log('✅ GPT-4o analysis parsed successfully');
      console.log('📊 GPT-4o Analysis Summary:', {
        atsScore: analysis.atsScore,
        overallGrade: analysis.overallGrade,
        detailedMetrics: analysis.detailedMetrics
      });
      
      return analysis;
    } catch (error) {
      console.error('❌ GPT-4o analysis failed:', error);
      throw error;
    }
  }

  combineAnalysisResults(claudeResult, gpt4oResult, targetIndustry, targetRole) {
    console.log('🔄 Combining analysis results from both models...');
    
    // If we have both results, combine them intelligently
    if (claudeResult && gpt4oResult) {
      console.log('✅ Both models succeeded - combining results');
      
      // Average the numeric scores
      const combinedScore = Math.round((claudeResult.atsScore + gpt4oResult.atsScore) / 2);
      
      // Use Claude's detailed analysis but incorporate GPT-4o's numeric precision
      const combined = {
        ...claudeResult,
        atsScore: combinedScore,
        detailedMetrics: {
          sectionCompleteness: Math.round((claudeResult.detailedMetrics?.sectionCompleteness + gpt4oResult.detailedMetrics?.sectionCompleteness) / 2),
          keywordDensity: Math.round((claudeResult.detailedMetrics?.keywordDensity + gpt4oResult.detailedMetrics?.keywordDensity) / 2),
          formatConsistency: Math.round((claudeResult.detailedMetrics?.formatConsistency + gpt4oResult.detailedMetrics?.formatConsistency) / 2),
          actionVerbs: Math.round((claudeResult.detailedMetrics?.actionVerbs + gpt4oResult.detailedMetrics?.actionVerbs) / 2),
          quantifiedAchievements: Math.round((claudeResult.detailedMetrics?.quantifiedAchievements + gpt4oResult.detailedMetrics?.quantifiedAchievements) / 2)
        },
        industryAlignment: Math.round((claudeResult.industryAlignment + gpt4oResult.industryAlignment) / 2),
        contentQuality: Math.round((claudeResult.contentQuality + gpt4oResult.contentQuality) / 2),
        modelsUsed: ['Claude Sonnet 4', 'GPT-4o']
      };
      
      // Update overall grade based on combined score
      combined.overallGrade = this.calculateGrade(combinedScore);
      
      return combined;
    }
    
    // If only one model succeeded, use that result
    if (claudeResult) {
      console.log('⚠️ Only Claude Sonnet 4 succeeded - using Claude result');
      return {
        ...claudeResult,
        modelsUsed: ['Claude Sonnet 4']
      };
    }
    
    if (gpt4oResult) {
      console.log('⚠️ Only GPT-4o succeeded - using GPT-4o result');
      return {
        ...gpt4oResult,
        modelsUsed: ['GPT-4o']
      };
    }
    
    // If both failed, return fallback
    console.log('❌ Both models failed - returning fallback analysis');
    return this.getFallbackAnalysis(targetIndustry, targetRole);
  }

  calculateGrade(score) {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  extractJSONFromResponse(content) {
    // Remove markdown code blocks if present
    let jsonContent = content.trim();
    
    // Check if content is wrapped in markdown code blocks
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Remove any leading/trailing whitespace
    jsonContent = jsonContent.trim();
    
    console.log('🔍 Extracted JSON content length:', jsonContent.length, 'characters');
    return jsonContent;
  }

  getFallbackAnalysis(targetIndustry, targetRole) {
    console.log('🔄 Using fallback analysis due to AI model failures');
    return {
      atsScore: 50,
      overallGrade: 'C',
      detailedMetrics: {
        sectionCompleteness: 50,
        keywordDensity: 50,
        formatConsistency: 50,
        actionVerbs: 50,
        quantifiedAchievements: 50
      },
      quickStats: {
        wordCount: 0,
        sectionsFound: 0,
        keywordsMatched: 0,
        improvementAreas: 0
      },
      strengths: ['Resume submitted successfully'],
      weaknesses: ['AI analysis unavailable'],
      recommendations: ['Please try again'],
      industryAlignment: 50,
      contentQuality: 50,
      modelsUsed: ['Default Fallback']
    };
  }
}

module.exports = SimpleATSAnalyzer;