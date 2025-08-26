import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/token/',
    register: '/auth/register/',
    refresh: '/auth/token/refresh/',
    logout: '/auth/logout/',
  },
  
  // Profiles
  profiles: {
    list: '/profiles/',
    detail: (id: number) => `/profiles/${id}/`,
    completion: '/profiles/completion/',
    education: {
      list: '/profiles/education/',
      bulkCreate: '/profiles/education/bulk_create/',
      detail: (id: number) => `/profiles/education/${id}/`,
    },
    experience: {
      list: '/profiles/experience/',
      bulkCreate: '/profiles/experience/bulk_create/',
      detail: (id: number) => `/profiles/experience/${id}/`,
    },
    skills: {
      list: '/profiles/skills/',
      bulkCreate: '/profiles/skills/bulk_create/',
      detail: (id: number) => `/profiles/skills/${id}/`,
      categories: '/profiles/skills/categories/',
    },
    projects: {
      list: '/profiles/projects/',
      bulkCreate: '/profiles/projects/bulk_create/',
      detail: (id: number) => `/profiles/projects/${id}/`,
    },
    certifications: {
      list: '/profiles/certifications/',
      bulkCreate: '/profiles/certifications/bulk_create/',
      detail: (id: number) => `/profiles/certifications/${id}/`,
    },
  },
  
  // Resumes
  resumes: {
    list: '/resumes/',
    detail: (id: number) => `/resumes/${id}/`,
    create: '/resumes/',
    update: (id: number) => `/resumes/${id}/`,
    delete: (id: number) => `/resumes/${id}/`,
    export: (id: number) => `/resumes/${id}/export/`,
    share: (id: number) => `/resumes/${id}/share/`,
    duplicate: (id: number) => `/resumes/${id}/duplicate/`,
    preview: (id: number) => `/resumes/${id}/preview/`,
    validate: (id: number) => `/resumes/${id}/validate/`,
    sections: {
      list: (resumeId: number) => `/resumes/${resumeId}/sections/`,
      detail: (resumeId: number, sectionId: number) => `/resumes/${resumeId}/sections/${sectionId}/`,
    },
  },
  
  // Templates
  templates: {
    list: '/templates/',
    detail: (id: number) => `/templates/${id}/`,
    create: '/templates/',
    update: (id: number) => `/templates/${id}/`,
    delete: (id: number) => `/templates/${id}/`,
    categories: '/templates/categories/',
    preview: (id: number) => `/templates/${id}/preview/`,
    duplicate: (id: number) => `/templates/${id}/duplicate/`,
    use: (id: number) => `/templates/${id}/use_template/`,
    customize: (id: number) => `/templates/${id}/customize/`,
    validate: (id: number) => `/templates/${id}/validate/`,
    export: (id: number) => `/templates/${id}/export/`,
    rate: (id: number) => `/templates/${id}/rate/`,
  },
};

// API service functions
export const apiService = {
  // Auth
  auth: {
    login: (credentials: { username: string; password: string }) =>
      api.post(endpoints.auth.login, credentials),
    register: (userData: any) => api.post(endpoints.auth.register, userData),
    refresh: (refreshToken: string) =>
      api.post(endpoints.auth.refresh, { refresh: refreshToken }),
    logout: () => api.post(endpoints.auth.logout),
  },
  
  // Profiles
  profiles: {
    getList: () => api.get(endpoints.profiles.list),
    getDetail: (id: number) => api.get(endpoints.profiles.detail(id)),
    update: (id: number, data: any) => api.patch(endpoints.profiles.detail(id), data),
    getCompletion: () => api.get(endpoints.profiles.completion),
    
    education: {
      getList: () => api.get(endpoints.profiles.education.list),
      create: (data: any) => api.post(endpoints.profiles.education.list, data),
      bulkCreate: (data: any) => api.post(endpoints.profiles.education.bulkCreate, data),
      update: (id: number, data: any) => api.patch(endpoints.profiles.education.detail(id), data),
      delete: (id: number) => api.delete(endpoints.profiles.education.detail(id)),
    },
    
    experience: {
      getList: () => api.get(endpoints.profiles.experience.list),
      create: (data: any) => api.post(endpoints.profiles.experience.list, data),
      bulkCreate: (data: any) => api.post(endpoints.profiles.experience.bulkCreate, data),
      update: (id: number, data: any) => api.patch(endpoints.profiles.experience.detail(id), data),
      delete: (id: number) => api.delete(endpoints.profiles.experience.detail(id)),
    },
    
    skills: {
      getList: () => api.get(endpoints.profiles.skills.list),
      create: (data: any) => api.post(endpoints.profiles.skills.list, data),
      bulkCreate: (data: any) => api.post(endpoints.profiles.skills.bulkCreate, data),
      update: (id: number, data: any) => api.patch(endpoints.profiles.skills.detail(id), data),
      delete: (id: number) => api.delete(endpoints.profiles.skills.detail(id)),
      getCategories: () => api.get(endpoints.profiles.skills.categories),
    },
    
    projects: {
      getList: () => api.get(endpoints.profiles.projects.list),
      create: (data: any) => api.post(endpoints.profiles.projects.list, data),
      bulkCreate: (data: any) => api.post(endpoints.profiles.projects.bulkCreate, data),
      update: (id: number, data: any) => api.patch(endpoints.profiles.projects.detail(id), data),
      delete: (id: number) => api.delete(endpoints.profiles.projects.detail(id)),
    },
    
    certifications: {
      getList: () => api.get(endpoints.profiles.certifications.list),
      create: (data: any) => api.post(endpoints.profiles.certifications.list, data),
      bulkCreate: (data: any) => api.post(endpoints.profiles.certifications.bulkCreate, data),
      update: (id: number, data: any) => api.patch(endpoints.profiles.certifications.detail(id), data),
      delete: (id: number) => api.delete(endpoints.profiles.certifications.detail(id)),
    },
  },
  
  // Resumes
  resumes: {
    getList: () => api.get(endpoints.resumes.list),
    getDetail: (id: number) => api.get(endpoints.resumes.detail(id)),
    create: (data: any) => api.post(endpoints.resumes.create, data),
    update: (id: number, data: any) => api.patch(endpoints.resumes.update(id), data),
    delete: (id: number) => api.delete(endpoints.resumes.delete(id)),
    export: (id: number, format: string) => api.post(endpoints.resumes.export(id), { format }),
    share: (id: number, data: any) => api.post(endpoints.resumes.share(id), data),
    duplicate: (id: number, data: any) => api.post(endpoints.resumes.duplicate(id), data),
    getPreview: (id: number) => api.get(endpoints.resumes.preview(id)),
    validate: (id: number) => api.get(endpoints.resumes.validate(id)),
    
    sections: {
      getList: (resumeId: number) => api.get(endpoints.resumes.sections.list(resumeId)),
      create: (resumeId: number, data: any) => api.post(endpoints.resumes.sections.list(resumeId), data),
      update: (resumeId: number, sectionId: number, data: any) =>
        api.patch(endpoints.resumes.sections.detail(resumeId, sectionId), data),
      delete: (resumeId: number, sectionId: number) =>
        api.delete(endpoints.resumes.sections.detail(resumeId, sectionId)),
    },
  },
  
  // Templates
  templates: {
    getList: () => api.get(endpoints.templates.list),
    getDetail: (id: number) => api.get(endpoints.templates.detail(id)),
    create: (data: any) => api.post(endpoints.templates.create, data),
    update: (id: number, data: any) => api.patch(endpoints.templates.update(id), data),
    delete: (id: number) => api.delete(endpoints.templates.delete(id)),
    getCategories: () => api.get(endpoints.templates.categories),
    getPreview: (id: number) => api.get(endpoints.templates.preview(id)),
    duplicate: (id: number, data: any) => api.post(endpoints.templates.duplicate(id), data),
    use: (id: number, data: any) => api.post(endpoints.templates.use(id), data),
    customize: (id: number, data: any) => api.post(endpoints.templates.customize(id), data),
    validate: (id: number) => api.get(endpoints.templates.validate(id)),
    export: (id: number, data: any) => api.post(endpoints.templates.export(id), data),
    rate: (id: number, data: any) => api.post(endpoints.templates.rate(id), data),
  },
};

export { api };
