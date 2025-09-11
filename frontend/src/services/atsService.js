const API_BASE_URL = 'http://localhost:3001/api';

class ATSService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/simple-ats`;
  }

  // Analyze resume file with advanced features
  async analyzeResume(file, options = {}) {
    try {
      // Validate file size (15MB limit - increased)
      if (file.size > 15 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 15MB.');
      }

      // Validate file type (expanded support)
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/html'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only PDF, DOCX, TXT, and HTML files are allowed.');
      }

      const formData = new FormData();
      formData.append('resume', file);
      
      // Add optional parameters
      if (options.industry) {
        formData.append('industry', options.industry);
      }
      if (options.role) {
        formData.append('role', options.role);
      }
      if (options.model) {
        formData.append('model', options.model);
      }

      console.log('Sending file to:', `${this.baseURL}/analyze`);
      console.log('File details:', { name: file.name, size: file.size, type: file.type });
      console.log('Options:', options);

      const response = await fetch(`${this.baseURL}/analyze`, {
        method: 'POST',
        body: formData
        // Don't set Content-Type for FormData, let the browser set it
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        let errorMessage = 'Failed to analyze resume';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Advanced analysis response:', data);
      
      // Log the extracted text received from backend
      if (data.data && data.data.extractedText) {
        console.log('📄 EXTRACTED TEXT RECEIVED FROM BACKEND:');
        console.log('=' .repeat(80));
        console.log(data.data.extractedText);
        console.log('=' .repeat(80));
      }
      
      return data;
    } catch (error) {
      console.error('ATS Analysis Error:', error);
      throw error;
    }
  }

  // Get health status
  async getHealthStatus() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      if (!response.ok) {
        throw new Error('Health check failed');
      }
      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  // Clear cache (for development)
  async clearCache() {
    try {
      const response = await fetch(`${this.baseURL}/clear-cache`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Cache clear failed');
      }
      return await response.json();
    } catch (error) {
      console.error('Cache clear error:', error);
      throw error;
    }
  }

  // Get industry suggestions
  getIndustrySuggestions() {
    return [
      { value: 'technology', label: 'Technology' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'finance', label: 'Finance' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'sales', label: 'Sales' },
      { value: 'education', label: 'Education' },
      { value: 'consulting', label: 'Consulting' },
      { value: 'manufacturing', label: 'Manufacturing' },
      { value: 'retail', label: 'Retail' },
      { value: 'government', label: 'Government' },
      { value: 'nonprofit', label: 'Non-profit' },
      { value: 'other', label: 'Other' }
    ];
  }

  // Get role level suggestions
  getRoleLevelSuggestions() {
    return [
      { value: 'entry', label: 'Entry Level' },
      { value: 'mid', label: 'Mid Level' },
      { value: 'senior', label: 'Senior Level' },
      { value: 'lead', label: 'Lead/Principal' },
      { value: 'manager', label: 'Manager' },
      { value: 'director', label: 'Director' },
      { value: 'executive', label: 'Executive' },
      { value: 'c-level', label: 'C-Level' }
    ];
  }

  // Get AI model suggestions
  getModelSuggestions() {
    return [
      { value: 'dual-model', label: 'Dual-Model Analysis (Recommended)', description: 'Claude Sonnet 4 + GPT-4o for comprehensive analysis' },
      { value: 'gpt-4o', label: 'GPT-4o (OpenAI)', description: 'Advanced reasoning and analysis' },
      { value: 'gpt-4o-mini', label: 'GPT-4o-mini (OpenAI)', description: 'Cost-effective with good quality' },
      { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (Anthropic)', description: 'Excellent for structured analysis' },
      { value: 'claude-haiku', label: 'Claude 3 Haiku (Anthropic)', description: 'Fast and efficient analysis' }
    ];
  }

  // Export analysis to PDF
  async exportToPDF(analysisData, benchmarkData, fileName) {
    try {
      const response = await fetch(`${this.baseURL}/export-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisData,
          benchmarkData,
          fileName
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'PDF export failed');
      }

      // Get the PDF blob
      const pdfBlob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName || 'ats-analysis'}-report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('PDF export error:', error);
      throw error;
    }
  }

}

export default new ATSService();
