/**
 * Keyword Extraction Utility
 * Extracts specific keywords from GPT-OSS-120b analysis text
 */
class KeywordExtractor {
  constructor() {
    // Common technology keywords to look for
    this.techKeywords = [
      'python', 'java', 'javascript', 'typescript', 'c#', 'c++', 'go', 'rust', 'php', 'ruby',
      'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'gitlab',
      'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite',
      'microservices', 'api', 'rest', 'graphql', 'websocket', 'grpc',
      'ci/cd', 'devops', 'agile', 'scrum', 'kanban', 'tdd', 'bdd',
      'machine learning', 'ai', 'data science', 'analytics', 'big data',
      'cloud computing', 'serverless', 'lambda', 'kubernetes', 'docker'
    ];

    // Senior-level keywords
    this.seniorKeywords = [
      'lead', 'architect', 'senior', 'principal', 'staff', 'director', 'manager',
      'strategic', 'scalable', 'enterprise', 'mentor', 'coach', 'team lead',
      'system design', 'architecture', 'technical leadership', 'cross-functional',
      'budget', 'roadmap', 'stakeholder', 'executive', 'decision making'
    ];

    // Action verbs
    this.actionVerbs = [
      'developed', 'implemented', 'designed', 'architected', 'built', 'created',
      'optimized', 'improved', 'enhanced', 'streamlined', 'automated', 'deployed',
      'managed', 'led', 'mentored', 'coached', 'guided', 'supervised',
      'analyzed', 'researched', 'evaluated', 'assessed', 'planned', 'strategized'
    ];
  }

  /**
   * Extract keywords from analysis text
   */
  extractKeywords(analysisText, detailedInsights, targetIndustry = 'technology', targetRole = 'Senior') {
    const found = [];
    const missing = [];
    const suggested = [];

    // Combine all text for analysis
    const allText = [
      analysisText,
      detailedInsights?.keywordAnalysis || '',
      detailedInsights?.contentAnalysis || '',
      detailedInsights?.industryAlignment || ''
    ].filter(text => text && text.trim().length > 0).join(' ').toLowerCase();

    // Get industry-specific keywords
    const industryKeywords = this.getIndustryKeywords(targetIndustry);
    const roleKeywords = this.getRoleKeywords(targetRole);
    
    console.log('🔍 Keyword Extractor Debug:');
    console.log('targetIndustry:', targetIndustry);
    console.log('targetRole:', targetRole);
    console.log('industryKeywords count:', industryKeywords.length);
    console.log('roleKeywords count:', roleKeywords.length);
    console.log('industryKeywords sample:', industryKeywords.slice(0, 5));

    // Extract found keywords from industry-specific list
    industryKeywords.forEach(keyword => {
      if (allText.includes(keyword.toLowerCase())) {
        found.push(keyword);
      }
    });

    // Extract found role-specific keywords
    roleKeywords.forEach(keyword => {
      if (allText.includes(keyword.toLowerCase())) {
        found.push(keyword);
      }
    });

    // Extract found action verbs
    this.actionVerbs.forEach(verb => {
      if (allText.includes(verb.toLowerCase())) {
        found.push(verb);
      }
    });

    // Extract missing keywords from analysis text
    const missingKeywords = this.extractMissingKeywords(allText);
    missing.push(...missingKeywords);

    // Generate suggestions based on industry and role
    const suggestions = this.generateIndustrySuggestions(targetIndustry, targetRole, found);
    suggested.push(...suggestions);

    return {
      found: [...new Set(found)], // Remove duplicates
      missing: [...new Set(missing)],
      suggested: [...new Set(suggested)]
    };
  }

  /**
   * Extract missing keywords mentioned in the analysis
   */
  extractMissingKeywords(text) {
    const missing = [];
    
    // Look for patterns like "missing", "lacks", "not present", etc.
    const missingPatterns = [
      /missing\s+([a-zA-Z\s,]+)/gi,
      /lacks?\s+([a-zA-Z\s,]+)/gi,
      /not\s+present[:\s]+([a-zA-Z\s,]+)/gi,
      /absent[:\s]+([a-zA-Z\s,]+)/gi,
      /no\s+([a-zA-Z\s,]+)/gi
    ];

    missingPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const keywords = match.replace(/^(missing|lacks?|not\s+present|absent|no)\s*:?\s*/i, '')
            .split(/[,\s]+/)
            .filter(word => word.length > 2)
            .map(word => word.trim());
          missing.push(...keywords);
        });
      }
    });

    return missing;
  }

  /**
   * Get industry-specific keywords
   */
  getIndustryKeywords(industry) {
    const industryKeywordMap = {
      'technology': [
        'python', 'java', 'javascript', 'typescript', 'c#', 'c++', 'go', 'rust', 'php', 'ruby',
        'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'gitlab',
        'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite',
        'microservices', 'api', 'rest', 'graphql', 'websocket', 'grpc',
        'ci/cd', 'devops', 'agile', 'scrum', 'kanban', 'tdd', 'bdd',
        'machine learning', 'ai', 'data science', 'analytics', 'big data',
        'cloud computing', 'serverless', 'lambda'
      ],
      'healthcare': [
        'patient care', 'clinical', 'medical', 'healthcare', 'nursing', 'physician', 'doctor',
        'hospital', 'clinic', 'pharmacy', 'diagnosis', 'treatment', 'therapy', 'rehabilitation',
        'emr', 'epic', 'cerner', 'allscripts', 'health information', 'medical records',
        'hipaa', 'compliance', 'quality assurance', 'patient safety', 'infection control',
        'medication', 'prescription', 'dosage', 'side effects', 'contraindications',
        'vital signs', 'blood pressure', 'heart rate', 'temperature', 'pulse oximetry',
        'iv therapy', 'catheterization', 'wound care', 'dressing changes', 'medication administration',
        'patient assessment', 'nursing care plan', 'discharge planning', 'patient education',
        'telehealth', 'remote monitoring', 'health informatics', 'clinical decision support'
      ],
      'finance': [
        'financial analysis', 'budgeting', 'forecasting', 'financial modeling', 'risk management',
        'investment', 'portfolio', 'trading', 'derivatives', 'securities', 'equity', 'bonds',
        'accounting', 'gaap', 'ifrs', 'audit', 'compliance', 'sox', 'internal controls',
        'financial reporting', 'p&l', 'balance sheet', 'cash flow', 'revenue recognition',
        'cost accounting', 'management accounting', 'financial planning', 'treasury',
        'credit analysis', 'loan underwriting', 'credit risk', 'market risk', 'operational risk',
        'regulatory compliance', 'finra', 'sec', 'cftc', 'basel iii', 'dodd-frank'
      ],
      'education': [
        'curriculum', 'lesson planning', 'instructional design', 'pedagogy', 'assessment',
        'student engagement', 'classroom management', 'differentiated instruction',
        'special education', 'iep', '504 plan', 'inclusive education', 'learning disabilities',
        'educational technology', 'lms', 'blackboard', 'canvas', 'moodle', 'google classroom',
        'student information system', 'sis', 'gradebook', 'attendance', 'parent communication',
        'professional development', 'continuing education', 'certification', 'licensure',
        'educational research', 'data-driven instruction', 'student outcomes', 'academic achievement'
      ],
      'marketing': [
        'digital marketing', 'seo', 'sem', 'ppc', 'social media marketing', 'content marketing',
        'email marketing', 'marketing automation', 'crm', 'salesforce', 'hubspot', 'marketo',
        'analytics', 'google analytics', 'adobe analytics', 'conversion optimization',
        'a/b testing', 'user experience', 'ux', 'ui', 'brand management', 'brand strategy',
        'market research', 'customer insights', 'persona development', 'customer journey',
        'lead generation', 'lead nurturing', 'sales funnel', 'roi', 'kpi', 'campaign management'
      ],
      'sales': [
        'sales process', 'lead generation', 'prospecting', 'cold calling', 'qualification',
        'needs assessment', 'solution selling', 'consultative selling', 'relationship building',
        'account management', 'territory management', 'pipeline management', 'forecasting',
        'quota achievement', 'revenue targets', 'deal closure', 'negotiation', 'contract management',
        'crm', 'salesforce', 'hubspot', 'pipedrive', 'sales automation', 'sales enablement',
        'product knowledge', 'competitive analysis', 'objection handling', 'presentation skills'
      ]
    };

    return industryKeywordMap[industry] || industryKeywordMap['technology'];
  }

  /**
   * Get role-specific keywords
   */
  getRoleKeywords(role) {
    const roleKeywordMap = {
      'Entry': ['entry level', 'junior', 'assistant', 'trainee', 'intern', 'graduate', 'new graduate'],
      'Junior': ['junior', 'associate', 'assistant', 'coordinator', 'specialist', 'analyst'],
      'Mid': ['mid level', 'experienced', 'specialist', 'coordinator', 'analyst', 'consultant'],
      'Senior': ['senior', 'lead', 'principal', 'expert', 'specialist', 'consultant', 'advisor'],
      'Lead': ['lead', 'team lead', 'senior', 'principal', 'architect', 'manager'],
      'Principal': ['principal', 'senior', 'architect', 'expert', 'consultant', 'advisor'],
      'Staff': ['staff', 'senior', 'principal', 'expert', 'specialist'],
      'Manager': ['manager', 'supervisor', 'director', 'lead', 'head of', 'team lead'],
      'Director': ['director', 'head of', 'vp', 'vice president', 'executive', 'senior director'],
      'VP': ['vp', 'vice president', 'executive', 'senior director', 'head of'],
      'C-Level': ['ceo', 'cto', 'cfo', 'coo', 'cmo', 'executive', 'president', 'chief']
    };

    return roleKeywordMap[role] || roleKeywordMap['Senior'];
  }

  /**
   * Generate industry-specific suggestions
   */
  generateIndustrySuggestions(industry, role, foundKeywords) {
    const suggestions = [];
    
    // Get industry keywords that are missing
    const industryKeywords = this.getIndustryKeywords(industry);
    const missingIndustryKeywords = industryKeywords.filter(keyword => 
      !foundKeywords.includes(keyword)
    );
    suggestions.push(...missingIndustryKeywords.slice(0, 8));

    // Get role keywords that are missing
    const roleKeywords = this.getRoleKeywords(role);
    const missingRoleKeywords = roleKeywords.filter(keyword => 
      !foundKeywords.includes(keyword)
    );
    suggestions.push(...missingRoleKeywords.slice(0, 3));

    return suggestions;
  }

  /**
   * Extract specific keywords from keyword analysis text
   */
  extractFromKeywordAnalysis(keywordAnalysis) {
    if (!keywordAnalysis) return { found: [], missing: [], suggested: [] };

    const found = [];
    const missing = [];
    const suggested = [];

    // Extract mentioned technologies
    const techMentions = keywordAnalysis.match(/\b(python|java|javascript|typescript|c#|c\+\+|go|rust|php|ruby|react|angular|vue|node\.js|express|django|flask|spring|laravel|aws|azure|gcp|docker|kubernetes)\b/gi);
    if (techMentions) {
      found.push(...techMentions.map(tech => tech.toLowerCase()));
    }

    // Extract missing technologies
    const missingTech = keywordAnalysis.match(/missing\s+([a-zA-Z\s,]+)/gi);
    if (missingTech) {
      missingTech.forEach(match => {
        const keywords = match.replace(/^missing\s+/i, '').split(/[,\s]+/).filter(word => word.length > 2);
        missing.push(...keywords);
      });
    }

    // Extract suggested keywords
    const suggestedKeywords = keywordAnalysis.match(/suggest[^.]*?([a-zA-Z\s,]+)/gi);
    if (suggestedKeywords) {
      suggestedKeywords.forEach(match => {
        const keywords = match.replace(/^suggest[^.]*?/i, '').split(/[,\s]+/).filter(word => word.length > 2);
        suggested.push(...keywords);
      });
    }

    return {
      found: [...new Set(found)],
      missing: [...new Set(missing)],
      suggested: [...new Set(suggested)]
    };
  }
}

module.exports = KeywordExtractor;
