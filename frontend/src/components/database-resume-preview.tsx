"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { BuilderTemplateRenderer } from './builder-template-renderer';
import { PragmaticTemplateRenderer } from './pragmatic-template-renderer';
import { CanvasTemplateRenderer } from './canvas-template-renderer';


interface DatabaseTemplate {
  _id: string;
  name: string;
  html?: string;
  renderEngine?: string;
  builderData?: {
    components: any[];
    style: string;
  };
  canvasData?: any;
}

interface DatabaseResumePreviewProps {
  templateId: string;
  className?: string;
  editable?: boolean;
  data?: Record<string, any>;
}

export function DatabaseResumePreview({ templateId, className = '', editable = false, data = {} }: DatabaseResumePreviewProps) {
  const [template, setTemplate] = useState<DatabaseTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasLoaded, setHasLoaded] = useState(false);

  // Enhanced template replacement function
  const replaceTemplateVars = (content: string, data: Record<string, any>): string => {
    if (!content) return '';
    
    console.log('replaceTemplateVars called with:', { content, data });
    
    let result = content;
    
    // Create a comprehensive flattened data object for easier replacement
    const flattenedData = {
      ...data,
      // Flatten nested objects
      ...(data.personalInfo || {}),
      // Add some default values for common template variables
      firstName: data.personalInfo?.firstName || data.firstName || 'John',
      lastName: data.personalInfo?.lastName || data.lastName || 'Doe',
      email: data.personalInfo?.email || data.email || 'john.doe@email.com',
      phone: data.personalInfo?.phone || data.phone || '+1 (555) 123-4567',
      jobTitle: data.personalInfo?.jobTitle || data.jobTitle || 'Professional',
      summary: data.personalInfo?.summary || data.summary || 'Experienced professional with a passion for excellence.',
      address: data.personalInfo?.address || data.address || '',
      city: data.personalInfo?.city || data.city || '',
      province: data.personalInfo?.province || data.province || '',
      postalCode: data.personalInfo?.postalCode || data.postalCode || '',
      linkedin: data.personalInfo?.linkedin || data.linkedin || '',
      website: data.personalInfo?.website || data.website || '',
    };
    
    console.log('Flattened data:', flattenedData);
    
    // Replace simple variables like {{firstName}}
    result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const replacement = flattenedData[key] || match;
      console.log(`Replacing ${match} with ${replacement}`);
      return replacement;
    });
    
    // Replace nested variables like {{personalInfo.firstName}}
    result = result.replace(/\{\{(\w+)\.(\w+)\}\}/g, (match, obj, key) => {
      const replacement = data[obj]?.[key] || match;
      console.log(`Replacing nested ${match} with ${replacement}`);
      return replacement;
    });
    
    // Handle array data for experience, education, skills, etc.
    if (data.experience && Array.isArray(data.experience)) {
      result = result.replace(/\{\{#each experience\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, content) => {
        return data.experience.map((exp: any) => {
          let itemContent = content;
          itemContent = itemContent.replace(/\{\{position\}\}/g, exp.position || '');
          itemContent = itemContent.replace(/\{\{company\}\}/g, exp.company || '');
          itemContent = itemContent.replace(/\{\{startDate\}\}/g, exp.startDate || '');
          itemContent = itemContent.replace(/\{\{endDate\}\}/g, exp.endDate || '');
          itemContent = itemContent.replace(/\{\{description\}\}/g, exp.description || '');
          return itemContent;
        }).join('');
      });
    }
    
    if (data.education && Array.isArray(data.education)) {
      result = result.replace(/\{\{#each education\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, content) => {
        return data.education.map((edu: any) => {
          let itemContent = content;
          itemContent = itemContent.replace(/\{\{degree\}\}/g, edu.degree || '');
          itemContent = itemContent.replace(/\{\{field\}\}/g, edu.field || '');
          itemContent = itemContent.replace(/\{\{institution\}\}/g, edu.institution || '');
          itemContent = itemContent.replace(/\{\{startDate\}\}/g, edu.startDate || '');
          itemContent = itemContent.replace(/\{\{endDate\}\}/g, edu.endDate || '');
          itemContent = itemContent.replace(/\{\{gpa\}\}/g, edu.gpa || '');
          return itemContent;
        }).join('');
      });
    }
    
    if (data.skills && Array.isArray(data.skills)) {
      result = result.replace(/\{\{#each skills\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, content) => {
        return data.skills.map((skill: any) => {
          let itemContent = content;
          itemContent = itemContent.replace(/\{\{name\}\}/g, skill.name || '');
          itemContent = itemContent.replace(/\{\{level\}\}/g, skill.level || '');
          itemContent = itemContent.replace(/\{\{category\}\}/g, skill.category || '');
          return itemContent;
        }).join('');
      });
    }
    
    console.log('Final result:', result);
    return result;
  };

  // Load template
  const loadTemplate = useCallback(async () => {
    if (!templateId) return;
    
    setLoading(true);
    setError('');

    try {
      const templateResponse = await fetch(`http://localhost:3001/api/templates/${templateId}`);
      if (!templateResponse.ok) {
        throw new Error('Template not found');
      }
      
      const templateData = await templateResponse.json();
      setTemplate(templateData);
      setHasLoaded(true);
    } catch (err) {
      console.error('Error loading template:', err);
      setError(err instanceof Error ? err.message : 'Failed to load template');
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  // Load template when component mounts
  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);


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
        onClick={loadTemplate}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </Button>
    </div>
  );

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

  // If we have template data, render it based on the engine type
  if (hasLoaded && template) {
    // Check if it's a canvas template
    if (template.renderEngine === 'canvas' && template.canvasData) {
      return <CanvasTemplateRenderer templateId={templateId} className={className} editable={editable} />;
    }
    
    // Check if it's a builder framework template
    if (template.renderEngine === 'builder' && template.builderData) {
      return <PragmaticTemplateRenderer templateId={templateId} className={className} editable={editable} data={data} />;
    }
    
    // Fallback to HTML template rendering
    if (template.html) {
      const htmlTemplate = template.html;
      
      if (editable) {
        // Show template with data replacement
        const processedHtml = replaceTemplateVars(htmlTemplate, data);
        const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(processedHtml)}`;
        
        return (
          <div className={`w-full max-w-4xl mx-auto ${className}`}>
            <iframe
              src={dataUrl}
              style={{
                width: '100%',
                maxWidth: '800px',
                height: '1000px',
                border: 'none',
                backgroundColor: '#ffffff',
                margin: '0 auto',
                display: 'block'
              }}
              title="Resume Preview"
            />
          </div>
        );
      } else {
        // Non-editable HTML template with data replacement for preview
        const processedHtml = replaceTemplateVars(htmlTemplate, data);
        const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(processedHtml)}`;
        
        return (
          <div className={`w-full max-w-4xl mx-auto ${className}`}>
            <iframe
              src={dataUrl}
              style={{
                width: '100%',
                maxWidth: '800px',
                height: '1000px',
                border: 'none',
                backgroundColor: '#ffffff',
                margin: '0 auto',
                display: 'block'
              }}
              title="Resume Preview"
            />
          </div>
        );
      }
    }
    
    // No valid template data
    return (
      <Card className={`w-full max-w-4xl mx-auto bg-white shadow-lg ${className}`}>
        <CardContent className="p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Invalid Template</h3>
            <p className="text-sm text-gray-600">This template has no valid rendering data.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fallback state
  return (
    <Card className={`w-full max-w-4xl mx-auto bg-white shadow-lg ${className}`}>
      <CardContent className="p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Preview</h3>
          <p className="text-sm text-gray-600 mb-4">Please wait while we load your resume preview...</p>
          <Button
            onClick={loadTemplate}
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
