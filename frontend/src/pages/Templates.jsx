import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Star,
  Sparkles,
  Briefcase,
  GraduationCap,
  Palette,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';

const Templates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const categories = [
    { id: 'all', name: 'All Templates', icon: Palette, count: 50 },
    { id: 'professional', name: 'Professional', icon: Briefcase, count: 15 },
    { id: 'creative', name: 'Creative', icon: Sparkles, count: 12 },
    { id: 'modern', name: 'Modern', icon: TrendingUp, count: 10 },
    { id: 'minimal', name: 'Minimal', icon: Clock, count: 8 },
    { id: 'academic', name: 'Academic', icon: GraduationCap, count: 5 }
  ];

  const templates = [
    {
      id: 1,
      name: 'Professional Classic',
      category: 'professional',
      description: 'Clean and traditional design perfect for corporate roles',
      image: '/api/templates/1/preview',
      rating: 4.8,
      downloads: 12500,
      tags: ['Corporate', 'Traditional', 'Clean'],
      featured: true,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 2,
      name: 'Modern Minimalist',
      category: 'minimal',
      description: 'Sleek and simple design that focuses on content',
      image: '/api/templates/2/preview',
      rating: 4.9,
      downloads: 8900,
      tags: ['Minimal', 'Clean', 'Modern'],
      featured: true,
      color: 'from-gray-500 to-slate-600'
    },
    {
      id: 3,
      name: 'Creative Portfolio',
      category: 'creative',
      description: 'Bold and artistic design for creative professionals',
      image: '/api/templates/3/preview',
      rating: 4.7,
      downloads: 6700,
      tags: ['Creative', 'Portfolio', 'Bold'],
      featured: false,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 4,
      name: 'Tech Professional',
      category: 'professional',
      description: 'Perfect for software developers and tech roles',
      image: '/api/templates/4/preview',
      rating: 4.6,
      downloads: 5400,
      tags: ['Tech', 'Developer', 'Professional'],
      featured: false,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 5,
      name: 'Academic Scholar',
      category: 'academic',
      description: 'Formal design ideal for academic and research positions',
      image: '/api/templates/5/preview',
      rating: 4.5,
      downloads: 3200,
      tags: ['Academic', 'Research', 'Formal'],
      featured: false,
      color: 'from-indigo-500 to-purple-600'
    },
    {
      id: 6,
      name: 'Startup Innovator',
      category: 'modern',
      description: 'Dynamic design for entrepreneurs and startup roles',
      image: '/api/templates/6/preview',
      rating: 4.4,
      downloads: 4100,
      tags: ['Startup', 'Innovative', 'Dynamic'],
      featured: false,
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 7,
      name: 'Executive Suite',
      category: 'professional',
      description: 'Premium design for senior executives and managers',
      image: '/api/templates/7/preview',
      rating: 4.8,
      downloads: 2800,
      tags: ['Executive', 'Premium', 'Leadership'],
      featured: true,
      color: 'from-slate-500 to-gray-600'
    },
    {
      id: 8,
      name: 'Design Portfolio',
      category: 'creative',
      description: 'Visually striking design for designers and artists',
      image: '/api/templates/8/preview',
      rating: 4.7,
      downloads: 3800,
      tags: ['Design', 'Portfolio', 'Creative'],
      featured: false,
      color: 'from-pink-500 to-rose-600'
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id - a.id;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Choose Your Perfect
              <span className="block bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Resume Template
              </span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Browse our collection of professionally designed templates. Each template is 
              ATS-optimized and crafted to help you stand out in your job search.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-300">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span>50+ Templates</span>
              </div>
              <div className="flex items-center">
                <Download className="w-4 h-4 text-green-400 mr-1" />
                <span>500K+ Downloads</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 text-blue-400 mr-1" />
                <span>Trusted by 100K+ Users</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  <span>{category.name}</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                {/* Template Preview */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className={`w-32 h-40 bg-gradient-to-br ${template.color} rounded-lg shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform duration-300`}>
                    <div className="p-3 text-white">
                      <div className="w-full h-2 bg-white/30 rounded mb-2"></div>
                      <div className="w-3/4 h-2 bg-white/30 rounded mb-1"></div>
                      <div className="w-1/2 h-2 bg-white/30 rounded"></div>
                    </div>
                  </div>
                  {template.featured && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Featured
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Link
                      to={`/builder?template=${template.id}`}
                      className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                    >
                      Use Template
                    </Link>
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                      {template.name}
                    </h3>
                    <div className="flex items-center text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{template.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Download className="w-4 h-4 mr-1" />
                      <span>{template.downloads.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/builder?template=${template.id}`}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        Use Template
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {sortedTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Create Your Perfect Resume?
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Choose from our professional templates and start building your resume in minutes. 
              No design skills required.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Building Free
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Templates;
