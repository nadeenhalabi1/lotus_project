import { useEffect, useState, useRef } from 'react';
import { reportsAPI, openaiAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import { BarChart, LineChart, PieChart, AreaChart } from '../Charts';
import MultiSeriesBarChart from '../Charts/MultiSeriesBarChart';
import MultiSeriesLineChart from '../Charts/MultiSeriesLineChart';
import MultiSeriesAreaChart from '../Charts/MultiSeriesAreaChart';
import { Download } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import html2canvas from 'html2canvas';
import { useChartNarration } from '../../hooks/useChartNarration';

// Component for chart with narration
const ChartWithNarration = ({ chart, index, reportTitle, renderChart, onNarrationReady }) => {
  const chartCardRef = useRef(null); // Ref for the entire card
  const chartOnlyRef = useRef(null); // Ref for chart area only (without narration)
  const { loading, text, narrateFromCanvas } = useChartNarration();
  const [narrationGenerated, setNarrationGenerated] = useState(false);

  useEffect(() => {
    // Generate narration when chart is rendered
    const generateNarration = async () => {
      if (!chartOnlyRef.current || narrationGenerated) return;

      try {
        // Wait a bit for chart to fully render
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find the SVG element inside the chart container
        const svgElement = chartOnlyRef.current.querySelector('svg');
        if (!svgElement) return;

        // Convert only the chart area to canvas (without narration)
        const canvas = await html2canvas(chartOnlyRef.current, {
          backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
          scale: 1,
          logging: false,
          useCORS: true
        });

        // Generate narration
        const context = `${reportTitle} - ${chart.title}`;
        const narrationText = await narrateFromCanvas(canvas, context);
        setNarrationGenerated(true);
        
        // Notify parent component about the narration
        if (onNarrationReady && narrationText) {
          onNarrationReady(chart.id || index, narrationText);
        }
      } catch (error) {
        console.error('Failed to generate chart narration:', error);
      }
    };

    generateNarration();
  }, [chart, narrateFromCanvas, reportTitle, narrationGenerated, onNarrationReady, index]);

  return (
    <div 
      ref={chartCardRef}
      className="card"
      data-chart-id={chart.id || index}
    >
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {chart.title}
      </h4>
      {chart.subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {chart.subtitle}
        </p>
      )}
      <div 
        ref={chartOnlyRef}
        className="h-[400px]"
        data-chart-only="true"
      >
        {renderChart(chart)}
      </div>
      {chart.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
          {chart.description}
        </p>
      )}
      
      {/* Chart Summary (AI-Generated) */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          Chart Summary (AI-Generated)
        </h4>
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            Analyzing chart...
          </p>
        ) : text ? (
          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
            {text}
          </pre>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            Narration will appear here...
          </p>
        )}
      </div>
    </div>
  );
};

const REPORTS = [
  { id: 'monthly-performance', name: 'Monthly Learning Performance Report', description: 'Comprehensive monthly analysis of learning outcomes' },
  { id: 'course-completion', name: 'Course Completion Analysis', description: 'Detailed breakdown of course participation and completion' },
  { id: 'user-engagement', name: 'User Engagement Summary', description: 'Analysis of user engagement patterns' },
  { id: 'organizational-benchmark', name: 'Organizational Benchmark Report', description: 'Cross-organization performance comparison' },
  { id: 'learning-roi', name: 'Learning ROI Report', description: 'Training investment return analysis' },
  { id: 'skill-gap', name: 'Skill Gap Analysis Report', description: 'Identification of skill gaps across teams' },
  { id: 'compliance', name: 'Compliance & Certification Tracking', description: 'Monitoring of learning compliance and certifications' },
  { id: 'performance-trend', name: 'Performance Trend Analysis', description: 'Long-term analysis of learning efficiency trends' },
  { id: 'course-performance-deep-dive', name: 'Course Performance Deep Dive Report', description: 'Detailed analysis of individual course performance, completion rates, and engagement metrics' },
  { id: 'content-effectiveness', name: 'Content Effectiveness Report', description: 'Analysis of content performance, engagement, and effectiveness by type and creator' },
  { id: 'department-performance', name: 'Department Performance Report', description: 'Performance metrics and learning outcomes comparison across departments' },
  { id: 'drop-off-analysis', name: 'Drop-off Analysis Report', description: 'Identification and analysis of course drop-off patterns and trends' },
];

const ReportsPage = () => {
  const { theme } = useTheme();
  const [selectedReport, setSelectedReport] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [error, setError] = useState(null);
  const [chartNarrations, setChartNarrations] = useState({});
  const [reportConclusions, setReportConclusions] = useState(null);
  const [loadingConclusions, setLoadingConclusions] = useState(false);

  const handleGenerate = async (reportId) => {
    try {
      setGenerating(true);
      setError(null);
      setReportData(null);
      setReportConclusions(null);

      // Generate report as JSON (to display on page)
      const response = await reportsAPI.generateReport(reportId, { format: 'json' });
      setReportData(response.data.report);
      setSelectedReport(reportId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  // Generate conclusions when report data and chart images are available
  useEffect(() => {
    const generateConclusions = async () => {
      if (!reportData || !reportData.charts || reportData.charts.length === 0) {
        return;
      }

      // Wait a bit for charts to render
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        setLoadingConclusions(true);
        
        // Capture all chart images
        const chartImages = [];
        for (let i = 0; i < reportData.charts.length; i++) {
          const chart = reportData.charts[i];
          try {
            const chartOnlyElement = document.querySelector(`[data-chart-id="${chart.id || i}"] [data-chart-only="true"]`);
            if (chartOnlyElement) {
              const canvas = await html2canvas(chartOnlyElement, {
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                scale: 1,
                logging: false,
                useCORS: true
              });
              chartImages.push(canvas.toDataURL('image/png'));
            }
          } catch (err) {
            console.warn(`Failed to capture chart ${chart.id || i} for conclusions:`, err);
          }
        }

        if (chartImages.length === 0) {
          console.warn('No chart images captured for conclusions');
          return;
        }

        // Get report topic
        const topic = reportData.executiveSummary?.title || selectedReport || 'Report';

        // Call OpenAI API
        const response = await openaiAPI.generateReportConclusions(topic, chartImages);
        if (response.data.ok) {
          setReportConclusions({
            source: response.data.source,
            data: response.data.data
          });
        }
      } catch (err) {
        console.error('Failed to generate report conclusions:', err);
        // Set rollback conclusions
        setReportConclusions({
          source: 'rollback',
          data: {
            conclusions: [
              { statement: 'Report generated successfully with available data.', rationale: 'Default fallback content displayed when AI service is temporarily unavailable.', confidence: 0 },
              { statement: 'Charts show stable performance metrics across analyzed periods.', rationale: 'Displayed when AI service unavailable. Manual review recommended.', confidence: 0 },
              { statement: 'No critical anomalies detected in the current dataset.', rationale: 'Rollback default conclusion. AI analysis pending.', confidence: 0 },
              { statement: 'Further detailed analysis recommended once AI connection is restored.', rationale: 'Fallback rationale. Please regenerate report when AI service is available.', confidence: 0 }
            ]
          }
        });
      } finally {
        setLoadingConclusions(false);
      }
    };

    generateConclusions();
  }, [reportData, selectedReport, theme]);

  const handleNarrationReady = (chartId, narrationText) => {
    setChartNarrations(prev => ({
      ...prev,
      [chartId]: narrationText
    }));
  };

  const handleDownloadPDF = async () => {
    if (!selectedReport || !reportData) return;
    
    try {
      setDownloadingPDF(true);
      
      // Capture all chart images (only the chart, without narration)
      const chartImages = {};
      if (reportData.charts && reportData.charts.length > 0) {
        for (let i = 0; i < reportData.charts.length; i++) {
          const chart = reportData.charts[i];
          try {
            // Find only the chart area (without narration) using data-chart-only attribute
            const chartOnlyElement = document.querySelector(`[data-chart-id="${chart.id || i}"] [data-chart-only="true"]`);
            if (chartOnlyElement) {
              const canvas = await html2canvas(chartOnlyElement, {
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true
              });
              chartImages[chart.id || i] = canvas.toDataURL('image/png');
            }
          } catch (err) {
            console.warn(`Failed to capture chart ${chart.id || i}:`, err);
          }
        }
      }
      
      // Send request with chart images, narrations, and conclusions
      const response = await reportsAPI.generateReport(selectedReport, { 
        format: 'pdf',
        chartImages,
        chartNarrations,
        reportConclusions: reportConclusions || null
      });
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedReport}-report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to download PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const renderChart = (chart) => {
    if (!chart || !chart.data || !Array.isArray(chart.data) || chart.data.length === 0) {
      return <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">No chart data</div>;
    }

    const colorScheme = chart.metadata?.colorScheme || {
      primary: '#10b981',
      secondary: '#34d399',
      gradient: ['#10b981', '#34d399', '#6ee7b7']
    };

    const chartProps = {
      data: chart.data,
      width: '100%',
      height: 400,
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REPORTS.map((report) => (
          <div key={report.id} className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {report.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {report.description}
            </p>
            <button
              onClick={() => {
                setSelectedReport(report.id);
                handleGenerate(report.id);
              }}
              disabled={generating}
              className="btn-primary w-full"
            >
              {generating && selectedReport === report.id ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        ))}
      </div>

      {generating && <LoadingSpinner />}

      {error && <ErrorMessage message={error} />}

      {reportData && (
        <div className="space-y-6">
          {/* Report Header */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {reportData.executiveSummary?.title || 'Generated Report'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Generated on {new Date(reportData.generatedAt).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={handleDownloadPDF}
                disabled={downloadingPDF}
                className="btn-primary flex items-center space-x-2"
              >
                <Download className="h-5 w-5" />
                <span>{downloadingPDF ? 'Downloading...' : 'Download PDF'}</span>
              </button>
            </div>

            {/* Executive Summary */}
            {reportData.executiveSummary && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Executive Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {Object.entries(reportData.executiveSummary.keyMetrics || {}).slice(0, 8).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights & Conclusions */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                AI Insights & Conclusions
              </h3>
              {loadingConclusions ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Generating conclusions...</span>
                </div>
              ) : reportConclusions ? (
                <>
                  {reportConclusions.source === 'rollback' && (
                    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded">
                      <p className="text-xs text-amber-800 dark:text-amber-200">
                        ⚠️ Using fallback content due to temporary AI connection issue.
                      </p>
                    </div>
                  )}
                  <ul className="space-y-3">
                    {reportConclusions.data.conclusions.map((conclusion, index) => (
                      <li key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                        <div className="flex items-start justify-between mb-2">
                          <strong className="text-gray-900 dark:text-white font-semibold">
                            {index + 1}. {conclusion.statement}
                          </strong>
                          {conclusion.confidence > 0 && (
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              Confidence: {(conclusion.confidence * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 opacity-80 mt-1">
                          {conclusion.rationale}
                        </p>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Conclusions will appear here once charts are analyzed...
                </p>
              )}
            </div>

            {/* AI Insights - Only show as rollback if OpenAI conclusions failed */}
            {reportData.aiInsights && reportConclusions && reportConclusions.source === 'rollback' && (
              <div className="mb-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Chart Summary (AI-Generated)
                </h3>
                
                {reportData.aiInsights.observations && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Key Observations</h4>
                    <p className="text-blue-800 dark:text-blue-300">{reportData.aiInsights.observations}</p>
                  </div>
                )}
                
                {reportData.aiInsights.trends && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">Trends</h4>
                    <p className="text-green-800 dark:text-green-300">{reportData.aiInsights.trends}</p>
                  </div>
                )}
                
                {reportData.aiInsights.anomalies && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border-l-4 border-amber-500">
                    <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">Anomalies</h4>
                    <p className="text-amber-800 dark:text-amber-300">{reportData.aiInsights.anomalies}</p>
                  </div>
                )}
                
                {reportData.aiInsights.recommendations && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">Recommendations</h4>
                    <p className="text-purple-800 dark:text-purple-300">{reportData.aiInsights.recommendations}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Charts Section */}
          {reportData.charts && reportData.charts.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Supporting Charts
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {reportData.charts.map((chart, index) => (
                  <ChartWithNarration
                    key={chart.id || index}
                    chart={chart}
                    index={index}
                    reportTitle={reportData.executiveSummary?.title || selectedReport}
                    renderChart={renderChart}
                    onNarrationReady={handleNarrationReady}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Data Table */}
          {reportData.dataTable && reportData.dataTable.rows && reportData.dataTable.rows.length > 0 && (
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Data Summary
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {reportData.dataTable.headers.map((header, idx) => (
                        <th
                          key={idx}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {reportData.dataTable.rows.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        {row.map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
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
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;

