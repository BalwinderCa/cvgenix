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
  Sparkles
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
}

export default function TemplateSidebar({ 
  currentTemplateId, 
  onTemplateSelect,
  canvasReady = false
}: TemplateSidebarProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)

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
        console.log('Templates loaded:', data.templates)
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
    <div className="w-96 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 shadow-lg border-r border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0 pt-20">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Templates
          </h2>
          <p className="text-gray-600 text-sm">
            Choose a template to get started
          </p>
        </div>
        

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Category:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`text-xs px-3 py-1 ${
                  selectedCategory === category 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
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
      <div className="flex-1 overflow-y-auto p-6">
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
                className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white cursor-pointer ${
                  currentTemplateId === template._id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:border-blue-300'
                }`}
                onClick={() => handleTemplateClick(template._id)}
              >
                <div className="relative overflow-hidden">
                  {/* Template Preview */}
                  <div className="aspect-[3/4] bg-white rounded-t-xl overflow-hidden border border-gray-200">
                    {template.thumbnail && template.thumbnail.startsWith('data:image') ? (
                      <img 
                        src={template.thumbnail} 
                        alt={`${template.name} template preview`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white flex items-center justify-center">
                        <div className="text-center p-4">
                          <div className="text-lg font-bold text-gray-900 mb-2">JOHN SMITH</div>
                          <div className="text-sm text-gray-600 mb-1">SOFTWARE ENGINEER</div>
                          <div className="text-xs text-gray-500 mb-3">john.smith@email.com</div>
                          <div className="text-xs text-gray-700">
                            Modern professional resume template
                          </div>
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
                  
                  {/* Hover overlay with use button */}
                  {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="bg-white text-gray-900 px-3 py-2 rounded-lg font-semibold text-xs shadow-lg hover:bg-gray-50 transition-colors duration-200 border border-gray-200">
                        <Sparkles className="w-3 h-3 mr-1 inline" />
                        Use
                      </button>
                    </div>
                  </div> */}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="text-sm text-gray-600 text-center">
          {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
        </div>
      </div>
    </div>
  )
}
