"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText,
  Loader2,
  Eye,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

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

interface DatabaseTemplate {
  _id: string;
  name: string;
  description: string;
  category: string;
  html: string;
  css: string;
  isPremium: boolean;
  features: string[];
  tags: string[];
  rating: {
    average: number;
    count: number;
  };
  usageCount: number;
}

interface DatabaseResumePreviewProps {
  data: ResumeData;
  templateId: string;
  className?: string;
}

export function DatabaseResumePreview({ data, templateId, className = '' }: DatabaseResumePreviewProps) {
  const [template, setTemplate] = useState<DatabaseTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [hasLoaded, setHasLoaded] = useState(false);

  // Helper function to merge user data with sample data
  const mergeUserDataWithSample = (userData: any, sampleData: any) => {
    const merged = JSON.parse(JSON.stringify(sampleData)); // Deep clone sample data
    
    // Merge personal info (only replace non-empty fields)
    if (userData.personalInfo) {
      Object.keys(userData.personalInfo).forEach(key => {
        if (userData.personalInfo[key] && userData.personalInfo[key].trim() !== '') {
          merged.personalInfo[key] = userData.personalInfo[key];
        }
      });
    }
    
    // Merge experience (replace with user data if it has content)
    if (userData.experience && userData.experience.length > 0) {
      const hasValidExperience = userData.experience.some((exp: any) => 
        exp.company || exp.position || exp.description
      );
      if (hasValidExperience) {
        merged.experience = userData.experience;
      }
    }
    
    // Merge education (replace with user data if it has content)
    if (userData.education && userData.education.length > 0) {
      const hasValidEducation = userData.education.some((edu: any) => 
        edu.institution || edu.degree || edu.field
      );
      if (hasValidEducation) {
        merged.education = userData.education;
      }
    }
    
    // Merge skills (replace with user data if it has content)
    if (userData.skills && userData.skills.length > 0) {
      const hasValidSkills = userData.skills.some((skill: any) => skill.name);
      if (hasValidSkills) {
        merged.skills = userData.skills;
      }
    }
    
    // Merge languages (replace with user data if it has content)
    if (userData.languages && userData.languages.length > 0) {
      merged.languages = userData.languages;
    }
    
    // Merge certifications (replace with user data if it has content)
    if (userData.certifications && userData.certifications.length > 0) {
      merged.certifications = userData.certifications;
    }
    
    // Merge social links (replace with user data if it has content)
    if (userData.socialLinks && userData.socialLinks.length > 0) {
      merged.socialLinks = userData.socialLinks;
    }
    
    // Merge custom sections (replace with user data if it has content)
    if (userData.customSections && userData.customSections.length > 0) {
      merged.customSections = userData.customSections;
    }
    
    return merged;
  };

  // Check if resume is empty
  const isResumeEmpty = () => {
    // Check personal info
    const hasPersonalInfo = data.personalInfo.firstName || 
                           data.personalInfo.lastName || 
                           data.personalInfo.email || 
                           data.personalInfo.phone ||
                           data.personalInfo.summary;

    // Check if experience has actual data (not just empty objects)
    const hasExperience = data.experience.some(exp => 
      exp.company || exp.position || exp.description || exp.achievements.length > 0
    );

    // Check if education has actual data
    const hasEducation = data.education.some(edu => 
      edu.institution || edu.degree || edu.field
    );

    // Check if skills have actual data
    const hasSkills = data.skills.some(skill => skill.name);

    // Check other arrays
    const hasOtherData = data.languages.length > 0 || 
                        data.certifications.length > 0 || 
                        data.socialLinks.length > 0 || 
                        data.customSections.length > 0;

    return !hasPersonalInfo && !hasExperience && !hasEducation && !hasSkills && !hasOtherData;
  };

  // Load template and generate preview
  const loadTemplateAndGeneratePreview = useCallback(async () => {
    if (!templateId) return;
    
    console.log('🔄 Loading template preview...', { templateId, data });
    setLoading(true);
    setError('');

    try {
      // First, get the template
      const templateResponse = await fetch(`http://localhost:3001/api/templates/${templateId}`);
      if (!templateResponse.ok) {
        throw new Error('Template not found');
      }
      
      const templateData = await templateResponse.json();
      setTemplate(templateData);

      // Always start with sample data, then merge user data on top
      let dataToSend;
      const isEmpty = isResumeEmpty();
      console.log('📊 Resume empty check:', isEmpty, 'Data:', data);
      console.log('🔍 Personal info check:', {
        firstName: data.personalInfo.firstName,
        lastName: data.personalInfo.lastName,
        email: data.personalInfo.email,
        phone: data.personalInfo.phone,
        summary: data.personalInfo.summary
      });
      
      console.log('📝 Using template data from first API call...');
      // Use the template data we already fetched
      if (templateData.sampleData) {
        dataToSend = templateData.sampleData;
        console.log('✅ Template sample data loaded as base');
      } else {
        console.log('⚠️ No sample data in template, using fallback');
        // Fallback to hardcoded data if API fails
        dataToSend = {
            personalInfo: {
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@email.com',
              phone: '+1 (555) 123-4567',
              address: '123 Main Street',
              city: 'New York',
              province: 'NY',
              postalCode: '10001',
              linkedin: 'linkedin.com/in/johndoe',
              website: 'johndoe.com',
              summary: 'Experienced software engineer with 5+ years of expertise in full-stack development, cloud architecture, and team leadership.'
            },
            experience: [
              {
                id: 'exp1',
                company: 'Tech Solutions Inc.',
                position: 'Senior Software Engineer',
                startDate: '2022-01',
                endDate: '2024-12',
                current: true,
                description: 'Lead development of microservices architecture and mentor junior developers.',
                achievements: [
                  'Improved system performance by 40% through optimization',
                  'Led a team of 5 developers on critical projects'
                ]
              }
            ],
            education: [
              {
                id: 'edu1',
                institution: 'University of Technology',
                degree: 'Bachelor of Science',
                field: 'Computer Science',
                startDate: '2016-09',
                endDate: '2020-05',
                gpa: '3.8'
              }
            ],
            skills: [
              { id: 'skill1', name: 'JavaScript', level: 'Expert', category: 'Technical Skills' },
              { id: 'skill2', name: 'React', level: 'Advanced', category: 'Technical Skills' },
              { id: 'skill3', name: 'Node.js', level: 'Advanced', category: 'Technical Skills' }
            ],
            languages: [
              { id: 'lang1', language: 'English', proficiency: 'Native' }
            ],
            certifications: [],
            socialLinks: [],
            customSections: []
          };
        }

      // Merge user data with sample data (user data overrides sample data)
      if (!isEmpty) {
        console.log('🔄 Merging user data with sample data...');
        dataToSend = mergeUserDataWithSample(data, dataToSend);
        console.log('✅ User data merged with sample data');
      } else {
        console.log('📋 Using pure sample data (no user input)');
      }

      console.log('🚀 Sending data to preview API:', dataToSend);
      console.log('🎯 Data source:', isEmpty ? 'PURE SAMPLE DATA' : 'MERGED DATA (Sample + User)');
      
      // Generate preview with user data or sample data
      const previewResponse = await fetch(`http://localhost:3001/api/templates/${templateId}/preview`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend)
          });

          if (!previewResponse.ok) {
            const errorText = await previewResponse.text();
            throw new Error(`Failed to generate preview: ${previewResponse.status} ${errorText}`);
          }

          const htmlContent = await previewResponse.text();
          console.log('✅ Preview HTML received, length:', htmlContent.length);
          setPreviewHtml(htmlContent);
          setHasLoaded(true);
    } catch (err) {
      console.error('Error loading template:', err);
      setError(err instanceof Error ? err.message : 'Failed to load template');
      toast.error('Failed to load template preview');
    } finally {
      setLoading(false);
    }
  }, [templateId, data]);

  // Load template when component mounts or data changes
  useEffect(() => {
    loadTemplateAndGeneratePreview();
  }, [templateId, data, loadTemplateAndGeneratePreview]);

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <FileText className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Resume Preview</h3>
      <p className="text-gray-600 mb-4 max-w-md text-sm">
        Start filling out the sections on the left to see your resume come to life here with the selected template.
      </p>
      <div className="text-xs text-gray-500">
        <p>Begin with your personal information, then add your experience and skills.</p>
      </div>
    </div>
  );

  // Loading state
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Template</h3>
      <p className="text-gray-600 text-sm">Generating your resume preview...</p>
    </div>
  );

  // Error state
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <FileText className="w-10 h-10 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Error</h3>
      <p className="text-gray-600 mb-4 text-sm">{error}</p>
      <Button 
        onClick={loadTemplateAndGeneratePreview}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </Button>
    </div>
  );

  // Always show preview (with sample data if resume is empty)

  // If loading, show loading state
  if (loading) {
    return (
      <Card className={`w-full max-w-4xl mx-auto bg-white shadow-lg ${className}`}>
        <CardContent className="p-8">
          <LoadingState />
        </CardContent>
      </Card>
    );
  }

  // If error, show error state
  if (error) {
    return (
      <Card className={`w-full max-w-4xl mx-auto bg-white shadow-lg ${className}`}>
        <CardContent className="p-8">
          <ErrorState />
        </CardContent>
      </Card>
    );
  }

  // If we have preview HTML, render it
  if (hasLoaded && previewHtml && previewHtml.length > 0) {
    return (
      <div className={`w-full max-w-4xl mx-auto ${className}`}>
        
        <div 
          className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden relative"
          style={{ minHeight: '800px' }}
        >
          <div className="absolute inset-0 overflow-hidden" style={{ 
            transform: 'scale(0.8)', 
            transformOrigin: 'top left', 
            width: '125%', 
            height: '125%'
          }}>
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full border-0"
              style={{ minHeight: '800px' }}
              title="Resume Preview"
            />
          </div>
        </div>
      </div>
    );
  }

  // Fallback state - should rarely be seen now
  return (
    <Card className={`w-full max-w-4xl mx-auto bg-white shadow-lg ${className}`}>
      <CardContent className="p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Preview</h3>
          <p className="text-sm text-gray-600 mb-4">Please wait while we load your resume preview...</p>
          <Button
            onClick={loadTemplateAndGeneratePreview}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
