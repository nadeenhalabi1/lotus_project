import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { aiCustomAPI } from '../../services/api.js';
import { BarChart, LineChart } from '../Charts';
import ErrorMessage from '../Common/ErrorMessage';

const AICustomPage = () => {
  const { theme } = useTheme();
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  /**
   * Transforms backend query result into chart-ready data format
   * Expects: columns array and rows array from backend
   * Returns: { labels: string[], values: number[], chartData: [{name, value}] } or null if cannot transform
   */
  const transformToChartData = (columns, rows) => {
    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      return null;
    }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    // For simple 2-column charts: first column = X-axis (labels), second column = Y-axis (values)
    if (columns.length === 2) {
      const firstCol = columns[0].name;
      const secondCol = columns[1].name;

      // Check if second column contains numeric values
      const sampleValue = rows[0]?.[secondCol];
      if (typeof sampleValue !== 'number') {
        return null; // Cannot chart non-numeric Y-axis
      }

      const labels = rows.map(row => {
        const value = row[firstCol];
        // Convert to string, handle dates/numbers
        return value !== null && value !== undefined ? String(value) : '';
      });

      const values = rows.map(row => {
        const value = row[secondCol];
        return typeof value === 'number' ? value : 0;
      });

      // Create chart data in format expected by chart components: [{name, value}]
      const chartData = labels.map((label, index) => ({
        name: label,
        value: values[index]
      }));

      return { labels, values, chartData };
    }

    // For more than 2 columns, we can't easily visualize as simple bar/line chart
    return null;
  };

  const handleGenerate = async () => {
    const trimmedInput = userInput.trim();

    // Validate input
    if (!trimmedInput) {
      setError('Please enter a description of the data or graph you want to generate.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('[AICustomPage] Sending request to backend...');
      const response = await aiCustomAPI.queryData(trimmedInput);
      const data = response.data;

      console.log('[AICustomPage] Backend response:', data);

      // Handle different statuses
      if (data.status === 'no_match') {
        setError(data.message || 'No matching tables or columns found for your request. Please try rephrasing.');
        setLoading(false);
        return;
      }

      if (data.status === 'error') {
        setError(data.message || 'An error occurred while processing your request.');
        setLoading(false);
        return;
      }

      if (data.status === 'ok') {
        // Check if we have data
        if (!data.rows || data.rows.length === 0) {
          setError('No data to display.');
          setLoading(false);
          return;
        }

        // Transform to chart data
        const chartData = transformToChartData(data.columns, data.rows);

        if (!chartData) {
          setError('This query result cannot be visualized as a chart. The result must have exactly 2 columns, with the second column containing numeric values.');
          setLoading(false);
          return;
        }

        // Store the result
        setResult({
          sql: data.sql,
          reason: data.reason,
          rowCount: data.rowCount,
          columns: data.columns,
          rows: data.rows,
          chartData: chartData.chartData,
          labels: chartData.labels,
          values: chartData.values
        });

        setLoading(false);
      } else {
        setError('Unexpected response status from server.');
        setLoading(false);
      }
    } catch (err) {
      console.error('[AICustomPage] Error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred while generating the graph.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      {/* Welcome Message */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
          Welcome to AI custom insights
        </h1>
      </div>

      {/* Input Card */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="card">
          {/* Textarea */}
          <div className="mb-6">
            <label htmlFor="ai-custom-input" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Describe your data insight or custom graph
            </label>
            <textarea
              id="ai-custom-input"
              value={userInput}
              onChange={(e) => {
                if (e.target.value.length <= 1000) {
                  setUserInput(e.target.value);
                }
              }}
              placeholder="Describe the data insight or custom graph you want..."
              className="w-full min-h-[150px] p-4 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
              maxLength={1000}
            />
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              Describe the data insight or custom graph you want (up to 1000 characters).
            </p>
            <div className="text-right text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {userInput.length} / 1000 characters
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center">
            <button
              onClick={handleGenerate}
              disabled={!userInput.trim() || loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate graph'}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-6xl mx-auto">
          <div className="card">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 dark:border-primary-400"></div>
              <p className="text-neutral-600 dark:text-neutral-400 mt-4">
                Generating your custom graph...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="max-w-6xl mx-auto">
          <ErrorMessage 
            message={error} 
            onRetry={handleGenerate}
          />
        </div>
      )}

      {/* Chart Result */}
      {result && !loading && !error && (
        <div className="max-w-6xl mx-auto">
          <div className="card">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
                AI-Generated Graph
              </h2>
              {result.reason && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  {result.reason}
                </p>
              )}
              <div className="text-xs text-neutral-500 dark:text-neutral-500 mb-4">
                <span className="font-semibold">Rows:</span> {result.rowCount} | 
                <span className="font-semibold ml-2">Columns:</span> {result.columns.map(c => c.name).join(', ')}
              </div>
            </div>

            {/* Chart Container */}
            <div className="w-full" style={{ height: '400px' }}>
              {/* Determine chart type: use LineChart for time-series data, BarChart otherwise */}
              {result.labels && result.labels.length > 0 && (
                (() => {
                  // Simple heuristic: if labels look like dates/times, use LineChart, otherwise BarChart
                  const firstLabel = result.labels[0];
                  const isTimeSeries = /^\d{4}-\d{2}-\d{2}|^\d{2}\/\d{2}\/\d{4}|^\d{4}-\d{2}$|month|year|date|time/i.test(firstLabel);
                  
                  const chartProps = {
                    data: result.chartData,
                    width: '100%',
                    height: 400,
                    colorScheme: { primary: '#6366f1', secondary: '#818cf8', gradient: ['#6366f1', '#818cf8', '#a5b4fc'] }
                  };

                  return isTimeSeries ? (
                    <LineChart {...chartProps} />
                  ) : (
                    <BarChart {...chartProps} />
                  );
                })()
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State (no result, no loading, no error) */}
      {!result && !loading && !error && (
        <div className="max-w-6xl mx-auto">
          <div className="card border-2 border-dashed border-neutral-300 dark:border-neutral-600">
            <div className="text-center py-12">
              <p className="text-neutral-500 dark:text-neutral-400 text-lg">
                Your custom AI-generated graph will appear here.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICustomPage;

