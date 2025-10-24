import React from 'react';

const ReportsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Reports
          </h1>
          <p className="mt-2 text-gray-600">
            Generate and manage executive reports
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Report Generation
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Report Type</label>
                  <select className="input">
                    <option>Course Analytics</option>
                    <option>User Engagement</option>
                    <option>Performance Trends</option>
                    <option>AI Insights</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Start Date</label>
                    <input type="date" className="input" />
                  </div>
                  <div>
                    <label className="label">End Date</label>
                    <input type="date" className="input" />
                  </div>
                </div>
                <button className="btn btn-primary">
                  Generate Report
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Reports
              </h2>
              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">Course Analytics</h3>
                      <p className="text-sm text-gray-600">Jan 2024</p>
                    </div>
                    <button className="btn btn-outline btn-sm">
                      View
                    </button>
                  </div>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">User Engagement</h3>
                      <p className="text-sm text-gray-600">Dec 2023</p>
                    </div>
                    <button className="btn btn-outline btn-sm">
                      View
                    </button>
                  </div>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">Performance Trends</h3>
                      <p className="text-sm text-gray-600">Nov 2023</p>
                    </div>
                    <button className="btn btn-outline btn-sm">
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

