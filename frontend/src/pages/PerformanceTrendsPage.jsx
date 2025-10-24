import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { generateEnhancedPDF } from '../utils/pdfGenerator';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PerformanceTrendsPage = () => {
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
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Course Completion Rate (%)',
            data: [68, 71, 73, 75, 72, 74, 76, 78, 75, 77, 79, 82],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
          },
          {
            label: 'User Engagement (%)',
            data: [72, 75, 78, 80, 77, 79, 81, 83, 80, 82, 84, 87],
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgb(16, 185, 129)',
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
          },
          {
            label: 'Skill Acquisition (%)',
            data: [65, 68, 70, 72, 69, 71, 73, 75, 72, 74, 76, 79],
            borderColor: 'rgb(139, 92, 246)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgb(139, 92, 246)',
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
          }
        ]
      };

      const mockTableData = [
        {
          month: 'January',
          completionRate: 68,
          engagement: 72,
          skillAcquisition: 65,
          trend: 'stable'
        },
        {
          month: 'February',
          completionRate: 71,
          engagement: 75,
          skillAcquisition: 68,
          trend: 'increasing'
        },
        {
          month: 'March',
          completionRate: 73,
          engagement: 78,
          skillAcquisition: 70,
          trend: 'increasing'
        },
        {
          month: 'April',
          completionRate: 75,
          engagement: 80,
          skillAcquisition: 72,
          trend: 'increasing'
        },
        {
          month: 'May',
          completionRate: 72,
          engagement: 77,
          skillAcquisition: 69,
          trend: 'decreasing'
        },
        {
          month: 'June',
          completionRate: 74,
          engagement: 79,
          skillAcquisition: 71,
          trend: 'increasing'
        },
        {
          month: 'July',
          completionRate: 76,
          engagement: 81,
          skillAcquisition: 73,
          trend: 'increasing'
        },
        {
          month: 'August',
          completionRate: 78,
          engagement: 83,
          skillAcquisition: 75,
          trend: 'increasing'
        },
        {
          month: 'September',
          completionRate: 75,
          engagement: 80,
          skillAcquisition: 72,
          trend: 'decreasing'
        },
        {
          month: 'October',
          completionRate: 77,
          engagement: 82,
          skillAcquisition: 74,
          trend: 'increasing'
        },
        {
          month: 'November',
          completionRate: 79,
          engagement: 84,
          skillAcquisition: 76,
          trend: 'increasing'
        },
        {
          month: 'December',
          completionRate: 82,
          engagement: 87,
          skillAcquisition: 79,
          trend: 'increasing'
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
        summary: `Performance Trends Report generated on ${new Date().toLocaleDateString()}. This report contains comprehensive data about performance trends, completion rates, and skill acquisition metrics including visual charts and detailed tables.`,
        metrics: {
          'Average Completion Rate': `${(tableData.reduce((sum, row) => sum + parseFloat(row.completionRate), 0) / tableData.length).toFixed(1)}%`,
          'Average Engagement': `${(tableData.reduce((sum, row) => sum + parseFloat(row.engagement), 0) / tableData.length).toFixed(1)}%`,
          'Average Skill Acquisition': `${(tableData.reduce((sum, row) => sum + parseFloat(row.skillAcquisition), 0) / tableData.length).toFixed(1)}%`
        },
        tableData: tableData
      };

      // Chart elements to capture
      const chartElements = ['performance-trends-chart'];

      const result = await generateEnhancedPDF(reportData, 'Performance Trends Report', chartElements);
      
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
        position: 'top',
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
        text: 'Performance Trends Over Time',
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
            return `${context.dataset.label}: ${context.parsed.y}%`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          callback: function(value) {
            return value + '%';
          },
          font: {
            size: 11
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div id="performance-trends-content" className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Performance Trends</h2>
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
      <div id="performance-trends-chart" className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="h-96">
          {chartData && <Line data={chartData} options={chartOptions} />}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Performance Trends Data</h3>
          <p className="text-sm text-gray-500">Monthly performance metrics and trend analysis</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skill Acquisition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.completionRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.engagement}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.skillAcquisition}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      row.trend === 'increasing' ? 'bg-green-100 text-green-800' :
                      row.trend === 'decreasing' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {row.trend === 'increasing' ? '↗' : row.trend === 'decreasing' ? '↘' : '→'} {row.trend}
                    </span>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-green-900">Strong Upward Trend</h4>
                <p className="text-sm text-green-700 mt-1">All performance metrics show consistent upward trends throughout the year, with 14% improvement in completion rates and 15% increase in engagement.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-900">Seasonal Patterns Detected</h4>
                <p className="text-sm text-blue-700 mt-1">Performance dips in May and September suggest seasonal patterns. Consider implementing targeted engagement strategies during these periods.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTrendsPage;

