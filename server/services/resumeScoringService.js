const loggerService = require('./loggerService')

class ResumeScoringService {
  constructor() {
    this.weights = {
      completeness: 0.25,
      contentQuality: 0.20,
      formatting: 0.15,
      keywords: 0.15,
      achievements: 0.10,
      skills: 0.10,
      education: 0.05
    }
  }

  /**
   * Calculate comprehensive resume score
   */
  async calculateResumeScore(resume, options = {}) {
    try {
      const {
        industry = 'general',
        role = 'general',
        experienceLevel = 'mid'
      } = options

      const scores = {
        completeness: this.calculateCompletenessScore(resume),
        contentQuality: this.calculateContentQualityScore(resume),
        formatting: this.calculateFormattingScore(resume),
        keywords: this.calculateKeywordsScore(resume, industry, role),
        achievements: this.calculateAchievementsScore(resume),
        skills: this.calculateSkillsScore(resume, industry),
        education: this.calculateEducationScore(resume, role)
      }

      // Calculate weighted total score
      const totalScore = Object.keys(scores).reduce((total, key) => {
        return total + (scores[key] * this.weights[key])
      }, 0)

      // Generate recommendations
      const recommendations = this.generateRecommendations(scores, resume)

      // Calculate grade
      const grade = this.calculateGrade(totalScore)

      return {
        success: true,
        data: {
          totalScore: Math.round(totalScore),
          grade: grade,
          breakdown: scores,
          recommendations: recommendations,
          strengths: this.identifyStrengths(scores),
          weaknesses: this.identifyWeaknesses(scores),
          industryAlignment: this.calculateIndustryAlignment(resume, industry),
          roleAlignment: this.calculateRoleAlignment(resume, role),
          experienceLevel: this.calculateExperienceLevel(resume),
          analyzedAt: new Date().toISOString()
        }
      }
    } catch (error) {
      loggerService.error('Error calculating resume score:', error)
      throw error
    }
  }

  /**
   * Calculate completeness score (0-100)
   */
  calculateCompletenessScore(resume) {
    const requiredSections = [
      'personalInfo',
      'experience',
      'education',
      'skills'
    ]

    const optionalSections = [
      'projects',
      'certifications',
      'languages',
      'hobbies'
    ]

    let score = 0
    let totalWeight = 0

    // Check required sections
    requiredSections.forEach(section => {
      const weight = 0.8 / requiredSections.length
      totalWeight += weight
      
      if (this.hasSectionContent(resume, section)) {
        score += weight * 100
      }
    })

    // Check optional sections
    optionalSections.forEach(section => {
      const weight = 0.2 / optionalSections.length
      totalWeight += weight
      
      if (this.hasSectionContent(resume, section)) {
        score += weight * 100
      }
    })

    return Math.min(100, score / totalWeight)
  }

  /**
   * Calculate content quality score (0-100)
   */
  calculateContentQualityScore(resume) {
    let score = 0
    let factors = 0

    // Personal info quality
    if (resume.personalInfo) {
      factors++
      let personalScore = 0
      
      if (resume.personalInfo.firstName && resume.personalInfo.lastName) personalScore += 25
      if (resume.personalInfo.email) personalScore += 25
      if (resume.personalInfo.phone) personalScore += 25
      if (resume.personalInfo.about && resume.personalInfo.about.length > 50) personalScore += 25
      
      score += personalScore
    }

    // Experience quality
    if (resume.experience && resume.experience.length > 0) {
      factors++
      let experienceScore = 0
      
      resume.experience.forEach(exp => {
        if (exp.position && exp.company) experienceScore += 20
        if (exp.description && exp.description.length > 50) experienceScore += 20
        if (exp.startDate) experienceScore += 20
        if (exp.achievements && exp.achievements.length > 0) experienceScore += 20
        if (exp.endDate || exp.current) experienceScore += 20
      })
      
      score += Math.min(100, experienceScore / resume.experience.length)
    }

    // Education quality
    if (resume.education && resume.education.length > 0) {
      factors++
      let educationScore = 0
      
      resume.education.forEach(edu => {
        if (edu.school && edu.degree) educationScore += 50
        if (edu.field) educationScore += 25
        if (edu.endDate) educationScore += 25
      })
      
      score += Math.min(100, educationScore / resume.education.length)
    }

    return factors > 0 ? score / factors : 0
  }

  /**
   * Calculate formatting score (0-100)
   */
  calculateFormattingScore(resume) {
    let score = 100

    // Check for consistent formatting
    if (resume.experience && resume.experience.length > 0) {
      const hasInconsistentDates = resume.experience.some(exp => 
        !exp.startDate || (!exp.endDate && !exp.current)
      )
      if (hasInconsistentDates) score -= 20
    }

    // Check for proper capitalization
    if (resume.personalInfo) {
      if (resume.personalInfo.firstName && resume.personalInfo.firstName !== resume.personalInfo.firstName.charAt(0).toUpperCase() + resume.personalInfo.firstName.slice(1).toLowerCase()) {
        score -= 10
      }
    }

    // Check for proper email format
    if (resume.personalInfo && resume.personalInfo.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(resume.personalInfo.email)) {
        score -= 15
      }
    }

    return Math.max(0, score)
  }

  /**
   * Calculate keywords score (0-100)
   */
  calculateKeywordsScore(resume, industry, role) {
    const industryKeywords = this.getIndustryKeywords(industry)
    const roleKeywords = this.getRoleKeywords(role)
    
    const resumeText = this.extractResumeText(resume).toLowerCase()
    
    let score = 0
    let totalKeywords = industryKeywords.length + roleKeywords.length
    
    // Check industry keywords
    industryKeywords.forEach(keyword => {
      if (resumeText.includes(keyword.toLowerCase())) {
        score += 1
      }
    })
    
    // Check role keywords
    roleKeywords.forEach(keyword => {
      if (resumeText.includes(keyword.toLowerCase())) {
        score += 1
      }
    })
    
    return totalKeywords > 0 ? (score / totalKeywords) * 100 : 50
  }

  /**
   * Calculate achievements score (0-100)
   */
  calculateAchievementsScore(resume) {
    let score = 0
    let totalAchievements = 0
    
    if (resume.experience && resume.experience.length > 0) {
      resume.experience.forEach(exp => {
        if (exp.achievements && exp.achievements.length > 0) {
          totalAchievements += exp.achievements.length
          exp.achievements.forEach(achievement => {
            if (this.isQuantifiedAchievement(achievement)) {
              score += 1
            }
          })
        }
      })
    }
    
    return totalAchievements > 0 ? (score / totalAchievements) * 100 : 0
  }

  /**
   * Calculate skills score (0-100)
   */
  calculateSkillsScore(resume, industry) {
    if (!resume.skills || resume.skills.length === 0) return 0
    
    const industrySkills = this.getIndustrySkills(industry)
    const resumeSkillNames = resume.skills.map(s => s.name.toLowerCase())
    
    let matchingSkills = 0
    industrySkills.forEach(skill => {
      if (resumeSkillNames.some(resumeSkill => 
        resumeSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(resumeSkill)
      )) {
        matchingSkills++
      }
    })
    
    return (matchingSkills / industrySkills.length) * 100
  }

  /**
   * Calculate education score (0-100)
   */
  calculateEducationScore(resume, role) {
    if (!resume.education || resume.education.length === 0) return 0
    
    const requiredEducation = this.getRequiredEducation(role)
    const highestEducation = this.getHighestEducationLevel(resume.education)
    
    return highestEducation >= requiredEducation ? 100 : (highestEducation / requiredEducation) * 100
  }

  /**
   * Generate recommendations based on scores
   */
  generateRecommendations(scores, resume) {
    const recommendations = []
    
    if (scores.completeness < 80) {
      recommendations.push({
        category: 'Completeness',
        priority: 'high',
        message: 'Add missing sections to improve completeness',
        suggestions: this.getMissingSections(resume)
      })
    }
    
    if (scores.contentQuality < 70) {
      recommendations.push({
        category: 'Content Quality',
        priority: 'high',
        message: 'Improve content quality and detail',
        suggestions: ['Add more detailed descriptions', 'Include specific achievements', 'Quantify your accomplishments']
      })
    }
    
    if (scores.keywords < 60) {
      recommendations.push({
        category: 'Keywords',
        priority: 'medium',
        message: 'Add more industry-relevant keywords',
        suggestions: ['Research job postings for keywords', 'Include technical skills', 'Add industry-specific terms']
      })
    }
    
    if (scores.achievements < 50) {
      recommendations.push({
        category: 'Achievements',
        priority: 'medium',
        message: 'Add quantified achievements',
        suggestions: ['Include numbers and percentages', 'Show impact of your work', 'Highlight specific results']
      })
    }
    
    if (scores.formatting < 80) {
      recommendations.push({
        category: 'Formatting',
        priority: 'low',
        message: 'Improve formatting consistency',
        suggestions: ['Use consistent date formats', 'Check capitalization', 'Verify contact information']
      })
    }
    
    return recommendations
  }

  /**
   * Helper methods
   */
  hasSectionContent(resume, section) {
    const data = resume[section]
    if (!data) return false
    
    if (Array.isArray(data)) {
      return data.length > 0
    }
    
    if (typeof data === 'object') {
      return Object.keys(data).length > 0
    }
    
    return Boolean(data)
  }

  isQuantifiedAchievement(achievement) {
    const quantifiedWords = ['increased', 'decreased', 'improved', 'reduced', 'saved', 'generated', 'achieved', 'delivered']
    const numbers = /\d+/
    
    return quantifiedWords.some(word => achievement.toLowerCase().includes(word)) && numbers.test(achievement)
  }

  extractResumeText(resume) {
    let text = ''
    
    if (resume.personalInfo) {
      text += `${resume.personalInfo.firstName} ${resume.personalInfo.lastName} `
      text += resume.personalInfo.about || ''
    }

    if (resume.experience) {
      resume.experience.forEach(exp => {
        text += `${exp.position} ${exp.company} ${exp.description || ''} `
        if (exp.achievements) {
          text += exp.achievements.join(' ')
        }
      })
    }

    if (resume.skills) {
      text += resume.skills.map(s => s.name).join(' ')
    }

    if (resume.education) {
      resume.education.forEach(edu => {
        text += `${edu.school} ${edu.degree} ${edu.field || ''} `
      })
    }

    return text
  }

  getIndustryKeywords(industry) {
    const keywords = {
      technology: ['software', 'development', 'programming', 'coding', 'api', 'database', 'cloud', 'devops'],
      healthcare: ['patient', 'medical', 'clinical', 'healthcare', 'treatment', 'diagnosis', 'therapy'],
      finance: ['financial', 'banking', 'investment', 'trading', 'risk', 'compliance', 'audit'],
      marketing: ['marketing', 'campaign', 'brand', 'social media', 'seo', 'analytics', 'content'],
      general: ['leadership', 'management', 'communication', 'problem solving', 'teamwork', 'project']
    }
    
    return keywords[industry.toLowerCase()] || keywords.general
  }

  getRoleKeywords(role) {
    const keywords = {
      developer: ['programming', 'coding', 'software', 'development', 'api', 'database'],
      manager: ['management', 'leadership', 'team', 'strategy', 'planning', 'budget'],
      analyst: ['analysis', 'data', 'research', 'reporting', 'insights', 'metrics'],
      designer: ['design', 'ui', 'ux', 'creative', 'visual', 'prototype'],
      general: ['skills', 'experience', 'responsibilities', 'achievements']
    }
    
    return keywords[role.toLowerCase()] || keywords.general
  }

  getIndustrySkills(industry) {
    const skills = {
      technology: ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'Git', 'AWS'],
      healthcare: ['Patient Care', 'Medical Records', 'HIPAA', 'Clinical Skills', 'Diagnosis'],
      finance: ['Financial Analysis', 'Excel', 'Risk Management', 'Compliance', 'Auditing'],
      marketing: ['Digital Marketing', 'SEO', 'Social Media', 'Analytics', 'Content Creation'],
      general: ['Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Project Management']
    }
    
    return skills[industry.toLowerCase()] || skills.general
  }

  getRequiredEducation(role) {
    const education = {
      entry: 1,
      mid: 2,
      senior: 3,
      lead: 3,
      executive: 4
    }
    
    return education[role.toLowerCase()] || 2
  }

  getHighestEducationLevel(education) {
    const levels = {
      'high school': 1,
      'associate': 2,
      'bachelor': 3,
      'master': 4,
      'phd': 5,
      'doctorate': 5
    }

    let highestLevel = 1
    education.forEach(edu => {
      const degree = edu.degree.toLowerCase()
      for (const [key, level] of Object.entries(levels)) {
        if (degree.includes(key) && level > highestLevel) {
          highestLevel = level
        }
      }
    })

    return highestLevel
  }

  calculateGrade(score) {
    if (score >= 90) return 'A+'
    if (score >= 85) return 'A'
    if (score >= 80) return 'A-'
    if (score >= 75) return 'B+'
    if (score >= 70) return 'B'
    if (score >= 65) return 'B-'
    if (score >= 60) return 'C+'
    if (score >= 55) return 'C'
    if (score >= 50) return 'C-'
    if (score >= 45) return 'D+'
    if (score >= 40) return 'D'
    return 'F'
  }

  identifyStrengths(scores) {
    const strengths = []
    Object.keys(scores).forEach(key => {
      if (scores[key] >= 80) {
        strengths.push(this.getCategoryName(key))
      }
    })
    return strengths
  }

  identifyWeaknesses(scores) {
    const weaknesses = []
    Object.keys(scores).forEach(key => {
      if (scores[key] < 60) {
        weaknesses.push(this.getCategoryName(key))
      }
    })
    return weaknesses
  }

  getCategoryName(key) {
    const names = {
      completeness: 'Completeness',
      contentQuality: 'Content Quality',
      formatting: 'Formatting',
      keywords: 'Keywords',
      achievements: 'Achievements',
      skills: 'Skills',
      education: 'Education'
    }
    return names[key] || key
  }

  calculateIndustryAlignment(resume, industry) {
    // Simple implementation - can be enhanced
    return this.calculateKeywordsScore(resume, industry, 'general')
  }

  calculateRoleAlignment(resume, role) {
    // Simple implementation - can be enhanced
    return this.calculateKeywordsScore(resume, 'general', role)
  }

  calculateExperienceLevel(resume) {
    if (!resume.experience || resume.experience.length === 0) return 'entry'
    
    const totalYears = this.calculateTotalExperienceYears(resume.experience)
    
    if (totalYears >= 10) return 'executive'
    if (totalYears >= 7) return 'senior'
    if (totalYears >= 3) return 'mid'
    return 'entry'
  }

  calculateTotalExperienceYears(experience) {
    let totalYears = 0
    experience.forEach(exp => {
      if (exp.startDate && exp.endDate) {
        const start = new Date(exp.startDate)
        const end = exp.endDate === 'Present' ? new Date() : new Date(exp.endDate)
        const years = (end - start) / (1000 * 60 * 60 * 24 * 365)
        totalYears += Math.max(0, years)
      }
    })
    return Math.round(totalYears)
  }

  getMissingSections(resume) {
    const requiredSections = ['personalInfo', 'experience', 'education', 'skills']
    const missing = []
    
    requiredSections.forEach(section => {
      if (!this.hasSectionContent(resume, section)) {
        missing.push(section)
      }
    })
    
    return missing
  }
}

module.exports = new ResumeScoringService()
