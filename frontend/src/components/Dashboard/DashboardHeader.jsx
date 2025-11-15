import { RefreshCw, Clock } from 'lucide-react';

const DashboardHeader = ({ lastUpdated, onRefresh, refreshing }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-50">
          Dashboard
        </h1>
        {lastUpdated && (
          <div className="flex items-center gap-2 mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>Last updated: {formatDate(lastUpdated)}</span>
          </div>
        )}
      </div>
      <button
        onClick={() => onRefresh()}
        className="btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap"
        aria-label="Refresh data"
        disabled={refreshing}
      >
        <RefreshCw className={`h-5 w-5 flex-shrink-0 ${refreshing ? 'animate-spin' : ''}`} />
        <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
      </button>
    </div>
  );
};

export default DashboardHeader;

