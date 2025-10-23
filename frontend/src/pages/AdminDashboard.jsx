// Admin Dashboard Component

import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Download
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

function AdminDashboard() {
  const [timeRange, setTimeRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const { data: dashboardData, isLoading, error, refetch } = useQuery(
    ['adminDashboard', timeRange],
    async () => {
      const response = await axios.get('/api/dashboards/admin', {
        params: {
          startDate: timeRange.startDate,
          endDate: timeRange.endDate
        }
      });
      return response.data.data;
    },
    {
      enabled: true,
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    }
  );

  const handleTimeRangeChange = (field, value) => {
    setTimeRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Dashboard refreshed');
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('/api/dashboards/admin/export', {
        params: timeRange,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `admin-dashboard-${timeRange.startDate}-${timeRange.endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Dashboard exported successfully');
    } catch (error) {
      toast.error('Failed to export dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-error-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-gray-500 mb-4">{error.message}</p>
        <button onClick={handleRefresh} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administrator Dashboard</h1>
          <p className="text-gray-600">Cross-organizational performance overview</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={handleRefresh} className="btn-outline">
            <Clock className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button onClick={handleExport} className="btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <label className="label">Time Range:</label>
          <input
            type="date"
            value={timeRange.startDate}
            onChange={(e) => handleTimeRangeChange('startDate', e.target.value)}
            className="input w-auto"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={timeRange.endDate}
            onChange={(e) => handleTimeRangeChange('endDate', e.target.value)}
            className="input w-auto"
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="w-8 h-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Organizations</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData?.organizations || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="w-8 h-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Metrics</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData?.totalMetrics || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="w-8 h-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Engagement</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData?.aggregatedData ? 
                  Math.round(Object.values(dashboardData.aggregatedData)
                    .reduce((sum, org) => sum + (org.metrics.engagement?.average || 0), 0) / 
                    Object.keys(dashboardData.aggregatedData).length) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="w-8 h-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Compliance Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData?.aggregatedData ? 
                  Math.round(Object.values(dashboardData.aggregatedData)
                    .reduce((sum, org) => sum + (org.metrics.compliance?.average || 0), 0) / 
                    Object.keys(dashboardData.aggregatedData).length) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Performance */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skill Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData?.aggregatedData && Object.entries(dashboardData.aggregatedData).map(([orgId, orgData]) => (
                <tr key={orgId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Organization {orgId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${orgData.metrics.engagement?.average || 0}%` }}
                        ></div>
                      </div>
                      {Math.round(orgData.metrics.engagement?.average || 0)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-success-600 h-2 rounded-full" 
                          style={{ width: `${orgData.metrics.skill_progress?.average || 0}%` }}
                        ></div>
                      </div>
                      {Math.round(orgData.metrics.skill_progress?.average || 0)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-warning-600 h-2 rounded-full" 
                          style={{ width: `${orgData.metrics.compliance?.average || 0}%` }}
                        ></div>
                      </div>
                      {Math.round(orgData.metrics.compliance?.average || 0)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-secondary-600 h-2 rounded-full" 
                          style={{ width: `${orgData.metrics.performance?.average || 0}%` }}
                        ></div>
                      </div>
                      {Math.round(orgData.metrics.performance?.average || 0)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trends */}
      {dashboardData?.trends && Object.keys(dashboardData.trends).length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Trends</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(dashboardData.trends).map(([metricType, trend]) => (
              <div key={metricType} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 capitalize">
                    {metricType.replace('_', ' ')}
                  </h4>
                  <div className={`flex items-center ${
                    trend.direction === 'up' ? 'text-success-600' : 
                    trend.direction === 'down' ? 'text-error-600' : 'text-gray-600'
                  }`}>
                    {trend.direction === 'up' ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : trend.direction === 'down' ? (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    ) : null}
                    {Math.abs(trend.change)}%
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  From {trend.firstValue}% to {trend.lastValue}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {dashboardData?.lastUpdated ? 
          new Date(dashboardData.lastUpdated).toLocaleString() : 
          'Never'
        }
      </div>
    </div>
  );
}

export default AdminDashboard;