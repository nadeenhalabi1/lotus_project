import { BarChart3 } from 'lucide-react';
import { BarChart, LineChart, PieChart, AreaChart } from '../Charts';
import MultiSeriesBarChart from '../Charts/MultiSeriesBarChart';
import MultiSeriesLineChart from '../Charts/MultiSeriesLineChart';
import MultiSeriesAreaChart from '../Charts/MultiSeriesAreaChart';
import { useTheme } from '../../context/ThemeContext';

const ChartCard = ({ chart, onClick, isStale = false, lastSuccessful }) => {
  const { theme } = useTheme();
  const colorScheme = chart.metadata?.colorScheme || {
    primary: '#10b981',
    secondary: '#34d399',
    gradient: ['#10b981', '#34d399', '#6ee7b7']
  };
  
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

  const renderChart = () => {
    const chartProps = {
      data: chart.data,
      width: '100%',
      height: 500, // Large and vibrant charts for dashboard
      colorScheme: colorScheme,
    };

    // Check if this is a multi-series chart (has multiple data keys)
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

  const formatDateTime = (value) => {
    if (!value) return 'Unknown';
    const date = new Date(value);
    return `${date.toLocaleString()}`;
  };

  const lastUpdated = chart.metadata?.lastUpdated || lastSuccessful;

  return (
    <div
      className="card cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-2 border-transparent hover:border-opacity-50"
      style={{
        borderColor: `${colorScheme.primary}40`,
        ...getBackgroundStyle(),
        boxShadow: theme === 'dark' 
          ? `0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)`
          : `0 4px 6px -1px ${colorScheme.primary}20, 0 2px 4px -1px ${colorScheme.primary}10`
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
      aria-label={`View ${chart.title} chart details`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {chart.title}
          </h3>
          {chart.subtitle && (
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {chart.subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isStale && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 shadow-sm">
              Stale Data
            </span>
          )}
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${colorScheme.primary}15` }}
          >
            <BarChart3 className="h-6 w-6" style={{ color: colorScheme.primary }} />
          </div>
        </div>
      </div>
              <div className="h-[500px] mb-4">{renderChart()}</div>
      {chart.description && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {chart.description}
        </p>
      )}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Last updated: <span className="text-gray-700 dark:text-gray-300">{formatDateTime(lastUpdated)}</span>
        </p>
      </div>
    </div>
  );
};

export default ChartCard;

