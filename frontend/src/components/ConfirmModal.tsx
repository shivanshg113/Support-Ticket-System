'use client';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

const BTN = {
  danger:  'bg-red-600 hover:bg-red-700 text-white',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white',
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
};

export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'primary', onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div
        className="relative bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-md p-5"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'fadeUp 0.15s ease-out both' }}
      >
        <h2 className="text-[14px] font-semibold text-gray-900 mb-1.5">{title}</h2>
        <p className="text-[13px] text-gray-500 leading-relaxed mb-5">{message}</p>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onCancel}
            className="text-[13px] text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 font-medium transition-colors">
            {cancelLabel}
          </button>
          <button onClick={onConfirm}
            className={`text-[13px] font-semibold px-4 py-1.5 rounded-md transition-colors ${BTN[variant]}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
