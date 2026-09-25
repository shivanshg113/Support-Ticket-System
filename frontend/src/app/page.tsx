'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import type { TicketResponse, TicketStatus, TicketPriority, StatsResponse } from '@/types';
import { STATUSES, PRIORITIES } from '@/types';
import { getTickets, getStats, extractErrorMessage } from '@/lib/api';
import { useDebounce } from '@/lib/useDebounce';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - +new Date(d)) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const day = Math.floor(h / 24); if (day < 7) return `${day}d ago`;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

type SortField = 'id' | 'createdAt' | 'updatedAt' | 'priority' | 'status';

function SortTh({ label, field, current, dir, onSort }: {
  label: string; field: SortField;
  current: SortField; dir: 'asc' | 'desc';
  onSort: (f: SortField) => void;
}) {
  const active = current === field;
  return (
    <th onClick={() => onSort(field)}
      className={`px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap ${active ? 'text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}>
      {label}{active ? (dir === 'asc' ? ' ↑' : ' ↓') : ''}
    </th>
  );
}

function exportCSV(tickets: TicketResponse[]) {
  const rows = [
    ['ID', 'Title', 'Priority', 'Status', 'Assignee', 'Created', 'Updated'],
    ...tickets.map(t => [t.id, `"${t.title.replace(/"/g, '""')}"`, t.priority, t.status, t.assignee,
      new Date(t.createdAt).toISOString(), new Date(t.updatedAt).toISOString()]),
  ];
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' }));
  a.download = `tickets-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

export default function TicketListPage() {
  const [tickets, setTickets]     = useState<TicketResponse[]>([]);
  const [stats, setStats]         = useState<StatsResponse | null>(null);
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState<TicketStatus | ''>('');
  const [priority, setPriority]   = useState<TicketPriority | ''>('');
  const [assignee, setAssignee]   = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(0);
  const PAGE_SIZE                 = 20;
  const searchRef                 = useRef<HTMLInputElement>(null);

  const debouncedSearch   = useDebounce(search, 400);
  const debouncedAssignee = useDebounce(assignee, 400);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault(); searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearch(''); setStatus(''); setPriority(''); setAssignee('');
        searchRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => { getStats().then(setStats).catch(() => {}); }, []);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await getTickets({
        search:   debouncedSearch   || undefined,
        status:   status   as TicketStatus   || undefined,
        priority: priority as TicketPriority || undefined,
        assignee: debouncedAssignee || undefined,
        sortBy: sortField, sortDir, page, size: PAGE_SIZE,
      });
      setTickets(r.content ?? (r as unknown as TicketResponse[]));
      setTotal(r.totalElements ?? (r.content ?? (r as unknown as TicketResponse[])).length);
    } catch (e) { setError(extractErrorMessage(e)); }
    finally    { setLoading(false); }
  }, [debouncedSearch, status, priority, debouncedAssignee, sortField, sortDir, page]);

  useEffect(() => { setPage(0); }, [debouncedSearch, status, priority, debouncedAssignee, sortField, sortDir]);
  useEffect(() => { load(); }, [load]);

  function toggleSort(f: SortField) {
    if (sortField === f) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortField(f); setSortDir('desc'); }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilters = !!(search || status || priority || assignee);

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">All Tickets</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            {stats
              ? `${stats.total} total · ${stats.open} open · ${stats.inProgress} in progress · ${stats.createdLast24h} new today`
              : loading ? 'Loading…' : `${total} tickets`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportCSV(tickets)} disabled={!tickets.length}
            className="hidden sm:flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 bg-white px-3 py-1.5 rounded-md disabled:opacity-40">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
          <Link href="/tickets/new"
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium px-3 py-1.5 rounded-md">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Ticket
          </Link>
        </div>
      </div>

      {/* Quick status tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 -mb-1">
        {[
          { label: 'All',         value: '',             count: stats?.total },
          { label: 'Open',        value: 'OPEN',         count: stats?.open },
          { label: 'In Progress', value: 'IN_PROGRESS',  count: stats?.inProgress },
          { label: 'Resolved',    value: 'RESOLVED',     count: stats?.resolved },
          { label: 'Closed',      value: 'CLOSED',       count: stats?.closed },
        ].map(tab => (
          <button key={tab.value} onClick={() => setStatus(tab.value as TicketStatus | '')}
            className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
              status === tab.value
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
            }`}>
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                status === tab.value ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-52">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input ref={searchRef} type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Search tickets… (press / to focus)'
            className="w-full pl-8 pr-8 py-1.5 text-[13px] border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-400 placeholder-gray-400"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-base leading-none">×</button>
          )}
        </div>

        <select value={priority} onChange={e => setPriority(e.target.value as TicketPriority | '')}
          className="appearance-none pl-3 pr-7 py-1.5 text-[13px] border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-indigo-500 text-gray-600">
          <option value="">Priority</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <input type="text" value={assignee} onChange={e => setAssignee(e.target.value)}
            placeholder="Assignee"
            className="pl-8 pr-3 py-1.5 text-[13px] border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-indigo-500 placeholder-gray-400 w-36" />
        </div>

        {hasFilters && (
          <button onClick={() => { setSearch(''); setStatus(''); setPriority(''); setAssignee(''); }}
            className="text-[12px] text-gray-400 hover:text-gray-700 px-2 py-1.5 rounded-md hover:bg-gray-100">
            Clear filters
          </button>
        )}

        {hasFilters && (
          <div className="flex flex-wrap gap-1.5 w-full mt-1">
            {status   && <Chip label={`Status: ${status.replace('_', ' ')}`}   remove={() => setStatus('')} />}
            {priority && <Chip label={`Priority: ${priority}`}                  remove={() => setPriority('')} />}
            {assignee && <Chip label={`Assignee: ${assignee}`}                  remove={() => setAssignee('')} />}
            {search   && <Chip label={`"${search}"`}                            remove={() => setSearch('')} />}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="hover:text-red-800">×</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              <SortTh label="#"        field="id"        current={sortField} dir={sortDir} onSort={toggleSort} />
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Title</th>
              <SortTh label="Priority" field="priority"  current={sortField} dir={sortDir} onSort={toggleSort} />
              <SortTh label="Status"   field="status"    current={sortField} dir={sortDir} onSort={toggleSort} />
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Assignee</th>
              <SortTh label="Updated"  field="updatedAt" current={sortField} dir={sortDir} onSort={toggleSort} />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 7 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="px-4 py-3"><div className="skeleton h-3.5 w-8" /></td>
                  <td className="px-4 py-3"><div className="skeleton h-3.5 w-52 mb-1" /><div className="skeleton h-3 w-32" /></td>
                  <td className="px-4 py-3"><div className="skeleton h-3.5 w-14" /></td>
                  <td className="px-4 py-3"><div className="skeleton h-3.5 w-20" /></td>
                  <td className="px-4 py-3 hidden sm:table-cell"><div className="skeleton h-3.5 w-24" /></td>
                  <td className="px-4 py-3"><div className="skeleton h-3.5 w-12" /></td>
                </tr>
              ))
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <p className="text-[13px] text-gray-400">
                    {hasFilters ? 'No tickets match your filters.' : 'No tickets yet.'}
                  </p>
                  {!hasFilters && (
                    <Link href="/tickets/new" className="inline-flex items-center gap-1.5 mt-3 text-[13px] text-indigo-600 hover:text-indigo-700 font-medium">
                      Create your first ticket →
                    </Link>
                  )}
                </td>
              </tr>
            ) : (
              tickets.map((t, i) => (
                <tr key={t.id}
                  onClick={() => { window.location.href = `/tickets/${t.id}`; }}
                  className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer group ${i === tickets.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] text-gray-400">{t.id}</span>
                  </td>
                  <td className="px-4 py-3 max-w-0 w-full">
                    <Link href={`/tickets/${t.id}`} onClick={e => e.stopPropagation()}
                      className="text-[13px] font-medium text-gray-900 group-hover:text-indigo-700 line-clamp-1 hover:underline">
                      {t.title}
                    </Link>
                    <p className="text-[12px] text-gray-400 line-clamp-1 mt-px">{t.description}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap"><PriorityBadge priority={t.priority} size="sm" /></td>
                  <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={t.status} size="sm" /></td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 flex-shrink-0">
                        {t.assignee[0]?.toUpperCase()}
                      </div>
                      <span className="text-[12px] text-gray-600 truncate max-w-24">{t.assignee}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-[12px] text-gray-400">{timeAgo(t.updatedAt)}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination footer */}
        {!loading && total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
            <span className="text-[12px] text-gray-400">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="px-2.5 py-1 text-[12px] text-gray-500 hover:text-gray-800 border border-gray-200 rounded disabled:opacity-30 bg-white hover:bg-gray-50">
                ← Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={`w-7 h-7 text-[12px] rounded border ${page === i ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                className="px-2.5 py-1 text-[12px] text-gray-500 hover:text-gray-800 border border-gray-200 rounded disabled:opacity-30 bg-white hover:bg-gray-50">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      <p className="text-[11px] text-gray-400 text-right">
        <kbd className="font-mono bg-white border border-gray-200 rounded px-1">/</kbd> search ·{' '}
        <kbd className="font-mono bg-white border border-gray-200 rounded px-1">Esc</kbd> clear
      </p>
    </div>
  );
}

function Chip({ label, remove }: { label: string; remove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-medium">
      {label}
      <button onClick={remove} className="text-indigo-400 hover:text-indigo-700 ml-0.5 leading-none text-sm">×</button>
    </span>
  );
}
