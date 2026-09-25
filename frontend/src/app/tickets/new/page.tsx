'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { TicketPriority } from '@/types';
import { createTicket, extractErrorMessage } from '@/lib/api';

interface FormState   { title: string; description: string; priority: TicketPriority | ''; assignee: string; }
interface FieldErrors { title?: string; description?: string; priority?: string; assignee?: string; }

const PRIORITY_OPTIONS: { value: TicketPriority; icon: string; label: string; sub: string; color: string; active: string }[] = [
  { value: 'LOW',      icon: '↓', label: 'Low',      sub: 'Minor, not urgent',     color: 'text-gray-400',   active: 'border-gray-500   bg-gray-50'   },
  { value: 'MEDIUM',   icon: '→', label: 'Medium',   sub: 'Moderate impact',       color: 'text-sky-500',    active: 'border-sky-500    bg-sky-50'    },
  { value: 'HIGH',     icon: '↑', label: 'High',     sub: 'Significant impact',    color: 'text-orange-500', active: 'border-orange-500 bg-orange-50' },
  { value: 'CRITICAL', icon: '⚡', label: 'Critical', sub: 'Service down — act now', color: 'text-red-500',  active: 'border-red-500    bg-red-50'    },
];

export default function NewTicketPage() {
  const router = useRouter();
  const [form, setForm]               = useState<FormState>({ title: '', description: '', priority: '', assignee: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError]       = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);

  function validate() {
    const e: FieldErrors = {};
    if (!form.title.trim())       e.title       = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.priority)           e.priority    = 'Select a priority';
    if (!form.assignee.trim())    e.assignee    = 'Assignee is required';
    setFieldErrors(e);
    return !Object.keys(e).length;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setApiError(null);
    try {
      const ticket = await createTicket({
        title:       form.title.trim(),
        description: form.description.trim(),
        priority:    form.priority as TicketPriority,
        assignee:    form.assignee.trim(),
      });
      router.push(`/tickets/${ticket.id}`);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'error' in err && (err as { error: string }).error === 'VALIDATION_FAILED') {
        const msg = (err as unknown as { message: string }).message;
        const errs: FieldErrors = {};
        msg.split(';').forEach(part => {
          const [f, ...rest] = part.split(':');
          const k = f?.trim() as keyof FieldErrors;
          if (k && rest.length) errs[k] = rest.join(':').trim();
        });
        setFieldErrors(errs);
      } else {
        setApiError(extractErrorMessage(err));
      }
    } finally { setLoading(false); }
  }

  const fieldCls = (k: keyof FieldErrors) =>
    `w-full border rounded-md px-3 py-2 text-[13px] bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-400 placeholder-gray-400 ${fieldErrors[k] ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`;

  return (
    <div className="max-w-[640px]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px] text-gray-400 mb-5">
        <Link href="/" className="hover:text-indigo-600 transition-colors">Tickets</Link>
        <span>/</span>
        <span className="text-gray-600">New Ticket</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <h1 className="text-[15px] font-semibold text-gray-900">Create ticket</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">Fill in the details below to open a new support ticket.</p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-5">
          {/* API error */}
          {apiError && (
            <div className="flex items-center gap-2 text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="flex-1">{apiError}</span>
              <button type="button" onClick={() => setApiError(null)} className="hover:text-red-800">×</button>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input type="text" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Brief, specific summary of the issue"
              className={fieldCls('title')} />
            {fieldErrors.title && <Err msg={fieldErrors.title} />}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea rows={5} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Steps to reproduce, expected vs actual behaviour, affected users, environment…"
              className={`${fieldCls('description')} resize-none`} />
            {fieldErrors.description && <Err msg={fieldErrors.description} />}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[12px] font-medium text-gray-600 mb-2">
              Priority <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRIORITY_OPTIONS.map(p => (
                <button type="button" key={p.value}
                  onClick={() => setForm(f => ({ ...f, priority: p.value }))}
                  className={`border-2 rounded-md py-3 px-2 text-center transition-all ${
                    form.priority === p.value
                      ? p.active
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}>
                  <span className={`block text-base leading-none mb-1.5 ${p.color}`}>{p.icon}</span>
                  <span className={`block text-[12px] font-semibold ${form.priority === p.value ? 'text-gray-900' : 'text-gray-600'}`}>{p.label}</span>
                  <span className={`block text-[10px] mt-0.5 leading-tight hidden sm:block ${form.priority === p.value ? 'text-gray-500' : 'text-gray-400'}`}>{p.sub}</span>
                </button>
              ))}
            </div>
            {fieldErrors.priority && <Err msg={fieldErrors.priority} />}
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
              Assignee <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input type="text" value={form.assignee}
                onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}
                placeholder="e.g. john.doe"
                className={`${fieldCls('assignee')} pl-9`} />
            </div>
            {fieldErrors.assignee && <Err msg={fieldErrors.assignee} />}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
            <button type="submit" disabled={loading}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-[13px] font-medium px-5 py-2 rounded-md transition-colors">
              {loading
                ? <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating…</>
                : 'Create ticket'}
            </button>
            <Link href="/" className="text-[13px] text-gray-500 hover:text-gray-800 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function Err({ msg }: { msg: string }) {
  return <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">⚠ {msg}</p>;
}
