import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useResume } from '../contexts/ResumeContext.jsx';
import { motion } from 'framer-motion';
import { 
  Save, 
  Download, 
  Eye, 
  EyeOff,
  ArrowLeft,
  Plus,
  Trash2,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Mail,
  Phone,
  MapPin,
  Settings,
  FileText,
  Sparkles,
  CheckCircle,
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ResumeBuilder = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentResume, getResume, createResume, updateResume } = useResume();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  
  const [resumeData, setResumeData] = useState({
    title: 'My Professional Resume',
    template: 'modern',
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
      linkedin: '',
      website: '',
      summary: 'Experienced professional with a proven track record of delivering exceptional results. Passionate about innovation and continuous improvement.'
    },
    experience: [
      {
        company: 'Tech Solutions Inc.',
        position: 'Senior Software Engineer',
        location: 'San Francisco, CA',
        startDate: '2022-01',
        endDate: '',
        current: true,
        description: ['Led development of scalable web applications using React and Node.js', 'Mentored junior developers and conducted code reviews', 'Improved application performance by 40% through optimization']
      }
    ],
    education: [
      {
        institution: 'Stanford University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startDate: '2018-09',
        endDate: '2022-05',
        gpa: '3.8',
        description: 'Graduated with honors. Relevant coursework: Data Structures, Algorithms, Software Engineering'
      }
    ],
    skills: [
      { name: 'JavaScript', level: 'expert' },
      { name: 'React', level: 'expert' },
      { name: 'Node.js', level: 'advanced' },
      { name: 'Python', level: 'intermediate' },
      { name: 'AWS', level: 'intermediate' }
    ],
    projects: [
      {
        title: 'E-commerce Platform',
        description: 'Built a full-stack e-commerce platform with React, Node.js, and MongoDB. Features include user authentication, payment processing, and admin dashboard.',
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        link: 'https://github.com/username/ecommerce',
        startDate: '2023-01',
        endDate: '2023-06'
      }
    ],
    certifications: [],
    languages: []
  });

  // Template definitions
  const templates = {
    modern: {
      name: 'Modern Professional',
      description: 'Clean and contemporary design',
      color: 'from-indigo-500 to-purple-600',
      preview: 'bg-gradient-to-br from-indigo-500 to-purple-600'
    },
    classic: {
      name: 'Classic Traditional',
      description: 'Timeless and professional',
      color: 'from-blue-500 to-indigo-600',
      preview: 'bg-gradient-to-br from-blue-500 to-indigo-600'
    },
    creative: {
      name: 'Creative Portfolio',
      description: 'Bold and artistic design',
      color: 'from-purple-500 to-pink-600',
      preview: 'bg-gradient-to-br from-purple-500 to-pink-600'
    },
    minimal: {
      name: 'Minimal Clean',
      description: 'Simple and elegant',
      color: 'from-gray-500 to-slate-600',
      preview: 'bg-gradient-to-br from-gray-500 to-slate-600'
    }
  };

  useEffect(() => {
    const template = searchParams.get('template');
    if (template) {
      setSelectedTemplate(template);
      setResumeData(prev => ({ ...prev, template }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (id) {
      loadResume();
    }
  }, [id]);

  useEffect(() => {
    if (currentResume) {
      setResumeData(currentResume);
    }
  }, [currentResume]);

  const loadResume = async () => {
    setLoading(true);
    await getResume(id);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (id) {
        await updateResume(id, resumeData);
      } else {
        const result = await createResume(resumeData);
        if (result.success) {
          navigate(`/builder/${result.resume._id}`);
        }
      }
    } catch (error) {
      console.error('Error saving resume:', error);
    }
    setSaving(false);
  };

  const handleDownload = () => {
    // TODO: Implement PDF generation and download
    alert('PDF download feature coming soon!');
  };

  const updateField = (section, field, value) => {
    setResumeData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const addItem = (section) => {
    const emptyItem = getEmptyItem(section);
    setResumeData(prev => ({
      ...prev,
      [section]: [...prev[section], emptyItem]
    }));
  };

  const removeItem = (section, index) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const updateItem = (section, index, field, value) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const getEmptyItem = (section) => {
    const emptyItems = {
      experience: {
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ['']
      },
      education: {
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        gpa: '',
        description: ''
      },
      skills: {
        name: '',
        level: 'intermediate'
      },
      projects: {
        title: '',
        description: '',
        technologies: [''],
        link: '',
        startDate: '',
        endDate: ''
      }
    };
    return emptyItems[section];
  };

  const sections = [
    { id: 'personal', name: 'Personal Info', icon: User },
    { id: 'experience', name: 'Experience', icon: Briefcase },
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'skills', name: 'Skills', icon: Award },
    { id: 'projects', name: 'Projects', icon: Globe }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${templates[selectedTemplate]?.preview} rounded-lg flex items-center justify-center`}>
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <input
                  type="text"
                  value={resumeData.title}
                  onChange={(e) => setResumeData(prev => ({ ...prev, title: e.target.value }))}
                  className="text-xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0"
                  placeholder="Resume Title"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="btn-secondary flex items-center space-x-2"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showPreview ? 'Hide Preview' : 'Preview'}</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Template Selector */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Template
                </h2>
                <div className="space-y-3">
                  {Object.entries(templates).map(([key, template]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedTemplate(key);
                        setResumeData(prev => ({ ...prev, template: key }));
                      }}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl border-2 transition-all duration-200 ${
                        selectedTemplate === key
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-8 h-8 ${template.preview} rounded-lg flex items-center justify-center`}>
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">{template.name}</div>
                        <div className="text-sm text-gray-500">{template.description}</div>
                      </div>
                      {selectedTemplate === key && (
                        <CheckCircle className="w-5 h-5 text-indigo-500 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sections Navigation */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sections</h2>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-left transition-all duration-200 ${
                          activeSection === section.id
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{section.name}</span>
                        {activeSection === section.id && (
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              {activeSection === 'personal' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.firstName}
                        onChange={(e) => updateField('personalInfo', 'firstName', e.target.value)}
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
                        value={resumeData.personalInfo.lastName}
                        onChange={(e) => updateField('personalInfo', 'lastName', e.target.value)}
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
                        value={resumeData.personalInfo.email}
                        onChange={(e) => updateField('personalInfo', 'email', e.target.value)}
                        className="input-field"
                        placeholder="john.doe@email.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) => updateField('personalInfo', 'phone', e.target.value)}
                        className="input-field"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={resumeData.personalInfo.linkedin}
                        onChange={(e) => updateField('personalInfo', 'linkedin', e.target.value)}
                        className="input-field"
                        placeholder="linkedin.com/in/johndoe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={resumeData.personalInfo.website}
                        onChange={(e) => updateField('personalInfo', 'website', e.target.value)}
                        className="input-field"
                        placeholder="johndoe.com"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Professional Summary
                    </label>
                    <textarea
                      value={resumeData.personalInfo.summary}
                      onChange={(e) => updateField('personalInfo', 'summary', e.target.value)}
                      className="input-field"
                      rows={4}
                      placeholder="A brief summary of your professional background and career objectives..."
                    />
                  </div>
                </motion.div>
              )}

              {activeSection === 'experience' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Briefcase className="w-5 h-5 mr-2" />
                      Work Experience
                    </h2>
                    <button
                      onClick={() => addItem('experience')}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Experience</span>
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {resumeData.experience.map((exp, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900">Experience {index + 1}</h3>
                          <button
                            onClick={() => removeItem('experience', index)}
                            className="text-red-600 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
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
                              onChange={(e) => updateItem('experience', index, 'company', e.target.value)}
                              className="input-field"
                              placeholder="Company Name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Position
                            </label>
                            <input
                              type="text"
                              value={exp.position}
                              onChange={(e) => updateItem('experience', index, 'position', e.target.value)}
                              className="input-field"
                              placeholder="Job Title"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Location
                            </label>
                            <input
                              type="text"
                              value={exp.location}
                              onChange={(e) => updateItem('experience', index, 'location', e.target.value)}
                              className="input-field"
                              placeholder="City, State"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                              </label>
                              <input
                                type="month"
                                value={exp.startDate}
                                onChange={(e) => updateItem('experience', index, 'startDate', e.target.value)}
                                className="input-field"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                              </label>
                              <input
                                type="month"
                                value={exp.endDate}
                                onChange={(e) => updateItem('experience', index, 'endDate', e.target.value)}
                                className="input-field"
                                disabled={exp.current}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={exp.current}
                              onChange={(e) => updateItem('experience', index, 'current', e.target.checked)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Currently working here</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeSection === 'education' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2" />
                      Education
                    </h2>
                    <button
                      onClick={() => addItem('education')}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Education</span>
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {resumeData.education.map((edu, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900">Education {index + 1}</h3>
                          <button
                            onClick={() => removeItem('education', index)}
                            className="text-red-600 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Institution
                            </label>
                            <input
                              type="text"
                              value={edu.institution}
                              onChange={(e) => updateItem('education', index, 'institution', e.target.value)}
                              className="input-field"
                              placeholder="University Name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Degree
                            </label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => updateItem('education', index, 'degree', e.target.value)}
                              className="input-field"
                              placeholder="Bachelor's Degree"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Field of Study
                            </label>
                            <input
                              type="text"
                              value={edu.fieldOfStudy}
                              onChange={(e) => updateItem('education', index, 'fieldOfStudy', e.target.value)}
                              className="input-field"
                              placeholder="Computer Science"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              GPA
                            </label>
                            <input
                              type="text"
                              value={edu.gpa}
                              onChange={(e) => updateItem('education', index, 'gpa', e.target.value)}
                              className="input-field"
                              placeholder="3.8"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                              </label>
                              <input
                                type="month"
                                value={edu.startDate}
                                onChange={(e) => updateItem('education', index, 'startDate', e.target.value)}
                                className="input-field"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                              </label>
                              <input
                                type="month"
                                value={edu.endDate}
                                onChange={(e) => updateItem('education', index, 'endDate', e.target.value)}
                                className="input-field"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={edu.description}
                            onChange={(e) => updateItem('education', index, 'description', e.target.value)}
                            className="input-field"
                            rows={3}
                            placeholder="Relevant coursework, achievements, or additional information..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeSection === 'skills' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Award className="w-5 h-5 mr-2" />
                      Skills
                    </h2>
                    <button
                      onClick={() => addItem('skills')}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Skill</span>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {resumeData.skills.map((skill, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-200">
                        <input
                          type="text"
                          value={skill.name}
                          onChange={(e) => updateItem('skills', index, 'name', e.target.value)}
                          className="input-field flex-1"
                          placeholder="Skill name"
                        />
                        <select
                          value={skill.level}
                          onChange={(e) => updateItem('skills', index, 'level', e.target.value)}
                          className="input-field w-32"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                        <button
                          onClick={() => removeItem('skills', index)}
                          className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeSection === 'projects' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Globe className="w-5 h-5 mr-2" />
                      Projects
                    </h2>
                    <button
                      onClick={() => addItem('projects')}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Project</span>
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {resumeData.projects.map((project, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900">Project {index + 1}</h3>
                          <button
                            onClick={() => removeItem('projects', index)}
                            className="text-red-600 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Project Title
                            </label>
                            <input
                              type="text"
                              value={project.title}
                              onChange={(e) => updateItem('projects', index, 'title', e.target.value)}
                              className="input-field"
                              placeholder="Project Name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Description
                            </label>
                            <textarea
                              value={project.description}
                              onChange={(e) => updateItem('projects', index, 'description', e.target.value)}
                              className="input-field"
                              rows={3}
                              placeholder="Describe your project..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Project Link
                            </label>
                            <input
                              type="url"
                              value={project.link}
                              onChange={(e) => updateItem('projects', index, 'link', e.target.value)}
                              className="input-field"
                              placeholder="https://github.com/username/project"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                              </label>
                              <input
                                type="month"
                                value={project.startDate}
                                onChange={(e) => updateItem('projects', index, 'startDate', e.target.value)}
                                className="input-field"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                              </label>
                              <input
                                type="month"
                                value={project.endDate}
                                onChange={(e) => updateItem('projects', index, 'endDate', e.target.value)}
                                className="input-field"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Live Resume Preview</h2>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">Template: {templates[selectedTemplate]?.name}</span>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-4xl mx-auto shadow-lg">
                {/* Resume Preview Content - Live Updates */}
                <div className={`text-center mb-8 pb-6 border-b-2 ${selectedTemplate === 'modern' ? 'border-indigo-200' : selectedTemplate === 'classic' ? 'border-blue-200' : selectedTemplate === 'creative' ? 'border-purple-200' : 'border-gray-200'}`}>
                  <h1 className={`text-3xl font-bold mb-2 ${selectedTemplate === 'modern' ? 'text-indigo-900' : selectedTemplate === 'classic' ? 'text-blue-900' : selectedTemplate === 'creative' ? 'text-purple-900' : 'text-gray-900'}`}>
                    {resumeData.personalInfo.firstName || 'Your'} {resumeData.personalInfo.lastName || 'Name'}
                  </h1>
                  <div className="space-y-1 text-gray-600">
                    {resumeData.personalInfo.email && (
                      <p className="flex items-center justify-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {resumeData.personalInfo.email}
                      </p>
                    )}
                    {resumeData.personalInfo.phone && (
                      <p className="flex items-center justify-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {resumeData.personalInfo.phone}
                      </p>
                    )}
                    {resumeData.personalInfo.linkedin && (
                      <p className="flex items-center justify-center">
                        <Globe className="w-4 h-4 mr-2" />
                        {resumeData.personalInfo.linkedin}
                      </p>
                    )}
                    {resumeData.personalInfo.website && (
                      <p className="flex items-center justify-center">
                        <Globe className="w-4 h-4 mr-2" />
                        {resumeData.personalInfo.website}
                      </p>
                    )}
                  </div>
                </div>

                {resumeData.personalInfo.summary && (
                  <div className="mb-6">
                    <h2 className={`text-xl font-semibold mb-3 ${selectedTemplate === 'modern' ? 'text-indigo-800' : selectedTemplate === 'classic' ? 'text-blue-800' : selectedTemplate === 'creative' ? 'text-purple-800' : 'text-gray-800'}`}>
                      Professional Summary
                    </h2>
                    <p className="text-gray-700 leading-relaxed">{resumeData.personalInfo.summary}</p>
                  </div>
                )}

                {resumeData.experience.length > 0 && (
                  <div className="mb-6">
                    <h2 className={`text-xl font-semibold mb-3 ${selectedTemplate === 'modern' ? 'text-indigo-800' : selectedTemplate === 'classic' ? 'text-blue-800' : selectedTemplate === 'creative' ? 'text-purple-800' : 'text-gray-800'}`}>
                      Work Experience
                    </h2>
                    {resumeData.experience.map((exp, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{exp.position || 'Position Title'}</h3>
                          <span className="text-gray-600 text-sm">
                            {exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Start Date'} - {exp.current ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'End Date')}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-1 font-medium">{exp.company || 'Company Name'}{exp.location && `, ${exp.location}`}</p>
                        {exp.description && exp.description.length > 0 && exp.description[0] && (
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 mt-2">
                            {exp.description.map((desc, i) => (
                              <li key={i}>{desc}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {resumeData.education.length > 0 && (
                  <div className="mb-6">
                    <h2 className={`text-xl font-semibold mb-3 ${selectedTemplate === 'modern' ? 'text-indigo-800' : selectedTemplate === 'classic' ? 'text-blue-800' : selectedTemplate === 'creative' ? 'text-purple-800' : 'text-gray-800'}`}>
                      Education
                    </h2>
                    {resumeData.education.map((edu, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {edu.degree || 'Degree'} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                          </h3>
                          <span className="text-gray-600 text-sm">
                            {edu.startDate ? new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Start Date'} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'End Date'}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-1">{edu.institution || 'Institution Name'}</p>
                        {edu.gpa && <p className="text-gray-700 text-sm">GPA: {edu.gpa}</p>}
                        {edu.description && <p className="text-gray-700 text-sm mt-1">{edu.description}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {resumeData.skills.length > 0 && (
                  <div className="mb-6">
                    <h2 className={`text-xl font-semibold mb-3 ${selectedTemplate === 'modern' ? 'text-indigo-800' : selectedTemplate === 'classic' ? 'text-blue-800' : selectedTemplate === 'creative' ? 'text-purple-800' : 'text-gray-800'}`}>
                      Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill, index) => (
                        <span key={index} className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedTemplate === 'modern' 
                            ? 'bg-indigo-100 text-indigo-800' 
                            : selectedTemplate === 'classic' 
                            ? 'bg-blue-100 text-blue-800' 
                            : selectedTemplate === 'creative' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {skill.name || 'Skill'} ({skill.level || 'Level'})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {resumeData.projects.length > 0 && (
                  <div className="mb-6">
                    <h2 className={`text-xl font-semibold mb-3 ${selectedTemplate === 'modern' ? 'text-indigo-800' : selectedTemplate === 'classic' ? 'text-blue-800' : selectedTemplate === 'creative' ? 'text-purple-800' : 'text-gray-800'}`}>
                      Projects
                    </h2>
                    {resumeData.projects.map((project, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{project.title || 'Project Title'}</h3>
                          <span className="text-gray-600 text-sm">
                            {project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Start Date'} - {project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'End Date'}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{project.description || 'Project description'}</p>
                        {project.link && (
                          <p className="text-blue-600 text-sm hover:underline cursor-pointer">{project.link}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Template-specific styling indicators */}
                <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
                  <p>Template: {templates[selectedTemplate]?.name} • Generated with Resume4Me</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;
