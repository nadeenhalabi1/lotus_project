import React, { useState, useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { generateEnhancedPDF } from '../utils/pdfGenerator';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const SkillDevelopmentPage = () => {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    fetchData();
    
    const handleRefresh = () => {
      fetchData();
    };
    
    window.addEventListener('refreshData', handleRefresh);
    return () => window.removeEventListener('refreshData', handleRefresh);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockChartData = {
        labels: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        datasets: [
          {
            data: [25, 35, 28, 12],
            backgroundColor: [
              'rgba(239, 68, 68, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)'
            ],
            borderColor: [
              'rgba(239, 68, 68, 1)',
              'rgba(245, 158, 11, 1)',
              'rgba(59, 130, 246, 1)',
              'rgba(16, 185, 129, 1)'
            ],
            borderWidth: 2,
            hoverOffset: 4
          }
        ]
      };

      const mockTableData = [
        {
          skill: 'JavaScript',
          beginner: 15,
          intermediate: 45,
          advanced: 30,
          expert: 10,
          totalUsers: 100
        },
        {
          skill: 'Python',
          beginner: 20,
          intermediate: 40,
          advanced: 25,
          expert: 15,
          totalUsers: 100
        },
        {
          skill: 'React',
          beginner: 25,
          intermediate: 35,
          advanced: 30,
          expert: 10,
          totalUsers: 100
        },
        {
          skill: 'Machine Learning',
          beginner: 30,
          intermediate: 30,
          advanced: 25,
          expert: 15,
          totalUsers: 100
        },
        {
          skill: 'Data Analysis',
          beginner: 18,
          intermediate: 42,
          advanced: 28,
          expert: 12,
          totalUsers: 100
        }
      ];

      setChartData(mockChartData);
      setTableData(mockTableData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const reportData = {
        summary: `Skill Development Report generated on ${new Date().toLocaleDateString()}. This report contains comprehensive data about skill development progress, course completion, and learning outcomes including visual charts and detailed tables.`,
        metrics: {
          'Total Skills': tableData.length,
          'Total Users': tableData.reduce((sum, row) => sum + row.totalUsers, 0),
          'Average Expert Level': `${(tableData.reduce((sum, row) => sum + row.expert, 0) / tableData.reduce((sum, row) => sum + row.totalUsers, 0) * 100).toFixed(1)}%`
        },
        tableData: tableData
      };

      // Chart elements to capture
      const chartElements = ['skill-development-chart'];

      const result = await generateEnhancedPDF(reportData, 'Skill Development Report', chartElements);
      
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      title: {
        display: true,
        text: 'Skill Level Distribution',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed}% (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div id="skill-development-content" className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Skill Development</h2>
        <div className="flex space-x-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : (
              'Refresh Data'
            )}
          </button>
          <button
            onClick={downloadReport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Chart */}
      <div id="skill-development-chart" className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="h-96">
          {chartData && <Doughnut data={chartData} options={chartOptions} />}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Skill Development Data</h3>
          <p className="text-sm text-gray-500">Breakdown of user skill levels across different technologies</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skill
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beginner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Intermediate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Advanced
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expert
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Users
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.skill}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{width: `${row.beginner}%`}}></div>
                      </div>
                      <span>{row.beginner}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${row.intermediate}%`}}></div>
                      </div>
                      <span>{row.intermediate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: `${row.advanced}%`}}></div>
                      </div>
                      <span>{row.advanced}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: `${row.expert}%`}}></div>
                      </div>
                      <span>{row.expert}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.totalUsers}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Generated Insights</h3>
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-green-900">Strong Intermediate Base</h4>
                <p className="text-sm text-green-700 mt-1">35% of users are at intermediate level, indicating good progression from beginner courses. Focus on advanced content to help them advance further.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-900">Expert Level Opportunity</h4>
                <p className="text-sm text-blue-700 mt-1">Only 12% of users reach expert level. Consider creating specialized expert tracks and mentorship programs to increase this percentage.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillDevelopmentPage;

