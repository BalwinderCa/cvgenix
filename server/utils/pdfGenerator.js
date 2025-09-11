/**
 * PDF Generation Service for ATS Analysis Reports
 * Generates comprehensive PDF reports with analysis results and industry benchmarking
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  constructor() {
    this.fonts = {
      regular: 'Helvetica',
      bold: 'Helvetica-Bold',
      italic: 'Helvetica-Oblique'
    };
  }

  /**
   * Generate comprehensive ATS analysis PDF report
   */
  async generateAnalysisReport(analysisData, benchmarkData, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Generate PDF content
        this.generatePDFContent(doc, analysisData, benchmarkData, options);
        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate PDF content
   */
  generatePDFContent(doc, analysisData, benchmarkData, options) {
    const { analysis, extractedText, fileName, analyzedAt } = analysisData;
    const { comparison, metricComparisons, keywordAnalysis, performanceInsights, recommendations } = benchmarkData;

    // Header
    this.addHeader(doc, fileName, analyzedAt);
    
    // Executive Summary
    this.addExecutiveSummary(doc, analysis, comparison);
    
    // ATS Score Overview
    this.addATSScoreOverview(doc, analysis, comparison);
    
    // Industry Benchmarking
    this.addIndustryBenchmarking(doc, comparison, performanceInsights);
    
    // Detailed Metrics Analysis
    this.addDetailedMetrics(doc, analysis, metricComparisons);
    
    // Keyword Analysis
    this.addKeywordAnalysis(doc, keywordAnalysis);
    
    // Strengths and Weaknesses
    this.addStrengthsWeaknesses(doc, analysis);
    
    // Recommendations
    this.addRecommendations(doc, analysis, recommendations);
    
    // Footer
    this.addFooter(doc);
  }

  /**
   * Add header section
   */
  addHeader(doc, fileName, analyzedAt) {
    // Title
    doc.font(this.fonts.bold)
       .fontSize(24)
       .fillColor('#1e40af')
       .text('ATS Analysis Report', 50, 50, { align: 'center' });
    
    // Subtitle
    doc.font(this.fonts.regular)
       .fontSize(14)
       .fillColor('#6b7280')
       .text('Comprehensive Resume Analysis with Industry Benchmarking', 50, 85, { align: 'center' });
    
    // File info
    doc.font(this.fonts.regular)
       .fontSize(12)
       .fillColor('#374151')
       .text(`File: ${fileName}`, 50, 120)
       .text(`Analyzed: ${new Date(analyzedAt).toLocaleDateString()}`, 50, 140);
    
    // Add line separator
    doc.moveTo(50, 170)
       .lineTo(545, 170)
       .stroke('#e5e7eb');
    
    doc.y = 190;
  }

  /**
   * Add executive summary
   */
  addExecutiveSummary(doc, analysis, comparison) {
    doc.font(this.fonts.bold)
       .fontSize(16)
       .fillColor('#1e40af')
       .text('Executive Summary', 50, doc.y);
    
    doc.y += 10;
    
    const summary = `Your resume received an ATS score of ${analysis.atsScore}/100 (${analysis.overallGrade} grade), ` +
                   `placing you in the ${comparison.percentile}th percentile for your industry and role level. ` +
                   `This is ${comparison.scoreDifference > 0 ? 'above' : 'below'} the industry average of ${comparison.industryAverage} points.`;
    
    doc.font(this.fonts.regular)
       .fontSize(11)
       .fillColor('#374151')
       .text(summary, 50, doc.y, { width: 495, align: 'justify' });
    
    doc.y += 40;
  }

  /**
   * Add ATS score overview
   */
  addATSScoreOverview(doc, analysis, comparison) {
    doc.font(this.fonts.bold)
       .fontSize(16)
       .fillColor('#1e40af')
       .text('ATS Score Overview', 50, doc.y);
    
    doc.y += 20;
    
    // Score visualization
    const scoreWidth = 200;
    const scoreHeight = 30;
    const scoreX = 50;
    const scoreY = doc.y;
    
    // Background bar
    doc.rect(scoreX, scoreY, scoreWidth, scoreHeight)
       .fill('#f3f4f6');
    
    // Score bar
    const scorePercentage = analysis.atsScore / 100;
    const fillWidth = scoreWidth * scorePercentage;
    const fillColor = this.getScoreColor(analysis.atsScore);
    
    doc.rect(scoreX, scoreY, fillWidth, scoreHeight)
       .fill(fillColor);
    
    // Score text
    doc.font(this.fonts.bold)
       .fontSize(18)
       .fillColor('#ffffff')
       .text(`${analysis.atsScore}/100`, scoreX + 10, scoreY + 5);
    
    doc.y += 50;
    
    // Score details
    doc.font(this.fonts.regular)
       .fontSize(11)
       .fillColor('#374151')
       .text(`Overall Grade: ${analysis.overallGrade}`, 50, doc.y)
       .text(`Industry Average: ${comparison.industryAverage}/100`, 50, doc.y + 15)
       .text(`Percentile Ranking: ${comparison.percentile}th`, 50, doc.y + 30)
       .text(`Performance Level: ${comparison.performance}`, 50, doc.y + 45);
    
    doc.y += 70;
  }

  /**
   * Add industry benchmarking section
   */
  addIndustryBenchmarking(doc, comparison, performanceInsights) {
    doc.font(this.fonts.bold)
       .fontSize(16)
       .fillColor('#1e40af')
       .text('Industry Benchmarking', 50, doc.y);
    
    doc.y += 20;
    
    // Performance insights
    doc.font(this.fonts.bold)
       .fontSize(12)
       .fillColor('#374151')
       .text('Performance Insights:', 50, doc.y);
    
    doc.y += 15;
    
    performanceInsights.forEach(insight => {
      doc.font(this.fonts.regular)
         .fontSize(10)
         .fillColor('#374151')
         .text(`• ${insight}`, 60, doc.y, { width: 435 });
      doc.y += 12;
    });
    
    doc.y += 20;
  }

  /**
   * Add detailed metrics analysis
   */
  addDetailedMetrics(doc, analysis, metricComparisons) {
    doc.font(this.fonts.bold)
       .fontSize(16)
       .fillColor('#1e40af')
       .text('Detailed Metrics Analysis', 50, doc.y);
    
    doc.y += 20;
    
    const metrics = analysis.detailedMetrics || {};
    const comparisons = metricComparisons || {};
    
    Object.entries(metrics).forEach(([metric, score]) => {
      const comparison = comparisons[metric];
      const metricName = this.formatMetricName(metric);
      
      // Metric name
      doc.font(this.fonts.bold)
         .fontSize(11)
         .fillColor('#374151')
         .text(metricName, 50, doc.y);
      
      // Score bar
      const barWidth = 200;
      const barHeight = 15;
      const barX = 250;
      const barY = doc.y - 5;
      
      // Background
      doc.rect(barX, barY, barWidth, barHeight)
         .fill('#f3f4f6');
      
      // Score fill
      const fillWidth = barWidth * (score / 100);
      const fillColor = this.getScoreColor(score);
      
      doc.rect(barX, barY, fillWidth, barHeight)
         .fill(fillColor);
      
      // Score text
      doc.font(this.fonts.regular)
         .fontSize(10)
         .fillColor('#374151')
         .text(`${score}%`, barX + barWidth + 10, barY + 2);
      
      // Industry comparison
      if (comparison) {
        doc.font(this.fonts.regular)
           .fontSize(9)
           .fillColor('#6b7280')
           .text(`Industry Avg: ${comparison.industryAverage}%`, 50, doc.y + 15);
      }
      
      doc.y += 35;
    });
    
    doc.y += 20;
  }

  /**
   * Add keyword analysis
   */
  addKeywordAnalysis(doc, keywordAnalysis) {
    doc.font(this.fonts.bold)
       .fontSize(16)
       .fillColor('#1e40af')
       .text('Keyword Analysis', 50, doc.y);
    
    doc.y += 20;
    
    // Coverage percentage
    doc.font(this.fonts.bold)
       .fontSize(12)
       .fillColor('#374151')
       .text(`Industry Keyword Coverage: ${keywordAnalysis.coverage}%`, 50, doc.y);
    
    doc.y += 20;
    
    // Found keywords
    if (keywordAnalysis.foundKeywords && keywordAnalysis.foundKeywords.length > 0) {
      doc.font(this.fonts.bold)
         .fontSize(11)
         .fillColor('#059669')
         .text('Keywords Found:', 50, doc.y);
      
      doc.y += 15;
      
      const foundKeywords = keywordAnalysis.foundKeywords.slice(0, 10);
      foundKeywords.forEach(keyword => {
        doc.font(this.fonts.regular)
           .fontSize(9)
           .fillColor('#374151')
           .text(`✓ ${keyword}`, 60, doc.y);
        doc.y += 12;
      });
      
      doc.y += 10;
    }
    
    // Missing keywords
    if (keywordAnalysis.missingKeywords && keywordAnalysis.missingKeywords.length > 0) {
      doc.font(this.fonts.bold)
         .fontSize(11)
         .fillColor('#dc2626')
         .text('Keywords to Add:', 50, doc.y);
      
      doc.y += 15;
      
      const missingKeywords = keywordAnalysis.missingKeywords.slice(0, 8);
      missingKeywords.forEach(keyword => {
        doc.font(this.fonts.regular)
           .fontSize(9)
           .fillColor('#374151')
           .text(`• ${keyword}`, 60, doc.y);
        doc.y += 12;
      });
    }
    
    doc.y += 30;
  }

  /**
   * Add strengths and weaknesses
   */
  addStrengthsWeaknesses(doc, analysis) {
    // Strengths
    if (analysis.strengths && analysis.strengths.length > 0) {
      doc.font(this.fonts.bold)
         .fontSize(16)
         .fillColor('#059669')
         .text('Resume Strengths', 50, doc.y);
      
      doc.y += 20;
      
      analysis.strengths.slice(0, 5).forEach(strength => {
        doc.font(this.fonts.regular)
           .fontSize(10)
           .fillColor('#374151')
           .text(`• ${strength}`, 60, doc.y, { width: 435 });
        doc.y += 15;
      });
      
      doc.y += 20;
    }
    
    // Weaknesses
    if (analysis.weaknesses && analysis.weaknesses.length > 0) {
      doc.font(this.fonts.bold)
         .fontSize(16)
         .fillColor('#dc2626')
         .text('Areas for Improvement', 50, doc.y);
      
      doc.y += 20;
      
      analysis.weaknesses.slice(0, 5).forEach(weakness => {
        doc.font(this.fonts.regular)
           .fontSize(10)
           .fillColor('#374151')
           .text(`• ${weakness}`, 60, doc.y, { width: 435 });
        doc.y += 15;
      });
      
      doc.y += 20;
    }
  }

  /**
   * Add recommendations
   */
  addRecommendations(doc, analysis, benchmarkRecommendations) {
    doc.font(this.fonts.bold)
       .fontSize(16)
       .fillColor('#1e40af')
       .text('Recommendations', 50, doc.y);
    
    doc.y += 20;
    
    // AI recommendations
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      doc.font(this.fonts.bold)
         .fontSize(12)
         .fillColor('#374151')
         .text('AI Recommendations:', 50, doc.y);
      
      doc.y += 15;
      
      analysis.recommendations.slice(0, 5).forEach(recommendation => {
        doc.font(this.fonts.regular)
           .fontSize(10)
           .fillColor('#374151')
           .text(`• ${recommendation}`, 60, doc.y, { width: 435 });
        doc.y += 15;
      });
      
      doc.y += 20;
    }
    
    // Benchmark recommendations
    if (benchmarkRecommendations && benchmarkRecommendations.length > 0) {
      doc.font(this.fonts.bold)
         .fontSize(12)
         .fillColor('#374151')
         .text('Industry-Specific Recommendations:', 50, doc.y);
      
      doc.y += 15;
      
      benchmarkRecommendations.slice(0, 5).forEach(recommendation => {
        doc.font(this.fonts.regular)
           .fontSize(10)
           .fillColor('#374151')
           .text(`• ${recommendation}`, 60, doc.y, { width: 435 });
        doc.y += 15;
      });
    }
  }

  /**
   * Add footer
   */
  addFooter(doc) {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 50;
    
    doc.font(this.fonts.regular)
       .fontSize(8)
       .fillColor('#6b7280')
       .text('Generated by ATS Analysis System', 50, footerY, { align: 'center' })
       .text(`Report generated on ${new Date().toLocaleDateString()}`, 50, footerY + 15, { align: 'center' });
  }

  /**
   * Get color based on score
   */
  getScoreColor(score) {
    if (score >= 80) return '#059669'; // Green
    if (score >= 60) return '#d97706'; // Orange
    return '#dc2626'; // Red
  }

  /**
   * Format metric name for display
   */
  formatMetricName(metric) {
    return metric.replace(/([A-Z])/g, ' $1')
                 .replace(/^./, str => str.toUpperCase())
                 .trim();
  }
}

module.exports = PDFGenerator;
