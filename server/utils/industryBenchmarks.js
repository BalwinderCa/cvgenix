/**
 * Industry Benchmarking System
 * Provides industry-specific standards and comparison metrics for ATS analysis
 */

class IndustryBenchmarks {
  constructor() {
    this.industryStandards = {
      technology: {
        name: "Technology",
        averageScore: 75,
        topPercentile: 90,
        bottomPercentile: 45,
        keyMetrics: {
          sectionCompleteness: { average: 85, excellent: 95, poor: 60 },
          keywordDensity: { average: 70, excellent: 85, poor: 40 },
          formatConsistency: { average: 80, excellent: 95, poor: 50 },
          actionVerbs: { average: 75, excellent: 90, poor: 45 },
          quantifiedAchievements: { average: 65, excellent: 85, poor: 30 }
        },
        criticalKeywords: [
          "software development", "programming", "coding", "algorithms", "data structures",
          "machine learning", "artificial intelligence", "cloud computing", "devops", "agile",
          "scrum", "python", "javascript", "react", "node.js", "sql", "git", "docker",
          "kubernetes", "aws", "azure", "gcp", "api", "microservices", "database"
        ],
        roleStandards: {
          "Entry": { averageScore: 65, topPercentile: 80 },
          "Mid": { averageScore: 75, topPercentile: 88 },
          "Senior": { averageScore: 82, topPercentile: 92 },
          "Lead": { averageScore: 85, topPercentile: 95 },
          "Principal": { averageScore: 88, topPercentile: 97 }
        }
      },
      healthcare: {
        name: "Healthcare",
        averageScore: 78,
        topPercentile: 92,
        bottomPercentile: 50,
        keyMetrics: {
          sectionCompleteness: { average: 90, excellent: 98, poor: 70 },
          keywordDensity: { average: 75, excellent: 88, poor: 45 },
          formatConsistency: { average: 85, excellent: 95, poor: 60 },
          actionVerbs: { average: 80, excellent: 92, poor: 50 },
          quantifiedAchievements: { average: 70, excellent: 85, poor: 35 }
        },
        criticalKeywords: [
          "patient care", "medical", "clinical", "healthcare", "diagnosis", "treatment",
          "nursing", "physician", "hospital", "clinic", "pharmaceutical", "therapy",
          "surgery", "emergency", "critical care", "pediatrics", "oncology", "cardiology",
          "neurology", "radiology", "laboratory", "research", "clinical trials", "HIPAA"
        ],
        roleStandards: {
          "Entry": { averageScore: 70, topPercentile: 85 },
          "Mid": { averageScore: 78, topPercentile: 90 },
          "Senior": { averageScore: 85, topPercentile: 95 },
          "Lead": { averageScore: 88, topPercentile: 97 },
          "Principal": { averageScore: 90, topPercentile: 98 }
        }
      },
      finance: {
        name: "Finance",
        averageScore: 80,
        topPercentile: 93,
        bottomPercentile: 55,
        keyMetrics: {
          sectionCompleteness: { average: 88, excellent: 96, poor: 65 },
          keywordDensity: { average: 78, excellent: 90, poor: 50 },
          formatConsistency: { average: 87, excellent: 96, poor: 65 },
          actionVerbs: { average: 82, excellent: 94, poor: 55 },
          quantifiedAchievements: { average: 75, excellent: 90, poor: 40 }
        },
        criticalKeywords: [
          "financial analysis", "investment", "portfolio", "risk management", "compliance",
          "audit", "accounting", "budgeting", "forecasting", "trading", "banking",
          "credit", "derivatives", "equity", "bonds", "securities", "valuation",
          "mergers", "acquisitions", "CFA", "CPA", "FRM", "regulatory", "Basel"
        ],
        roleStandards: {
          "Entry": { averageScore: 72, topPercentile: 87 },
          "Mid": { averageScore: 80, topPercentile: 92 },
          "Senior": { averageScore: 87, topPercentile: 96 },
          "Lead": { averageScore: 90, topPercentile: 98 },
          "Principal": { averageScore: 92, topPercentile: 99 }
        }
      },
      marketing: {
        name: "Marketing",
        averageScore: 73,
        topPercentile: 88,
        bottomPercentile: 48,
        keyMetrics: {
          sectionCompleteness: { average: 82, excellent: 93, poor: 58 },
          keywordDensity: { average: 72, excellent: 85, poor: 42 },
          formatConsistency: { average: 78, excellent: 90, poor: 52 },
          actionVerbs: { average: 76, excellent: 88, poor: 48 },
          quantifiedAchievements: { average: 68, excellent: 82, poor: 35 }
        },
        criticalKeywords: [
          "digital marketing", "social media", "content marketing", "SEO", "SEM",
          "PPC", "email marketing", "campaign", "brand", "analytics", "ROI",
          "conversion", "lead generation", "customer acquisition", "market research",
          "strategy", "advertising", "public relations", "influencer", "automation"
        ],
        roleStandards: {
          "Entry": { averageScore: 65, topPercentile: 80 },
          "Mid": { averageScore: 73, topPercentile: 86 },
          "Senior": { averageScore: 80, topPercentile: 92 },
          "Lead": { averageScore: 83, topPercentile: 95 },
          "Principal": { averageScore: 85, topPercentile: 97 }
        }
      },
      sales: {
        name: "Sales",
        averageScore: 76,
        topPercentile: 89,
        bottomPercentile: 52,
        keyMetrics: {
          sectionCompleteness: { average: 84, excellent: 94, poor: 62 },
          keywordDensity: { average: 74, excellent: 87, poor: 45 },
          formatConsistency: { average: 80, excellent: 92, poor: 55 },
          actionVerbs: { average: 78, excellent: 90, poor: 50 },
          quantifiedAchievements: { average: 72, excellent: 88, poor: 38 }
        },
        criticalKeywords: [
          "sales", "revenue", "quota", "prospecting", "lead generation", "CRM",
          "pipeline", "closing", "negotiation", "relationship", "client", "customer",
          "territory", "account management", "business development", "partnership",
          "consultative selling", "solution selling", "cold calling", "presentation"
        ],
        roleStandards: {
          "Entry": { averageScore: 68, topPercentile: 82 },
          "Mid": { averageScore: 76, topPercentile: 88 },
          "Senior": { averageScore: 83, topPercentile: 93 },
          "Lead": { averageScore: 86, topPercentile: 96 },
          "Principal": { averageScore: 88, topPercentile: 98 }
        }
      },
      general: {
        name: "General",
        averageScore: 70,
        topPercentile: 85,
        bottomPercentile: 45,
        keyMetrics: {
          sectionCompleteness: { average: 80, excellent: 92, poor: 55 },
          keywordDensity: { average: 65, excellent: 80, poor: 40 },
          formatConsistency: { average: 75, excellent: 88, poor: 50 },
          actionVerbs: { average: 70, excellent: 85, poor: 45 },
          quantifiedAchievements: { average: 60, excellent: 78, poor: 30 }
        },
        criticalKeywords: [
          "leadership", "management", "communication", "problem solving", "teamwork",
          "project management", "analytical", "strategic", "collaboration", "innovation",
          "results", "achievement", "growth", "improvement", "efficiency", "quality"
        ],
        roleStandards: {
          "Entry": { averageScore: 60, topPercentile: 75 },
          "Mid": { averageScore: 70, topPercentile: 83 },
          "Senior": { averageScore: 77, topPercentile: 88 },
          "Lead": { averageScore: 80, topPercentile: 92 },
          "Principal": { averageScore: 82, topPercentile: 95 }
        }
      }
    };
  }

  /**
   * Get industry benchmark data
   */
  getIndustryBenchmark(industry, role = 'Mid') {
    const industryData = this.industryStandards[industry] || this.industryStandards.general;
    const roleData = industryData.roleStandards[role] || industryData.roleStandards.Mid;
    
    return {
      industry: industryData.name,
      role: role,
      averageScore: roleData.averageScore,
      topPercentile: roleData.topPercentile,
      bottomPercentile: industryData.bottomPercentile,
      keyMetrics: industryData.keyMetrics,
      criticalKeywords: industryData.criticalKeywords
    };
  }

  /**
   * Compare resume analysis against industry benchmarks
   */
  compareWithBenchmark(analysis, industry, role = 'Mid') {
    const benchmark = this.getIndustryBenchmark(industry, role);
    const atsScore = analysis.atsScore || 0;
    const detailedMetrics = analysis.detailedMetrics || {};

    // Calculate percentile ranking
    const percentile = this.calculatePercentile(atsScore, benchmark);
    
    // Compare detailed metrics
    const metricComparisons = this.compareMetrics(detailedMetrics, benchmark.keyMetrics);
    
    // Analyze keyword coverage
    const keywordAnalysis = this.analyzeKeywords(analysis.extractedText || '', benchmark.criticalKeywords);
    
    // Generate performance insights
    const performanceInsights = this.generatePerformanceInsights(atsScore, benchmark, percentile);

    return {
      benchmark: benchmark,
      comparison: {
        score: atsScore,
        industryAverage: benchmark.averageScore,
        topPercentile: benchmark.topPercentile,
        percentile: percentile,
        performance: this.getPerformanceLevel(percentile),
        scoreDifference: atsScore - benchmark.averageScore
      },
      metricComparisons: metricComparisons,
      keywordAnalysis: keywordAnalysis,
      performanceInsights: performanceInsights,
      recommendations: this.generateBenchmarkRecommendations(atsScore, benchmark, metricComparisons, keywordAnalysis)
    };
  }

  /**
   * Calculate percentile ranking
   */
  calculatePercentile(score, benchmark) {
    if (score >= benchmark.topPercentile) return 95;
    if (score >= benchmark.averageScore) {
      const range = benchmark.topPercentile - benchmark.averageScore;
      const position = score - benchmark.averageScore;
      return Math.round(75 + (position / range) * 20);
    } else {
      const range = benchmark.averageScore - benchmark.bottomPercentile;
      const position = score - benchmark.bottomPercentile;
      return Math.round(25 + (position / range) * 50);
    }
  }

  /**
   * Compare detailed metrics against industry standards
   */
  compareMetrics(detailedMetrics, benchmarkMetrics) {
    const comparisons = {};
    
    Object.keys(benchmarkMetrics).forEach(metric => {
      const userScore = detailedMetrics[metric] || 0;
      const benchmark = benchmarkMetrics[metric];
      
      comparisons[metric] = {
        userScore: userScore,
        industryAverage: benchmark.average,
        excellent: benchmark.excellent,
        poor: benchmark.poor,
        performance: this.getMetricPerformance(userScore, benchmark),
        difference: userScore - benchmark.average
      };
    });
    
    return comparisons;
  }

  /**
   * Analyze keyword coverage
   */
  analyzeKeywords(resumeText, criticalKeywords) {
    if (!resumeText) return { coverage: 0, foundKeywords: [], missingKeywords: [] };
    
    const text = resumeText.toLowerCase();
    const foundKeywords = [];
    const missingKeywords = [];
    
    criticalKeywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
      } else {
        missingKeywords.push(keyword);
      }
    });
    
    const coverage = (foundKeywords.length / criticalKeywords.length) * 100;
    
    return {
      coverage: Math.round(coverage),
      foundKeywords: foundKeywords,
      missingKeywords: missingKeywords.slice(0, 10), // Limit to top 10 missing
      totalKeywords: criticalKeywords.length
    };
  }

  /**
   * Get performance level based on percentile
   */
  getPerformanceLevel(percentile) {
    if (percentile >= 90) return 'Exceptional';
    if (percentile >= 75) return 'Above Average';
    if (percentile >= 50) return 'Average';
    if (percentile >= 25) return 'Below Average';
    return 'Needs Improvement';
  }

  /**
   * Get metric performance level
   */
  getMetricPerformance(score, benchmark) {
    if (score >= benchmark.excellent) return 'Excellent';
    if (score >= benchmark.average) return 'Good';
    if (score >= benchmark.poor) return 'Fair';
    return 'Poor';
  }

  /**
   * Generate performance insights
   */
  generatePerformanceInsights(score, benchmark, percentile) {
    const insights = [];
    
    if (percentile >= 90) {
      insights.push("Your resume ranks in the top 10% for this industry and role level.");
      insights.push("You're well-positioned to compete for senior positions.");
    } else if (percentile >= 75) {
      insights.push("Your resume performs above industry average.");
      insights.push("Minor improvements could help you reach the top tier.");
    } else if (percentile >= 50) {
      insights.push("Your resume meets industry standards.");
      insights.push("Focus on key areas to improve your competitive position.");
    } else if (percentile >= 25) {
      insights.push("Your resume is below industry average.");
      insights.push("Significant improvements needed to be competitive.");
    } else {
      insights.push("Your resume needs substantial improvement.");
      insights.push("Consider professional resume review and optimization.");
    }
    
    const scoreDiff = score - benchmark.averageScore;
    if (Math.abs(scoreDiff) > 5) {
      if (scoreDiff > 0) {
        insights.push(`You're ${scoreDiff} points above the industry average.`);
      } else {
        insights.push(`You're ${Math.abs(scoreDiff)} points below the industry average.`);
      }
    }
    
    return insights;
  }

  /**
   * Generate benchmark-specific recommendations
   */
  generateBenchmarkRecommendations(score, benchmark, metricComparisons, keywordAnalysis) {
    const recommendations = [];
    
    // Score-based recommendations
    if (score < benchmark.averageScore) {
      recommendations.push(`Focus on reaching the industry average of ${benchmark.averageScore} points.`);
    }
    
    // Metric-based recommendations
    Object.entries(metricComparisons).forEach(([metric, comparison]) => {
      if (comparison.performance === 'Poor') {
        const metricName = metric.replace(/([A-Z])/g, ' $1').toLowerCase();
        recommendations.push(`Improve ${metricName} - currently ${comparison.userScore}% vs industry average ${comparison.industryAverage}%.`);
      }
    });
    
    // Keyword recommendations
    if (keywordAnalysis.coverage < 50) {
      recommendations.push(`Increase keyword coverage - currently ${keywordAnalysis.coverage}% of industry keywords found.`);
      if (keywordAnalysis.missingKeywords.length > 0) {
        recommendations.push(`Consider adding keywords like: ${keywordAnalysis.missingKeywords.slice(0, 3).join(', ')}.`);
      }
    }
    
    return recommendations;
  }
}

module.exports = IndustryBenchmarks;
