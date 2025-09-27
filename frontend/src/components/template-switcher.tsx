'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Palette, Star, Download, Eye, RotateCcw, Check } from 'lucide-react'

interface Template {
  _id: string
  name: string
  description: string
  category: string
  thumbnail: string
  isPremium: boolean
  rating: number | { average: number; count: number }
  downloadCount: number
}

interface TemplateSwitcherProps {
  currentTemplateId: string
  onTemplateSwitch: (templateId: string) => void
  className?: string
}

export default function TemplateSwitcher({ 
  currentTemplateId, 
  onTemplateSwitch, 
  className = '' 
}: TemplateSwitcherProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [switching, setSwitching] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  const handlePreview = async (templateId: string) => {
    setPreviewTemplate(templateId)
    // Open preview in new window
    const previewWindow = window.open(
      `http://localhost:3001/api/template-editor/preview/${templateId}`,
      '_blank',
      'width=800,height=1000,scrollbars=yes,resizable=yes'
    )
    if (previewWindow) {
      previewWindow.focus()
    }
  }

  const handleSwitchTemplate = async () => {
    if (!selectedTemplate) return

    setSwitching(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Please log in to switch templates')
        return
      }

      // Get current resume ID (you might need to pass this as a prop)
      const resumeResponse = await fetch('http://localhost:3001/api/resumes/current', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!resumeResponse.ok) {
        throw new Error('Failed to get current resume')
      }

      const resumeData = await resumeResponse.json()
      const resumeId = resumeData._id

      // Switch template
      const switchResponse = await fetch('http://localhost:3001/api/template-editor/switch-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resumeId,
          templateId: selectedTemplate
        })
      })

      if (switchResponse.ok) {
        onTemplateSwitch(selectedTemplate)
        setIsOpen(false)
        setSelectedTemplate(null)
        alert('Template switched successfully!')
      } else {
        const error = await switchResponse.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error('Error switching template:', error)
      alert('Failed to switch template')
    } finally {
      setSwitching(false)
    }
  }

  const getRating = (rating: number | { average: number; count: number }) => {
    return typeof rating === 'number' ? rating : rating.average
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`flex items-center gap-2 ${className}`}
        >
          <Palette className="h-4 w-4" />
          Switch Template
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Choose a New Template
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {templates.map((template) => (
            <Card 
              key={template._id}
              className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedTemplate === template._id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:border-blue-300'
              }`}
              onClick={() => handleTemplateSelect(template._id)}
            >
              <div className="p-4">
                {/* Template Preview */}
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Palette className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500 font-medium">{template.name}</p>
                    </div>
                  </div>
                </div>

                {/* Template Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    {template.isPremium && (
                      <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{getRating(template.rating).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{template.downloadCount}</span>
                    </div>
                  </div>

                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePreview(template._id)
                    }}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  
                  {selectedTemplate === template._id && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSwitchTemplate()
                      }}
                      disabled={switching}
                      className="flex-1"
                    >
                      {switching ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Switch
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Selected Indicator */}
                {selectedTemplate === template._id && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-6 border-t">
          <div className="text-sm text-gray-500">
            {selectedTemplate ? 'Template selected' : 'Select a template to switch'}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            
            <Button 
              onClick={handleSwitchTemplate}
              disabled={!selectedTemplate || switching}
            >
              {switching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Switching...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Switch Template
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
