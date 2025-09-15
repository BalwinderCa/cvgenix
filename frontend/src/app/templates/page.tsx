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
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import SignupModal from '@/components/auth/SignupModal';

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
  rating: number;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [signupModalOpen, setSignupModalOpen] = useState(false);

  const categories = ['all', 'modern', 'classic', 'minimal', 'creative'];
  const industries = ['all', 'technology', 'finance', 'healthcare', 'education', 'marketing', 'design'];

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, selectedCategory, selectedIndustry]);

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
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.industry.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Industry filter
    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(template => template.industry === selectedIndustry);
    }

    setFilteredTemplates(filtered);
  };

  const handleUseTemplate = (templateId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setSignupModalOpen(true);
      return;
    }

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
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Resume Templates</h1>
          <p className="text-muted-foreground">
            Choose from our collection of professionally designed resume templates
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Category:</span>
              <div className="flex gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Industry:</span>
              <div className="flex gap-2">
                {industries.map(industry => (
                  <Button
                    key={industry}
                    variant={selectedIndustry === industry ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedIndustry(industry)}
                  >
                    {industry.charAt(0).toUpperCase() + industry.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template._id} className="group hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="aspect-[3/4] bg-muted rounded-t-lg overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <LayoutTemplate className="w-16 h-16 text-muted-foreground" />
                  </div>
                </div>
                {template.isPremium && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500">
                    Premium
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {template.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {template.downloads}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {template.experience}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => previewTemplate(template._id)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleUseTemplate(template._id)}
                  >
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <LayoutTemplate className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}
      </div>

      {/* Signup Modal */}
      <SignupModal
        open={signupModalOpen}
        onOpenChange={setSignupModalOpen}
        onSwitchToLogin={() => {
          setSignupModalOpen(false);
          // You could add a login modal here if needed
        }}
      />
    </div>
  );
}