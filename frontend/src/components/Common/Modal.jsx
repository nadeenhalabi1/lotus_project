const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center">
      <div className="absolute inset-0 bg-neutral-900/50 dark:bg-neutral-900/70" onClick={onClose} />
      <div className="relative bg-white dark:bg-neutral-800 rounded-modal shadow-2xl max-w-2xl w-full mx-4 border border-neutral-200 dark:border-neutral-700">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{title}</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-300 dark:hover:text-neutral-100 transition-colors duration-fast"
            aria-label="Close modal"
            type="button"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto text-neutral-700 dark:text-neutral-200">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/40 rounded-b-modal flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

