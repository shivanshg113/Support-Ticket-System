interface Props {
  message: string;
  onDismiss?: () => void;
  variant?: 'error' | 'warning';
}

export default function ErrorMessage({ message, onDismiss, variant = 'error' }: Props) {
  const styles = variant === 'error'
    ? { wrap: 'bg-red-50 border-red-200', icon: 'text-red-500', text: 'text-red-700', btn: 'text-red-400 hover:text-red-600' }
    : { wrap: 'bg-amber-50 border-amber-200', icon: 'text-amber-500', text: 'text-amber-700', btn: 'text-amber-400 hover:text-amber-600' };

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3.5 ${styles.wrap}`}>
      <div className={`flex-shrink-0 mt-0.5 ${styles.icon}`}>
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <p className={`flex-1 text-sm font-medium ${styles.text}`}>{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className={`flex-shrink-0 text-lg leading-none ${styles.btn}`}>×</button>
      )}
    </div>
  );
}
