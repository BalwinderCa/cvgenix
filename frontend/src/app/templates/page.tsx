"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  LayoutTemplate, 
  Search, 
  Filter,
  Eye,
  Download,
  Star,
  Clock,
  Sparkles,
  Palette,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import NavigationHeader from '@/components/navigation-header';
import FooterSection from '@/components/footer-section';

interface Template {
  _id: string;
  name: string;
  category: string;
  industry: string;
  style: string;
  experience: string;
  description: string;
  thumbnail: string;
  isPremium: boolean;
  createdAt: string;
  downloads: number;
  rating: number | { average: number; count: number };
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'modern', 'classic', 'minimal', 'creative'];

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, selectedCategory]);

  const loadTemplates = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      } else {
        // Fallback to default templates if API fails
        setTemplates(getDefaultTemplates());
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      // Fallback to default templates
      setTemplates(getDefaultTemplates());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultTemplates = (): Template[] => {
    return [
      {
        _id: '1',
        name: 'Modern Professional',
        category: 'modern',
        industry: 'technology',
        style: 'Modern',
        experience: 'Mid',
        description: 'Clean and contemporary design perfect for tech professionals',
        thumbnail: '/api/placeholder/300/400',
        isPremium: false,
        createdAt: new Date().toISOString(),
        downloads: 1250,
        rating: 4.8
      },
      {
        _id: '2',
        name: 'Classic Corporate',
        category: 'classic',
        industry: 'finance',
        style: 'Classic',
        experience: 'Senior',
        description: 'Traditional and professional layout for corporate environments',
        thumbnail: '/api/placeholder/300/400',
        isPremium: false,
        createdAt: new Date().toISOString(),
        downloads: 980,
        rating: 4.6
      },
      {
        _id: '3',
        name: 'Minimalist Focus',
        category: 'minimal',
        industry: 'design',
        style: 'Minimal',
        experience: 'Entry',
        description: 'Simple and elegant design that lets your content shine',
        thumbnail: '/api/placeholder/300/400',
        isPremium: true,
        createdAt: new Date().toISOString(),
        downloads: 750,
        rating: 4.9
      },
      {
        _id: '4',
        name: 'Creative Grid',
        category: 'creative',
        industry: 'marketing',
        style: 'Creative',
        experience: 'Mid',
        description: 'Bold and innovative design for creative professionals',
        thumbnail: '/api/placeholder/300/400',
        isPremium: true,
        createdAt: new Date().toISOString(),
        downloads: 650,
        rating: 4.7
      }
    ];
  };

  const filterTemplates = () => {
    let filtered = templates;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    setFilteredTemplates(filtered);
  };

  const handleUseTemplate = (templateId: string) => {
    // No auth required - directly navigate to resume builder
    router.push(`/resume-builder?template=${templateId}`);
  };


  const previewTemplate = (templateId: string) => {
    // Open template preview in new tab
    window.open(`/templates/preview/${templateId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <NavigationHeader />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-16 mt-8 sm:mt-15">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Resume Templates
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from our collection of professionally designed resume templates. 
            Each template is ATS-optimized and crafted to help you stand out to recruiters.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search templates by name, industry, or style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>


          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Category:</span>
              <div className="flex gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredTemplates.map((template) => (
            <Card key={template._id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
              <div className="relative overflow-hidden">
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl overflow-hidden">
                  {template.thumbnail && template.thumbnail.startsWith('data:image') ? (
                    <img 
                      src={template.thumbnail} 
                      alt={`${template.name} template preview`}
                      className="w-full h-full object-cover"
                    />
                  ) : template.thumbnail && template.thumbnail.startsWith('data:text/html') ? (
                    <iframe 
                      src={template.thumbnail} 
                      className="w-full h-full border-0"
                      title={`${template.name} template preview`}
                      style={{ 
                        pointerEvents: 'none',
                        overflow: 'hidden',
                        transform: 'scale(1.0)',
                        transformOrigin: 'top left',
                        width: '100%',
                        height: '100%'
                      }}
                      scrolling="no"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Palette className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-sm text-gray-500 font-medium">{template.style || 'Professional Resume'}</p>
                      </div>
                    </div>
                  )}
                </div>
                {template.isPremium && (
                  <Badge className="absolute top-3 right-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold">
                    <Star className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
                {/* Use button - only show on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={() => handleUseTemplate(template._id)}
                    className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold text-lg shadow-lg hover:bg-gray-50 transition-colors duration-200 border border-gray-200"
                  >
                    Use this template
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <LayoutTemplate className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No templates found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Try adjusting your search criteria or filters to find the perfect template for your resume.
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
        )}

        {/* Results Count */}
        {filteredTemplates.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-600">
              Showing {filteredTemplates.length} of {templates.length} templates
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <div className="mt-20">
        <FooterSection />
      </div>


    </div>
  );
}