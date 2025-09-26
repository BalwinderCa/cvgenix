"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Palette, 
  Eye, 
  Check,
  Star,
  Sparkles,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface DatabaseTemplate {
  _id: string;
  name: string;
  description: string;
  category: string;
  isPremium: boolean;
  thumbnail: string;
  features?: string[];
  tags: string[];
  rating: {
    average: number;
    count: number;
  };
  usageCount: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'modern' | 'classic' | 'minimal' | 'creative';
  isPremium: boolean;
  preview: string;
  features: string[];
}

interface TemplateSelectorProps {
  currentTemplate: string;
  onTemplateChange: (templateId: string) => void;
  className?: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'modern',
    name: 'Modern Professional',
    description: 'Clean, contemporary design with subtle colors and modern typography',
    category: 'modern',
    isPremium: false,
    preview: '/templates/modern-preview.png',
    features: ['ATS-friendly', 'Mobile responsive', 'Professional layout']
  },
  {
    id: 'classic',
    name: 'Classic Traditional',
    description: 'Timeless design with traditional formatting and professional appearance',
    category: 'classic',
    isPremium: false,
    preview: '/templates/classic-preview.png',
    features: ['Conservative style', 'Industry standard', 'Easy to read']
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Ultra-clean design with maximum white space and minimal distractions',
    category: 'minimal',
    isPremium: false,
    preview: '/templates/minimal-preview.png',
    features: ['Clean layout', 'Focus on content', 'Modern aesthetic']
  },
  {
    id: 'creative',
    name: 'Creative Portfolio',
    description: 'Bold design with creative elements perfect for design and creative roles',
    category: 'creative',
    isPremium: true,
    preview: '/templates/creative-preview.png',
    features: ['Eye-catching design', 'Creative elements', 'Portfolio integration']
  },
  {
    id: 'executive',
    name: 'Executive Suite',
    description: 'Premium design for senior-level positions with sophisticated styling',
    category: 'classic',
    isPremium: true,
    preview: '/templates/executive-preview.png',
    features: ['Executive styling', 'Premium layout', 'Senior-level appeal']
  },
  {
    id: 'tech',
    name: 'Tech Professional',
    description: 'Modern design optimized for technology and engineering roles',
    category: 'modern',
    isPremium: true,
    preview: '/templates/tech-preview.png',
    features: ['Tech-focused', 'Skills highlighting', 'Modern design']
  }
];

export function TemplateSelector({ 
  currentTemplate, 
  onTemplateChange, 
  className = '' 
}: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(currentTemplate);
  const [templates, setTemplates] = useState<DatabaseTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  // Load templates from database
  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/templates');
        if (response.ok) {
          const data = await response.json();
          setTemplates(data.templates || []);
        } else {
          console.error('Failed to load templates');
          toast.error('Failed to load templates');
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        toast.error('Error loading templates');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleApplyTemplate = () => {
    if (selectedTemplate !== currentTemplate) {
      onTemplateChange(selectedTemplate);
      toast.success('Template changed successfully!');
    }
    setIsOpen(false);
  };

  const handlePreviewTemplate = (templateId: string) => {
    window.open(`http://localhost:3001/api/templates/${templateId}/preview`, '_blank');
  };

  const currentTemplateData = templates.find(t => t._id === currentTemplate) || 
    TEMPLATES.find(t => t.id === currentTemplate);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={`flex items-center gap-2 ${className}`}>
          <Palette className="w-4 h-4" />
          Template: {currentTemplateData?.name || 'Modern'}
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[calc(100vw-2rem)] max-h-[80vh] overflow-y-auto sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Choose Resume Template
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {loading ? (
            <div className="col-span-2 flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading templates...</span>
            </div>
          ) : (
            <>
              {/* Database Templates */}
              {templates.map((template) => (
                <Card 
                  key={template._id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedTemplate === template._id 
                      ? 'ring-2 ring-blue-500 border-blue-500' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => handleTemplateSelect(template._id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          {template.isPremium && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                          {template.rating.average > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              {template.rating.average}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      </div>
                      {selectedTemplate === template._id && (
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Template Preview */}
                    <div className="bg-gray-100 rounded-lg p-4 mb-3 min-h-[120px] flex items-center justify-center">
                      {template.thumbnail ? (
                        <img 
                          src={template.thumbnail} 
                          alt={template.name}
                          className="max-w-full max-h-full object-contain rounded"
                        />
                      ) : (
                        <div className="text-center text-gray-500">
                          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Template Preview</p>
                          <p className="text-xs text-gray-400">{template.category}</p>
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-1 mb-3">
                      {(template.features || template.tags || []).slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewTemplate(template._id);
                        }}
                        className="flex-1 text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                    </div>

                    {/* Category Badge */}
                    <div className="mt-3">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          template.category === 'Professional' ? 'border-blue-200 text-blue-700' :
                          template.category === 'Creative' ? 'border-purple-200 text-purple-700' :
                          template.category === 'Modern' ? 'border-green-200 text-green-700' :
                          'border-gray-200 text-gray-700'
                        }`}
                      >
                        {template.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Fallback Templates */}
              {templates.length === 0 && TEMPLATES.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedTemplate === template.id 
                      ? 'ring-2 ring-blue-500 border-blue-500' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          {template.isPremium && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      </div>
                      {selectedTemplate === template.id && (
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Template Preview Placeholder */}
                    <div className="bg-gray-100 rounded-lg p-4 mb-3 min-h-[120px] flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Template Preview</p>
                        <p className="text-xs text-gray-400">{template.category}</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-1">
                      {template.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* Category Badge */}
                    <div className="mt-3">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          template.category === 'modern' ? 'border-blue-200 text-blue-700' :
                          template.category === 'classic' ? 'border-gray-200 text-gray-700' :
                          template.category === 'minimal' ? 'border-green-200 text-green-700' :
                          'border-purple-200 text-purple-700'
                        }`}
                      >
                        {template.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleApplyTemplate}>
            Apply Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
