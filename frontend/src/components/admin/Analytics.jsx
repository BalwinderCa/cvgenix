import React, { useState, useEffect } from 'react'
import { 
  FiBarChart2, 
  FiUsers, 
  FiFileText,
  FiDollarSign
} from 'react-icons/fi'
import api from '../../services/api'

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7d')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/admin/analytics?period=${period}`)
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Track your website performance and user activity</p>
        </div>
        
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* User Registrations Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Registrations</h3>
        {analytics?.userRegistrations?.length > 0 ? (
          <div className="h-64 flex items-end justify-between space-x-2">
            {analytics.userRegistrations.map((item, index) => {
              const maxCount = Math.max(...analytics.userRegistrations.map(d => d.count))
              const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    <div>{item.count}</div>
                    <div>{new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No registration data available
          </div>
        )}
      </div>

      {/* Template Usage */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Most Used Templates</h3>
        {analytics?.templateUsage?.length > 0 ? (
          <div className="space-y-4">
            {analytics.templateUsage.map((template, index) => (
              <div key={template._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-sm text-gray-500">{template.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{template.usageCount} uses</div>
                  <div className="text-sm text-gray-500">
                    Rating: {template.rating?.average?.toFixed(1) || '0.0'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No template usage data available
          </div>
        )}
      </div>

      {/* Subscription Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Distribution</h3>
        {analytics?.subscriptionStats?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analytics.subscriptionStats.map((stat) => (
              <div key={stat._id} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
                <div className="text-sm text-gray-500 capitalize">{stat._id || 'free'} users</div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${(stat.count / analytics.subscriptionStats.reduce((sum, s) => sum + s.count, 0)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No subscription data available
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="bg-white rounded-lg shadow p-6">
           <div className="flex items-center">
             <div className="p-3 bg-blue-100 rounded-lg">
               <FiUsers className="h-6 w-6 text-blue-600" />
             </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.subscriptionStats?.reduce((sum, stat) => sum + stat.count, 0) || 0}
              </p>
            </div>
          </div>
        </div>

                 <div className="bg-white rounded-lg shadow p-6">
           <div className="flex items-center">
             <div className="p-3 bg-green-100 rounded-lg">
               <FiFileText className="h-6 w-6 text-green-600" />
             </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Templates</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.templateUsage?.length || 0}
              </p>
            </div>
          </div>
        </div>

                 <div className="bg-white rounded-lg shadow p-6">
           <div className="flex items-center">
             <div className="p-3 bg-purple-100 rounded-lg">
               <FiBarChart2 className="h-6 w-6 text-purple-600" />
             </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.templateUsage?.reduce((sum, template) => sum + template.usageCount, 0) || 0}
              </p>
            </div>
          </div>
        </div>

                 <div className="bg-white rounded-lg shadow p-6">
           <div className="flex items-center">
             <div className="p-3 bg-orange-100 rounded-lg">
               <FiDollarSign className="h-6 w-6 text-orange-600" />
             </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Premium Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.subscriptionStats?.find(s => s._id === 'pro')?.count || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
