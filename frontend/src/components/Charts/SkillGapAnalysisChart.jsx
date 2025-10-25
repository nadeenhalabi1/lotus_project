import React, { useState, useEffect } from 'react';
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
import { Bar, Doughnut } from 'react-chartjs-2';
import { API_ENDPOINTS } from '../../config/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const SkillGapAnalysisChart = () => {
  const [skillGapData, setSkillGapData] = useState(null);
  const [departmentData, setDepartmentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkillGapData();
  }, []);

  const fetchSkillGapData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/microservices/analytics/skill-gaps`);
      const data = await response.json();
      
      if (data.success) {
        const skillGaps = data.data;
        
        // Process skill gap data for bar chart
        const gapLabels = [];
        const gapValues = [];
        const gapSeverity = [];
        
        skillGaps.forEach(dept => {
          dept.criticalGaps.forEach(gap => {
            gapLabels.push(`${dept.department} - ${gap.skill}`);
            gapValues.push(gap.affectedUsers);
            gapSeverity.push(gap.gapSeverity);
          });
        });

        const skillGapChartData = {
          labels: gapLabels,
          datasets: [
            {
              label: 'Users Affected',
              data: gapValues,
              backgroundColor: gapSeverity.map(severity => {
                switch(severity) {
                  case 'high': return 'rgba(239, 68, 68, 0.8)';
                  case 'medium': return 'rgba(245, 158, 11, 0.8)';
                  case 'low': return 'rgba(34, 197, 94, 0.8)';
                  default: return 'rgba(107, 114, 128, 0.8)';
                }
              }),
              borderColor: gapSeverity.map(severity => {
                switch(severity) {
                  case 'high': return 'rgba(239, 68, 68, 1)';
                  case 'medium': return 'rgba(245, 158, 11, 1)';
                  case 'low': return 'rgba(34, 197, 94, 1)';
                  default: return 'rgba(107, 114, 128, 1)';
                }
              }),
              borderWidth: 2,
              borderRadius: 4,
              borderSkipped: false,
            }
          ]
        };

        // Process department data for doughnut chart
        const deptLabels = skillGaps.map(dept => dept.department);
        const deptValues = skillGaps.map(dept => dept.criticalGaps.length);
        
        const departmentChartData = {
          labels: deptLabels,
          datasets: [
            {
              data: deptValues,
              backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)'
              ],
              borderColor: [
                'rgba(59, 130, 246, 1)',
                'rgba(16, 185, 129, 1)',
                'rgba(139, 92, 246, 1)',
                'rgba(245, 158, 11, 1)',
                'rgba(239, 68, 68, 1)'
              ],
              borderWidth: 2,
              hoverOffset: 4
            }
          ]
        };

        setSkillGapData(skillGapChartData);
        setDepartmentData(departmentChartData);
      }
    } catch (error) {
      console.error('Error fetching skill gap data:', error);
    } finally {
      setLoading(false);
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Critical Skill Gaps by Department',
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
            return `${context.parsed.y} users affected`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          font: {
            size: 10
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  const doughnutOptions = {
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
        text: 'Skill Gaps Distribution by Department',
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
            return `${context.label}: ${context.parsed} gaps (${percentage}%)`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="h-80">
          {skillGapData && <Bar data={skillGapData} options={barOptions} />}
        </div>
        
        {/* Doughnut Chart */}
        <div className="h-80">
          {departmentData && <Doughnut data={departmentData} options={doughnutOptions} />}
        </div>
      </div>
      
      {/* Legend for severity levels */}
      <div className="mt-6 flex justify-center space-x-6">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
          <span className="text-sm text-gray-600">High Severity</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Medium Severity</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Low Severity</span>
        </div>
      </div>
    </div>
  );
};

export default SkillGapAnalysisChart;

