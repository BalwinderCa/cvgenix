import React from 'react'
import { Helmet } from 'react-helmet-async'
import AdminSidebar from './AdminSidebar'
import LoadingSpinner from '../common/LoadingSpinner'

const AdminLayout = ({ children, activeTab, setActiveTab, adminUser, loading }) => {
  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <>
      <Helmet>
        <title>Admin Panel - Resume4Me</title>
        <meta name="description" content="Resume4Me Admin Panel - Manage users, templates, and settings" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-500">Resume4Me Administration</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {adminUser && `Welcome, ${adminUser.firstName} ${adminUser.lastName}`}
            </div>
          </div>
        </div>
        
        <div className="flex">
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} adminUser={adminUser} />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

export default AdminLayout
