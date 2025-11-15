const variants = {
  info: 'bg-info-50 border-info-200 text-info-800 dark:bg-info-900/40 dark:border-info-700 dark:text-info-200',
  warning: 'bg-warning-50 border-warning-200 text-warning-800 dark:bg-warning-900/30 dark:border-warning-700 dark:text-warning-200',
  error: 'bg-error-50 border-error-200 text-error-800 dark:bg-error-900/30 dark:border-error-700 dark:text-error-200'
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
    <div className={`border rounded-lg px-4 py-3 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-sm ${variantClasses}`}>
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
            className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-300 dark:hover:text-neutral-100 transition-colors duration-fast"
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

