const API_BASE_URL = 'http://localhost:3001/api';

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
  async analyzeResume(file) {
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

      console.log('Sending file to:', `${this.baseURL}/analyze`);
      console.log('File details:', { name: file.name, size: file.size, type: file.type });

      const response = await fetch(`${this.baseURL}/analyze`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type for FormData, let the browser set it
        headers: {
          'Authorization': `Bearer ${this.getAuthToken() || ''}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

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
      console.log('Analysis response:', data);
      return data;
    } catch (error) {
      console.error('ATS Analysis Error:', error);
      throw error;
    }
  }

  // Get keyword suggestions
  async getKeywords() {
    try {
      const response = await fetch(`${this.baseURL}/keywords`, {
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
