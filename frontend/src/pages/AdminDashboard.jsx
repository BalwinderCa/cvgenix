import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import DashboardOverview from '../components/admin/DashboardOverview'
import UserManagement from '../components/admin/UserManagement'
import TemplateManagement from '../components/admin/TemplateManagement'
import SettingsManagement from '../components/admin/SettingsManagement'
import Analytics from '../components/admin/Analytics'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [adminUser, setAdminUser] = useState(null)
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) return
    
    // Check for admin authentication
    const adminToken = localStorage.getItem('adminToken')
    const adminUserData = localStorage.getItem('adminUser')
    
    if (!adminToken || !adminUserData) {
      console.log('AdminDashboard: No admin token or user data, redirecting to admin login')
      hasRedirected.current = true
      navigate('/admin/login')
      return
    }

    try {
      const user = JSON.parse(adminUserData)
      if (!['admin', 'super_admin'].includes(user.role)) {
        console.log('AdminDashboard: User not admin, redirecting to admin login')
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        hasRedirected.current = true
        navigate('/admin/login')
        return
      }
      
      setAdminUser(user)
      setLoading(false)
    } catch (error) {
      console.error('Error parsing admin user data:', error)
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      hasRedirected.current = true
      navigate('/admin/login')
    }
  }, []) // Remove navigate from dependency array to prevent infinite loop

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />
      case 'users':
        return <UserManagement />
      case 'templates':
        return <TemplateManagement />
      case 'settings':
        return <SettingsManagement />
      case 'analytics':
        return <Analytics />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <AdminLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      adminUser={adminUser} 
      loading={loading}
    >
      {renderContent()}
    </AdminLayout>
  )
}

export default AdminDashboard
