import React, { useState, useEffect } from 'react'
import { 
  FiUsers, 
  FiFileText, 
  FiBarChart2, 
  FiEye,
  FiUserPlus,
  FiPlus,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiShield,
  FiZap
} from 'react-icons/fi'
import api from '../../services/api'

const DashboardOverview = () => {
  const [stats, setStats] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [recentTemplates, setRecentTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setError(null)
      const response = await api.get('/api/admin/dashboard')
      setStats(response.data.stats)
      setRecentUsers(response.data.recentUsers)
      setRecentTemplates(response.data.recentTemplates)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <FiTrendingUp className="h-4 w-4" />
    if (growth < 0) return <FiTrendingDown className="h-4 w-4" />
    return <FiActivity className="h-4 w-4" />
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: FiUsers,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive',
      description: 'Registered users'
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: FiUserPlus,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive',
      description: 'Active this month'
    },
    {
      title: 'Total Templates',
      value: stats?.totalTemplates || 0,
      icon: FiFileText,
      color: 'bg-purple-500',
      change: '+5%',
      changeType: 'positive',
      description: 'Available templates'
    },
    {
      title: 'Total Resumes',
      value: stats?.totalResumes || 0,
      icon: FiPlus,
      color: 'bg-orange-500',
      change: '+15%',
      changeType: 'positive',
      description: 'Created resumes'
    },
    {
      title: 'Conversion Rate',
      value: stats?.conversionRate || 0,
      icon: FiBarChart2,
      color: 'bg-indigo-500',
      change: '+2.3%',
      changeType: 'positive',
      description: 'Free to paid',
      suffix: '%'
    },
    {
      title: 'Monthly Revenue',
      value: stats?.revenueMetrics?.monthlyRevenue || 0,
      icon: FiDollarSign,
      color: 'bg-emerald-500',
      change: '+15.5%',
      changeType: 'positive',
      description: 'This month',
      formatter: formatCurrency
    }
  ]

  const systemHealth = stats?.systemHealth

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">{error}</div>
          <button 
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Welcome to your admin dashboard</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>System Online</span>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* System Health Alert */}
      {systemHealth && (
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiShield className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-medium text-gray-900">System Health</h3>
                <p className="text-sm text-gray-600">
                  Uptime: {Math.floor(systemHealth.uptime / 3600)}h {Math.floor((systemHealth.uptime % 3600) / 60)}m
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                Memory: {Math.round(systemHealth.memoryUsage.heapUsed / 1024 / 1024)}MB
              </div>
              <div className="text-sm text-gray-600">
                CPU: {Math.round(systemHealth.cpuUsage.user / 1000)}ms
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          const formattedValue = stat.formatter ? stat.formatter(stat.value) : formatNumber(stat.value)
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formattedValue}{stat.suffix || ''}
                    </p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center text-sm font-medium ${getGrowthColor(stat.changeType === 'positive' ? 1 : -1)}`}>
                    {getGrowthIcon(stat.changeType === 'positive' ? 1 : -1)}
                    <span className="ml-1">{stat.change}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Revenue Metrics */}
      {stats?.revenueMetrics && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.revenueMetrics.monthlyRevenue)}
              </div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.revenueMetrics.totalRevenue)}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.revenueMetrics.averageRevenuePerUser)}
              </div>
              <div className="text-sm text-gray-600">ARPU</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                +{stats.revenueMetrics.monthlyGrowth}%
              </div>
              <div className="text-sm text-gray-600">Growth</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.subscription?.plan === 'pro' ? 'bg-purple-100 text-purple-800' :
                        user.subscription?.plan === 'standard' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.subscription?.plan || 'free'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent users</p>
            )}
          </div>
        </div>

        {/* Recent Templates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Templates</h3>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {recentTemplates.length > 0 ? (
              <div className="space-y-4">
                {recentTemplates.map((template) => (
                  <div key={template._id} className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FiFileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900">{template.name}</p>
                      <p className="text-sm text-gray-600">{template.category}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        template.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {template.isPremium && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Premium
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent templates</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FiUserPlus className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium">Add User</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FiFileText className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium">Add Template</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FiBarChart2 className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium">View Analytics</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FiZap className="h-5 w-5 text-orange-600 mr-2" />
            <span className="text-sm font-medium">System Settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
