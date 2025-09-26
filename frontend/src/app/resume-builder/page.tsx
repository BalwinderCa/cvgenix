"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Download, 
  Save, 
  Eye,
  Plus,
  Trash2,
  Edit,
  Monitor,
  Palette,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowUp,
  Languages,
  FileText,
  CheckSquare,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import NavigationHeader from '@/components/navigation-header';
import FooterSection from '@/components/footer-section';
import { ResumePreview } from '@/components/resume-preview';
import { DatabaseResumePreview } from '@/components/database-resume-preview';
import { TemplateSelector } from '@/components/template-selector';
import { EnhancedSkillsInput } from '@/components/enhanced-skills-input';
import { ResumeSharing } from '@/components/resume-sharing';
import { DraggableSections } from '@/components/draggable-sections';
import { useAutoSave } from '@/hooks/use-autosave';

interface ResumeData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    linkedin: string;
    website: string;
    summary: string;
  };
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    category?: string;
  }>;
  languages: Array<{
    id: string;
    language: string;
    proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Native' | 'Fluent';
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  socialLinks: Array<{
    id: string;
    platform: string;
    url: string;
  }>;
  customSections: Array<{
    id: string;
    title: string;
    content: string;
    type: 'text' | 'list' | 'mixed';
    items?: string[];
  }>;
}

export default function ResumeBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      linkedin: '',
      website: '',
      summary: ''
    },
    experience: [{
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: []
    }],
    education: [{
      id: `edu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: ''
    }],
    skills: [{
      id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      level: 'Intermediate' as const,
      category: ''
    }],
    languages: [],
    certifications: [],
    socialLinks: [],
    customSections: []
  });
  const [loading, setLoading] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState('68d0d4afb43130abbe306950'); // Default to Professional Classic template ID
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('heading');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [sections, setSections] = useState([
    { id: 'heading', title: 'Heading', icon: <User className="w-4 h-4" />, enabled: true, order: 0, required: true },
    { id: 'experience', title: 'Work Experience', icon: <Briefcase className="w-4 h-4" />, enabled: true, order: 1, required: true },
    { id: 'education', title: 'Education', icon: <GraduationCap className="w-4 h-4" />, enabled: true, order: 2, required: true },
    { id: 'skills', title: 'Skills', icon: <Award className="w-4 h-4" />, enabled: true, order: 3, required: true },
    { id: 'summary', title: 'Summary', icon: <FileText className="w-4 h-4" />, enabled: true, order: 4, required: false },
    { id: 'finalize', title: 'Finalize', icon: <CheckSquare className="w-4 h-4" />, enabled: true, order: 5, required: false },
  ]);

  // Load resume data on component mount
  useEffect(() => {
    loadResumeData();
    
    // Check for template parameter in URL
    const templateParam = searchParams.get('template');
    if (templateParam) {
      setCurrentTemplate(templateParam);
    }
  }, [searchParams]);

  const loadResumeData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:3001/api/resumes/current', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure at least one form exists for required sections
        const processedData = {
          ...data,
          experience: data.experience && data.experience.length > 0 ? data.experience : [{
            id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            current: false,
            description: '',
            achievements: []
          }],
          education: data.education && data.education.length > 0 ? data.education : [{
            id: `edu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            institution: '',
            degree: '',
            field: '',
            startDate: '',
            endDate: '',
            gpa: ''
          }],
          skills: data.skills && data.skills.length > 0 ? data.skills : [{
            id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: '',
            level: 'Intermediate' as const,
            category: ''
          }]
        };
        setResumeData(processedData);
        setCurrentResumeId(data._id || data.id);
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Error loading resume data:', error);
    }
  };

  // Auto-save functionality
  const saveResumeToServer = useCallback(async (data: ResumeData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch('http://localhost:3001/api/resumes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...data, templateId: currentTemplate })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Save error:', errorData);
      
      // Handle rate limiting specifically
      if (response.status === 429) {
        const retryAfter = errorData.retryAfter || 1;
        throw new Error(`Rate limited. Please wait ${retryAfter} minute(s) before trying again.`);
      }
      
      throw new Error(errorData.message || 'Failed to save resume');
    }

    setLastSaved(new Date());
    return response.json();
  }, [currentTemplate]);

  const { manualSave, hasUnsavedChanges, isSaving } = useAutoSave({
    data: resumeData,
    onSave: saveResumeToServer,
    interval: 60000, // 60 seconds (increased to reduce API calls)
    enabled: true,
    onSaveSuccess: () => {
      // Subtle success feedback
    },
    onSaveError: (error) => {
      console.error('Auto-save error:', error);
    }
  });

  const saveResume = async () => {
    setLoading(true);
    try {
      await manualSave();
      toast.success('Resume saved successfully!');
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Error saving resume');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setCurrentTemplate(templateId);
    // Auto-save when template changes
    setTimeout(() => {
      manualSave();
    }, 1000);
  };

  const exportToPDF = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/resumes/export/pdf', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resumeData)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resumeData.personalInfo.firstName}_${resumeData.personalInfo.lastName}_Resume.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Resume exported to PDF!');
      } else {
        toast.error('Failed to export resume');
      }
    } catch (error) {
      console.error('Error exporting resume:', error);
      toast.error('Error exporting resume');
    } finally {
      setLoading(false);
    }
  };

  const addExperience = () => {
    const newExperience = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: []
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.length > 1 
        ? prev.experience.filter(exp => exp.id !== id)
        : prev.experience
    }));
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addEducation = () => {
    const newEducation = {
      id: `edu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: ''
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.length > 1 
        ? prev.education.filter(edu => edu.id !== id)
        : prev.education
    }));
  };

  const updateEducation = (id: string, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };


  const handleSectionsChange = (newSections: any[]) => {
    setSections(newSections);
  };

  const handleSectionToggle = (sectionId: string, enabled: boolean) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, enabled } : section
    ));
  };


  // Language functions
  const addLanguage = () => {
    const newLanguage = {
      id: Date.now().toString(),
      language: '',
      proficiency: 'Intermediate' as const
    };
    setResumeData(prev => ({
      ...prev,
      languages: [...prev.languages, newLanguage]
    }));
  };

  const removeLanguage = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang.id !== id)
    }));
  };

  const updateLanguage = (id: string, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      languages: prev.languages.map(lang =>
        lang.id === id ? { ...lang, [field]: value } : lang
      )
    }));
  };

  // Certification functions
  const addCertification = () => {
    const newCertification = {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      date: '',
      url: ''
    };
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCertification]
    }));
  };

  const removeCertification = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }));
  };

  const updateCertification = (id: string, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert =>
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    }));
  };

  // Skill functions
  const addSkill = () => {
    const newSkill = {
      id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      level: 'Intermediate' as const,
      category: ''
    };
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
  };

  const removeSkill = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.length > 1 
        ? prev.skills.filter(skill => skill.id !== id)
        : prev.skills
    }));
  };

  const updateSkill = (id: string, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map(skill =>
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    }));
  };

  // Achievement functions
  const addAchievement = (experienceId: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === experienceId 
          ? { ...exp, achievements: [...exp.achievements, ''] }
          : exp
      )
    }));
  };

  const removeAchievement = (experienceId: string, achievementIndex: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === experienceId 
          ? { ...exp, achievements: exp.achievements.filter((_, index) => index !== achievementIndex) }
          : exp
      )
    }));
  };

  const updateAchievement = (experienceId: string, achievementIndex: number, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === experienceId 
          ? { 
              ...exp, 
              achievements: exp.achievements.map((achievement, index) => 
                index === achievementIndex ? value : achievement
              )
            }
          : exp
      )
    }));
  };

  // Social Links functions
  const addSocialLink = () => {
    const newSocialLink = {
      id: Date.now().toString(),
      platform: '',
      url: ''
    };
    setResumeData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, newSocialLink]
    }));
  };

  const removeSocialLink = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter(link => link.id !== id)
    }));
  };

  const updateSocialLink = (id: string, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map(link =>
        link.id === id ? { ...link, [field]: value } : link
      )
    }));
  };

  // Custom Sections functions
  const addCustomSection = () => {
    const newCustomSection = {
      id: Date.now().toString(),
      title: '',
      content: '',
      type: 'text' as const,
      items: []
    };
    setResumeData(prev => ({
      ...prev,
      customSections: [...prev.customSections, newCustomSection]
    }));
  };

  const removeCustomSection = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.filter(section => section.id !== id)
    }));
  };

  const updateCustomSection = (id: string, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.map(section =>
        section.id === id ? { ...section, [field]: value } : section
      )
    }));
  };

  const addCustomSectionItem = (sectionId: string) => {
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.map(section =>
        section.id === sectionId 
          ? { ...section, items: [...(section.items || []), ''] }
          : section
      )
    }));
  };

  const removeCustomSectionItem = (sectionId: string, itemIndex: number) => {
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.map(section =>
        section.id === sectionId 
          ? { ...section, items: (section.items || []).filter((_, index) => index !== itemIndex) }
          : section
      )
    }));
  };

  const updateCustomSectionItem = (sectionId: string, itemIndex: number, value: string) => {
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.map(section =>
        section.id === sectionId 
          ? { 
              ...section, 
              items: (section.items || []).map((item, index) => 
                index === itemIndex ? value : item
              )
            }
          : section
      )
    }));
  };

  const currentSectionIndex = sections.findIndex(s => s.id === currentTab);
  const currentSection = sections.find(s => s.id === currentTab);
  const progressPercentage = Math.round(((currentSectionIndex + 1) / sections.length) * 100);

  // Check if resume is empty to increase preview height
  const isResumeEmpty = () => {
    return (
      !resumeData.personalInfo.firstName &&
      !resumeData.personalInfo.lastName &&
      !resumeData.personalInfo.email &&
      resumeData.experience.length === 0 &&
      resumeData.education.length === 0 &&
      resumeData.skills.length === 0 &&
      resumeData.languages.length === 0 &&
      resumeData.certifications.length === 0 &&
      resumeData.socialLinks.length === 0 &&
      resumeData.customSections.length === 0
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Main Navigation */}
      <NavigationHeader />
      
      {/* Top Navigation */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40 mt-24 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Header */}
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">Resume Builder</h1>
                <p className="text-xs text-gray-500">Create your professional resume</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {currentResumeId && (
                <ResumeSharing 
                  resumeId={currentResumeId}
                  resumeTitle={`${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}` || 'Resume'}
                />
              )}
            </div>
          </div>

          {/* Progress Stepper */}
          <div className="border-t border-gray-100 py-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">
                  Step {currentSectionIndex + 1} of {sections.length}
                </span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-600 font-medium">{currentSection?.title}</span>
              </div>
              <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">{progressPercentage}% Complete</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
              {sections
                .filter(section => section.enabled)
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <React.Fragment key={section.id}>
                    <button
                      onClick={() => setCurrentTab(section.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap group ${
                        currentTab === section.id
                          ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                        currentTab === section.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : index < currentSectionIndex
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                      }`}>
                        {index < currentSectionIndex ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <span className="hidden sm:block">{section.title}</span>
                    </button>
                    {index < sections.filter(s => s.enabled).length - 1 && (
                      <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />
                    )}
                  </React.Fragment>
                ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Form Section */}
          <div className="space-y-8 relative">

            {/* Heading Section */}
            {currentTab === 'heading' && (
              <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl font-semibold text-gray-900 mb-2">What's the best way for employers to contact you?</CardTitle>
                  <p className="text-sm text-gray-600">We'll use this information to help employers reach out to you.</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                      <Input
                        id="firstName"
                        value={resumeData.personalInfo.firstName}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, firstName: e.target.value }
                        }))}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                      <Input
                        id="lastName"
                        value={resumeData.personalInfo.lastName}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, lastName: e.target.value }
                        }))}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, email: e.target.value }
                        }))}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
                      <Input
                        id="phone"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, phone: e.target.value }
                        }))}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={resumeData.personalInfo.address}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, address: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={resumeData.personalInfo.city}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, city: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="province">Province</Label>
                      <Input
                        id="province"
                        value={resumeData.personalInfo.province}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, province: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={resumeData.personalInfo.postalCode}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, postalCode: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={resumeData.personalInfo.linkedin}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={resumeData.personalInfo.website}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, website: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Work Experience Section */}
            {currentTab === 'experience' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Work Experience
                    </CardTitle>
                    <Button onClick={addExperience}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Experience
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resumeData.experience.map((exp, index) => (
                    <Card key={exp.id} className="border">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-semibold">Experience #{index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExperience(exp.id)}
                            disabled={resumeData.experience.length === 1}
                            className={resumeData.experience.length === 1 ? "opacity-50 cursor-not-allowed" : ""}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Company</Label>
                            <Input
                              value={exp.company}
                              onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Position</Label>
                            <Input
                              value={exp.position}
                              onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={exp.startDate}
                              onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input
                              type="date"
                              value={exp.endDate}
                              onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                              disabled={exp.current}
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <Label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={exp.current}
                              onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                            />
                            Currently working here
                          </Label>
                        </div>
                        <div className="mt-4">
                          <Label>Description</Label>
                          <Textarea
                            rows={3}
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                            placeholder="Describe your responsibilities and achievements..."
                          />
                        </div>
                        
                        {/* Achievements Section */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <Label>Key Achievements</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addAchievement(exp.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Achievement
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {exp.achievements.map((achievement, achievementIndex) => (
                              <div key={achievementIndex} className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                                <Input
                                  value={achievement}
                                  onChange={(e) => updateAchievement(exp.id, achievementIndex, e.target.value)}
                                  placeholder="e.g., Increased sales by 25% through strategic initiatives"
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAchievement(exp.id, achievementIndex)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                            {exp.achievements.length === 0 && (
                              <p className="text-sm text-gray-500 italic">
                                Add specific achievements to make your experience stand out
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {resumeData.experience.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No work experience added yet.</p>
                      <p className="text-sm">Click "Add Experience" to get started.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Education Section */}
            {currentTab === 'education' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Education
                    </CardTitle>
                    <Button onClick={addEducation}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Education
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resumeData.education.map((edu, index) => (
                    <Card key={edu.id} className="border">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-semibold">Education #{index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEducation(edu.id)}
                            disabled={resumeData.education.length === 1}
                            className={resumeData.education.length === 1 ? "opacity-50 cursor-not-allowed" : ""}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Institution</Label>
                            <Input
                              value={edu.institution}
                              onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Degree</Label>
                            <Input
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label>Field of Study</Label>
                            <Input
                              value={edu.field}
                              onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>GPA (Optional)</Label>
                            <Input
                              value={edu.gpa || ''}
                              onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={edu.startDate}
                              onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input
                              type="date"
                              value={edu.endDate}
                              onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {resumeData.education.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No education added yet.</p>
                      <p className="text-sm">Click "Add Education" to get started.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Skills Section */}
            {currentTab === 'skills' && (
              <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                      <Award className="w-5 h-5" />
                      Skills
                    </CardTitle>
                    <Button onClick={addSkill} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Skill
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {resumeData.skills.map((skill, index) => (
                    <Card key={skill.id} className="border border-gray-200 shadow-sm">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">Skill #{index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSkill(skill.id)}
                            disabled={resumeData.skills.length === 1}
                            className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${resumeData.skills.length === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Skill Name</Label>
                              <Input
                                value={skill.name}
                                onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                                placeholder="e.g., Project Management, Customer Service, Data Analysis"
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Proficiency Level</Label>
                              <select
                                value={skill.level}
                                onChange={(e) => updateSkill(skill.id, 'level', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                              >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Expert">Expert</option>
                              </select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Category (Optional)</Label>
                            <select
                              value={skill.category || ''}
                              onChange={(e) => updateSkill(skill.id, 'category', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                            >
                              <option value="">Select Category</option>
                              <option value="Technical Skills">Technical Skills</option>
                              <option value="Soft Skills">Soft Skills</option>
                              <option value="Languages">Languages</option>
                              <option value="Software">Software</option>
                              <option value="Management">Management</option>
                              <option value="Sales & Marketing">Sales & Marketing</option>
                              <option value="Finance & Accounting">Finance & Accounting</option>
                              <option value="Healthcare">Healthcare</option>
                              <option value="Education">Education</option>
                              <option value="Creative & Design">Creative & Design</option>
                              <option value="Communication">Communication</option>
                              <option value="Analytical">Analytical</option>
                              <option value="Leadership">Leadership</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          {/* Skill Level Visual Indicator */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Proficiency</Label>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    skill.level === 'Beginner' ? 'w-1/4 bg-red-400' :
                                    skill.level === 'Intermediate' ? 'w-1/2 bg-yellow-400' :
                                    skill.level === 'Advanced' ? 'w-3/4 bg-blue-400' :
                                    'w-full bg-green-400'
                                  }`}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-600 min-w-[80px]">{skill.level}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {resumeData.skills.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No skills added yet</h3>
                      <p className="text-sm text-gray-600 mb-4">Add your skills with proficiency levels to showcase your expertise across all areas.</p>
                      <Button onClick={addSkill} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Skill
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Summary Section */}
            {currentTab === 'summary' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Professional Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    rows={6}
                    value={resumeData.personalInfo.summary}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, summary: e.target.value }
                    }))}
                    placeholder="Write a brief summary of your professional background, key skills, and career objectives..."
                  />
                </CardContent>
              </Card>
            )}





            {/* Finalize Section */}
            {currentTab === 'finalize' && (
              <div className="space-y-8">
                {/* Resume Completeness Check */}
                <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                      <CheckSquare className="w-5 h-5" />
                      Resume Completeness
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        {resumeData.personalInfo.firstName && resumeData.personalInfo.lastName ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                        )}
                        <span className={resumeData.personalInfo.firstName && resumeData.personalInfo.lastName ? 'text-green-700' : 'text-orange-700'}>
                          Personal Information
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {resumeData.experience.length > 0 ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                        )}
                        <span className={resumeData.experience.length > 0 ? 'text-green-700' : 'text-orange-700'}>
                          Work Experience ({resumeData.experience.length} entries)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {resumeData.education.length > 0 ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                        )}
                        <span className={resumeData.education.length > 0 ? 'text-green-700' : 'text-orange-700'}>
                          Education ({resumeData.education.length} entries)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {resumeData.skills.length > 0 ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                        )}
                        <span className={resumeData.skills.length > 0 ? 'text-green-700' : 'text-orange-700'}>
                          Skills ({resumeData.skills.length} skills)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {resumeData.personalInfo.summary ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                        )}
                        <span className={resumeData.personalInfo.summary ? 'text-green-700' : 'text-orange-700'}>
                          Professional Summary
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Languages Section */}
                <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                        <Languages className="w-5 h-5" />
                        Languages
                      </CardTitle>
                      <Button onClick={addLanguage} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Language
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {resumeData.languages.map((lang, index) => (
                      <Card key={lang.id} className="border border-gray-200 shadow-sm">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-semibold text-gray-900">Language #{index + 1}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLanguage(lang.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Language</Label>
                                <Input
                                  value={lang.language}
                                  onChange={(e) => updateLanguage(lang.id, 'language', e.target.value)}
                                  placeholder="e.g., Spanish, French, Mandarin"
                                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Proficiency Level</Label>
                                <select
                                  value={lang.proficiency}
                                  onChange={(e) => updateLanguage(lang.id, 'proficiency', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                                >
                                  <option value="Beginner">Beginner</option>
                                  <option value="Intermediate">Intermediate</option>
                                  <option value="Advanced">Advanced</option>
                                  <option value="Native">Native</option>
                                  <option value="Fluent">Fluent</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {resumeData.languages.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Languages className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No languages added yet.</p>
                        <p className="text-sm">Click "Add Language" to get started.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Certifications Section */}
                <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                        <Award className="w-5 h-5" />
                        Certifications
                      </CardTitle>
                      <Button onClick={addCertification} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Certification
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {resumeData.certifications.map((cert, index) => (
                      <Card key={cert.id} className="border border-gray-200 shadow-sm">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-semibold text-gray-900">Certification #{index + 1}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCertification(cert.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Certification Name</Label>
                                <Input
                                  value={cert.name}
                                  onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                                  placeholder="e.g., PMP Certification, CPA License, CPR Certification"
                                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Issuing Organization</Label>
                                <Input
                                  value={cert.issuer}
                                  onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                                  placeholder="e.g., Project Management Institute, American Red Cross"
                                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Issue Date</Label>
                                <Input
                                  type="date"
                                  value={cert.date}
                                  onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Credential URL (Optional)</Label>
                                <Input
                                  value={cert.url || ''}
                                  onChange={(e) => updateCertification(cert.id, 'url', e.target.value)}
                                  placeholder="https://credential-url.com"
                                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {resumeData.certifications.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No certifications added yet.</p>
                        <p className="text-sm">Click "Add Certification" to get started.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Social Links Section */}
                <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                        <User className="w-5 h-5" />
                        Social Links
                      </CardTitle>
                      <Button onClick={addSocialLink} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Social Link
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {resumeData.socialLinks.map((link, index) => (
                      <Card key={link.id} className="border border-gray-200 shadow-sm">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-semibold text-gray-900">Social Link #{index + 1}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSocialLink(link.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Platform</Label>
                                <select
                                  value={link.platform}
                                  onChange={(e) => updateSocialLink(link.id, 'platform', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                                >
                                  <option value="">Select Platform</option>
                                  <option value="LinkedIn">LinkedIn</option>
                                  <option value="Portfolio">Portfolio</option>
                                  <option value="Website">Personal Website</option>
                                  <option value="GitHub">GitHub</option>
                                  <option value="Behance">Behance</option>
                                  <option value="Dribbble">Dribbble</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Twitter">Twitter</option>
                                  <option value="Instagram">Instagram</option>
                                  <option value="Facebook">Facebook</option>
                                  <option value="YouTube">YouTube</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">URL</Label>
                                <Input
                                  value={link.url}
                                  onChange={(e) => updateSocialLink(link.id, 'url', e.target.value)}
                                  placeholder="https://..."
                                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                                />
                              </div>
                            </div>
                            {link.url && (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Preview:</p>
                                <a 
                                  href={link.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  {link.platform || 'Social Link'} - {link.url}
                                </a>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {resumeData.socialLinks.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No social links added yet.</p>
                        <p className="text-sm">Click "Add Social Link" to get started.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Custom Sections */}
                <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                        <FileText className="w-5 h-5" />
                        Custom Sections
                      </CardTitle>
                      <Button onClick={addCustomSection} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Custom Section
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Create your own sections for volunteer work, awards, publications, or any other information you want to include.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {resumeData.customSections.map((section, index) => (
                      <Card key={section.id} className="border border-gray-200 shadow-sm">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-semibold text-gray-900">Custom Section #{index + 1}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCustomSection(section.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Section Title</Label>
                                <Input
                                  value={section.title}
                                  onChange={(e) => updateCustomSection(section.id, 'title', e.target.value)}
                                  placeholder="e.g., Volunteer Work, Awards, Publications, References"
                                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Content Type</Label>
                                <select
                                  value={section.type}
                                  onChange={(e) => updateCustomSection(section.id, 'type', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                                >
                                  <option value="text">Text/Paragraph</option>
                                  <option value="list">Bullet Points</option>
                                  <option value="mixed">Text + Bullet Points</option>
                                </select>
                              </div>
                            </div>
                            
                            {/* Text Content */}
                            {(section.type === 'text' || section.type === 'mixed') && (
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Description</Label>
                                <Textarea
                                  rows={3}
                                  value={section.content}
                                  onChange={(e) => updateCustomSection(section.id, 'content', e.target.value)}
                                  placeholder="Describe your activities, achievements, or any relevant information..."
                                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                                />
                              </div>
                            )}

                            {/* List Items */}
                            {(section.type === 'list' || section.type === 'mixed') && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm font-medium text-gray-700">Items</Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addCustomSectionItem(section.id)}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Item
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  {(section.items || []).map((item, itemIndex) => (
                                    <div key={itemIndex} className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                                      <Input
                                        value={item}
                                        onChange={(e) => updateCustomSectionItem(section.id, itemIndex, e.target.value)}
                                        placeholder="Enter item description..."
                                        className="flex-1"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeCustomSectionItem(section.id, itemIndex)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))}
                                  {(section.items || []).length === 0 && (
                                    <p className="text-sm text-gray-500 italic">
                                      Add bullet points to organize your information
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Preview */}
                            {(section.title || section.content || (section.items && section.items.length > 0)) && (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-2 font-medium">Preview:</p>
                                <div className="text-sm">
                                  {section.title && (
                                    <h4 className="font-semibold text-gray-900 mb-2">{section.title}</h4>
                                  )}
                                  {section.content && (
                                    <p className="text-gray-700 mb-2">{section.content}</p>
                                  )}
                                  {section.items && section.items.length > 0 && (
                                    <ul className="space-y-1">
                                      {section.items.map((item, itemIndex) => (
                                        <li key={itemIndex} className="flex items-start">
                                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                                          <span className="text-gray-700">{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {resumeData.customSections.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No custom sections added yet.</p>
                        <p className="text-sm">Click "Add Custom Section" to get started.</p>
                        <div className="text-xs text-gray-500 mt-2">
                          Popular examples: Volunteer Work, Awards, Publications, References, Professional Memberships
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Resume Statistics */}
                <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                      <Sparkles className="w-5 h-5" />
                      Resume Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{resumeData.experience.length}</div>
                        <div className="text-sm text-blue-700">Work Experiences</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{resumeData.skills.length}</div>
                        <div className="text-sm text-green-700">Skills Listed</div>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{resumeData.languages.length}</div>
                        <div className="text-sm text-orange-700">Languages</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{resumeData.certifications.length}</div>
                        <div className="text-sm text-purple-700">Certifications</div>
                      </div>
                      <div className="p-4 bg-indigo-50 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">{resumeData.socialLinks.length}</div>
                        <div className="text-sm text-indigo-700">Social Links</div>
                      </div>
                      <div className="p-4 bg-teal-50 rounded-lg">
                        <div className="text-2xl font-bold text-teal-600">{resumeData.customSections.length}</div>
                        <div className="text-sm text-teal-700">Custom Sections</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Export Options */}
                <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                      <Download className="w-5 h-5" />
                      Export Your Resume
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const isResumeComplete = 
                        resumeData.personalInfo.firstName && 
                        resumeData.personalInfo.lastName && 
                        resumeData.personalInfo.email && 
                        (resumeData.experience.length > 0 || resumeData.education.length > 0) && 
                        resumeData.skills.length > 0;

                      if (!isResumeComplete) {
                        return (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-amber-900">Resume Not Ready for Export</h4>
                                <p className="text-sm text-amber-800 mt-1">
                                  Please complete the required sections (Personal Info, Experience/Education, and Skills) before exporting your resume.
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 gap-3">
                          <Button 
                            onClick={exportToPDF} 
                            disabled={loading}
                            className="w-full justify-start"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download as PDF
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => window.print()}
                            className="w-full justify-start"
                          >
                            <Monitor className="w-4 h-4 mr-2" />
                            Print Resume
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={saveResume}
                            disabled={loading || isSaving}
                            className="w-full justify-start"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save Resume'}
                          </Button>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Tips */}
                <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                      <Sparkles className="w-5 h-5" />
                      Final Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">💡 Final Tips</h4>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        <li>• Review your resume for typos and formatting</li>
                        <li>• Ensure all dates and information are accurate</li>
                        <li>• Tailor your skills and experience to match job requirements</li>
                        <li>• Use strong action verbs in your experience descriptions</li>
                        <li>• Keep your resume to 1-2 pages maximum</li>
                        <li>• Highlight relevant achievements and quantifiable results</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="space-y-8">
            {/* Preview Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-semibold text-gray-900">Live Preview</h3>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  {currentTemplate}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <TemplateSelector 
                  currentTemplate={currentTemplate}
                  onTemplateChange={handleTemplateChange}
                />
              </div>
            </div>
            
            {/* Preview Content */}
            <div className="w-full">
              <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${isResumeEmpty() ? 'min-h-[300px]' : ''}`}>
                <DatabaseResumePreview 
                  data={resumeData as any}
                  templateId={currentTemplate}
                />
              </div>
            </div>

            {/* Progress Navigation Button */}
            <div className="flex justify-center gap-4">
              {currentTab === 'heading' ? (
                // For heading section, show full preview and next button
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Full Preview
                  </Button>
                  <Button
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === currentTab);
                      if (currentIndex < sections.length - 1) {
                        setCurrentTab(sections[currentIndex + 1].id);
                      }
                    }}
                    disabled={currentSectionIndex === sections.length - 1}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 mr-2" />
                    Next: {sections[currentSectionIndex + 1]?.title || 'Complete'}
                  </Button>
                </>
              ) : (
                // For other sections, show three buttons
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === currentTab);
                      if (currentIndex > 0) {
                        setCurrentTab(sections[currentIndex - 1].id);
                      }
                    }}
                    disabled={currentSectionIndex === 0}
                    className="px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Full Preview
                  </Button>
                  <Button
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === currentTab);
                      if (currentIndex < sections.length - 1) {
                        setCurrentTab(sections[currentIndex + 1].id);
                      }
                    }}
                    disabled={currentSectionIndex === sections.length - 1}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 mr-2" />
                    Next: {sections[currentSectionIndex + 1]?.title || 'Complete'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Full Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Full Resume Preview
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <DatabaseResumePreview 
              data={resumeData as any}
              templateId={currentTemplate}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Footer */}
      <div className="mt-20">
        <FooterSection />
      </div>
    </div>
  );
}

