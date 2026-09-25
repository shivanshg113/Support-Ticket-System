'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps { message: string; type: ToastType; onClose: () => void; duration?: number; }

const ICONS = {
  success: <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>,
  error:   <svg className="w-4 h-4 text-red-500"     fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>,
  info:    <svg className="w-4 h-4 text-blue-500"    fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

export default function Toast({ message, type, onClose, duration = 3500 }: ToastProps) {
  const [exiting, setExiting] = useState(false);

  function dismiss() { setExiting(true); setTimeout(onClose, 220); }
  useEffect(() => { const t = setTimeout(dismiss, duration); return () => clearTimeout(t); }, [duration]); // eslint-disable-line

  return (
    <div className={`flex items-center gap-3 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 min-w-64 max-w-sm ${exiting ? 'toast-exit' : 'toast-enter'}`}>
      {ICONS[type]}
      <p className="text-[13px] text-gray-800 font-medium flex-1">{message}</p>
      <button onClick={dismiss} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }: {
  toasts: { id: string; message: string; type: ToastType }[];
  onClose: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <Toast message={t.message} type={t.type} onClose={() => onClose(t.id)} />
        </div>
      ))}
    </div>
  );
}
