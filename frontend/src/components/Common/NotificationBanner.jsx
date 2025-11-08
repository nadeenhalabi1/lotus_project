const variants = {
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-200',
  warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-200',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200'
};

const NotificationBanner = ({
  message,
  variant = 'info',
  actionLabel,
  retryLabel,
  onAction,
  onRetry,
  onClose
}) => {
  const variantClasses = variants[variant] || variants.info;

  return (
    <div className={`border rounded-md px-4 py-3 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${variantClasses}`}>
      <div className="flex items-start gap-3">
        <span className="font-medium">{message}</span>
      </div>
      <div className="flex items-center gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-secondary text-sm"
            type="button"
          >
            {retryLabel || 'Retry'}
          </button>
        )}
        {onAction && (
          <button
            onClick={onAction}
            className="btn-primary text-sm"
            type="button"
          >
            {actionLabel || 'View details'}
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
            type="button"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationBanner;

