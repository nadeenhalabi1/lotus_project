import React, { useState } from 'react';

const DashboardTabs = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'course-analytics', label: 'Course Analytics', icon: '📚' },
    { id: 'user-engagement', label: 'User Engagement', icon: '👥' },
    { id: 'performance-trends', label: 'Performance Trends', icon: '📈' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card-gradient">
                <h3 className="text-lg font-semibold text-neutral-text dark:text-dark-text mb-4">System Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-text2 dark:text-dark-text2">API Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-green/10 text-accent-green">
                      Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-text2 dark:text-dark-text2">Database</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-green/10 text-accent-green">
                      Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-text2 dark:text-dark-text2">AI Service</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-green/10 text-accent-green">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-gradient">
                <h3 className="text-lg font-semibold text-neutral-text dark:text-dark-text mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="btn btn-primary w-full text-left">
                    Generate New Report
                  </button>
                  <button className="btn btn-outline w-full text-left">
                    Refresh Data
                  </button>
                  <button className="btn btn-outline w-full text-left">
                    Export Reports
                  </button>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Report generated 2 hours ago</div>
                  <div>• AI insights updated 4 hours ago</div>
                  <div>• Data refreshed 6 hours ago</div>
                  <div>• New user onboarded yesterday</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'course-analytics':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Top Performing Courses</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Introduction to AI</span>
                      <span className="text-sm font-medium">92% completion</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Machine Learning Basics</span>
                      <span className="text-sm font-medium">87% completion</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Data Analysis</span>
                      <span className="text-sm font-medium">84% completion</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Course Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Courses</span>
                      <span className="text-sm font-medium">45</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Courses</span>
                      <span className="text-sm font-medium">38</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Rating</span>
                      <span className="text-sm font-medium">4.2/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'user-engagement':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">23</div>
                  <div className="text-sm text-gray-600">Daily Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary-600">156</div>
                  <div className="text-sm text-gray-600">Weekly Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">423</div>
                  <div className="text-sm text-gray-600">Monthly Active Users</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'performance-trends':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Completion Rate Trend</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">This Month</span>
                      <span className="text-sm font-medium text-green-600">87%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Month</span>
                      <span className="text-sm font-medium">84%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Trend</span>
                      <span className="text-sm font-medium text-green-600">↗ +3%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">User Growth</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">This Month</span>
                      <span className="text-sm font-medium">180</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Month</span>
                      <span className="text-sm font-medium">175</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Growth</span>
                      <span className="text-sm font-medium text-green-600">↗ +5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
        <div className="border-b border-neutral-card dark:border-dark-card">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-blue text-primary-blue'
                    : 'border-transparent text-neutral-text2 dark:text-dark-text2 hover:text-neutral-text dark:hover:text-dark-text hover:border-neutral-card dark:hover:border-dark-card'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default DashboardTabs;

