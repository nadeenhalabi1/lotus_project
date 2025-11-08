import { Clock, Database } from 'lucide-react';

const BOXChartItem = ({ chart, onClick }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div
      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
        {chart.name}
      </h3>
      {chart.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {chart.description}
        </p>
      )}
      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
        {chart.dataSource && (
          <div className="flex items-center space-x-1">
            <Database className="h-3 w-3" />
            <span>{chart.dataSource}</span>
          </div>
        )}
        {chart.lastUpdated && (
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{formatDate(chart.lastUpdated)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BOXChartItem;

