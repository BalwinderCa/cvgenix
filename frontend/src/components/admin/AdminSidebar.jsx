import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FiBarChart2, 
  FiUsers, 
  FiFileText, 
  FiSettings, 
  FiHome,
  FiLogOut
} from 'react-icons/fi'

const AdminSidebar = ({ activeTab, setActiveTab, adminUser }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/admin/login')
  }
  const menuItems = [
    {
      id: 'overview',
      name: 'Dashboard',
      icon: FiHome,
      description: 'Overview and statistics'
    },
    {
      id: 'users',
      name: 'Users',
      icon: FiUsers,
      description: 'Manage user accounts'
    },
    {
      id: 'templates',
      name: 'Templates',
      icon: FiFileText,
      description: 'Manage resume templates'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: FiSettings,
      description: 'Site configuration'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: FiBarChart2,
      description: 'Detailed analytics'
    }
  ]

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-600 mt-1">Resume4Me Dashboard</p>
      </div>
      
      <nav className="mt-6">
        <div className="px-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg mb-1 transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      </nav>
      
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {adminUser?.firstName?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : 'Admin User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {adminUser?.role || 'Administrator'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Logout"
          >
            <FiLogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminSidebar
