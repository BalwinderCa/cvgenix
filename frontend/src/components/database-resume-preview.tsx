"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText,
  Loader2,
  RefreshCw
} from 'lucide-react';


interface DatabaseTemplate {
  _id: string;
  name: string;
  html: string;
}

interface DatabaseResumePreviewProps {
  templateId: string;
  className?: string;
}

export function DatabaseResumePreview({ templateId, className = '' }: DatabaseResumePreviewProps) {
  const [template, setTemplate] = useState<DatabaseTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasLoaded, setHasLoaded] = useState(false);


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

  // If we have template data, render it using the HTML template from database
  if (hasLoaded && template) {
    // Use the HTML template from database as-is
    const htmlTemplate = template.html;
    
    // Create a data URL for the iframe to isolate the template
    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlTemplate)}`;
    
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
