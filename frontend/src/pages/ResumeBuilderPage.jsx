import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useInView } from 'react-intersection-observer'
import { 
  FiSave, 
  FiDownload, 
  FiEye, 
  FiEyeOff,
  FiPlus,
  FiTrash2,
  FiArrowLeft
} from 'react-icons/fi'
import { useResume } from '../hooks/useResume'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const ResumeBuilderPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { 
    resume, 
    currentTemplate, 
    loading, 
    saving,
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
    saveResume,
    exportResume
  } = useResume()

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [previewMode, setPreviewMode] = useState(false)

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save your resume')
      return
    }

    const result = await saveResume()
    if (result.success) {
      toast.success('Resume saved successfully!')
    }
  }

  const handleExport = async (format) => {
    const result = await exportResume(format)
    if (!result.success) {
      toast.error('Failed to export resume')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resume...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Resume Builder - Resume4Me | Create Your Professional Resume</title>
        <meta name="description" content="Build your professional resume with our easy-to-use builder. Real-time preview and instant PDF download." />
      </Helmet>

      <div className="pt-16 lg:pt-20">
        {/* Header */}
        <section className="bg-white border-b border-gray-100">
          <div className="container-max">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/templates')}
                  className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <FiArrowLeft className="w-5 h-5 mr-2" />
                  Back to Templates
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
                  <p className="text-gray-600">Template: {currentTemplate?.name || 'Modern CV'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="btn-secondary flex items-center"
                >
                  {previewMode ? <FiEyeOff className="w-4 h-4 mr-2" /> : <FiEye className="w-4 h-4 mr-2" />}
                  {previewMode ? 'Edit Mode' : 'Preview'}
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex items-center"
                >
                  <FiSave className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </button>

                <div className="relative group">
                  <button className="btn-primary flex items-center">
                    <FiDownload className="w-4 h-4 mr-2" />
                    Export
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-large border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <button
                        onClick={() => handleExport('pdf')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Download as PDF
                      </button>
                      <button
                        onClick={() => handleExport('png')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Download as PNG
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="section-padding bg-gradient-bg">
          <div className="container-max">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section */}
              <motion.div
                ref={ref}
                initial={{ opacity: 0, x: -30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8 }}
                className={`${previewMode ? 'hidden lg:block' : ''}`}
              >
                <div className="space-y-8">
                  {/* Personal Information */}
                  <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={resume.personalInfo.firstName}
                          onChange={(e) => updatePersonalInfo({ firstName: e.target.value })}
                          className="input-field"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={resume.personalInfo.lastName}
                          onChange={(e) => updatePersonalInfo({ lastName: e.target.value })}
                          className="input-field"
                          placeholder="Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={resume.personalInfo.email}
                          onChange={(e) => updatePersonalInfo({ email: e.target.value })}
                          className="input-field"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={resume.personalInfo.phone}
                          onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
                          className="input-field"
                          placeholder="+1 (234) 567-890"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          About
                        </label>
                        <textarea
                          value={resume.personalInfo.about}
                          onChange={(e) => updatePersonalInfo({ about: e.target.value })}
                          className="input-field resize-none"
                          rows={4}
                          placeholder="Brief professional summary..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Education */}
                  <div className="card">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Education</h2>
                      <button
                        onClick={() => addEducation({
                          school: '',
                          degree: '',
                          field: '',
                          startDate: '',
                          endDate: '',
                          description: ''
                        })}
                        className="btn-secondary flex items-center"
                      >
                        <FiPlus className="w-4 h-4 mr-2" />
                        Add Education
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {resume.education.map((edu, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Education #{index + 1}</h3>
                            <button
                              onClick={() => removeEducation(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                School/University
                              </label>
                              <input
                                type="text"
                                value={edu.school}
                                onChange={(e) => updateEducation(index, { ...edu, school: e.target.value })}
                                className="input-field"
                                placeholder="University of California"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Degree
                              </label>
                              <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => updateEducation(index, { ...edu, degree: e.target.value })}
                                className="input-field"
                                placeholder="Bachelor of Science"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Field of Study
                              </label>
                              <input
                                type="text"
                                value={edu.field}
                                onChange={(e) => updateEducation(index, { ...edu, field: e.target.value })}
                                className="input-field"
                                placeholder="Computer Science"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Graduation Date
                              </label>
                              <input
                                type="text"
                                value={edu.endDate}
                                onChange={(e) => updateEducation(index, { ...edu, endDate: e.target.value })}
                                className="input-field"
                                placeholder="2023"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="card">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Work Experience</h2>
                      <button
                        onClick={() => addExperience({
                          company: '',
                          position: '',
                          startDate: '',
                          endDate: '',
                          description: ''
                        })}
                        className="btn-secondary flex items-center"
                      >
                        <FiPlus className="w-4 h-4 mr-2" />
                        Add Experience
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {resume.experience.map((exp, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Experience #{index + 1}</h3>
                            <button
                              onClick={() => removeExperience(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company
                              </label>
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => updateExperience(index, { ...exp, company: e.target.value })}
                                className="input-field"
                                placeholder="Google"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Position
                              </label>
                              <input
                                type="text"
                                value={exp.position}
                                onChange={(e) => updateExperience(index, { ...exp, position: e.target.value })}
                                className="input-field"
                                placeholder="Software Engineer"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                              </label>
                              <input
                                type="text"
                                value={exp.startDate}
                                onChange={(e) => updateExperience(index, { ...exp, startDate: e.target.value })}
                                className="input-field"
                                placeholder="Jan 2022"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                              </label>
                              <input
                                type="text"
                                value={exp.endDate}
                                onChange={(e) => updateExperience(index, { ...exp, endDate: e.target.value })}
                                className="input-field"
                                placeholder="Present"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                              </label>
                              <textarea
                                value={exp.description}
                                onChange={(e) => updateExperience(index, { ...exp, description: e.target.value })}
                                className="input-field resize-none"
                                rows={3}
                                placeholder="Describe your responsibilities and achievements..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="card">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Skills</h2>
                      <button
                        onClick={() => addSkill({ name: '', level: 'Intermediate' })}
                        className="btn-secondary flex items-center"
                      >
                        <FiPlus className="w-4 h-4 mr-2" />
                        Add Skill
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {resume.skills.map((skill, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) => updateSkill(index, { ...skill, name: e.target.value })}
                            className="flex-1 input-field"
                            placeholder="Skill name"
                          />
                          <select
                            value={skill.level}
                            onChange={(e) => updateSkill(index, { ...skill, level: e.target.value })}
                            className="input-field w-32"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Expert">Expert</option>
                          </select>
                          <button
                            onClick={() => removeSkill(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Preview Section */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`${previewMode ? 'lg:col-span-2' : ''}`}
              >
                <div className="sticky top-24">
                  <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Live Preview</h2>
                    <div className="resume-paper aspect-[8.5/11] p-8 overflow-auto">
                      {/* Resume Preview Content */}
                      <div className="space-y-6">
                        {/* Header */}
                        <div className="text-center border-b border-gray-300 pb-4">
                          <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {resume.personalInfo.firstName} {resume.personalInfo.lastName}
                          </h1>
                          <p className="text-gray-600">{resume.personalInfo.email}</p>
                          <p className="text-gray-600">{resume.personalInfo.phone}</p>
                        </div>

                        {/* About */}
                        {resume.personalInfo.about && (
                          <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">About</h2>
                            <p className="text-gray-700">{resume.personalInfo.about}</p>
                          </div>
                        )}

                        {/* Experience */}
                        {resume.experience.length > 0 && (
                          <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Experience</h2>
                            <div className="space-y-4">
                              {resume.experience.map((exp, index) => (
                                <div key={index}>
                                  <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                                    <span className="text-gray-600 text-sm">
                                      {exp.startDate} - {exp.endDate}
                                    </span>
                                  </div>
                                  <p className="text-gray-600 mb-2">{exp.company}</p>
                                  <p className="text-gray-700 text-sm">{exp.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Education */}
                        {resume.education.length > 0 && (
                          <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Education</h2>
                            <div className="space-y-4">
                              {resume.education.map((edu, index) => (
                                <div key={index}>
                                  <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                                    <span className="text-gray-600 text-sm">{edu.endDate}</span>
                                  </div>
                                  <p className="text-gray-600 mb-1">{edu.school}</p>
                                  <p className="text-gray-700 text-sm">{edu.field}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Skills */}
                        {resume.skills.length > 0 && (
                          <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                              {resume.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                                >
                                  {skill.name} ({skill.level})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default ResumeBuilderPage
