import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'

const ResumeContext = createContext()

const initialState = {
  resume: {
    id: null,
    templateId: null,
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      website: '',
      about: '',
      avatar: null,
    },
    education: [],
    experience: [],
    skills: [],
    socials: [],
    hobbies: [],
    customSections: [],
  },
  templates: [],
  currentTemplate: null,
  loading: false,
  saving: false,
  previewMode: false,
}

const resumeReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_SAVING':
      return { ...state, saving: action.payload }
    case 'SET_RESUME':
      return { ...state, resume: action.payload }
    case 'UPDATE_PERSONAL_INFO':
      return {
        ...state,
        resume: {
          ...state.resume,
          personalInfo: { ...state.resume.personalInfo, ...action.payload },
        },
      }
    case 'ADD_EDUCATION':
      return {
        ...state,
        resume: {
          ...state.resume,
          education: [...state.resume.education, action.payload],
        },
      }
    case 'UPDATE_EDUCATION':
      return {
        ...state,
        resume: {
          ...state.resume,
          education: state.resume.education.map((edu, index) =>
            index === action.payload.index ? action.payload.data : edu
          ),
        },
      }
    case 'REMOVE_EDUCATION':
      return {
        ...state,
        resume: {
          ...state.resume,
          education: state.resume.education.filter((_, index) => index !== action.payload),
        },
      }
    case 'ADD_EXPERIENCE':
      return {
        ...state,
        resume: {
          ...state.resume,
          experience: [...state.resume.experience, action.payload],
        },
      }
    case 'UPDATE_EXPERIENCE':
      return {
        ...state,
        resume: {
          ...state.resume,
          experience: state.resume.experience.map((exp, index) =>
            index === action.payload.index ? action.payload.data : exp
          ),
        },
      }
    case 'REMOVE_EXPERIENCE':
      return {
        ...state,
        resume: {
          ...state.resume,
          experience: state.resume.experience.filter((_, index) => index !== action.payload),
        },
      }
    case 'ADD_SKILL':
      return {
        ...state,
        resume: {
          ...state.resume,
          skills: [...state.resume.skills, action.payload],
        },
      }
    case 'UPDATE_SKILL':
      return {
        ...state,
        resume: {
          ...state.resume,
          skills: state.resume.skills.map((skill, index) =>
            index === action.payload.index ? action.payload.data : skill
          ),
        },
      }
    case 'REMOVE_SKILL':
      return {
        ...state,
        resume: {
          ...state.resume,
          skills: state.resume.skills.filter((_, index) => index !== action.payload),
        },
      }
    case 'ADD_SOCIAL':
      return {
        ...state,
        resume: {
          ...state.resume,
          socials: [...state.resume.socials, action.payload],
        },
      }
    case 'UPDATE_SOCIAL':
      return {
        ...state,
        resume: {
          ...state.resume,
          socials: state.resume.socials.map((social, index) =>
            index === action.payload.index ? action.payload.data : social
          ),
        },
      }
    case 'REMOVE_SOCIAL':
      return {
        ...state,
        resume: {
          ...state.resume,
          socials: state.resume.socials.filter((_, index) => index !== action.payload),
        },
      }
    case 'ADD_HOBBY':
      return {
        ...state,
        resume: {
          ...state.resume,
          hobbies: [...state.resume.hobbies, action.payload],
        },
      }
    case 'UPDATE_HOBBY':
      return {
        ...state,
        resume: {
          ...state.resume,
          hobbies: state.resume.hobbies.map((hobby, index) =>
            index === action.payload.index ? action.payload.data : hobby
          ),
        },
      }
    case 'REMOVE_HOBBY':
      return {
        ...state,
        resume: {
          ...state.resume,
          hobbies: state.resume.hobbies.filter((_, index) => index !== action.payload),
        },
      }
    case 'SET_TEMPLATES':
      return { ...state, templates: action.payload }
    case 'SET_CURRENT_TEMPLATE':
      return { ...state, currentTemplate: action.payload }
    case 'TOGGLE_PREVIEW_MODE':
      return { ...state, previewMode: !state.previewMode }
    case 'REORDER_SECTION':
      const { section, fromIndex, toIndex } = action.payload
      const sectionArray = [...state.resume[section]]
      const [removed] = sectionArray.splice(fromIndex, 1)
      sectionArray.splice(toIndex, 0, removed)
      return {
        ...state,
        resume: {
          ...state.resume,
          [section]: sectionArray,
        },
      }
    default:
      return state
  }
}

export const ResumeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(resumeReducer, initialState)
  const { id } = useParams()

  // Load templates on mount
  useEffect(() => {
    loadTemplates()
  }, [])

  // Load resume data if editing existing resume
  useEffect(() => {
    if (id && id !== 'new') {
      loadResume(id)
    }
  }, [id])

  const loadTemplates = async () => {
    try {
      const response = await api.get('/api/templates')
      dispatch({ type: 'SET_TEMPLATES', payload: response.data.templates })
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }

  const loadResume = async (resumeId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await api.get(`/api/resumes/${resumeId}`)
      dispatch({ type: 'SET_RESUME', payload: response.data.resume })
      
      // Set current template
      const template = state.templates.find(t => t.id === response.data.resume.templateId)
      if (template) {
        dispatch({ type: 'SET_CURRENT_TEMPLATE', payload: template })
      }
    } catch (error) {
      toast.error('Failed to load resume')
      console.error('Failed to load resume:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const saveResume = async () => {
    try {
      dispatch({ type: 'SET_SAVING', payload: true })
      
      if (state.resume.id) {
        // Update existing resume
        const response = await api.put(`/api/resumes/${state.resume.id}`, state.resume)
        dispatch({ type: 'SET_RESUME', payload: response.data.resume })
      } else {
        // Create new resume
        const response = await api.post('/api/resumes', state.resume)
        dispatch({ type: 'SET_RESUME', payload: response.data.resume })
      }
      
      toast.success('Resume saved successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save resume'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false })
    }
  }

  const exportResume = async (format = 'pdf') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await api.post(`/api/resumes/export`, {
        resume: state.resume,
        format,
      }, {
        responseType: 'blob',
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `resume.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success(`Resume exported as ${format.toUpperCase()}`)
      return { success: true }
    } catch (error) {
      toast.error('Failed to export resume')
      return { success: false, error: error.message }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const updatePersonalInfo = (data) => {
    dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: data })
  }

  const addEducation = (education) => {
    dispatch({ type: 'ADD_EDUCATION', payload: education })
  }

  const updateEducation = (index, data) => {
    dispatch({ type: 'UPDATE_EDUCATION', payload: { index, data } })
  }

  const removeEducation = (index) => {
    dispatch({ type: 'REMOVE_EDUCATION', payload: index })
  }

  const addExperience = (experience) => {
    dispatch({ type: 'ADD_EXPERIENCE', payload: experience })
  }

  const updateExperience = (index, data) => {
    dispatch({ type: 'UPDATE_EXPERIENCE', payload: { index, data } })
  }

  const removeExperience = (index) => {
    dispatch({ type: 'REMOVE_EXPERIENCE', payload: index })
  }

  const addSkill = (skill) => {
    dispatch({ type: 'ADD_SKILL', payload: skill })
  }

  const updateSkill = (index, data) => {
    dispatch({ type: 'UPDATE_SKILL', payload: { index, data } })
  }

  const removeSkill = (index) => {
    dispatch({ type: 'REMOVE_SKILL', payload: index })
  }

  const addSocial = (social) => {
    dispatch({ type: 'ADD_SOCIAL', payload: social })
  }

  const updateSocial = (index, data) => {
    dispatch({ type: 'UPDATE_SOCIAL', payload: { index, data } })
  }

  const removeSocial = (index) => {
    dispatch({ type: 'REMOVE_SOCIAL', payload: index })
  }

  const addHobby = (hobby) => {
    dispatch({ type: 'ADD_HOBBY', payload: hobby })
  }

  const updateHobby = (index, data) => {
    dispatch({ type: 'UPDATE_HOBBY', payload: { index, data } })
  }

  const removeHobby = (index) => {
    dispatch({ type: 'REMOVE_HOBBY', payload: index })
  }

  const setCurrentTemplate = (template) => {
    dispatch({ type: 'SET_CURRENT_TEMPLATE', payload: template })
    if (template) {
      dispatch({ 
        type: 'UPDATE_PERSONAL_INFO', 
        payload: { templateId: template.id } 
      })
    }
  }

  const togglePreviewMode = () => {
    dispatch({ type: 'TOGGLE_PREVIEW_MODE' })
  }

  const reorderSection = (section, fromIndex, toIndex) => {
    dispatch({ 
      type: 'REORDER_SECTION', 
      payload: { section, fromIndex, toIndex } 
    })
  }

  const value = {
    ...state,
    saveResume,
    exportResume,
    updatePersonalInfo,
    addEducation,
    updateEducation,
    removeEducation,
    addExperience,
    updateExperience,
    removeExperience,
    addSkill,
    updateSkill,
    removeSkill,
    addSocial,
    updateSocial,
    removeSocial,
    addHobby,
    updateHobby,
    removeHobby,
    setCurrentTemplate,
    togglePreviewMode,
    reorderSection,
  }

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>
}

export const useResume = () => {
  const context = useContext(ResumeContext)
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider')
  }
  return context
}

export { ResumeContext }
