class IndustryBenchmarks {
  constructor() {
    // Industry benchmark data for different sectors and roles
    this.benchmarks = {
      technology: {
        junior: { averageScore: 65, excellentScore: 85, poorScore: 45 },
        mid: { averageScore: 70, excellentScore: 88, poorScore: 50 },
        senior: { averageScore: 75, excellentScore: 90, poorScore: 55 },
        lead: { averageScore: 80, excellentScore: 92, poorScore: 60 }
      },
      healthcare: {
        junior: { averageScore: 60, excellentScore: 80, poorScore: 40 },
        mid: { averageScore: 65, excellentScore: 85, poorScore: 45 },
        senior: { averageScore: 70, excellentScore: 88, poorScore: 50 },
        lead: { averageScore: 75, excellentScore: 90, poorScore: 55 }
      },
      finance: {
        junior: { averageScore: 62, excellentScore: 82, poorScore: 42 },
        mid: { averageScore: 68, excellentScore: 86, poorScore: 48 },
        senior: { averageScore: 72, excellentScore: 89, poorScore: 52 },
        lead: { averageScore: 78, excellentScore: 91, poorScore: 58 }
      },
      marketing: {
        junior: { averageScore: 58, excellentScore: 78, poorScore: 38 },
        mid: { averageScore: 63, excellentScore: 83, poorScore: 43 },
        senior: { averageScore: 68, excellentScore: 86, poorScore: 48 },
        lead: { averageScore: 73, excellentScore: 88, poorScore: 53 }
      },
      sales: {
        junior: { averageScore: 55, excellentScore: 75, poorScore: 35 },
        mid: { averageScore: 60, excellentScore: 80, poorScore: 40 },
        senior: { averageScore: 65, excellentScore: 83, poorScore: 45 },
        lead: { averageScore: 70, excellentScore: 85, poorScore: 50 }
      },
      education: {
        junior: { averageScore: 57, excellentScore: 77, poorScore: 37 },
        mid: { averageScore: 62, excellentScore: 82, poorScore: 42 },
        senior: { averageScore: 67, excellentScore: 85, poorScore: 47 },
        lead: { averageScore: 72, excellentScore: 87, poorScore: 52 }
      },
      engineering: {
        junior: { averageScore: 68, excellentScore: 88, poorScore: 48 },
        mid: { averageScore: 73, excellentScore: 91, poorScore: 53 },
        senior: { averageScore: 78, excellentScore: 93, poorScore: 58 },
        lead: { averageScore: 83, excellentScore: 95, poorScore: 63 }
      },
      consulting: {
        junior: { averageScore: 70, excellentScore: 90, poorScore: 50 },
        mid: { averageScore: 75, excellentScore: 92, poorScore: 55 },
        senior: { averageScore: 80, excellentScore: 94, poorScore: 60 },
        lead: { averageScore: 85, excellentScore: 96, poorScore: 65 }
      },
      manufacturing: {
        junior: { averageScore: 60, excellentScore: 80, poorScore: 40 },
        mid: { averageScore: 65, excellentScore: 83, poorScore: 45 },
        senior: { averageScore: 70, excellentScore: 86, poorScore: 50 },
        lead: { averageScore: 75, excellentScore: 88, poorScore: 55 }
      },
      retail: {
        junior: { averageScore: 50, excellentScore: 70, poorScore: 30 },
        mid: { averageScore: 55, excellentScore: 75, poorScore: 35 },
        senior: { averageScore: 60, excellentScore: 78, poorScore: 40 },
        lead: { averageScore: 65, excellentScore: 80, poorScore: 45 }
      },
      government: {
        junior: { averageScore: 58, excellentScore: 78, poorScore: 38 },
        mid: { averageScore: 63, excellentScore: 83, poorScore: 43 },
        senior: { averageScore: 68, excellentScore: 86, poorScore: 48 },
        lead: { averageScore: 73, excellentScore: 88, poorScore: 53 }
      },
      nonprofit: {
        junior: { averageScore: 55, excellentScore: 75, poorScore: 35 },
        mid: { averageScore: 60, excellentScore: 80, poorScore: 40 },
        senior: { averageScore: 65, excellentScore: 83, poorScore: 45 },
        lead: { averageScore: 70, excellentScore: 85, poorScore: 50 }
      }
    };
  }

  /**
   * Compare analysis results with industry benchmarks
   * @param {Object} analysis - The analysis results
   * @param {string} industry - The target industry
   * @param {string} role - The target role level
   * @returns {Object} Benchmark comparison data
   */
  compareWithBenchmark(analysis, industry = 'technology', role = 'mid') {
    const industryData = this.benchmarks[industry.toLowerCase()] || this.benchmarks.technology;
    const roleData = industryData[role.toLowerCase()] || industryData.mid;
    
    const score = analysis.atsScore || 0;
    const averageScore = roleData.averageScore;
    const excellentScore = roleData.excellentScore;
    const poorScore = roleData.poorScore;

    // Calculate percentile
    let percentile;
    if (score >= excellentScore) {
      percentile = 90 + ((score - excellentScore) / (100 - excellentScore)) * 10;
    } else if (score >= averageScore) {
      percentile = 50 + ((score - averageScore) / (excellentScore - averageScore)) * 40;
    } else if (score >= poorScore) {
      percentile = 25 + ((score - poorScore) / (averageScore - poorScore)) * 25;
    } else {
      percentile = (score / poorScore) * 25;
    }

    percentile = Math.min(100, Math.max(0, Math.round(percentile)));

    // Determine performance level
    let performance;
    if (score >= excellentScore) {
      performance = 'Excellent';
    } else if (score >= averageScore) {
      performance = 'Above Average';
    } else if (score >= poorScore) {
      performance = 'Average';
    } else {
      performance = 'Below Average';
    }

    // Calculate improvement potential
    const improvementPotential = Math.max(0, excellentScore - score);

    return {
      comparison: {
        score: score,
        industryAverage: averageScore,
        excellentThreshold: excellentScore,
        poorThreshold: poorScore,
        percentile: percentile,
        performance: performance,
        improvementPotential: improvementPotential
      },
      industry: industry,
      role: role,
      benchmarkData: roleData,
      recommendations: this.getBenchmarkRecommendations(score, roleData, industry)
    };
  }

  /**
   * Get benchmark-specific recommendations
   * @param {number} score - Current ATS score
   * @param {Object} roleData - Role benchmark data
   * @param {string} industry - Target industry
   * @returns {Array} Array of recommendations
   */
  getBenchmarkRecommendations(score, roleData, industry) {
    const recommendations = [];
    
    if (score < roleData.poorScore) {
      recommendations.push(`Your score is significantly below the ${industry} industry average. Focus on basic ATS optimization.`);
      recommendations.push('Consider adding more industry-specific keywords and improving resume structure.');
    } else if (score < roleData.averageScore) {
      recommendations.push(`Your score is below the ${industry} industry average. Focus on keyword optimization and content quality.`);
      recommendations.push('Add more quantified achievements and industry-specific terminology.');
    } else if (score < roleData.excellentScore) {
      recommendations.push(`Your score is above the ${industry} industry average. Fine-tune for excellence.`);
      recommendations.push('Focus on advanced optimization techniques and industry leadership keywords.');
    } else {
      recommendations.push(`Excellent! Your score exceeds the ${industry} industry benchmark.`);
      recommendations.push('Maintain current optimization level and consider advanced positioning strategies.');
    }

    return recommendations;
  }

  /**
   * Get industry-specific benchmark data
   * @param {string} industry - The industry name
   * @returns {Object} Industry benchmark data
   */
  getIndustryBenchmarks(industry) {
    return this.benchmarks[industry.toLowerCase()] || this.benchmarks.technology;
  }

  /**
   * Get all available industries
   * @returns {Array} List of available industries
   */
  getAvailableIndustries() {
    return Object.keys(this.benchmarks);
  }

  /**
   * Get all available role levels for an industry
   * @param {string} industry - The industry name
   * @returns {Array} List of available role levels
   */
  getAvailableRoles(industry) {
    const industryData = this.benchmarks[industry.toLowerCase()];
    return industryData ? Object.keys(industryData) : [];
  }
}

module.exports = IndustryBenchmarks;