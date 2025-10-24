import React, { useState } from 'react';
import OverviewPage from './OverviewPage';
import CourseAnalyticsPage from './CourseAnalyticsPage';
import SkillDevelopmentPage from './SkillDevelopmentPage';
import UserEngagementPage from './UserEngagementPage';
import ExercisePerformancePage from './ExercisePerformancePage';
import PerformanceTrendsPage from './PerformanceTrendsPage';

const DataInsightsDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const tabs = [
    'Overview',
    'Course Analytics',
    'Skill Development',
    'User Engagement',
    'Exercise Performance',
    'Performance Trends'
  ];

  const refreshData = () => {
    setLastUpdated(new Date());
    // Trigger refresh for all components
    window.dispatchEvent(new CustomEvent('refreshData'));
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'Overview':
        return <OverviewPage />;
      case 'Course Analytics':
        return <CourseAnalyticsPage />;
      case 'Skill Development':
        return <SkillDevelopmentPage />;
      case 'User Engagement':
        return <UserEngagementPage />;
      case 'Exercise Performance':
        return <ExercisePerformancePage />;
      case 'Performance Trends':
        return <PerformanceTrendsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Data Insights Dashboard</h1>
              <p className="mt-1 text-lg text-gray-600">Advanced Analytics & Visualizations</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleString()}
              </div>
              <button
                onClick={refreshData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActivePage()}
      </main>
    </div>
  );
};

export default DataInsightsDashboard;

