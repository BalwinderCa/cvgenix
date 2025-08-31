import React, { useState, useEffect } from 'react'
import { 
  FiSettings, 
  FiHome,
  FiDroplet,
  FiDollarSign,
  FiPhone,
  FiShare,
  FiBarChart2,
  FiZap
} from 'react-icons/fi'
import api from '../../services/api'

const SettingsManagement = () => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/admin/settings')
      setSettings(response.data)
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async (sectionData) => {
    try {
      setSaving(true)
      const updatedSettings = { ...settings, ...sectionData }
              await api.put('/api/admin/settings', updatedSettings)
      setSettings(updatedSettings)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'general', name: 'General', icon: FiSettings },
    { id: 'appearance', name: 'Appearance', icon: FiDroplet },
    { id: 'contact', name: 'Contact', icon: FiPhone },
    { id: 'social', name: 'Social', icon: FiShare },
    { id: 'analytics', name: 'Analytics', icon: FiBarChart2 },
    { id: 'maintenance', name: 'Maintenance', icon: FiZap }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings settings={settings} onSave={handleSaveSettings} saving={saving} />
      case 'appearance':
        return <AppearanceSettings settings={settings} onSave={handleSaveSettings} saving={saving} />
      case 'contact':
        return <ContactSettings settings={settings} onSave={handleSaveSettings} saving={saving} />
      case 'social':
        return <SocialSettings settings={settings} onSave={handleSaveSettings} saving={saving} />
      case 'analytics':
        return <AnalyticsSettings settings={settings} onSave={handleSaveSettings} saving={saving} />
      case 'maintenance':
        return <MaintenanceSettings settings={settings} onSave={handleSaveSettings} saving={saving} />
      default:
        return <GeneralSettings settings={settings} onSave={handleSaveSettings} saving={saving} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-gray-600 mt-2">Configure your website settings and appearance</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>
        
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

// General Settings Component
const GeneralSettings = ({ settings, onSave, saving }) => {
  const [formData, setFormData] = useState({
    siteName: settings?.siteName || '',
    siteDescription: settings?.siteDescription || '',
    logo: settings?.logo || '',
    heroTitle: settings?.heroTitle || '',
    heroSubtitle: settings?.heroSubtitle || '',
    features: settings?.features || []
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }))
  }

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const updateFeature = (index, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Site Name</label>
          <input
            type="text"
            value={formData.siteName}
            onChange={(e) => setFormData(prev => ({ ...prev, siteName: e.target.value }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Logo URL</label>
          <input
            type="url"
            value={formData.logo}
            onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Site Description</label>
        <textarea
          value={formData.siteDescription}
          onChange={(e) => setFormData(prev => ({ ...prev, siteDescription: e.target.value }))}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Hero Title</label>
        <input
          type="text"
          value={formData.heroTitle}
          onChange={(e) => setFormData(prev => ({ ...prev, heroTitle: e.target.value }))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Hero Subtitle</label>
        <textarea
          value={formData.heroSubtitle}
          onChange={(e) => setFormData(prev => ({ ...prev, heroSubtitle: e.target.value }))}
          rows={2}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Features</label>
        <div className="mt-2 space-y-2">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter feature"
              />
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="px-3 py-2 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addFeature}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Add Feature
          </button>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

// Appearance Settings Component
const AppearanceSettings = ({ settings, onSave, saving }) => {
  const [formData, setFormData] = useState({
    primaryColor: settings?.primaryColor || '#3B82F6',
    secondaryColor: settings?.secondaryColor || '#6B7280',
    accentColor: settings?.accentColor || '#10B981'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Appearance Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Primary Color</label>
          <div className="mt-1 flex items-center space-x-2">
            <input
              type="color"
              value={formData.primaryColor}
              onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
              className="h-10 w-20 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              value={formData.primaryColor}
              onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
          <div className="mt-1 flex items-center space-x-2">
            <input
              type="color"
              value={formData.secondaryColor}
              onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
              className="h-10 w-20 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              value={formData.secondaryColor}
              onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Accent Color</label>
          <div className="mt-1 flex items-center space-x-2">
            <input
              type="color"
              value={formData.accentColor}
              onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
              className="h-10 w-20 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              value={formData.accentColor}
              onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}





// Contact Settings Component
const ContactSettings = ({ settings, onSave, saving }) => {
  const [formData, setFormData] = useState({
    contact: settings?.contact || {
      email: '',
      phone: '',
      address: ''
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={formData.contact.email}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              contact: { ...prev.contact, email: e.target.value }
            }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            value={formData.contact.phone}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              contact: { ...prev.contact, phone: e.target.value }
            }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            value={formData.contact.address}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              contact: { ...prev.contact, address: e.target.value }
            }))}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

// Social Settings Component
const SocialSettings = ({ settings, onSave, saving }) => {
  const [formData, setFormData] = useState({
    social: settings?.social || {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: ''
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Social Media Links</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Facebook</label>
          <input
            type="url"
            value={formData.social.facebook}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              social: { ...prev.social, facebook: e.target.value }
            }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Twitter</label>
          <input
            type="url"
            value={formData.social.twitter}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              social: { ...prev.social, twitter: e.target.value }
            }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
          <input
            type="url"
            value={formData.social.linkedin}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              social: { ...prev.social, linkedin: e.target.value }
            }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Instagram</label>
          <input
            type="url"
            value={formData.social.instagram}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              social: { ...prev.social, instagram: e.target.value }
            }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

// Analytics Settings Component
const AnalyticsSettings = ({ settings, onSave, saving }) => {
  const [formData, setFormData] = useState({
    analytics: settings?.analytics || {
      googleAnalyticsId: '',
      facebookPixelId: ''
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Analytics Configuration</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Google Analytics ID</label>
          <input
            type="text"
            value={formData.analytics.googleAnalyticsId}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              analytics: { ...prev.analytics, googleAnalyticsId: e.target.value }
            }))}
            placeholder="G-XXXXXXXXXX"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Facebook Pixel ID</label>
          <input
            type="text"
            value={formData.analytics.facebookPixelId}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              analytics: { ...prev.analytics, facebookPixelId: e.target.value }
            }))}
            placeholder="XXXXXXXXXX"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

// Maintenance Settings Component
const MaintenanceSettings = ({ settings, onSave, saving }) => {
  const [formData, setFormData] = useState({
    maintenance: settings?.maintenance || {
      isMaintenanceMode: false,
      maintenanceMessage: ''
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Maintenance Mode</h3>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="maintenanceMode"
            checked={formData.maintenance.isMaintenanceMode}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              maintenance: { ...prev.maintenance, isMaintenanceMode: e.target.checked }
            }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
            Enable Maintenance Mode
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Maintenance Message</label>
          <textarea
            value={formData.maintenance.maintenanceMessage}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              maintenance: { ...prev.maintenance, maintenanceMessage: e.target.value }
            }))}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="We are currently performing maintenance. Please check back soon."
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

export default SettingsManagement
