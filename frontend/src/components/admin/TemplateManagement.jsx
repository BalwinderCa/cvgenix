import React, { useState, useEffect } from 'react'
import { 
  FiSearch, 
  FiFilter,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiEye,
  FiFileText
} from 'react-icons/fi'
import api from '../../services/api'

const TemplateManagement = () => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [currentPage, search, categoryFilter, statusFilter])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search,
        category: categoryFilter,
        status: statusFilter
      })
      
      const response = await api.get(`/api/admin/templates?${params}`)
      setTemplates(response.data.templates)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTemplate = async (templateData) => {
    try {
      if (isEdit) {
        await api.put(`/api/admin/templates/${selectedTemplate._id}`, templateData)
      } else {
        await api.post('/api/admin/templates', templateData)
      }
      setShowModal(false)
      setSelectedTemplate(null)
      setIsEdit(false)
      fetchTemplates()
    } catch (error) {
      console.error('Error saving template:', error)
    }
  }

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await api.delete(`/api/admin/templates/${templateId}`)
        fetchTemplates()
      } catch (error) {
        console.error('Error deleting template:', error)
      }
    }
  }

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template)
    setIsEdit(true)
    setShowModal(true)
  }

  const handleAddTemplate = () => {
    setSelectedTemplate(null)
    setIsEdit(false)
    setShowModal(true)
  }

  const getCategoryBadgeColor = (category) => {
    const colors = {
      'Professional': 'bg-blue-100 text-blue-800',
      'Creative': 'bg-purple-100 text-purple-800',
      'Minimalist': 'bg-gray-100 text-gray-800',
      'Modern': 'bg-green-100 text-green-800',
      'Classic': 'bg-yellow-100 text-yellow-800',
      'Executive': 'bg-red-100 text-red-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Template Management</h1>
          <p className="text-gray-600 mt-2">Manage resume templates and configurations</p>
        </div>
        <button 
          onClick={handleAddTemplate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <FiPlus className="h-5 w-5 mr-2" />
          Add Template
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="Professional">Professional</option>
            <option value="Creative">Creative</option>
            <option value="Minimalist">Minimalist</option>
            <option value="Modern">Modern</option>
            <option value="Classic">Classic</option>
            <option value="Executive">Executive</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <button
            onClick={() => {
              setSearch('')
              setCategoryFilter('')
              setStatusFilter('')
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
          >
            <FiFilter className="h-4 w-4 mr-2" />
            Clear
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))
        ) : templates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FiFileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No templates found</p>
          </div>
        ) : (
          templates.map((template) => (
            <div key={template._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                {template.thumbnail ? (
                  <img 
                    src={template.thumbnail} 
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                                 ) : (
                   <FiFileText className="h-12 w-12 text-gray-400" />
                 )}
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                  <div className="flex space-x-1">
                                         <button
                       onClick={() => handleEditTemplate(template)}
                       className="text-blue-600 hover:text-blue-900"
                     >
                       <FiEdit className="h-4 w-4" />
                     </button>
                     <button
                       onClick={() => handleDeleteTemplate(template._id)}
                       className="text-red-600 hover:text-red-900"
                     >
                       <FiTrash2 className="h-4 w-4" />
                     </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>
                
                <div className="space-y-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(template.category)}`}>
                    {template.category}
                  </span>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      template.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      {template.isPremium && (
                        <span className="text-yellow-600 text-xs">⭐ Premium</span>
                      )}
                      {template.isPopular && (
                        <span className="text-orange-600 text-xs">🔥 Popular</span>
                      )}
                      {template.isNewTemplate && (
                        <span className="text-green-600 text-xs">🆕 New</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Usage: {template.usageCount} • Rating: {template.rating?.average?.toFixed(1) || '0.0'} ({template.rating?.count || 0})
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {isEdit ? 'Edit Template' : 'Add New Template'}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              handleSaveTemplate({
                name: formData.get('name'),
                description: formData.get('description'),
                category: formData.get('category'),
                tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
                thumbnail: formData.get('thumbnail'),
                preview: formData.get('preview'),
                html: formData.get('html'),
                css: formData.get('css'),
                isPremium: formData.get('isPremium') === 'true',
                isActive: formData.get('isActive') === 'true',
                isPopular: formData.get('isPopular') === 'true',
                isNewTemplate: formData.get('isNewTemplate') === 'true',
                config: {
                  sections: [
                    { name: 'Personal Info', required: true, order: 1 },
                    { name: 'Experience', required: true, order: 2 },
                    { name: 'Education', required: true, order: 3 },
                    { name: 'Skills', required: false, order: 4 }
                  ],
                  colors: {
                    primary: formData.get('primaryColor') || '#3B82F6',
                    secondary: formData.get('secondaryColor') || '#6B7280',
                    accent: formData.get('accentColor') || '#10B981'
                  }
                }
              })
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedTemplate?.name || ''}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    defaultValue={selectedTemplate?.category || 'Professional'}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Creative">Creative</option>
                    <option value="Minimalist">Minimalist</option>
                    <option value="Modern">Modern</option>
                    <option value="Classic">Classic</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    defaultValue={selectedTemplate?.description || ''}
                    required
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    defaultValue={selectedTemplate?.tags?.join(', ') || ''}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
                  <input
                    type="url"
                    name="thumbnail"
                    defaultValue={selectedTemplate?.thumbnail || ''}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preview URL</label>
                  <input
                    type="url"
                    name="preview"
                    defaultValue={selectedTemplate?.preview || ''}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">HTML Content</label>
                  <textarea
                    name="html"
                    defaultValue={selectedTemplate?.html || ''}
                    required
                    rows={6}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">CSS Styles</label>
                  <textarea
                    name="css"
                    defaultValue={selectedTemplate?.css || ''}
                    required
                    rows={6}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isPremium"
                        value="true"
                        defaultChecked={selectedTemplate?.isPremium || false}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Premium</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        value="true"
                        defaultChecked={selectedTemplate?.isActive !== false}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isPopular"
                        value="true"
                        defaultChecked={selectedTemplate?.isPopular || false}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Popular</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isNewTemplate"
                        value="true"
                        defaultChecked={selectedTemplate?.isNewTemplate || false}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">New</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  {isEdit ? 'Update Template' : 'Create Template'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setSelectedTemplate(null)
                    setIsEdit(false)
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TemplateManagement
