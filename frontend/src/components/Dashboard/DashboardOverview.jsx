import React from 'react';

const DashboardOverview = () => {
  const mockData = {
    totalReports: 156,
    activeUsers: 23,
    completionRate: 87,
    lastUpdated: new Date().toLocaleString()
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-neutral-text dark:text-dark-text">Overview</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="card-gradient">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-text2 dark:text-dark-text2">Total Reports</p>
              <p className="text-2xl font-bold text-neutral-text dark:text-dark-text">{mockData.totalReports}</p>
            </div>
            <div className="p-2 bg-primary-blue/10 rounded-lg">
              <svg className="w-6 h-6 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card-gradient">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-text2 dark:text-dark-text2">Active Users</p>
              <p className="text-2xl font-bold text-neutral-text dark:text-dark-text">{mockData.activeUsers}</p>
            </div>
            <div className="p-2 bg-primary-purple/10 rounded-lg">
              <svg className="w-6 h-6 text-primary-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card-gradient col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-text2 dark:text-dark-text2">Completion Rate</p>
              <p className="text-2xl font-bold text-neutral-text dark:text-dark-text">{mockData.completionRate}%</p>
            </div>
            <div className="p-2 bg-accent-green/10 rounded-lg">
              <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-neutral-muted dark:text-dark-muted">
        Last updated: {mockData.lastUpdated}
      </div>
    </div>
  );
};

export default DashboardOverview;

