"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Eye, 
  EyeOff,
  Settings,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Languages,
  FileText,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  enabled: boolean;
  order: number;
  required: boolean;
}

interface DraggableSectionsProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
  onSectionToggle: (sectionId: string, enabled: boolean) => void;
}

export function DraggableSections({ sections, onSectionsChange, onSectionToggle }: DraggableSectionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section && !section.required) {
      onSectionToggle(sectionId, !section.enabled);
      toast.success(`${section.title} section ${!section.enabled ? 'enabled' : 'disabled'}`);
    }
  };

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'personal': return <User className="w-4 h-4" />;
      case 'experience': return <Briefcase className="w-4 h-4" />;
      case 'education': return <GraduationCap className="w-4 h-4" />;
      case 'skills': return <Code className="w-4 h-4" />;
      case 'projects': return <Award className="w-4 h-4" />;
      case 'languages': return <Languages className="w-4 h-4" />;
      case 'certifications': return <FileText className="w-4 h-4" />;
      case 'achievements': return <Star className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const enabledSections = sections.filter(s => s.enabled).length;
  const totalSections = sections.length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Customize Sections
          <Badge variant="secondary" className="ml-1">
            {enabledSections}/{totalSections}
          </Badge>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Customize Resume Sections
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Instructions */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">How to customize:</h4>
                <ul className="text-sm text-blue-800 mt-1 space-y-1">
                  <li>• Click the eye icon to show/hide sections</li>
                  <li>• Required sections cannot be hidden</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sections List */}
          <div className="space-y-2">
            {sections
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <Card
                  key={section.id}
                  className={`transition-all duration-200 ${
                    !section.enabled ? 'opacity-60' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getSectionIcon(section.id)}
                        <div>
                          <h4 className="font-medium">{section.title}</h4>
                          {section.required && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {section.required ? (
                          <Badge variant="secondary" className="text-xs">
                            Always Visible
                          </Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSection(section.id)}
                            className="p-2"
                          >
                            {section.enabled ? (
                              <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Summary */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Section Summary</h4>
                <p className="text-sm text-gray-600">
                  {enabledSections} of {totalSections} sections enabled
                </p>
              </div>
              <Badge variant={enabledSections >= 3 ? 'default' : 'secondary'}>
                {enabledSections >= 3 ? 'Good' : 'Add More'}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                // Reset to default enabled state
                const defaultSections = sections.map((section) => ({
                  ...section,
                  enabled: section.required || ['personal', 'experience', 'education', 'skills'].includes(section.id)
                }));
                onSectionsChange(defaultSections);
                toast.success('Sections reset to default');
              }}
              className="flex-1"
            >
              Reset to Default
            </Button>
            
            <Button
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
