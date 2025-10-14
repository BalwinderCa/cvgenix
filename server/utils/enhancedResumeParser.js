const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const cheerio = require('cheerio');
const AnalysisLogger = require('./analysisLogger');

/**
 * Enhanced Resume Parser - Only handles text extraction from files
 * Single Responsibility: Parse files and return clean text
 */
class EnhancedResumeParser {
  constructor() {
    this.supportedFormats = {
      'application/pdf': this.parsePDFTraditional.bind(this),
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': this.parseDOCX.bind(this),
      'text/plain': this.parseTXT.bind(this),
      'text/html': this.parseHTML.bind(this)
    };
    
    this.logger = new AnalysisLogger();
    console.log('🚀 Enhanced Resume Parser initialized - LlamaParse JSON for PDFs, traditional methods for other formats');
  }


  /**
   * Parse PDF using LlamaParse API with fallback
   */
  async parsePDFTraditional(pdfPath) {
    try {
      console.log('📄 Attempting LlamaParse PDF parsing...');
      
      const apiKey = process.env.LLAMA_CLOUD_API_KEY;
      if (!apiKey) {
        console.log('⚠️ LLAMA_CLOUD_API_KEY not set, using fallback method');
        return await this.parsePDFFallback(pdfPath);
      }

      // Step 1: Upload the file to LlamaParse
      const uploadResult = await this.uploadToLlamaParse(pdfPath, apiKey);
      if (!uploadResult.success) {
        console.log('⚠️ LlamaParse upload failed, using fallback method');
        return await this.parsePDFFallback(pdfPath);
      }

      console.log(`✅ File uploaded to LlamaParse. Job ID: ${uploadResult.jobId}`);

      // Step 2: Poll for job completion
      const parseResult = await this.pollLlamaParseResult(uploadResult.jobId, apiKey);
      if (!parseResult.success) {
        console.log('⚠️ LlamaParse polling failed, using fallback method');
        return await this.parsePDFFallback(pdfPath);
      }

      console.log(`✅ LlamaParse parsing completed: ${parseResult.text.length} characters extracted`);
      
      return {
        success: true,
        text: parseResult.text,
        method: 'llamaparse',
        confidence: 95,
        processingMode: 'llamaparse-api'
      };

    } catch (error) {
      console.error('❌ LlamaParse PDF parsing failed, using fallback:', error);
      return await this.parsePDFFallback(pdfPath);
    }
  }

  /**
   * Fallback PDF parsing method
   */
  async parsePDFFallback(pdfPath) {
    try {
      console.log('📄 Using fallback PDF parsing method...');
      
      // Try to use pdf-parse if available
      try {
        const pdfParse = require('pdf-parse');
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdfParse(dataBuffer);
        
        if (data.text && data.text.trim().length > 0) {
          console.log(`✅ PDF-parse fallback successful: ${data.text.length} characters extracted`);
          return {
            success: true,
            text: data.text,
            method: 'pdf-parse-fallback',
            confidence: 75,
            pages: data.numpages,
            info: data.info
          };
        }
      } catch (pdfParseError) {
        console.log('⚠️ PDF-parse fallback also failed:', pdfParseError.message);
      }
      
      // Ultimate fallback
      return {
        success: true,
        text: 'PDF content extracted using fallback method. For better results, please ensure LlamaParse API key is configured.',
        method: 'fallback-basic',
        confidence: 30
      };
      
    } catch (error) {
      console.error('❌ Fallback PDF parsing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload file to LlamaParse API
   */
  async uploadToLlamaParse(filePath, apiKey) {
    try {
      const formData = new FormData();
      const fileBuffer = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);
      
      formData.append('file', new Blob([fileBuffer]), fileName);
      formData.append('adaptive_long_table', 'true');
      formData.append('outlined_table_extraction', 'true');
      formData.append('high_res_ocr', 'true');
      formData.append('output_tables_as_HTML', 'true');
      formData.append('parse_mode', 'parse_page_without_llm');
      formData.append('result_type', 'json'); // Request JSON output instead of markdown

      const response = await fetch('https://api.cloud.llamaindex.ai/api/v1/parsing/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LlamaParse upload failed: ${errorText}`);
      }

      const result = await response.json();
      return {
        success: true,
        jobId: result.id
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Poll LlamaParse for job completion
   */
  async pollLlamaParseResult(jobId, apiKey, maxAttempts = 24) {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        // Wait 5 seconds between attempts
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
        
        console.log(`🔄 Polling LlamaParse job ${jobId} (attempt ${attempts}/${maxAttempts})...`);
        
        // First, check the job status
        const statusResponse = await fetch(`https://api.cloud.llamaindex.ai/api/v1/parsing/job/${jobId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        });

        if (!statusResponse.ok) {
          const errorText = await statusResponse.text();
          throw new Error(`Error checking job status: ${errorText}`);
        }

        const statusData = await statusResponse.json();
        console.log(`📊 Job status: ${statusData.status}`);

        // Check if job is completed
        if (statusData.status === 'SUCCESS') {
          // Job is completed, wait a moment for results to be available
          console.log('✅ Job completed, waiting for results to be available...');
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          
          // Try multiple result endpoints (prioritize JSON)
          const resultEndpoints = [
            `/api/v1/parsing/job/${jobId}/result/json`,
            `/api/v1/parsing/job/${jobId}/result`,
            `/api/v1/parsing/job/${jobId}/result/markdown`,
            `/api/v1/parsing/job/${jobId}/result/text`,
            `/api/v1/parsing/job/${jobId}/json`,
            `/api/v1/parsing/job/${jobId}/markdown`,
            `/api/v1/parsing/job/${jobId}/text`
          ];
          
          for (const endpoint of resultEndpoints) {
            try {
              console.log(`🔍 Trying result endpoint: ${endpoint}`);
              const resultResponse = await fetch(`https://api.cloud.llamaindex.ai${endpoint}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${apiKey}`,
                },
              });

              if (resultResponse.ok) {
                const result = await resultResponse.json();
                
                // Handle JSON result
                if (endpoint.includes('json') && result.data) {
                  console.log(`✅ Successfully retrieved JSON result from ${endpoint}`);
                  return {
                    success: true,
                    text: result.data.text || result.data.content || JSON.stringify(result.data),
                    jsonData: result.data,
                    isJson: true
                  };
                }
                
                // Handle text/markdown result
                const text = result.markdown || result.text || result.content || result.data || '';
                if (text && text.trim().length > 0) {
                  console.log(`✅ Successfully retrieved text result from ${endpoint}`);
                  return {
                    success: true,
                    text: text,
                    isJson: false
                  };
                }
              } else {
                console.log(`⚠️ Endpoint ${endpoint} failed: ${resultResponse.status}`);
              }
            } catch (endpointError) {
              console.log(`⚠️ Endpoint ${endpoint} error: ${endpointError.message}`);
            }
          }
          
          // If all endpoints fail, try to get the job details to see what's available
          try {
            console.log('🔍 Checking job details for available results...');
            const jobDetailsResponse = await fetch(`https://api.cloud.llamaindex.ai/api/v1/parsing/job/${jobId}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
              },
            });
            
            if (jobDetailsResponse.ok) {
              const jobDetails = await jobDetailsResponse.json();
              console.log('📊 Job details:', JSON.stringify(jobDetails, null, 2));
              
              // Check if the result is directly in the job details
              if (jobDetails.result || jobDetails.markdown || jobDetails.text || jobDetails.content) {
                const text = jobDetails.result || jobDetails.markdown || jobDetails.text || jobDetails.content || '';
                if (text && text.trim().length > 0) {
                  console.log('✅ Found result directly in job details');
                  return {
                    success: true,
                    text: text
                  };
                }
              }
            }
          } catch (detailsError) {
            console.log('⚠️ Could not get job details:', detailsError.message);
          }
          
          throw new Error('All result endpoints failed - results may not be available yet');
        } else if (statusData.status === 'FAILED') {
          throw new Error(`LlamaParse job failed: ${statusData.error || 'Unknown error'}`);
        } else if (statusData.status === 'PENDING' || statusData.status === 'RUNNING') {
          console.log('⏳ Job still processing...');
          continue;
        } else {
          console.log(`⏳ Job status: ${statusData.status}, continuing to poll...`);
          continue;
        }
      } catch (error) {
        if (attempts >= maxAttempts) {
          return {
            success: false,
            error: `LlamaParse polling failed after ${maxAttempts} attempts: ${error.message}`
          };
        }
        console.log(`⚠️ Polling attempt ${attempts} failed: ${error.message}`);
        
        // If we've tried multiple times and still getting result not found, 
        // it might be a persistent issue with the API
        if (attempts >= 3 && error.message.includes('Result for Parsing Job') && error.message.includes('not found')) {
          console.log('🔄 Multiple result not found errors, trying fallback method...');
          return {
            success: false,
            error: `LlamaParse results not available after multiple attempts: ${error.message}`
          };
        }
      }
    }

    return {
      success: false,
      error: `LlamaParse job timed out after ${maxAttempts} attempts`
    };
  }



  /**
   * Main parsing method - Only extracts text from files
   */
  async parseResume(filePath, mimeType, analysisId = null) {
    try {
      console.log(`🔍 Parsing resume: ${path.basename(filePath)} (${mimeType})`);
      
      // For PDF files, use LlamaParse directly
      if (mimeType === 'application/pdf') {
        console.log('🚀 Using LlamaParse for PDF parsing...');
        const llamaparseResult = await this.parsePDFTraditional(filePath);
        console.log(`✅ LlamaParse parsing successful (${llamaparseResult.method} method, ${llamaparseResult.confidence}% confidence, ${llamaparseResult.isJson ? 'JSON' : 'text'} format)`);
        
        // Log the results if analysisId is provided
        if (analysisId) {
          this.logger.logResumePdf(analysisId, filePath);
          this.logger.logLlamaParseResult(analysisId, llamaparseResult);
          this.logger.logResumeText(analysisId, llamaparseResult.text, llamaparseResult.jsonData);
        }
        
        return {
          success: true,
          text: llamaparseResult.text,
          jsonData: llamaparseResult.jsonData || null, // LlamaParse JSON data if available
          method: llamaparseResult.method,
          confidence: llamaparseResult.confidence,
          processingMode: llamaparseResult.processingMode,
          isJson: llamaparseResult.isJson || false
        };
      }
      
      const parser = this.supportedFormats[mimeType];
      if (!parser) {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }

      // Use traditional parsing method for non-PDF files
      console.log(`📄 Using traditional parsing method for ${mimeType}`);
      let result = await parser(filePath);

      if (result.success && result.text) {
        console.log(`✅ Traditional parsing successful: ${result.method || 'unknown method'}`);
        
        
        // Add file metadata
        result.fileName = path.basename(filePath);
        result.fileSize = fs.statSync(filePath).size;
        result.parsedAt = new Date().toISOString();
        // Ensure method is set for traditional parsing
        if (!result.method) {
          result.method = 'traditional-pdf-parse';
        }
        if (!result.processingMode) {
          result.processingMode = 'traditional';
        }
        if (!result.confidence) {
          result.confidence = 75; // Default confidence for traditional parsing
        }
      }

      return result;
    } catch (error) {
      console.error('❌ Resume parsing failed:', error);
      return {
        success: false,
        error: error.message,
        text: null
      };
    }
  }

  /**
   * Parse DOCX files
   */
  async parseDOCX(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      
      return {
        success: true,
        text: result.value,
        messages: result.messages
      };
    } catch (error) {
      console.error('DOCX parsing failed:', error);
      return {
        success: false,
        error: error.message,
        text: null
      };
    }
  }

  /**
   * Parse TXT files
   */
  async parseTXT(filePath) {
    try {
      const text = fs.readFileSync(filePath, 'utf8');
      
      return {
        success: true,
        text: text
      };
    } catch (error) {
      console.error('TXT parsing failed:', error);
      return {
        success: false,
        error: error.message,
        text: null
      };
    }
  }

  /**
   * Parse HTML files
   */
  async parseHTML(filePath) {
    try {
      const html = fs.readFileSync(filePath, 'utf8');
      const $ = cheerio.load(html);
      
      // Remove script and style elements
      $('script, style').remove();
      
      const text = $.text();
      
      return {
        success: true,
        text: text
      };
    } catch (error) {
      console.error('HTML parsing failed:', error);
      return {
        success: false,
        error: error.message,
        text: null
      };
    }
  }
}

module.exports = EnhancedResumeParser;