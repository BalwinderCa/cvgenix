const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  }

  async register(userData: { firstName: string; lastName: string; email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  }

  // Resume endpoints
  async getResumes() {
    const response = await fetch(`${API_BASE_URL}/resumes`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  async getCurrentResume() {
    const response = await fetch(`${API_BASE_URL}/resumes/current`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  async saveResume(resumeData: any) {
    const response = await fetch(`${API_BASE_URL}/resumes`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(resumeData)
    });
    return response.json();
  }

  async updateResume(resumeId: string, resumeData: any) {
    const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(resumeData)
    });
    return response.json();
  }

  async deleteResume(resumeId: string) {
    const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  async exportResumeToPDF(resumeId: string) {
    const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}/export/pdf`, {
      headers: this.getAuthHeaders()
    });
    return response.blob();
  }

  // Template endpoints
  async getTemplates() {
    const response = await fetch(`${API_BASE_URL}/templates`);
    return response.json();
  }

  async getTemplate(templateId: string) {
    const response = await fetch(`${API_BASE_URL}/templates/${templateId}`);
    return response.json();
  }

  // ATS endpoints
  async analyzeResume(file: File) {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await fetch(`${API_BASE_URL}/ats/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    return response.json();
  }

  // Cover letter endpoints
  async getCoverLetters() {
    const response = await fetch(`${API_BASE_URL}/cover-letters`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  async saveCoverLetter(coverLetterData: any) {
    const response = await fetch(`${API_BASE_URL}/cover-letters`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(coverLetterData)
    });
    return response.json();
  }

  async updateCoverLetter(coverLetterId: string, coverLetterData: any) {
    const response = await fetch(`${API_BASE_URL}/cover-letters/${coverLetterId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(coverLetterData)
    });
    return response.json();
  }

  async deleteCoverLetter(coverLetterId: string) {
    const response = await fetch(`${API_BASE_URL}/cover-letters/${coverLetterId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  async exportCoverLetterToPDF(coverLetterId: string) {
    const response = await fetch(`${API_BASE_URL}/cover-letters/${coverLetterId}/export/pdf`, {
      headers: this.getAuthHeaders()
    });
    return response.blob();
  }

  // User endpoints
  async getUserStats() {
    const response = await fetch(`${API_BASE_URL}/users/stats`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }
}

export const apiService = new ApiService();
export default apiService;
