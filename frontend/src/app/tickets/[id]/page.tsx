'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { TicketResponse, TicketPriority, TicketStatus, CommentResponse } from '@/types';
import { PRIORITIES, allowedNextStatuses } from '@/types';
import { getTicket, updateTicket, transitionStatus, deleteTicket, deleteComment, extractErrorMessage } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import CommentSection from '@/components/CommentSection';
import { ToastContainer } from '@/components/Toast';
import type { ToastType } from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';

interface ToastItem { id: string; message: string; type: ToastType; }

function fmt(d: string) {
  return new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function TicketDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const ticketId = Number(id);

  const [ticket, setTicket]   = useState<TicketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [toasts, setToasts]   = useState<ToastItem[]>([]);

  // Edit
  const [editing, setEditing]         = useState(false);
  const [editForm, setEditForm]       = useState({ title: '', description: '', priority: '' as TicketPriority | '', assignee: '' });
  const [editError, setEditError]     = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Transition
  const [selectedNext, setSelectedNext]           = useState<TicketStatus | ''>('');
  const [transitionError, setTransitionError]     = useState<string | null>(null);
  const [transitionLoading, setTransitionLoading] = useState(false);
  const [confirmTransition, setConfirmTransition] = useState(false);

  // Delete
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Copy
  const [copied, setCopied] = useState(false);

  const toast = (message: string, type: ToastType) =>
    setToasts(p => [...p, { id: Date.now().toString(), message, type }]);

  const loadTicket = useCallback(async () => {
    try {
      const t = await getTicket(ticketId);
      setTicket(t);
      setEditForm({ title: t.title, description: t.description, priority: t.priority, assignee: t.assignee });
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'status' in e && (e as { status: number }).status === 404) router.push('/');
      else setError(extractErrorMessage(e));
    } finally { setLoading(false); }
  }, [ticketId, router]);

  useEffect(() => { loadTicket(); }, [loadTicket]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setEditLoading(true); setEditError(null);
    try {
      const u = await updateTicket(ticketId, {
        title:       editForm.title       || undefined,
        description: editForm.description || undefined,
        priority:    (editForm.priority as TicketPriority) || undefined,
        assignee:    editForm.assignee    || undefined,
      });
      setTicket(u); setEditing(false); toast('Ticket updated', 'success');
    } catch (e) { setEditError(extractErrorMessage(e)); }
    finally     { setEditLoading(false); }
  }

  async function handleTransition() {
    if (!selectedNext || !ticket) return;
    setConfirmTransition(false); setTransitionLoading(true); setTransitionError(null);
    try {
      const u = await transitionStatus(ticketId, { status: selectedNext });
      setTicket(u); setSelectedNext('');
      toast(`Moved to ${selectedNext.replace('_', ' ')}`, 'success');
    } catch (e) { setTransitionError(extractErrorMessage(e)); }
    finally     { setTransitionLoading(false); }
  }

  async function handleDelete() {
    setConfirmDelete(false); setDeleteLoading(true);
    try {
      await deleteTicket(ticketId);
      toast('Ticket deleted', 'info');
      setTimeout(() => router.push('/'), 700);
    } catch (e) { toast(extractErrorMessage(e), 'error'); setDeleteLoading(false); }
  }

  async function handleDeleteComment(commentId: number) {
    if (!ticket) return;
    try {
      await deleteComment(ticketId, commentId);
      setTicket({ ...ticket, comments: ticket.comments.filter(c => c.id !== commentId) });
      toast('Comment removed', 'info');
    } catch (e) { toast(extractErrorMessage(e), 'error'); }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  }

  const nextStatuses = ticket ? allowedNextStatuses(ticket.status) : [];
  const isTerminal   = nextStatuses.length === 0;

  const fieldCls = `w-full border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-400 placeholder-gray-400`;

  if (loading) return (
    <div className="max-w-[860px] mx-auto space-y-4">
      <div className="h-5 skeleton w-48" />
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="h-6 skeleton w-2/3" />
        <div className="h-4 skeleton w-full" />
        <div className="h-4 skeleton w-4/5" />
      </div>
    </div>
  );

  if (error || !ticket) return (
    <div className="max-w-[860px] mx-auto">
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-[13px]">
        {error ?? 'Ticket not found.'}
      </div>
    </div>
  );

  return (
    <div className="max-w-[860px] mx-auto space-y-4">
      <ToastContainer toasts={toasts} onClose={id => setToasts(p => p.filter(t => t.id !== id))} />

      {/* Modals */}
      {confirmTransition && selectedNext && (
        <ConfirmModal
          title="Confirm transition"
          message={`Move #${ticket.id} from ${ticket.status.replace('_', ' ')} → ${selectedNext.replace('_', ' ')}?`}
          confirmLabel={`Move to ${selectedNext.replace('_', ' ')}`}
          variant={selectedNext === 'CANCELLED' ? 'danger' : 'primary'}
          onConfirm={handleTransition}
          onCancel={() => setConfirmTransition(false)}
        />
      )}
      {confirmDelete && (
        <ConfirmModal
          title="Delete ticket"
          message={`Permanently delete #${ticket.id} "${ticket.title}"? All comments will be removed. This cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px] text-gray-400">
        <Link href="/" className="hover:text-indigo-600 transition-colors">Tickets</Link>
        <span>/</span>
        <span className="text-gray-600 font-medium truncate">#{ticket.id} — {ticket.title}</span>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-5 items-start">

        {/* ── Left: Main content ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Title + meta bar */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-4">

              {/* Top: ID + badges + actions */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">#{ticket.id}</span>
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                </div>

                {!editing && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={copyLink}
                      className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100">
                      {copied
                        ? <><svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> Copied</>
                        : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copy</>}
                    </button>
                    <button onClick={() => { setEditing(true); setEditError(null); }}
                      className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button onClick={() => setConfirmDelete(true)} disabled={deleteLoading}
                      className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Title / edit form */}
              {editing ? (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-[13px] font-semibold text-gray-700">Edit Ticket</h2>
                  </div>
                  {editError && (
                    <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">{editError}</p>
                  )}
                  <form onSubmit={handleSave} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Title</label>
                      <input type="text" value={editForm.title} className={fieldCls}
                        onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</label>
                      <textarea rows={4} value={editForm.description} className={`${fieldCls} resize-none`}
                        onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Priority</label>
                        <select value={editForm.priority} className={`${fieldCls} appearance-none`}
                          onChange={e => setEditForm(f => ({ ...f, priority: e.target.value as TicketPriority }))}>
                          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Assignee</label>
                        <input type="text" value={editForm.assignee} className={fieldCls}
                          onChange={e => setEditForm(f => ({ ...f, assignee: e.target.value }))} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button type="submit" disabled={editLoading}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-[13px] font-medium px-4 py-1.5 rounded-md">
                        {editLoading ? 'Saving…' : 'Save changes'}
                      </button>
                      <button type="button" onClick={() => { setEditing(false); setEditError(null); }}
                        className="text-[13px] text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-100">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  <h1 className="text-[17px] font-semibold text-gray-900 leading-snug mb-2">{ticket.title}</h1>
                  <p className="text-[13px] text-gray-600 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                </>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
            <CommentSection
              ticketId={ticketId}
              comments={ticket.comments}
              onCommentAdded={c => { setTicket(t => t ? { ...t, comments: [...t.comments, c] } : t); toast('Comment posted', 'success'); }}
              onCommentDeleted={handleDeleteComment}
            />
          </div>
        </div>

        {/* ── Right: Properties sidebar ── */}
        <div className="w-56 flex-shrink-0 space-y-3 sticky top-[72px]">

          {/* Properties */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Properties</p>
            </div>
            <div className="px-3 py-3 space-y-3">
              {[
                { label: 'Status',   value: <StatusBadge status={ticket.status} /> },
                { label: 'Priority', value: <PriorityBadge priority={ticket.priority} /> },
                {
                  label: 'Assignee',
                  value: (
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                        {ticket.assignee[0]?.toUpperCase()}
                      </div>
                      <span className="text-[12px] text-gray-700 font-medium truncate">{ticket.assignee}</span>
                    </div>
                  ),
                },
              ].map(row => (
                <div key={row.label}>
                  <p className="text-[11px] text-gray-400 mb-1">{row.label}</p>
                  {row.value}
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">Created</span>
                  <span className="text-[11px] text-gray-600">{fmt(ticket.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">Updated</span>
                  <span className="text-[11px] text-gray-600">{fmt(ticket.updatedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">Comments</span>
                  <span className="text-[11px] text-gray-600">{ticket.comments.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status transition */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Transition</p>
            </div>
            <div className="px-3 py-3">
              {isTerminal ? (
                <p className="text-[12px] text-gray-400 leading-relaxed">
                  Ticket is in a terminal state — no further transitions allowed.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-gray-400 mb-2">Move to</p>
                  {nextStatuses.map(s => (
                    <button key={s} onClick={() => setSelectedNext(s === selectedNext ? '' : s)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md border text-[12px] font-medium transition-colors ${
                        selectedNext === s
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : s === 'CANCELLED'
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}>
                      {s.replace('_', ' ')}
                      {selectedNext === s && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                  ))}
                  {transitionError && (
                    <p className="text-[11px] text-red-600 bg-red-50 rounded-md px-2 py-1.5 border border-red-200">{transitionError}</p>
                  )}
                  {selectedNext && (
                    <button onClick={() => setConfirmTransition(true)} disabled={transitionLoading}
                      className="w-full mt-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-[13px] font-medium py-2 rounded-md transition-colors">
                      {transitionLoading ? 'Applying…' : 'Apply'}
                    </button>
                  )}
                  <p className="text-[10px] text-gray-400 leading-relaxed">Server-side enforcement — invalid transitions are rejected at the API layer.</p>
                </div>
              )}
            </div>
          </div>

          {/* Back */}
          <Link href="/" className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-indigo-600 group transition-colors">
            <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all tickets
          </Link>
        </div>
      </div>
    </div>
  );
}
