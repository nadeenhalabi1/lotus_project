import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Download, Filter, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { chartsAPI } from '../../services/api';
import { BarChart, LineChart, PieChart, AreaChart } from '../Charts';
import MultiSeriesBarChart from '../Charts/MultiSeriesBarChart';
import MultiSeriesLineChart from '../Charts/MultiSeriesLineChart';
import MultiSeriesAreaChart from '../Charts/MultiSeriesAreaChart';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import { useTheme } from '../../context/ThemeContext';
import html2canvas from 'html2canvas';

const ChartDetailPage = () => {
  const { chartId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [staleInfo, setStaleInfo] = useState({
    isStale: location.state?.isStale || false,
    lastUpdated: location.state?.lastUpdated || null
  });
  const chartRef = useRef(null); // Ref for the chart container
  
  // Course filtering state
  const [courses, setCourses] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [isCourseChart, setIsCourseChart] = useState(false);
  const [showCourseFilter, setShowCourseFilter] = useState(false);
  const [filtering, setFiltering] = useState(false);
  
  // Dynamic background based on theme
  const getBackgroundStyle = () => {
    if (theme === 'dark') {
      return {
        background: `linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.98) 100%)`, // gray-800 to gray-900
      };
    }
    return {
      background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)`,
    };
  };

  useEffect(() => {
    const fetchChart = async () => {
      try {
        setLoading(true);
        const response = await chartsAPI.getChart(chartId);
        const chartData = response.data;
        setChart(chartData);

        setStaleInfo((prev) => ({
          isStale: prev.isStale || chartData.metadata?.isStale || false,
          lastUpdated: chartData.metadata?.lastUpdated || prev.lastUpdated
        }));

        // Check if this is a course-related chart
        const isCourse = chartData.metadata?.services?.includes('courseBuilder') || 
                        chartData.metadata?.service === 'courseBuilder' ||
                        chartData.metadata?.services?.includes('assessment') ||
                        chartData.metadata?.service === 'assessment' ||
                        chartId?.includes('course') ||
                        chartId?.includes('enrollments') ||
                        chartId?.includes('top-courses') ||
                        chartId?.includes('rating-vs-engagement') ||
                        chartId?.includes('dropoff');
        
        setIsCourseChart(isCourse);

        // If it's a course chart, load available courses
        if (isCourse) {
          try {
            const coursesResponse = await chartsAPI.getCourses();
            setCourses(coursesResponse.data.courses || []);
            // Initialize with all courses selected
            setSelectedCourseIds(coursesResponse.data.courses?.map(c => c.id) || []);
          } catch (err) {
            console.error('Failed to load courses:', err);
          }
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load chart');
      } finally {
        setLoading(false);
      }
    };

    fetchChart();
  }, [chartId]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await chartsAPI.refreshChart(chartId);
      const refreshedChart = response.data.chart;
      setChart(refreshedChart);
      
      setStaleInfo({
        isStale: refreshedChart.metadata?.isStale || false,
        lastUpdated: refreshedChart.metadata?.lastUpdated || null
      });

      // Reload courses if it's a course chart
      if (isCourseChart) {
        try {
          const coursesResponse = await chartsAPI.getCourses();
          setCourses(coursesResponse.data.courses || []);
        } catch (err) {
          console.error('Failed to reload courses:', err);
        }
      }
    } catch (err) {
      console.error('Refresh error:', err);
      setError(err.response?.data?.error || 'Failed to refresh chart data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCourseFilter = async () => {
    if (!isCourseChart || selectedCourseIds.length === 0) return;

    try {
      setFiltering(true);
      const response = await chartsAPI.getFilteredChart(chartId, selectedCourseIds);
      const filteredChart = response.data;
      setChart(filteredChart);
      setShowCourseFilter(false);
    } catch (err) {
      console.error('Filter error:', err);
      setError(err.response?.data?.error || 'Failed to filter chart data');
    } finally {
      setFiltering(false);
    }
  };

  const handleClearFilter = async () => {
    try {
      setFiltering(true);
      // Reload original chart
      const response = await chartsAPI.getChart(chartId);
      const chartData = response.data;
      setChart(chartData);
      setSelectedCourseIds(courses.map(c => c.id));
      setShowCourseFilter(false);
    } catch (err) {
      console.error('Clear filter error:', err);
      setError(err.response?.data?.error || 'Failed to clear filter');
    } finally {
      setFiltering(false);
    }
  };

  const toggleCourseSelection = (courseId) => {
    setSelectedCourseIds(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const selectAllCourses = () => {
    setSelectedCourseIds(courses.map(c => c.id));
  };

  const deselectAllCourses = () => {
    setSelectedCourseIds([]);
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      setError(null); // Clear previous errors
      
      console.log('Starting PDF download for chart:', chartId);
      
      // Capture chart as image
      let chartImageBase64 = null;
      if (chartRef.current) {
        try {
          console.log('Capturing chart image...');
          const canvas = await html2canvas(chartRef.current, {
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            scale: 2, // Higher quality
            logging: false,
            useCORS: true
          });
          chartImageBase64 = canvas.toDataURL('image/png');
          console.log('Chart image captured, size:', chartImageBase64.length);
        } catch (canvasError) {
          console.warn('Failed to capture chart image:', canvasError);
          // Continue without image
        }
      }
      
      // Send chart image to server along with chartId
      const response = await chartsAPI.downloadChartPDF(chartId, chartImageBase64);
      
      // Check if response is actually a PDF
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      // Check content type
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('application/pdf') && !(response.data instanceof Blob)) {
        console.warn('Unexpected content type:', contentType);
      }
      
      // Create blob and download
      const blob = response.data instanceof Blob 
        ? response.data 
        : new Blob([response.data], { type: 'application/pdf' });
      
      if (blob.size === 0) {
        throw new Error('PDF file is empty');
      }
      
      console.log('PDF blob created, size:', blob.size);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeTitle = (chart?.title || 'chart').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `${safeTitle}-chart.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('PDF download completed successfully');
    } catch (err) {
      console.error('PDF download error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          'Failed to download PDF';
      setError(errorMessage);
    } finally {
      setDownloading(false);
    }
  };

  const renderChart = () => {
    if (!chart) return null;

    const colorScheme = chart.metadata?.colorScheme || {
      primary: '#10b981',
      secondary: '#34d399',
      gradient: ['#10b981', '#34d399', '#6ee7b7']
    };

    const chartProps = {
      data: chart.data,
      width: '100%',
      height: 600, // Much larger than dashboard (400px -> 600px)
      colorScheme: colorScheme,
    };

    // Check if this is a multi-series chart
    const isMultiSeries = chart.data && chart.data.length > 0 && 
      Object.keys(chart.data[0]).filter(key => key !== 'name').length > 1;

    switch (chart.type) {
      case 'bar':
        return isMultiSeries ? <MultiSeriesBarChart {...chartProps} /> : <BarChart {...chartProps} />;
      case 'line':
        return isMultiSeries ? <MultiSeriesLineChart {...chartProps} /> : <LineChart {...chartProps} />;
      case 'pie':
        return <PieChart {...chartProps} />;
      case 'area':
        return isMultiSeries ? <MultiSeriesAreaChart {...chartProps} /> : <AreaChart {...chartProps} />;
      default:
        return isMultiSeries ? <MultiSeriesBarChart {...chartProps} /> : <BarChart {...chartProps} />;
    }
  };

  // Convert chart data to table format
  const getTableData = () => {
    if (!chart || !chart.data || !Array.isArray(chart.data) || chart.data.length === 0) {
      return null;
    }

    // Get all keys from the first data item (excluding 'name')
    const firstItem = chart.data[0];
    const dataKeys = Object.keys(firstItem).filter(key => key !== 'name');
    
    // If it's a simple chart (only 'name' and 'value'), create simple table
    if (dataKeys.length === 1 && dataKeys[0] === 'value') {
      return {
        headers: ['Name', 'Value'],
        rows: chart.data.map(item => [item.name || 'N/A', item.value || 0])
      };
    }

    // Multi-series chart - show all columns
    return {
      headers: ['Name', ...dataKeys],
      rows: chart.data.map(item => [
        item.name || 'N/A',
        ...dataKeys.map(key => item[key] !== undefined ? item[key] : 'N/A')
      ])
    };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }

  if (!chart) {
    return <ErrorMessage message="Chart not found" />;
  }

  const formatDateTime = (value) => {
    if (!value) return 'Unknown';
    const date = new Date(value);
    return `${date.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-primary-700 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Dashboard</span>
      </button>

      <div 
        className="card border-2 border-transparent"
        style={{
          ...getBackgroundStyle(),
          boxShadow: theme === 'dark' 
            ? `0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)`
            : undefined
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
              {chart.title}
            </h1>
            {chart.subtitle && (
              <p className="text-lg font-medium text-neutral-500 dark:text-neutral-400">
                {chart.subtitle}
              </p>
            )}
            {chart.description && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                {chart.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {staleInfo.isStale && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 shadow-sm">
                Stale Data
              </span>
            )}
            {isCourseChart && (
              <button
                onClick={() => setShowCourseFilter(!showCourseFilter)}
                className="btn-secondary flex items-center space-x-2"
                aria-label="Filter by courses"
              >
                <Filter className="h-5 w-5" />
                <span>Filter Courses</span>
                {chart.metadata?.filtered && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-primary-700 text-white rounded-full">
                    {chart.metadata?.courseCount || selectedCourseIds.length}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-primary flex items-center space-x-2"
              aria-label="Refresh chart data"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="btn-secondary flex items-center space-x-2"
              aria-label="Download PDF"
            >
              <Download className={`h-5 w-5 ${downloading ? 'animate-pulse' : ''}`} />
              <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* Course Filter Panel */}
        {isCourseChart && showCourseFilter && (
          <div className="mb-6 p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Select Courses to Display
              </h3>
              <button
                onClick={() => setShowCourseFilter(false)}
                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors duration-fast"
                aria-label="Close filter"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4 flex items-center gap-2">
              <button
                onClick={selectAllCourses}
                className="text-sm text-primary-700 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                Select All
              </button>
              <span className="text-neutral-400">|</span>
              <button
                onClick={deselectAllCourses}
                className="text-sm text-neutral-600 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300 font-medium"
              >
                Deselect All
              </button>
              <span className="text-sm text-neutral-500 dark:text-neutral-400 ml-auto">
                {selectedCourseIds.length} of {courses.length} selected
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 p-4">
              <div className="space-y-2">
                {courses.map(course => (
                  <label
                    key={course.id}
                    className="flex items-start gap-3 p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCourseIds.includes(course.id)}
                      onChange={() => toggleCourseSelection(course.id)}
                      className="mt-1 h-4 w-4 text-primary-700 focus:ring-primary-500 border-neutral-300 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                        {course.name}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {course.topic} • {course.duration}h • {course.totalEnrollments} enrollments
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
              {chart.metadata?.filtered && (
                <button
                  onClick={handleClearFilter}
                  disabled={filtering}
                  className="text-sm text-neutral-600 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300 font-medium"
                >
                  Clear Filter
                </button>
              )}
              <button
                onClick={handleCourseFilter}
                disabled={filtering || selectedCourseIds.length === 0}
                className="btn-primary text-sm px-4 py-2"
              >
                {filtering ? 'Applying...' : 'Apply Filter'}
              </button>
            </div>
          </div>
        )}
        
        {/* Large Chart Display */}
        <div className="mb-8" ref={chartRef}>
          <div className="h-[600px] w-full">{renderChart()}</div>
        </div>

        {/* Data Table - Always show if data exists */}
        {(() => {
          const tableData = getTableData();
          if (!tableData) return null;

          return (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Data Table
              </h2>
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {tableData.headers.map((header, idx) => (
                        <th
                          key={idx}
                          className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {tableData.rows.map((row, rowIdx) => (
                      <tr 
                        key={rowIdx}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        {row.map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className={`px-6 py-4 text-sm ${
                              cellIdx === 0 
                                ? 'font-medium text-gray-900 dark:text-gray-100' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {typeof cell === 'number' ? cell.toLocaleString() : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Last updated: <span className="text-gray-700 dark:text-gray-300">{formatDateTime(staleInfo.lastUpdated || chart.metadata?.lastUpdated)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChartDetailPage;

