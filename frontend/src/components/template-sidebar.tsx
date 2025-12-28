'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Palette, 
  Star, 
  Search, 
  Filter,
  Check,
  Eye,
  Crown,
  Sparkles,
  Upload
} from 'lucide-react'

interface Template {
  _id: string
  name: string
  description: string
  category: string
  thumbnail: string
  isPremium: boolean
  rating: number | { average: number; count: number }
  downloadCount: number
  canvasData?: {
    elements: any[]
    stageConfig: {
      width: number
      height: number
    }
  }
}

interface TemplateSidebarProps {
  currentTemplateId: string
  onTemplateSelect: (templateId: string) => void
  canvasReady?: boolean
  onUploadResume?: () => void
}

export default function TemplateSidebar({ 
  currentTemplateId, 
  onTemplateSelect,
  canvasReady = false,
  onUploadResume
}: TemplateSidebarProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  const categories = ['all', 'modern', 'classic', 'minimal', 'creative']

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    filterTemplates()
  }, [templates, searchQuery, selectedCategory])

  const loadTemplates = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/templates')
      if (response.ok) {
        const data = await response.json()
        //console.log('Templates loaded:', data.templates)
        setTemplates(data.templates || [])
      } else {
        console.log('API failed, using default templates')
        // Fallback to default templates if API fails
        setTemplates(getDefaultTemplates())
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      // Fallback to default templates
      setTemplates(getDefaultTemplates())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultTemplates = (): Template[] => {
    return []
  }

  const filterTemplates = () => {
    let filtered = templates

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    setFilteredTemplates(filtered)
  }

  const handleTemplateClick = (templateId: string) => {
    console.log('Template clicked in sidebar:', templateId)
    onTemplateSelect(templateId)
  }

  const getRating = (rating: number | { average: number; count: number }) => {
    return typeof rating === 'number' ? rating : rating.average
  }

  const generatePreviewFromCanvas = (template: Template) => {
    if (!template.canvasData || !template.canvasData.elements) {
      return null
    }

    // Find key elements for preview
    const nameElement = template.canvasData.elements.find((el: any) => el.id === 'name')
    const titleElement = template.canvasData.elements.find((el: any) => el.id === 'title')
    const emailElement = template.canvasData.elements.find((el: any) => el.id === 'email')
    const phoneElement = template.canvasData.elements.find((el: any) => el.id === 'phone')
    const summaryElement = template.canvasData.elements.find((el: any) => el.id === 'summary_text')

    return {
      name: nameElement?.text || 'JOHN DOE',
      title: titleElement?.text || 'Software Engineer',
      email: emailElement?.text || 'john.doe@email.com',
      phone: phoneElement?.text || '(555) 123-4567',
      summary: summaryElement?.text || 'Experienced software engineer with expertise in modern web technologies.'
    }
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="mb-4">
          <h3 className="font-medium text-gray-900 text-sm">Templates</h3>
          <p className="text-xs text-gray-500">Choose a template to get started</p>
        </div>

        {onUploadResume && (
          <button
            onClick={onUploadResume}
            disabled={!canvasReady}
            className={`w-full flex items-center gap-3 rounded-lg border text-left p-3 text-sm font-medium transition-colors ${
              canvasReady
                ? 'border-primary/60 bg-primary/5 text-primary hover:bg-primary/10'
                : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
              <Upload className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Bring Your Own Resume
              </p>
              <p className="text-sm font-semibold text-gray-900">
                Upload &amp; edit
              </p>
            </div>
          </button>
        )}
        

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 text-sm border-gray-300 focus:border-gray-400 focus:ring-gray-400"
          />
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-600">Category:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`text-xs px-2 py-1 ${
                  selectedCategory === category 
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <Palette className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters.
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <Card 
                key={template._id}
                className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white cursor-pointer p-0 overflow-hidden ${
                  currentTemplateId === template._id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:border-blue-300'
                }`}
                onClick={() => handleTemplateClick(template._id)}
              >
                <div className="relative overflow-hidden">
                  {/* Template Preview */}
                  <div className="aspect-[3/4] bg-white overflow-hidden border-0">
                    {template.thumbnail && (template.thumbnail.startsWith('data:image') || template.thumbnail.startsWith('http://') || template.thumbnail.startsWith('https://')) && !failedImages.has(template._id) ? (
                      <img 
                        src={template.thumbnail.startsWith('http') ? `http://localhost:3001/api/templates/thumbnail/${template._id}?t=${Date.now()}` : template.thumbnail}
                        alt={`${template.name} template preview`}
                        className="w-full h-full object-cover block"
                        style={{ display: 'block' }}
                        crossOrigin="anonymous"
                        onError={(e) => {
                          console.error(`Failed to load thumbnail for template ${template.name}:`, template.thumbnail);
                          console.error(`Image src was:`, e.currentTarget.src);
                          setFailedImages(prev => new Set(prev).add(template._id));
                          // Try direct URL as fallback
                          if (template.thumbnail.startsWith('http') && e.currentTarget.src.includes('/thumbnail/')) {
                            e.currentTarget.src = template.thumbnail;
                          }
                        }}
                        onLoad={() => {
                         // console.log(`Successfully loaded thumbnail for template ${template.name}`);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-white flex items-center justify-center">
                        <div className="text-center p-4">
                          {failedImages.has(template._id) ? (
                            <>
                              <div className="text-lg font-bold text-gray-900 mb-2">{template.name}</div>
                              <div className="text-xs text-gray-500">Preview unavailable</div>
                            </>
                          ) : (
                            <>
                          <div className="text-lg font-bold text-gray-900 mb-2">JOHN SMITH</div>
                          <div className="text-sm text-gray-600 mb-1">SOFTWARE ENGINEER</div>
                          <div className="text-xs text-gray-500 mb-3">john.smith@email.com</div>
                          <div className="text-xs text-gray-700">
                            Modern professional resume template
                          </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {template.isPremium && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-xs">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  
                  {/* Current Template Indicator */}
                  {currentTemplateId === template._id && (
                    <div className="absolute top-2 left-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                  
                  {/* Edit button - only show on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTemplateClick(template._id);
                      }}
                      className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm shadow-lg hover:bg-gray-50 transition-colors duration-200 border border-gray-200 cursor-pointer"
                    >
                        <Sparkles className="w-3 h-3 mr-1 inline" />
                      Edit this template
                      </button>
                    </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="h-12 border-t border-gray-200 bg-gray-50 flex-shrink-0 flex items-center justify-center">
        <div className="text-xs text-gray-500">
          {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
        </div>
      </div>
    </div>
  )
}
