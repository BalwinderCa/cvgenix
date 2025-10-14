const fs = require('fs');
const path = require('path');

class AnalysisLogger {
  constructor() {
    this.logsDir = path.join(__dirname, '../../logs');
    this.ensureLogsDirectory();
  }

  ensureLogsDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  getAnalysisLogDir(analysisId) {
    const analysisLogDir = path.join(this.logsDir, analysisId);
    if (!fs.existsSync(analysisLogDir)) {
      fs.mkdirSync(analysisLogDir, { recursive: true });
    }
    return analysisLogDir;
  }

  logResumePdf(analysisId, pdfPath) {
    try {
      const logDir = this.getAnalysisLogDir(analysisId);
      const logFile = path.join(logDir, 'resume.pdf');
      
      // Copy the PDF file to the log directory
      if (fs.existsSync(pdfPath)) {
        fs.copyFileSync(pdfPath, logFile);
        console.log(`📁 Resume PDF saved to: ${logFile}`);
      }
    } catch (error) {
      console.error('❌ Error logging resume PDF:', error);
    }
  }

  logResumeText(analysisId, resumeText, jsonData = null) {
    try {
      const logDir = this.getAnalysisLogDir(analysisId);
      const logFile = path.join(logDir, 'resumetextwearesendingtoparse.txt');
      
      let content = `RESUME TEXT EXTRACTED FROM PDF:\n`;
      content += `=====================================\n\n`;
      content += resumeText;
      
      if (jsonData) {
        content += `\n\n\nSTRUCTURED JSON DATA FROM LLAMAPARSE:\n`;
        content += `=====================================\n\n`;
        content += JSON.stringify(jsonData, null, 2);
      }
      
      fs.writeFileSync(logFile, content, 'utf8');
      console.log(`📝 Resume text saved to: ${logFile}`);
    } catch (error) {
      console.error('❌ Error logging resume text:', error);
    }
  }

  logGptResponse(analysisId, gptResponse) {
    try {
      const logDir = this.getAnalysisLogDir(analysisId);
      const logFile = path.join(logDir, 'gptresponse.json');
      
      fs.writeFileSync(logFile, gptResponse, 'utf8');
      console.log(`🤖 GPT response saved to: ${logFile}`);
    } catch (error) {
      console.error('❌ Error logging GPT response:', error);
    }
  }

  logAnalysisSummary(analysisId, analysis) {
    try {
      const logDir = this.getAnalysisLogDir(analysisId);
      const logFile = path.join(logDir, 'summary.json');
      
      const summary = {
        analysisId: analysisId,
        timestamp: new Date().toISOString(),
        atsScore: analysis.atsScore,
        overallGrade: analysis.overallGrade,
        modelUsed: analysis.modelUsed,
        detailedMetrics: analysis.detailedMetrics,
        quickStats: analysis.quickStats,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendations: analysis.recommendations,
        detailedInsights: analysis.detailedInsights,
        sectionAnalysis: analysis.sectionAnalysis,
        industryAlignment: analysis.industryAlignment,
        contentQuality: analysis.contentQuality
      };
      
      fs.writeFileSync(logFile, JSON.stringify(summary, null, 2), 'utf8');
      console.log(`📊 Analysis summary saved to: ${logFile}`);
    } catch (error) {
      console.error('❌ Error logging analysis summary:', error);
    }
  }

  logAnalysisPrompt(analysisId, prompt) {
    try {
      const logDir = this.getAnalysisLogDir(analysisId);
      const logFile = path.join(logDir, 'analysisprompt.txt');
      
      fs.writeFileSync(logFile, prompt, 'utf8');
      console.log(`📋 Analysis prompt saved to: ${logFile}`);
    } catch (error) {
      console.error('❌ Error logging analysis prompt:', error);
    }
  }

  logLlamaParseResult(analysisId, llamaparseResult) {
    try {
      const logDir = this.getAnalysisLogDir(analysisId);
      const logFile = path.join(logDir, 'llamaparse_result.json');
      
      const result = {
        analysisId: analysisId,
        timestamp: new Date().toISOString(),
        success: llamaparseResult.success,
        method: llamaparseResult.method,
        confidence: llamaparseResult.confidence,
        processingMode: llamaparseResult.processingMode,
        isJson: llamaparseResult.isJson,
        textLength: llamaparseResult.text?.length || 0,
        hasJsonData: !!llamaparseResult.jsonData,
        jsonData: llamaparseResult.jsonData
      };
      
      fs.writeFileSync(logFile, JSON.stringify(result, null, 2), 'utf8');
      console.log(`🦙 LlamaParse result saved to: ${logFile}`);
    } catch (error) {
      console.error('❌ Error logging LlamaParse result:', error);
    }
  }

  // Clean up old log directories (older than 7 days)
  cleanupOldLogs() {
    try {
      const now = Date.now();
      const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
      
      if (fs.existsSync(this.logsDir)) {
        const entries = fs.readdirSync(this.logsDir, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const entryPath = path.join(this.logsDir, entry.name);
            const stats = fs.statSync(entryPath);
            
            if (stats.mtime.getTime() < sevenDaysAgo) {
              fs.rmSync(entryPath, { recursive: true, force: true });
              console.log(`🧹 Cleaned up old log directory: ${entry.name}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error cleaning up old logs:', error);
    }
  }
}

module.exports = AnalysisLogger;
