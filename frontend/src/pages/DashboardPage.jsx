import React from 'react';
import DashboardCharts from '../components/Charts/DashboardCharts';
import { useTheme } from '../contexts/ThemeContext';
import Logo from '../components/Common/Logo';
import { generateEnhancedPDF } from '../utils/pdfGenerator';

const DashboardPage = () => {
  const { isDark, toggleTheme } = useTheme();

  const downloadDashboardReport = async () => {
    try {
      const reportData = {
        summary: `Executive Dashboard Report generated on ${new Date().toLocaleDateString()}. This comprehensive report provides insights into key performance indicators, user engagement metrics, and operational analytics including visual charts and detailed data tables.`,
        metrics: {
          'Total Users': '1,247',
          'Active Courses': '23',
          'Completion Rate': '87.3%',
          'Average Rating': '4.6/5',
          'Monthly Growth': '+12.5%',
          'User Satisfaction': '94.2%'
        }
      };

      // Chart elements to capture from dashboard
      const chartElements = ['dashboard-charts', 'ai-insights-panel'];

      const result = await generateEnhancedPDF(reportData, 'Executive Dashboard Report', chartElements);
      
      if (result.success) {
        console.log(`PDF report generated successfully: ${result.fileName}`);
      } else {
        console.error('Failed to generate PDF:', result.error);
        alert('Failed to generate PDF report. Please try again.');
      }
    } catch (error) {
      console.error('Error generating PDF report:', error);
      alert('Error generating PDF report. Please try again.');
    }
  };

  return (
    <div id="dashboard-content" className="min-h-screen bg-neutral-bg dark:bg-dark-bg">
      {/* Header */}
      <header className="bg-neutral-card dark:bg-dark-card shadow-card border-b border-neutral-card dark:border-dark-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
                    <div className="flex items-center">
                      <Logo className="w-16 h-16 mr-4" />
                      <div>
                        <span className="text-sm text-neutral-text2 dark:text-dark-text2">Management Reporting</span>
                      </div>
                    </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-neutral-text2 dark:text-dark-text2">Executive Dashboard</span>
              <button
                onClick={downloadDashboardReport}
                className="btn-primary flex items-center px-3 py-2 text-sm font-medium"
                aria-label="Download Dashboard Report"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-neutral-bg2 dark:bg-dark-bg2 hover:bg-neutral-bg3 dark:hover:bg-dark-bg3 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <svg className="w-5 h-5 text-accent-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-accent-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              <div className="w-8 h-8 bg-primary-purple rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">E</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-text dark:text-dark-text">Executive Dashboard</h2>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users Card */}
          <div className="card-gradient">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-blue/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-text2 dark:text-dark-text2">Total Users</p>
                <p className="text-2xl font-bold text-neutral-text dark:text-dark-text">12,345</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-xs text-accent-green bg-accent-green/10 px-2 py-1 rounded-full">+12% from last month</span>
            </div>
          </div>

          {/* Course Completions Card */}
          <div className="card-gradient">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-accent-green/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-text2 dark:text-dark-text2">Course Completions</p>
                <p className="text-2xl font-bold text-neutral-text dark:text-dark-text">8,765</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-xs text-accent-green bg-accent-green/10 px-2 py-1 rounded-full">+8% from last month</span>
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="card-gradient">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-purple/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-text2 dark:text-dark-text2">AI Insights</p>
                <p className="text-2xl font-bold text-neutral-text dark:text-dark-text">234</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-xs text-primary-blue bg-primary-blue/10 px-2 py-1 rounded-full">+15% from last month</span>
            </div>
          </div>

          {/* Active Sessions Card */}
          <div className="card-gradient">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-accent-orange/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-text2 dark:text-dark-text2">Active Sessions</p>
                <p className="text-2xl font-bold text-neutral-text dark:text-dark-text">1,234</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-xs text-accent-orange bg-accent-orange/10 px-2 py-1 rounded-full">+5% from last hour</span>
            </div>
          </div>
        </div>

        {/* Interactive Charts Section */}
        <div id="dashboard-charts" className="mb-8">
          <h3 className="text-2xl font-bold text-neutral-text dark:text-dark-text mb-4">Analytics Dashboard</h3>
          <DashboardCharts />
        </div>

        {/* Recent Reports Section */}
        <div className="card-gradient">
          <div className="px-6 py-4 border-b border-neutral-card dark:border-dark-card">
            <h3 className="text-lg font-semibold text-neutral-text dark:text-dark-text">Recent Reports</h3>
            <p className="text-sm text-neutral-text2 dark:text-dark-text2">Latest AI-generated insights and analytics</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Report Item 1 */}
              <div className="flex items-center justify-between p-4 bg-neutral-bg2 dark:bg-dark-bg2 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary-blue/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-neutral-text dark:text-dark-text">Course Completion Trends - Q3</h4>
                    <p className="text-xs text-neutral-text2 dark:text-dark-text2">Generated 2 hours ago • 85% completion rate</p>
                  </div>
                </div>
                <button className="btn btn-primary">
                  View Report
                </button>
              </div>

              {/* Report Item 2 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Skill Gap Analysis - Marketing Team</h4>
                    <p className="text-xs text-gray-500">Generated 4 hours ago • 3 critical gaps identified</p>
                  </div>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  View Report
                </button>
              </div>

              {/* Report Item 3 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Platform Performance Overview - October</h4>
                    <p className="text-xs text-gray-500">Generated 6 hours ago • 99.2% uptime achieved</p>
                  </div>
                </div>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  View Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-card dark:bg-dark-card border-t border-neutral-card dark:border-dark-card mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-neutral-text2 dark:text-dark-text2">
              © 2024 educoreAI Management Reporting System
            </div>
            <div className="text-sm text-neutral-text2 dark:text-dark-text2">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;
