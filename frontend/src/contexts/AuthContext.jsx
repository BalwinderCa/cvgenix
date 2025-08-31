import React, { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: false,
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      }
    case 'LOGIN_FAIL':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const navigate = useNavigate()

  // Set auth token in axios headers
  useEffect(() => {
    if (state.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [state.token])

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (state.token) {
        try {
          const response = await api.get('/api/auth/me')
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: response.data.user, token: state.token },
          })
        } catch (error) {
          localStorage.removeItem('token')
          dispatch({ type: 'LOGIN_FAIL' })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await api.post('/api/auth/login', { email, password })
      
      const { user, token } = response.data
      localStorage.setItem('token', token)
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      })
      
      setShowLoginModal(false)
      toast.success('Welcome back!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      dispatch({ type: 'LOGIN_FAIL' })
      return { success: false, error: message }
    }
  }

  const signup = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await api.post('/api/auth/signup', userData)
      
      const { user, token } = response.data
      localStorage.setItem('token', token)
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      })
      
      setShowSignupModal(false)
      toast.success('Account created successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed'
      toast.error(message)
      dispatch({ type: 'LOGIN_FAIL' })
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully')
    navigate('/')
  }

  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/api/auth/profile', userData)
      dispatch({ type: 'UPDATE_USER', payload: response.data.user })
      toast.success('Profile updated successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const updateCredits = async (newCredits) => {
    try {
      const response = await api.put('/api/auth/credits', { credits: newCredits })
      dispatch({ type: 'UPDATE_USER', payload: response.data.user })
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update credits'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const deductCredit = async () => {
    try {
      const response = await api.post('/api/auth/deduct-credit')
      dispatch({ type: 'UPDATE_USER', payload: response.data.user })
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to deduct credit'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const forgotPassword = async (email) => {
    try {
      await api.post('/api/auth/forgot-password', { email })
      toast.success('Password reset email sent')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const resetPassword = async (token, password) => {
    try {
      await api.post('/api/auth/reset-password', { token, password })
      toast.success('Password reset successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const loginWithGoogle = async (idToken) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await api.post('/api/auth/google', { idToken })
      
      const { user, token } = response.data
      localStorage.setItem('token', token)
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      })
      
      setShowLoginModal(false)
      toast.success('Welcome back!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Google login failed'
      toast.error(message)
      dispatch({ type: 'LOGIN_FAIL' })
      return { success: false, error: message }
    }
  }

  const signupWithGoogle = async (idToken) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await api.post('/api/auth/google/signup', { idToken })
      
      const { user, token } = response.data
      localStorage.setItem('token', token)
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      })
      
      setShowSignupModal(false)
      toast.success('Account created successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Google signup failed'
      toast.error(message)
      dispatch({ type: 'LOGIN_FAIL' })
      return { success: false, error: message }
    }
  }

  const openLoginModal = () => setShowLoginModal(true)
  const closeLoginModal = () => setShowLoginModal(false)
  const openSignupModal = () => setShowSignupModal(true)
  const closeSignupModal = () => setShowSignupModal(false)
  
  // Switch functions that close one modal and open the other
  const switchToSignup = () => {
    setShowLoginModal(false)
    setShowSignupModal(true)
  }
  
  const switchToLogin = () => {
    setShowSignupModal(false)
    setShowLoginModal(true)
  }

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    isAuthenticated: state.isAuthenticated,
    showLoginModal,
    showSignupModal,
    openLoginModal,
    closeLoginModal,
    openSignupModal,
    closeSignupModal,
    switchToSignup,
    switchToLogin,
    login,
    signup,
    loginWithGoogle,
    signupWithGoogle,
    logout,
    updateProfile,
    updateCredits,
    deductCredit,
    forgotPassword,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { AuthContext }
