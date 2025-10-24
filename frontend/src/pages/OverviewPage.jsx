import React from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const ReportCard = ({ title, chartType, data, summary, onViewDetails }) => {
  const renderChart = () => {
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 11,
              weight: '500'
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          cornerRadius: 8
        }
      }
    };

    switch (chartType) {
      case 'bar':
        return <Bar data={data} options={commonOptions} />;
      case 'line':
        return <Line data={data} options={commonOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={commonOptions} />;
      default:
        return <Bar data={data} options={commonOptions} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button
          onClick={onViewDetails}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Details →
        </button>
      </div>
      
      <div className="h-64 mb-4">
        {renderChart()}
      </div>
      
      <div className="text-sm text-gray-600">
        {summary}
      </div>
    </div>
  );
};

const OverviewPage = () => {
  // Active vs Registered Users Data
  const activeUsersData = {
    labels: ['JavaScript Fundamentals', 'Python for Data Science'],
    datasets: [
      {
        label: 'Registered Users',
        data: [24, 18],
        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(34, 197, 94, 0.8)'],
        borderColor: ['rgba(59, 130, 246, 1)', 'rgba(34, 197, 94, 1)'],
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Active Users',
        data: [18, 15],
        backgroundColor: ['rgba(147, 197, 253, 0.8)', 'rgba(134, 239, 172, 0.8)'],
        borderColor: ['rgba(147, 197, 253, 1)', 'rgba(134, 239, 172, 1)'],
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  };

  // Course Completion Trends Data
  const completionTrendsData = {
    labels: ['JavaScript Fundamentals', 'Python for Data Science'],
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: [70, 85],
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
      }
    ]
  };

  // Skill Level Distribution Data
  const skillDistributionData = {
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

  // User Engagement Levels Data
  const engagementData = {
    labels: ['Low', 'Medium', 'High', 'Very High'],
    datasets: [
      {
        label: 'Users',
        data: [15, 25, 35, 25],
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderColor: [
          'rgba(139, 92, 246, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)'
        ],
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  };

  const handleViewDetails = (reportType) => {
    // This would navigate to the specific report page
    console.log(`Viewing details for: ${reportType}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportCard
          title="Active vs Registered Users by Course"
          chartType="bar"
          data={activeUsersData}
          summary="JavaScript Fundamentals shows higher registration but Python for Data Science has better active user retention."
          onViewDetails={() => handleViewDetails('Course Analytics')}
        />
        
        <ReportCard
          title="Course Completion Trends"
          chartType="line"
          data={completionTrendsData}
          summary="Python for Data Science shows 15% higher completion rate compared to JavaScript Fundamentals."
          onViewDetails={() => handleViewDetails('Course Analytics')}
        />
        
        <ReportCard
          title="Skill Level Distribution"
          chartType="doughnut"
          data={skillDistributionData}
          summary="Most users are at Intermediate level (35%), with Advanced users representing 28% of the population."
          onViewDetails={() => handleViewDetails('Skill Development')}
        />
        
        <ReportCard
          title="User Engagement Levels"
          chartType="bar"
          data={engagementData}
          summary="High engagement users dominate at 35%, indicating strong platform adoption and user satisfaction."
          onViewDetails={() => handleViewDetails('User Engagement')}
        />
      </div>
      
      {/* AI Insights Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Generated Insights</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-900">High Completion Rate Detected</h4>
                <p className="text-sm text-blue-700 mt-1">Python for Data Science shows exceptional completion rates. Consider expanding similar content structure to other courses.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-green-900">Engagement Trend Analysis</h4>
                <p className="text-sm text-green-700 mt-1">User engagement levels are trending upward. High engagement users increased by 12% this month.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;

