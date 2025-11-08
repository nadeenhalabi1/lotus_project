import Modal from '../Common/Modal';

const formatDateTime = (value) => {
  if (!value) return 'Unknown';
  const date = new Date(value);
  return `${date.toLocaleString()}`;
};

const RefreshStatusModal = ({ isOpen, onClose, status, onRetry }) => {
  if (!status) return null;

  const failed = status.failed || [];
  const successful = status.successful || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Data Refresh Details"
      footer={
        <>
          {failed.length > 0 && (
            <button onClick={onRetry} className="btn-primary" type="button">
              Retry Failed Sources
            </button>
          )}
          <button onClick={onClose} className="btn-secondary" type="button">
            Close
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-2">
            Status Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Last Attempt</p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">{formatDateTime(status.timestamp)}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Successful Sources</p>
              <p className="text-base font-semibold text-emerald-600 dark:text-emerald-300">{successful.length}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Failed Sources</p>
              <p className="text-base font-semibold text-amber-600 dark:text-amber-300">{failed.length}</p>
            </div>
          </div>
        </div>

        {failed.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-2">
              Failed Sources
            </h3>
            <div className="space-y-3">
              {failed.map((item) => (
                <div key={item.service} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900 dark:text-white capitalize">{item.service}</p>
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-300">Needs Attention</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.reason}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Last successful update: {formatDateTime(item.lastSuccessful)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {successful.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-2">
              Successful Sources
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {successful.map((item) => (
                <div key={item.service} className="card p-3">
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{item.service}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Updated at: {formatDateTime(item.lastUpdated)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RefreshStatusModal;

