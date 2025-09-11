const fs = require('fs');
const path = require('path');
const EnhancedResumeParser = require('./enhancedResumeParser');

/**
 * Parser Comparison Utility
 * Tests different parsing methods and provides performance metrics
 */
class ParserComparison {
  constructor() {
    this.parser = new EnhancedResumeParser();
    this.results = [];
  }

  /**
   * Compare all parsing methods for a given PDF
   */
  async compareParsingMethods(filePath, mimeType = 'application/pdf') {
    console.log('🔍 Starting comprehensive parser comparison...');
    console.log(`📄 File: ${path.basename(filePath)}`);
    
    const methods = [
      { name: 'pdf2json', method: () => this.parser.parsePDFWithPDF2JSON(filePath) },
      { name: 'pdf-parse', method: () => this.parser.parsePDFWithPDFParse(filePath) },
      { name: 'ocr-advanced', method: () => this.parser.parsePDFWithOCR(filePath) }
    ];

    const results = [];

    for (const { name, method } of methods) {
      const result = await this.testParsingMethod(name, method);
      results.push(result);
    }

    // Sort by success rate and text quality
    results.sort((a, b) => {
      if (a.success !== b.success) return b.success - a.success;
      return b.textLength - a.textLength;
    });

    this.results = results;
    this.printComparisonReport();
    
    return results;
  }

  /**
   * Test a single parsing method
   */
  async testParsingMethod(name, method) {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 Testing ${name}...`);
      const result = await method();
      const endTime = Date.now();
      const duration = endTime - startTime;

      const analysis = {
        method: name,
        success: result.success,
        duration: duration,
        textLength: result.text ? result.text.length : 0,
        confidence: result.confidence || 0,
        pages: result.pages || 0,
        error: result.error || null,
        text: result.text || null,
        quality: this.assessTextQuality(result.text)
      };

      console.log(`✅ ${name} completed in ${duration}ms - ${analysis.textLength} chars`);
      return analysis;

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`❌ ${name} failed after ${duration}ms:`, error.message);
      
      return {
        method: name,
        success: false,
        duration: duration,
        textLength: 0,
        confidence: 0,
        pages: 0,
        error: error.message,
        text: null,
        quality: 0
      };
    }
  }

  /**
   * Assess text quality for ATS scoring
   */
  assessTextQuality(text) {
    if (!text || text.length < 10) return 0;

    let quality = 0;

    // Check for resume structure
    const structureKeywords = [
      'experience', 'education', 'skills', 'summary', 'objective',
      'contact', 'phone', 'email', 'linkedin', 'github'
    ];
    
    const foundStructure = structureKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    ).length;
    
    quality += foundStructure * 10; // Up to 100 points for structure

    // Check for contact information
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
    
    if (emailRegex.test(text)) quality += 20;
    if (phoneRegex.test(text)) quality += 20;

    // Check for professional content
    const professionalKeywords = [
      'university', 'degree', 'certification', 'project', 'achievement',
      'responsibility', 'leadership', 'management', 'development', 'analysis'
    ];
    
    const foundProfessional = professionalKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    ).length;
    
    quality += Math.min(foundProfessional * 5, 50); // Up to 50 points

    // Check for proper formatting (newlines, structure)
    const lineCount = text.split('\n').length;
    if (lineCount > 10) quality += 10;
    if (lineCount > 20) quality += 10;

    // Check for OCR artifacts (negative quality indicators)
    const ocrArtifacts = [
      /\b[0-9]{1,2}\s*[a-z]\b/g,  // Numbers followed by single letters
      /\b[a-z]{1,2}\s*[0-9]\b/g,  // Single letters followed by numbers
      /[^\w\s@.-]/g               // Special characters that shouldn't be in resumes
    ];
    
    let artifactCount = 0;
    ocrArtifacts.forEach(regex => {
      const matches = text.match(regex);
      if (matches) artifactCount += matches.length;
    });
    
    quality -= Math.min(artifactCount * 2, 30); // Penalize OCR artifacts

    return Math.max(0, Math.min(quality, 100));
  }

  /**
   * Print comprehensive comparison report
   */
  printComparisonReport() {
    console.log('\n📊 PARSER COMPARISON REPORT');
    console.log('=' .repeat(80));
    
    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      const quality = result.quality;
      const qualityBar = '█'.repeat(Math.floor(quality / 10)) + '░'.repeat(10 - Math.floor(quality / 10));
      
      console.log(`\n${index + 1}. ${result.method.toUpperCase()}`);
      console.log(`   Status: ${status} ${result.success ? 'SUCCESS' : 'FAILED'}`);
      console.log(`   Duration: ${result.duration}ms`);
      console.log(`   Text Length: ${result.textLength} characters`);
      console.log(`   Quality: ${quality}/100 [${qualityBar}]`);
      console.log(`   Confidence: ${result.confidence}/100`);
      console.log(`   Pages: ${result.pages}`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.text && result.text.length > 0) {
        const preview = result.text.substring(0, 100).replace(/\n/g, ' ');
        console.log(`   Preview: ${preview}...`);
      }
    });

    // Recommendations
    console.log('\n🎯 RECOMMENDATIONS');
    console.log('=' .repeat(40));
    
    const successfulResults = this.results.filter(r => r.success);
    
    if (successfulResults.length === 0) {
      console.log('❌ No parsing methods succeeded. Check file format and integrity.');
    } else {
      const bestResult = successfulResults[0];
      console.log(`🏆 Best Method: ${bestResult.method}`);
      console.log(`   Quality Score: ${bestResult.quality}/100`);
      console.log(`   Processing Time: ${bestResult.duration}ms`);
      
      if (bestResult.quality < 70) {
        console.log('⚠️  Low quality detected. Consider manual review or OCR preprocessing.');
      }
      
      if (bestResult.duration > 5000) {
        console.log('⚠️  Slow processing time. Consider optimizing for production use.');
      }
    }
  }

  /**
   * Get the best parsing method for a file
   */
  getBestMethod() {
    const successfulResults = this.results.filter(r => r.success);
    
    if (successfulResults.length === 0) {
      return null;
    }
    
    // Sort by quality score, then by speed
    successfulResults.sort((a, b) => {
      if (a.quality !== b.quality) return b.quality - a.quality;
      return a.duration - b.duration;
    });
    
    return successfulResults[0];
  }

  /**
   * Save comparison results to file
   */
  async saveResults(outputPath) {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      bestMethod: this.getBestMethod(),
      summary: {
        totalMethods: this.results.length,
        successfulMethods: this.results.filter(r => r.success).length,
        averageQuality: this.results.reduce((sum, r) => sum + r.quality, 0) / this.results.length,
        averageDuration: this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length
      }
    };

    await fs.promises.writeFile(outputPath, JSON.stringify(report, null, 2));
    console.log(`📄 Comparison results saved to: ${outputPath}`);
  }
}

module.exports = ParserComparison;
