'use client';

import { useState } from 'react';
import type { CommentResponse } from '@/types';
import { addComment, extractErrorMessage } from '@/lib/api';

interface Props {
  ticketId: number;
  comments: CommentResponse[];
  onCommentAdded: (c: CommentResponse) => void;
  onCommentDeleted?: (id: number) => void;
}

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - +new Date(d)) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const day = Math.floor(h / 24); if (day < 7) return `${day}d ago`;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function getInitials(name: string) {
  return name.split(/[-_.\s]/).map(p => p[0]?.toUpperCase()).filter(Boolean).slice(0, 2).join('') || '?';
}

const COLORS = ['bg-indigo-500','bg-violet-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-cyan-600','bg-blue-500'];
function avatarBg(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return COLORS[Math.abs(h) % COLORS.length];
}

export default function CommentSection({ ticketId, comments, onCommentAdded, onCommentDeleted }: Props) {
  const [author, setAuthor]     = useState('');
  const [body, setBody]         = useState('');
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!author.trim()) e.author = 'Author required';
    if (!body.trim())   e.body   = 'Comment cannot be empty';
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setApiError(null);
    try {
      const c = await addComment(ticketId, { author: author.trim(), content: body.trim() });
      onCommentAdded(c);
      setAuthor(''); setBody(''); setErrors({}); setOpen(false);
    } catch (err) { setApiError(extractErrorMessage(err)); }
    finally      { setLoading(false); }
  }

  const inCls = (k: string) =>
    `w-full border rounded-md px-3 py-2 text-[13px] bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-400 placeholder-gray-400 ${errors[k] ? 'border-red-400' : 'border-gray-200'}`;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-gray-800">
          Activity
          <span className="ml-1.5 text-[11px] font-normal text-gray-400">({comments.length})</span>
        </h3>
        {!open && (
          <button onClick={() => setOpen(true)}
            className="text-[12px] text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add comment
          </button>
        )}
      </div>

      {/* Thread */}
      <div className="space-y-3">
        {comments.length === 0 && !open && (
          <div className="text-center py-8">
            <p className="text-[13px] text-gray-400">No comments yet.</p>
            <button onClick={() => setOpen(true)}
              className="mt-2 text-[12px] text-indigo-600 hover:text-indigo-700 font-medium">
              Add the first comment
            </button>
          </div>
        )}

        {comments.map(c => (
          <div key={c.id} className="flex gap-3 group/c">
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 mt-0.5 ${avatarBg(c.author)}`}>
              {getInitials(c.author)}
            </div>
            {/* Bubble */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[13px] font-semibold text-gray-800">{c.author}</span>
                <span className="text-[11px] text-gray-400">{timeAgo(c.createdAt)}</span>
                {onCommentDeleted && (
                  <button onClick={() => onCommentDeleted(c.id)}
                    className="opacity-0 group-hover/c:opacity-100 ml-auto text-gray-300 hover:text-red-500 transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-[13px] text-gray-600 leading-relaxed whitespace-pre-wrap">{c.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Compose form */}
      {open && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {apiError && (
            <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">{apiError}</p>
          )}
          <form onSubmit={submit} className="space-y-2.5">
            <input type="text" value={author} onChange={e => setAuthor(e.target.value)}
              placeholder="Your name"
              className={inCls('author')} />
            {errors.author && <p className="text-[11px] text-red-500">{errors.author}</p>}

            <textarea rows={3} value={body} onChange={e => setBody(e.target.value)}
              placeholder="Write a comment…"
              className={`${inCls('body')} resize-none`} />
            {errors.body && <p className="text-[11px] text-red-500">{errors.body}</p>}

            <div className="flex items-center gap-2">
              <button type="submit" disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-[13px] font-medium px-4 py-1.5 rounded-md transition-colors">
                {loading ? 'Posting…' : 'Post comment'}
              </button>
              <button type="button" onClick={() => { setOpen(false); setErrors({}); setApiError(null); }}
                className="text-[13px] text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
