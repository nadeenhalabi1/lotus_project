import React from 'react';
import CourseEnrollmentChart from '../components/Charts/CourseEnrollmentChart';
import CompletionTrendsChart from '../components/Charts/CompletionTrendsChart';
import SkillGapAnalysisChart from '../components/Charts/SkillGapAnalysisChart';
import PerformanceMetricsChart from '../components/Charts/PerformanceMetricsChart';
import AIInsightsPanel from '../components/Charts/AIInsightsPanel';

function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">educoreAI</h1>
              <span className="ml-2 text-sm text-gray-500">Management Reporting Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Executive Dashboard</span>
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">E</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview Cards */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Executive Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Users Card */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">12,345</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">+12% from last month</span>
              </div>
            </div>

            {/* Course Completions Card */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Course Completions</p>
                  <p className="text-2xl font-bold text-gray-900">8,765</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">+8% from last month</span>
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">AI Insights</p>
                  <p className="text-2xl font-bold text-gray-900">234</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">+15% from last month</span>
              </div>
            </div>

            {/* Active Sessions Card */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">1,234</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">+5% from last hour</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-8">
          {/* Course Enrollment Chart */}
          <CourseEnrollmentChart />

          {/* Performance Metrics and Completion Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PerformanceMetricsChart />
            <CompletionTrendsChart />
          </div>

          {/* Skill Gap Analysis */}
          <SkillGapAnalysisChart />

          {/* AI Insights Panel */}
          <AIInsightsPanel />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              © 2024 educoreAI Management Reporting System
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default DashboardPage;

