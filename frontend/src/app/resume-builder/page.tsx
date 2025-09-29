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
  FileText,
  Sparkles,
  ArrowUp,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import NavigationHeader from '@/components/navigation-header';
import FooterSection from '@/components/footer-section';
import { DatabaseResumePreview } from '@/components/database-resume-preview';
import { DraggableResumePreview } from '@/components/draggable-resume-preview';
import TemplateSidebar from '@/components/template-sidebar';
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
  const [currentTemplate, setCurrentTemplate] = useState(''); // No template selected initially
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [isVisualMode, setIsVisualMode] = useState(false);
  const [currentTab, setCurrentTab] = useState('heading');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [showTemplateSelection, setShowTemplateSelection] = useState(true);
  const [hasExistingResume, setHasExistingResume] = useState(false);
  const [showTemplateSidebar, setShowTemplateSidebar] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Load resume data on component mount
  useEffect(() => {
    loadResumeData();
    
    // Check for template parameter in URL
    const templateParam = searchParams.get('template');
    if (templateParam) {
      setCurrentTemplate(templateParam);
      setShowTemplateSelection(false); // Skip template selection if template is specified in URL
      // Template provided in URL
    }
  }, [searchParams]);

  const loadResumeData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // If user is logged in, try to load existing resume data
      if (token) {
        const response = await fetch('http://localhost:3001/api/resumes/current', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          // Check if user has existing resume data
          const hasData = data.personalInfo?.firstName || 
                        data.personalInfo?.lastName || 
                        data.personalInfo?.email ||
                        (data.experience && data.experience.length > 0 && data.experience[0].company) ||
                        (data.education && data.education.length > 0 && data.education[0].institution) ||
                        (data.skills && data.skills.length > 0 && data.skills[0].name);
          
          setHasExistingResume(hasData);
          
          // If user has existing resume data, skip template selection
          if (hasData) {
            setShowTemplateSelection(false);
          }
          
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
        } else {
          // No existing resume found, show template selection
          setHasExistingResume(false);
        }
      } else {
        // User not logged in, show template selection
        setHasExistingResume(false);
      }
    } catch (error) {
      console.error('Error loading resume data:', error);
      setHasExistingResume(false);
    }
  };

  // Auto-save functionality
  const saveResumeToServer = useCallback(async (data: ResumeData) => {
    const token = localStorage.getItem('token');
    
    // If user is not logged in, save to localStorage only
    if (!token) {
      localStorage.setItem('resumeData', JSON.stringify({ ...data, templateId: currentTemplate }));
      setLastSaved(new Date());
      return { success: true, message: 'Saved locally (login to sync across devices)' };
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

  const handleSelectTemplate = (templateId: string) => {
    setCurrentTemplate(templateId);
    setShowTemplateSelection(false);
  };

  const handleEditExistingResume = () => {
    setShowTemplateSelection(false);
  };

  const handleStartFresh = () => {
    // Reset resume data to empty state
    setResumeData({
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
    setShowTemplateSelection(false);
  };

  // Fallback template if the current one doesn't exist
  const getValidTemplate = (templateId: string) => {
    // Return the template ID if it exists, otherwise return empty string
    return templateId || '';
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







  // Check if resume is empty to increase preview height
  const isResumeEmpty = () => {
    return (
      !resumeData.personalInfo.firstName &&
      !resumeData.personalInfo.lastName &&
      !resumeData.personalInfo.email &&
      resumeData.experience.length === 0 &&
      resumeData.education.length === 0 &&
      resumeData.skills.length === 0
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Navigation */}
      <NavigationHeader />
      
      {/* Template Selection Screen */}
      {showTemplateSelection && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="text-center mb-8 sm:mb-16 mt-8 sm:mt-15">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {hasExistingResume ? 'Choose Your Path' : 'Create Your Resume'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {hasExistingResume 
                ? 'You have an existing resume. Would you like to edit it or start fresh with a new template?'
                : 'Choose a template to get started or start building your resume from scratch.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Upload Resume Option */}
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Upload Your Resume
                </h3>
                <p className="text-gray-600 mb-6">
                  Transform your resume with smart AI analysis.
                </p>
                <Button 
                  onClick={() => router.push('/konva')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resume
                </Button>
              </CardContent>
            </Card>

            {/* Edit Existing Resume Option */}
            {hasExistingResume && (
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-green-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Edit className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Edit Existing Resume
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Continue working on your current resume with all your existing information.
                  </p>
                  <Button 
                    onClick={() => router.push('/konva')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit My Resume
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Start from Scratch Option */}
            {!hasExistingResume && (
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-purple-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Start from Scratch
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create a stunning resume from scratch with<br />
                    our intuitive step-by-step builder.
                  </p>
                  <Button 
                    onClick={() => router.push('/konva')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Start Building
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

        </main>
      )}

      {/* Upload Resume Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Your Resume
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Drop your resume here</p>
              <p className="text-sm text-gray-600 mb-4">or click to browse files</p>
              <Button variant="outline" className="w-full">
                Choose File
              </Button>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Supported formats: PDF, DOC, DOCX (Max 10MB)
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowUploadModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // TODO: Handle file upload
                  setShowUploadModal(false);
                  toast.success('Resume uploaded successfully!');
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Upload & Analyze
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resume Builder Interface */}
      {!showTemplateSelection && (
        <main className="flex h-screen">
          {/* Template Sidebar */}
          {showTemplateSidebar && (
            <TemplateSidebar
              currentTemplateId={currentTemplate}
              onTemplateSelect={handleTemplateChange}
            />
          )}
          
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto ml-4 pt-6">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
              {/* Preview Section */}
              <div className="space-y-8">
                
                {/* Preview Content */}
                <div className="w-full">
                  {!currentTemplate || currentTemplate === '' ? (
                    <div 
                      className="bg-white rounded-2md shadow-xl overflow-hidden flex items-center justify-center"
                      style={{ width: '680px', height: '850px', margin: '2rem auto 0 auto' }}
                    >
                      <div className="text-center p-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Template Selected</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Please select a template from the sidebar to see your resume preview.
                        </p>
                        <Button
                          onClick={() => setShowTemplateSelection(true)}
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <Palette className="w-4 h-4 mr-2" />
                          Choose Template
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full">
                      <DatabaseResumePreview 
                        templateId={getValidTemplate(currentTemplate)}
                        editable={true}
                        data={resumeData}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsPreviewModalOpen(true)}
                    disabled={!currentTemplate || currentTemplate === ''}
                    className="px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Full Preview
                  </Button>
                  <Button
                    onClick={exportToPDF}
                    disabled={loading || !currentTemplate || currentTemplate === ''}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      
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
              templateId={getValidTemplate(currentTemplate)}
              editable={true}
              data={resumeData}
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