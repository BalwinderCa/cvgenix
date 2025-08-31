import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../hooks/useAuth'
import { FiUser, FiCreditCard, FiFileText, FiSettings, FiLogOut, FiHeart, FiBriefcase, FiBookOpen, FiAward, FiStar, FiPlus, FiTrash2 } from 'react-icons/fi'
import MainLayout from '../components/layout/MainLayout'

const UserDashboard = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: {
      technical: '',
      soft: '',
      languages: ''
    },
    certifications: [],
    hobbies: '',
    projects: []
  })

  const handleLogout = () => {
    logout()
  }

  // Initialize profile data with user info
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        personalInfo: {
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email || '',
          phone: '',
          location: ''
        }
      }))
    }
  }, [user])

  // Load saved profile data from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem(`profile_${user?.id}`)
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile)
        setProfileData(parsed)
      } catch (error) {
        console.error('Error loading profile data:', error)
      }
    }
  }, [user?.id])

  // Profile form handlers
  const updatePersonalInfo = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }))
  }

  const updateSkills = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [field]: value
      }
    }))
  }

  const addExperience = () => {
    const newExperience = {
      id: Date.now(),
      jobTitle: '',
      company: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: ''
    }
    setProfileData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }))
  }

  const updateExperience = (id, field, value) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const removeExperience = (id) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }))
  }

  const addEducation = () => {
    const newEducation = {
      id: Date.now(),
      degree: '',
      institution: '',
      startYear: '',
      graduationYear: '',
      isCurrent: false,
      gpa: '',
      achievements: ''
    }
    setProfileData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }))
  }

  const updateEducation = (id, field, value) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }))
  }

  const removeEducation = (id) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }))
  }

  const addCertification = () => {
    const newCertification = {
      id: Date.now(),
      name: '',
      organization: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: ''
    }
    setProfileData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCertification]
    }))
  }

  const updateCertification = (id, field, value) => {
    setProfileData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert => 
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    }))
  }

  const removeCertification = (id) => {
    setProfileData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }))
  }

  const addProject = () => {
    const newProject = {
      id: Date.now(),
      name: '',
      description: '',
      technologies: '',
      projectUrl: '',
      githubUrl: '',
      startDate: '',
      endDate: '',
      isCurrent: false
    }
    setProfileData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }))
  }

  const updateProject = (id, field, value) => {
    setProfileData(prev => ({
      ...prev,
      projects: prev.projects.map(project => 
        project.id === id ? { ...project, [field]: value } : project
      )
    }))
  }

  const removeProject = (id) => {
    setProfileData(prev => ({
      ...prev,
      projects: prev.projects.filter(project => project.id !== id)
    }))
  }

  const saveProfile = async () => {
    setIsSaving(true)
    setSaveMessage('')
    
    try {
      // Save to localStorage
      localStorage.setItem(`profile_${user?.id}`, JSON.stringify(profileData))
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSaveMessage('Profile saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage('Error saving profile. Please try again.')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FiUser },
    { id: 'credits', name: 'Credits', icon: FiCreditCard },
    { id: 'profile', name: 'My Profile', icon: FiUser },
    { id: 'settings', name: 'Settings', icon: FiSettings },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Welcome back, {user?.firstName}!</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Available Credits</p>
                      <p className="text-2xl font-bold">{user?.credits || 3}</p>
                    </div>
                    <FiCreditCard className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Resumes Created</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <FiFileText className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Account Status</p>
                      <p className="text-2xl font-bold">Active</p>
                    </div>
                    <FiUser className="w-8 h-8 opacity-80" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:text-orange-600 transition-colors">
                  <FiFileText className="w-6 h-6 mr-2" />
                  <span className="font-medium">Create New Resume</span>
                </button>
                <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:text-orange-600 transition-colors">
                  <FiFileText className="w-6 h-6 mr-2" />
                  <span className="font-medium">Browse Templates</span>
                </button>
              </div>
            </div>
          </div>
        )

      case 'credits':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Credits Management</h3>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Available Credits</p>
                    <p className="text-4xl font-bold">{user?.credits || 3}</p>
                    <p className="text-sm opacity-90 mt-2">Each resume creation uses 1 credit</p>
                  </div>
                  <FiCreditCard className="w-16 h-16 opacity-80" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">How Credits Work</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Each resume creation uses 1 credit</li>
                    <li>• Credits are automatically deducted when you create a resume</li>
                    <li>• You start with 3 free credits</li>
                    <li>• Get more credits by supporting us via "Buy Me a Coffee"</li>
                  </ul>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Get More Credits</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Support our development and get additional credits by buying us a coffee!
                  </p>
                  <a
                    href="https://www.buymeacoffee.com/resume4me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Buy Me a Coffee
                  </a>
                </div>
              </div>
            </div>
          </div>
        )

      case 'profile':
        return (
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FiUser className="w-5 h-5 mr-2" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={profileData.personalInfo.fullName}
                    onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={profileData.personalInfo.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    value={profileData.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input 
                    type="text" 
                    value={profileData.personalInfo.location}
                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                  <input 
                    type="url" 
                    value={profileData.personalInfo.linkedin}
                    onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personal Website</label>
                  <input 
                    type="url" 
                    value={profileData.personalInfo.website}
                    onChange={(e) => updatePersonalInfo('website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                <textarea 
                  rows="3"
                  value={profileData.personalInfo.summary}
                  onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Brief professional summary (2-3 sentences about your career goals and expertise)..."
                />
                <p className="text-xs text-gray-500 mt-1">This will appear at the top of your resume</p>
              </div>
            </div>

            {/* Professional Experience */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FiBriefcase className="w-5 h-5 mr-2" />
                Professional Experience
              </h3>
              <div className="space-y-4">
                {profileData.experience.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FiBriefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No experience added yet</p>
                  </div>
                ) : (
                  profileData.experience.map((exp, index) => (
                    <div key={exp.id} className="border border-gray-200 rounded-lg p-4 relative">
                      <button
                        onClick={() => removeExperience(exp.id)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove experience"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                          <input 
                            type="text" 
                            value={exp.jobTitle}
                            onChange={(e) => updateExperience(exp.id, 'jobTitle', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="e.g., Senior Software Engineer"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                          <input 
                            type="text" 
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="e.g., Google Inc."
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input 
                            type="month" 
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <input 
                            type="month" 
                            value={exp.endDate}
                            onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                            disabled={exp.isCurrent}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                              exp.isCurrent ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="flex items-center">
                          <input 
                            type="checkbox" 
                            checked={exp.isCurrent}
                            onChange={(e) => updateExperience(exp.id, 'isCurrent', e.target.checked)}
                            className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">I currently work here</span>
                        </label>
                        {exp.isCurrent && (
                          <p className="text-xs text-gray-500 mt-1">End date will be hidden and show "Present" on your resume</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea 
                          rows="3"
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Describe your responsibilities and achievements..."
                        />
                      </div>
                    </div>
                  ))
                )}
                <button 
                  onClick={addExperience}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors flex items-center justify-center"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add Experience
                </button>
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FiBookOpen className="w-5 h-5 mr-2" />
                Education
              </h3>
              <div className="space-y-4">
                {profileData.education.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FiBookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No education added yet</p>
                  </div>
                ) : (
                  profileData.education.map((edu, index) => (
                    <div key={edu.id} className="border border-gray-200 rounded-lg p-4 relative">
                      <button
                        onClick={() => removeEducation(edu.id)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove education"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                          <input 
                            type="text" 
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="e.g., Bachelor of Science in Computer Science"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                          <input 
                            type="text" 
                            value={edu.institution}
                            onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="e.g., Stanford University"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                          <input 
                            type="number" 
                            value={edu.startYear}
                            onChange={(e) => updateEducation(edu.id, 'startYear', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="2016"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                          <input 
                            type="number" 
                            value={edu.graduationYear}
                            onChange={(e) => updateEducation(edu.id, 'graduationYear', e.target.value)}
                            disabled={edu.isCurrent}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                              edu.isCurrent ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                            placeholder="2020"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="flex items-center">
                            <input 
                              type="checkbox" 
                              checked={edu.isCurrent}
                              onChange={(e) => updateEducation(edu.id, 'isCurrent', e.target.checked)}
                              className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">Currently studying</span>
                          </label>
                          {edu.isCurrent && (
                            <p className="text-xs text-gray-500 mt-1">Graduation year will show "Expected 2024" on your resume</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">GPA (Optional)</label>
                          <input 
                            type="text" 
                            value={edu.gpa}
                            onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="e.g., 3.8/4.0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Achievements/Activities (Optional)</label>
                        <textarea 
                          rows="2"
                          value={edu.achievements}
                          onChange={(e) => updateEducation(edu.id, 'achievements', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Honors, awards, relevant coursework, extracurricular activities..."
                        />
                      </div>
                    </div>
                  ))
                )}
                <button 
                  onClick={addEducation}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors flex items-center justify-center"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add Education
                </button>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FiStar className="w-5 h-5 mr-2" />
                Skills
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Technical Skills</label>
                  <input 
                    type="text" 
                    value={profileData.skills.technical}
                    onChange={(e) => updateSkills('technical', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., JavaScript, React, Node.js, Python, AWS"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Soft Skills</label>
                  <input 
                    type="text" 
                    value={profileData.skills.soft}
                    onChange={(e) => updateSkills('soft', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., Leadership, Communication, Problem Solving, Team Management"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                  <input 
                    type="text" 
                    value={profileData.skills.languages}
                    onChange={(e) => updateSkills('languages', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., English (Native), Spanish (Fluent), French (Intermediate)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Include proficiency levels</p>
                </div>
              </div>
            </div>

            {/* Projects */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FiFileText className="w-5 h-5 mr-2" />
                Projects & Portfolio
              </h3>
              <div className="space-y-4">
                {profileData.projects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FiFileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No projects added yet</p>
                  </div>
                ) : (
                  profileData.projects.map((project, index) => (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-4 relative">
                      <button
                        onClick={() => removeProject(project.id)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove project"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                          <input 
                            type="text" 
                            value={project.name}
                            onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="e.g., E-commerce Platform"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Technologies Used</label>
                          <input 
                            type="text" 
                            value={project.technologies}
                            onChange={(e) => updateProject(project.id, 'technologies', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="e.g., React, Node.js, MongoDB"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Project URL</label>
                          <input 
                            type="url" 
                            value={project.projectUrl}
                            onChange={(e) => updateProject(project.id, 'projectUrl', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="https://yourproject.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Repository</label>
                          <input 
                            type="url" 
                            value={project.githubUrl}
                            onChange={(e) => updateProject(project.id, 'githubUrl', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="https://github.com/username/project"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input 
                            type="month" 
                            value={project.startDate}
                            onChange={(e) => updateProject(project.id, 'startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <input 
                            type="month" 
                            value={project.endDate}
                            onChange={(e) => updateProject(project.id, 'endDate', e.target.value)}
                            disabled={project.isCurrent}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                              project.isCurrent ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="flex items-center">
                          <input 
                            type="checkbox" 
                            checked={project.isCurrent}
                            onChange={(e) => updateProject(project.id, 'isCurrent', e.target.checked)}
                            className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">Currently working on this project</span>
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Description</label>
                        <textarea 
                          rows="3"
                          value={project.description}
                          onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Describe the project, your role, technologies used, and key achievements..."
                        />
                      </div>
                    </div>
                  ))
                )}
                <button 
                  onClick={addProject}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors flex items-center justify-center"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add Project
                </button>
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FiAward className="w-5 h-5 mr-2" />
                Certifications
              </h3>
              <div className="space-y-4">
                {profileData.certifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FiAward className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No certifications added yet</p>
                  </div>
                ) : (
                  profileData.certifications.map((cert, index) => (
                    <div key={cert.id} className="border border-gray-200 rounded-lg p-4 relative">
                      <button
                        onClick={() => removeCertification(cert.id)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove certification"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
                          <input 
                            type="text" 
                            value={cert.name}
                            onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="e.g., AWS Certified Solutions Architect"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
                          <input 
                            type="text" 
                            value={cert.organization}
                            onChange={(e) => updateCertification(cert.id, 'organization', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="e.g., Amazon Web Services"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                          <input 
                            type="month" 
                            value={cert.issueDate}
                            onChange={(e) => updateCertification(cert.id, 'issueDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                          <input 
                            type="month" 
                            value={cert.expiryDate}
                            onChange={(e) => updateCertification(cert.id, 'expiryDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Credential ID (Optional)</label>
                          <input 
                            type="text" 
                            value={cert.credentialId}
                            onChange={(e) => updateCertification(cert.id, 'credentialId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="e.g., AWS-123456789"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Verification URL (Optional)</label>
                          <input 
                            type="url" 
                            value={cert.credentialUrl}
                            onChange={(e) => updateCertification(cert.id, 'credentialUrl', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="https://verify.aws.com/..."
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <button 
                  onClick={addCertification}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors flex items-center justify-center"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add Certification
                </button>
              </div>
            </div>

            {/* Hobbies & Interests */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FiHeart className="w-5 h-5 mr-2" />
                Hobbies & Interests
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personal Interests</label>
                <textarea 
                  rows="3"
                  value={profileData.hobbies}
                  onChange={(e) => setProfileData(prev => ({ ...prev, hobbies: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Share your hobbies, interests, and activities that showcase your personality..."
                />
                <p className="text-xs text-gray-500 mt-1">This helps personalize your resume and shows cultural fit</p>
              </div>
            </div>

            {/* Save Button */}
            <div className="bg-white rounded-lg shadow p-6">
              {saveMessage && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  saveMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {saveMessage}
                </div>
              )}
              <button 
                onClick={saveProfile}
                disabled={isSaving}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  isSaving 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Profile Information'}
              </button>
            </div>
          </div>
        )

      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{user?.firstName} {user?.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Member Since</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  <FiLogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <MainLayout>
      <Helmet>
        <title>Dashboard - Resume4Me</title>
        <meta name="description" content="Manage your resume builder account and credits" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Top Bar with User Info */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Logo and Branding */}
              <div className="flex items-center space-x-4">
                <img src="/logo.png" className="h-12 w-auto" alt="Resume4me" />
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gradient">Resume4me</span>
                  <span className="text-sm text-muted-foreground">Executive Career Services</span>
                </div>
              </div>
              
              {/* Separator */}
              <div className="mx-8 h-8 w-px bg-gray-300"></div>
              
              {/* Dashboard Info */}
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.firstName}!</p>
              </div>
            </div>
            
            {/* User Info Panel */}
            <div className="flex items-center space-x-4">
              {/* Credits Display */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-orange-50 rounded-lg">
                <FiCreditCard className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Credits:</span>
                <span className="text-orange-600 font-bold">{user?.credits || 3}</span>
              </div>
              
              {/* Buy Me a Coffee Link */}
              <a
                href="https://www.buymeacoffee.com/resume4me"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiHeart className="w-4 h-4" />
                <span>Support Us</span>
              </a>
              
              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <FiUser className="w-4 h-4" />
                  <span>{user?.firstName || 'User'}</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">My Account</h2>
            <p className="text-gray-600 mt-2">Manage your account and resumes</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64">
              <nav className="bg-white rounded-lg shadow">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                        isActive
                          ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.name}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default UserDashboard
