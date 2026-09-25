import type { TicketStatus } from '@/types';

interface Props {
  status: TicketStatus;
  size?: 'sm' | 'md';
}

const config: Record<TicketStatus, { dot: string; text: string; label: string; pulse?: boolean }> = {
  OPEN:        { dot: 'bg-blue-500',    text: 'text-blue-700',    label: 'Open' },
  IN_PROGRESS: { dot: 'bg-amber-500',   text: 'text-amber-700',   label: 'In Progress', pulse: true },
  RESOLVED:    { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'Resolved' },
  CLOSED:      { dot: 'bg-gray-400',    text: 'text-gray-500',    label: 'Closed' },
  CANCELLED:   { dot: 'bg-red-400',     text: 'text-red-600',     label: 'Cancelled' },
};

export default function StatusBadge({ status, size = 'md' }: Props) {
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium ${size === 'sm' ? 'text-[11px]' : 'text-xs'} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot} ${c.pulse ? 'animate-pulse' : ''}`} />
      {c.label}
    </span>
  );
}
