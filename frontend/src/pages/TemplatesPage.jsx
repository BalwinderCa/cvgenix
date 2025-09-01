import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useInView } from 'react-intersection-observer'
import { FiEye, FiArrowRight, FiSearch, FiFilter } from 'react-icons/fi'

const TemplatesPage = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'professional', name: 'Professional' },
    { id: 'creative', name: 'Creative' },
    { id: 'minimalist', name: 'Minimalist' },
    { id: 'modern', name: 'Modern' },
    { id: 'classic', name: 'Classic' },
    { id: 'executive', name: 'Executive' },
    { id: 'startup', name: 'Startup' }
  ]

  const templates = [
    {
      id: 'modern-cv',
      name: 'Modern CV',
      category: 'professional',
      description: 'Clean and professional template perfect for corporate roles',
      image: '/templates/modern-cv.jpg',
      isPopular: true,
      isNewTemplate: false,
      tags: ['Professional', 'Corporate', 'Clean']
    },
    {
      id: 'creative',
      name: 'Creative',
      category: 'creative',
      description: 'Bold and creative design for creative professionals',
      image: '/templates/creative.jpg',
      isPopular: false,
      isNewTemplate: true,
      tags: ['Creative', 'Design', 'Bold']
    },
    {
      id: 'minimalist',
      name: 'Minimalist',
      category: 'minimalist',
      description: 'Simple and elegant template focusing on content',
      image: '/templates/minimalist.jpg',
      isPopular: false,
      isNewTemplate: false,
      tags: ['Minimalist', 'Simple', 'Elegant']
    },
    {
      id: 'executive',
      name: 'Executive',
      category: 'executive',
      description: 'Sophisticated template for senior professionals',
      image: '/templates/executive.jpg',
      isPopular: true,
      isNewTemplate: false,
      tags: ['Executive', 'Senior', 'Sophisticated']
    },
    {
      id: 'startup',
      name: 'Startup',
      category: 'startup',
      description: 'Modern template perfect for tech and startup roles',
      image: '/templates/startup.jpg',
      isPopular: false,
      isNewTemplate: false,
      tags: ['Startup', 'Tech', 'Modern']
    },
    {
      id: 'classic',
      name: 'Classic',
      category: 'classic',
      description: 'Traditional template that never goes out of style',
      image: '/templates/classic.jpg',
      isPopular: false,
      isNewTemplate: false,
      tags: ['Classic', 'Traditional', 'Timeless']
    },
    {
      id: 'modern-minimal',
      name: 'Modern Minimal',
      category: 'modern',
      description: 'Contemporary design with clean lines and modern typography',
      image: '/templates/modern-minimal.jpg',
      isPopular: false,
      isNewTemplate: true,
      tags: ['Modern', 'Minimal', 'Contemporary']
    },
    {
      id: 'professional-bold',
      name: 'Professional Bold',
      category: 'professional',
      description: 'Strong and confident template for ambitious professionals',
      image: '/templates/professional-bold.jpg',
      isPopular: false,
      isNewTemplate: false,
      tags: ['Professional', 'Bold', 'Confident']
    },
    {
      id: 'creative-modern',
      name: 'Creative Modern',
      category: 'creative',
      description: 'Innovative design combining creativity with professionalism',
      image: '/templates/creative-modern.jpg',
      isPopular: false,
      isNewTemplate: false,
      tags: ['Creative', 'Modern', 'Innovative']
    }
  ]

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  }

  return (
    <>
      <Helmet>
        <title>Resume Templates - Resume4Me | 50+ Professional Templates</title>
        <meta name="description" content="Browse our collection of 50+ professional resume templates. Find the perfect template for your industry and experience level." />
      </Helmet>

      <div className="pt-16 lg:pt-20">
        {/* Hero Section */}
        <section className="section-padding bg-gradient-bg">
          <div className="container-max">
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Resume{' '}
                <span className="gradient-text">Templates</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Choose from our collection of 50+ professionally designed templates 
                that are optimized for ATS systems and designed to impress recruiters.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="section-padding bg-white border-b border-gray-100">
          <div className="container-max">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <FiFilter className="w-5 h-5 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="section-padding bg-gradient-bg">
          <div className="container-max">
            {filteredTemplates.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    variants={itemVariants}
                    className="group"
                  >
                    <div className="card overflow-hidden hover:shadow-large transition-all duration-300">
                      {/* Template Image */}
                      <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl overflow-hidden">
                        {/* Placeholder for template image */}
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                              <span className="text-white font-bold text-xl">
                                {template.name.charAt(0)}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700">{template.name}</h3>
                            <p className="text-sm text-gray-500">{template.category}</p>
                          </div>
                        </div>

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="flex space-x-4">
                            <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                              <FiEye className="w-5 h-5" />
                            </button>
                            <Link
                              to={`/template-edit/${template.id}`}
                              className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors"
                            >
                              <FiArrowRight className="w-5 h-5" />
                            </Link>
                          </div>
                        </div>

                        {/* Badges */}
                        {template.isPopular && (
                          <div className="absolute top-4 left-4 bg-warning-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            Most Popular
                          </div>
                        )}
                        {template.isNewTemplate && (
                          <div className="absolute top-4 right-4 bg-success-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            New
                          </div>
                        )}
                      </div>

                      {/* Template Info */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full capitalize">
                            {template.category}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {template.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button className="flex-1 btn-secondary text-sm py-2">
                            Preview
                          </button>
                          <Link
                            to={`/template-edit/${template.id}`}
                            className="flex-1 btn-primary text-sm py-2"
                          >
                            Use Template
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or category filter.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* More Templates Coming Soon */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center mt-16"
            >
              <div className="bg-white rounded-2xl shadow-soft p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  More Templates Coming Soon
                </h3>
                <p className="text-gray-600 mb-6">
                  We're constantly adding new templates to our collection. 
                  Subscribe to our newsletter to be notified when new templates are available.
                </p>
                <Link
                  to="/"
                  className="btn-outline"
                >
                  Back to Home
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}

export default TemplatesPage
