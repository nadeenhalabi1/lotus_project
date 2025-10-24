import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { generateEnhancedPDF } from '../../utils/pdfGenerator';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardCharts = () => {
  const [courseData, setCourseData] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);
  const [skillData, setSkillData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch course data
      const courseResponse = await fetch('http://localhost:3001/api/enhanced/coursebuilder/courses?normalize=true');
      const courseResult = await courseResponse.json();
      setCourseData(courseResult.data);

      // Fetch assessment data
      const assessmentResponse = await fetch('http://localhost:3001/api/enhanced/assessment/tests?normalize=true');
      const assessmentResult = await assessmentResponse.json();
      setAssessmentData(assessmentResult.data);

      // Fetch skill data
      const skillResponse = await fetch('http://localhost:3001/api/enhanced/learnerai/skills/proficiency/0.7?normalize=true');
      const skillResult = await skillResponse.json();
      setSkillData(skillResult.data);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Download functionality - now generates PDF instead of JSON
  const downloadData = async (data, filename, chartId, reportTitle) => {
    try {
      const reportData = {
        summary: `${reportTitle} Report generated on ${new Date().toLocaleDateString()}. This report contains comprehensive data including visual charts and detailed tables.`,
        metrics: {
          'Total Records': data?.length || 0,
          'Data Type': reportTitle,
          'Generated': new Date().toLocaleString()
        },
        tableData: data || []
      };

      // Chart elements to capture
      const chartElements = chartId ? [chartId] : [];

      const result = await generateEnhancedPDF(reportData, reportTitle, chartElements);
      
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

  // Course Enrollment vs Active Users Chart
  const courseEnrollmentChart = {
    labels: courseData?.map(course => course.title) || [],
    datasets: [
      {
        label: 'Total Enrollments',
        data: courseData?.map(course => course.totalEnrollments) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
      {
        label: 'Active Enrollments',
        data: courseData?.map(course => course.activeEnrollments) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      }
    ]
  };

  // Course Completion Rates Chart
  const completionRateChart = {
    labels: courseData?.map(course => course.title) || [],
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: courseData?.map(course => Math.round(course.completionRate * 100)) || [],
        backgroundColor: 'rgba(168, 85, 247, 0.5)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Test Scores Distribution Chart
  const testScoresChart = {
    labels: assessmentData?.map(test => test.title) || [],
    datasets: [
      {
        label: 'Average Score',
        data: assessmentData?.map(test => test.averageScore) || [],
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 2,
      },
      {
        label: 'Pass Rate (%)',
        data: assessmentData?.map(test => Math.round(test.passRate * 100)) || [],
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
      }
    ]
  };

  // Skill Proficiency Distribution Chart
  const skillProficiencyChart = {
    labels: ['Beginner (0-40%)', 'Intermediate (40-70%)', 'Advanced (70-90%)', 'Expert (90-100%)'],
    datasets: [
      {
        data: [
          skillData?.filter(skill => skill.proficiency < 0.4).length || 0,
          skillData?.filter(skill => skill.proficiency >= 0.4 && skill.proficiency < 0.7).length || 0,
          skillData?.filter(skill => skill.proficiency >= 0.7 && skill.proficiency < 0.9).length || 0,
          skillData?.filter(skill => skill.proficiency >= 0.9).length || 0
        ],
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
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
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
      },
      title: {
        display: true,
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Course Enrollment vs Active Users Chart */}
      <div id="course-enrollment-chart" className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Course Enrollment Analysis</h3>
              <p className="text-sm text-gray-500">Total vs Active enrollments across all courses</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadData(courseData, 'course-enrollment-data.json', 'course-enrollment-chart', 'Course Enrollment Analysis')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                📥 Download Data
              </button>
              <button
                onClick={fetchData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                🔄 Refresh Data
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="h-96">
            <Bar data={courseEnrollmentChart} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Course Enrollment vs Active Users'}}}} />
          </div>
          
          {/* Data Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Enrollments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Enrollments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courseData?.map((course, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.totalEnrollments.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.activeEnrollments.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Math.round((course.activeEnrollments / course.totalEnrollments) * 100)}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Math.round(course.completionRate * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Course Completion Rates Chart */}
      <div id="completion-trends-chart" className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Course Completion Trends</h3>
              <p className="text-sm text-gray-500">Completion rates across different courses</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadData(courseData?.map(course => ({title: course.title, completionRate: course.completionRate})), 'completion-rates-data.json', 'completion-trends-chart', 'Course Completion Trends')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                📥 Download Data
              </button>
              <button
                onClick={fetchData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                🔄 Refresh Data
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="h-96">
            <Line data={completionRateChart} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Course Completion Rates'}}}} />
          </div>
          
          {/* Data Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courseData?.map((course, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Math.round(course.completionRate * 100)}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.averageRating}/5.0</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{course.difficulty}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Test Scores Chart */}
      <div id="assessment-performance-chart" className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Assessment Performance</h3>
              <p className="text-sm text-gray-500">Average scores and pass rates across assessments</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadData(assessmentData, 'assessment-data.json', 'assessment-performance-chart', 'Assessment Performance')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                📥 Download Data
              </button>
              <button
                onClick={fetchData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                🔄 Refresh Data
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="h-96">
            <Bar data={testScoresChart} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Assessment Scores vs Pass Rates'}}}} />
          </div>
          
          {/* Data Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Attempts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assessmentData?.map((test, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{test.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.averageScore}/100</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Math.round(test.passRate * 100)}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.totalAttempts.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.totalQuestions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Skill Proficiency Distribution Chart */}
      <div id="skill-proficiency-chart" className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Skill Proficiency Distribution</h3>
              <p className="text-sm text-gray-500">Distribution of skill proficiency levels across all users</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadData(skillData, 'skill-proficiency-data.json', 'skill-proficiency-chart', 'Skill Proficiency')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                📥 Download Data
              </button>
              <button
                onClick={fetchData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                🔄 Refresh Data
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="h-96">
            <Doughnut data={skillProficiencyChart} options={{...doughnutOptions, plugins: {...doughnutOptions.plugins, title: {...doughnutOptions.plugins.title, text: 'Skill Proficiency Levels Distribution'}}}} />
          </div>
          
          {/* Data Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proficiency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acquired</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {skillData?.slice(0, 10).map((skill, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{skill.skill}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Math.round(skill.proficiency * 100)}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Math.round(skill.confidence * 100)}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{skill.proficiencyLevel}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(skill.acquiredAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Last Updated Info */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {lastUpdated.toLocaleString()}
      </div>
    </div>
  );
};

export default DashboardCharts;

