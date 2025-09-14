const JobPosting = require('../models/JobPosting')
const Resume = require('../models/Resume')
const loggerService = require('./loggerService')

class JobMatchingService {
  constructor() {
    this.matchThreshold = 0.6 // Minimum match score to recommend
  }

  /**
   * Find job matches for a resume
   */
  async findJobMatches(resumeId, options = {}) {
    try {
      const { limit = 10, industry, location, experienceLevel } = options

      const resume = await Resume.findById(resumeId)
        .populate('template', 'name category')

      if (!resume) {
        throw new Error('Resume not found')
      }

      // Build search criteria
      const searchCriteria = this.buildSearchCriteria(resume, { industry, location, experienceLevel })

      // Find potential job matches
      const jobs = await JobPosting.find(searchCriteria)
        .limit(limit * 2) // Get more to filter later
        .sort({ createdAt: -1 })

      // Calculate match scores
      const matches = await this.calculateMatchScores(resume, jobs)

      // Filter and sort by match score
      const filteredMatches = matches
        .filter(match => match.score >= this.matchThreshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

      return {
        success: true,
        matches: filteredMatches,
        totalFound: jobs.length,
        totalMatches: filteredMatches.length
      }
    } catch (error) {
      loggerService.error('Error finding job matches:', error)
      throw error
    }
  }

  /**
   * Build search criteria based on resume and options
   */
  buildSearchCriteria(resume, options = {}) {
    const criteria = {
      isActive: true
    }

    // Industry filter
    if (options.industry) {
      criteria['company.industry'] = new RegExp(options.industry, 'i')
    }

    // Location filter
    if (options.location) {
      criteria.$or = [
        { 'company.location.city': new RegExp(options.location, 'i') },
        { 'company.location.state': new RegExp(options.location, 'i') },
        { 'company.location.remote': true }
      ]
    }

    // Experience level filter
    if (options.experienceLevel) {
      criteria['employment.level'] = options.experienceLevel
    }

    // Skills-based search
    if (resume.skills && resume.skills.length > 0) {
      const skillNames = resume.skills.map(skill => skill.name)
      criteria['requirements.skills.name'] = { $in: skillNames }
    }

    return criteria
  }

  /**
   * Calculate match scores between resume and jobs
   */
  async calculateMatchScores(resume, jobs) {
    const matches = []

    for (const job of jobs) {
      const score = await this.calculateMatchScore(resume, job)
      matches.push({
        job: job,
        score: score,
        reasons: this.getMatchReasons(resume, job, score)
      })
    }

    return matches
  }

  /**
   * Calculate match score between resume and job
   */
  async calculateMatchScore(resume, job) {
    let score = 0
    let totalWeight = 0

    // Skills matching (40% weight)
    const skillsScore = this.calculateSkillsMatch(resume.skills || [], job.requirements.skills || [])
    score += skillsScore * 0.4
    totalWeight += 0.4

    // Experience matching (25% weight)
    const experienceScore = this.calculateExperienceMatch(resume.experience || [], job.requirements.experience)
    score += experienceScore * 0.25
    totalWeight += 0.25

    // Education matching (15% weight)
    const educationScore = this.calculateEducationMatch(resume.education || [], job.requirements.education)
    score += educationScore * 0.15
    totalWeight += 0.15

    // Industry matching (10% weight)
    const industryScore = this.calculateIndustryMatch(resume, job)
    score += industryScore * 0.1
    totalWeight += 0.1

    // Location matching (10% weight)
    const locationScore = this.calculateLocationMatch(resume, job)
    score += locationScore * 0.1
    totalWeight += 0.1

    return totalWeight > 0 ? score / totalWeight : 0
  }

  /**
   * Calculate skills match score
   */
  calculateSkillsMatch(resumeSkills, jobSkills) {
    if (!jobSkills || jobSkills.length === 0) return 1

    const resumeSkillNames = resumeSkills.map(s => s.name.toLowerCase())
    const jobSkillNames = jobSkills.map(s => s.name.toLowerCase())

    const matchingSkills = jobSkillNames.filter(skill => 
      resumeSkillNames.some(resumeSkill => 
        resumeSkill.includes(skill) || skill.includes(resumeSkill)
      )
    )

    return matchingSkills.length / jobSkillNames.length
  }

  /**
   * Calculate experience match score
   */
  calculateExperienceMatch(resumeExperience, jobExperience) {
    if (!jobExperience) return 1

    const resumeYears = this.calculateResumeExperienceYears(resumeExperience)
    const requiredMin = jobExperience.min || 0
    const requiredMax = jobExperience.max || 10

    if (resumeYears >= requiredMin && resumeYears <= requiredMax) {
      return 1
    } else if (resumeYears < requiredMin) {
      return Math.max(0, resumeYears / requiredMin)
    } else {
      return Math.max(0, 1 - (resumeYears - requiredMax) / requiredMax)
    }
  }

  /**
   * Calculate education match score
   */
  calculateEducationMatch(resumeEducation, jobEducation) {
    if (!jobEducation || jobEducation === 'any') return 1

    const educationLevels = {
      'high_school': 1,
      'associate': 2,
      'bachelor': 3,
      'master': 4,
      'phd': 5
    }

    const requiredLevel = educationLevels[jobEducation] || 1
    const resumeLevel = this.getHighestEducationLevel(resumeEducation)

    return resumeLevel >= requiredLevel ? 1 : resumeLevel / requiredLevel
  }

  /**
   * Calculate industry match score
   */
  calculateIndustryMatch(resume, job) {
    // Simple keyword matching for now
    const resumeText = this.extractResumeText(resume)
    const industryKeywords = job.company.industry.toLowerCase().split(' ')

    const matches = industryKeywords.filter(keyword => 
      resumeText.toLowerCase().includes(keyword)
    )

    return matches.length / industryKeywords.length
  }

  /**
   * Calculate location match score
   */
  calculateLocationMatch(resume, job) {
    if (job.company.location.remote) return 1

    const resumeLocation = resume.personalInfo.address || ''
    const jobLocation = `${job.company.location.city} ${job.company.location.state}`.toLowerCase()

    return resumeLocation.toLowerCase().includes(jobLocation) ? 1 : 0.5
  }

  /**
   * Get match reasons
   */
  getMatchReasons(resume, job, score) {
    const reasons = []

    if (score > 0.8) {
      reasons.push('Excellent match')
    } else if (score > 0.6) {
      reasons.push('Good match')
    } else {
      reasons.push('Partial match')
    }

    // Add specific reasons
    const skillsMatch = this.calculateSkillsMatch(resume.skills || [], job.requirements.skills || [])
    if (skillsMatch > 0.7) {
      reasons.push('Strong skills alignment')
    }

    const experienceMatch = this.calculateExperienceMatch(resume.experience || [], job.requirements.experience)
    if (experienceMatch > 0.8) {
      reasons.push('Experience level matches')
    }

    if (job.company.location.remote) {
      reasons.push('Remote work available')
    }

    return reasons
  }

  /**
   * Helper methods
   */
  calculateResumeExperienceYears(experience) {
    if (!experience || experience.length === 0) return 0

    let totalYears = 0
    for (const exp of experience) {
      if (exp.startDate && exp.endDate) {
        const start = new Date(exp.startDate)
        const end = exp.endDate === 'Present' ? new Date() : new Date(exp.endDate)
        const years = (end - start) / (1000 * 60 * 60 * 24 * 365)
        totalYears += Math.max(0, years)
      }
    }

    return Math.round(totalYears)
  }

  getHighestEducationLevel(education) {
    if (!education || education.length === 0) return 1

    const levels = {
      'high school': 1,
      'associate': 2,
      'bachelor': 3,
      'master': 4,
      'phd': 5,
      'doctorate': 5
    }

    let highestLevel = 1
    for (const edu of education) {
      const degree = edu.degree.toLowerCase()
      for (const [key, level] of Object.entries(levels)) {
        if (degree.includes(key) && level > highestLevel) {
          highestLevel = level
        }
      }
    }

    return highestLevel
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
      })
    }

    if (resume.skills) {
      text += resume.skills.map(s => s.name).join(' ')
    }

    return text
  }
}

module.exports = new JobMatchingService()
