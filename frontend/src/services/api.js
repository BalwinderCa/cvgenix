import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Check if this is an admin route
    const isAdminRoute = config.url.includes('/admin/')
    
    // Use admin token for admin routes, regular token for other routes
    const token = isAdminRoute 
      ? localStorage.getItem('adminToken') || localStorage.getItem('token')
      : localStorage.getItem('token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Check if this was an admin route
      const isAdminRoute = error.config?.url?.includes('/admin/')
      
      if (isAdminRoute) {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        window.location.href = '/admin/login'
      } else {
        localStorage.removeItem('token')
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

export default api
