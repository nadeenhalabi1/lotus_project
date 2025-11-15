import { Clock, Database } from 'lucide-react';

const BOXChartItem = ({ chart, onClick }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div
      className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer transition-colors duration-fast"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
        {chart.name}
      </h3>
      {chart.description && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
          {chart.description}
        </p>
      )}
      <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
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

