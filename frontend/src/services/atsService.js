const API_BASE_URL = '/api';

class ATSService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/ats`;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Get auth headers
  getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Analyze resume file
  async analyzeResume(file, jobTitle = '', industry = '') {
    try {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 10MB.');
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.');
      }

      const formData = new FormData();
      formData.append('resume', file);
      
      if (jobTitle) {
        formData.append('jobTitle', jobTitle);
      }
      
      if (industry) {
        formData.append('industry', industry);
      }

      const response = await fetch(`${this.baseURL}/analyze`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}` || ''
        }
      });

      if (!response.ok) {
        let errorMessage = 'Failed to analyze resume';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('ATS Analysis Error:', error);
      throw error;
    }
  }

  // Get keyword suggestions
  async getKeywords(jobTitle = '', industry = '') {
    try {
      const params = new URLSearchParams();
      if (jobTitle) params.append('jobTitle', jobTitle);
      if (industry) params.append('industry', industry);

      const response = await fetch(`${this.baseURL}/keywords?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch keywords');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Keywords Error:', error);
      throw error;
    }
  }

  // Get analysis history
  async getHistory() {
    try {
      const response = await fetch(`${this.baseURL}/history`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch history');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('History Error:', error);
      throw error;
    }
  }

  // Save analysis result
  async saveAnalysis(analysisData) {
    try {
      const response = await fetch(`${this.baseURL}/save-analysis`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(analysisData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save analysis');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Save Analysis Error:', error);
      throw error;
    }
  }
}

export default new ATSService();
