import type { TicketPriority } from '@/types';

interface Props {
  priority: TicketPriority;
  size?: 'sm' | 'md';
}

const config: Record<TicketPriority, { icon: string; color: string; label: string }> = {
  LOW:      { icon: '↓', color: 'text-gray-400',   label: 'Low' },
  MEDIUM:   { icon: '→', color: 'text-sky-500',    label: 'Medium' },
  HIGH:     { icon: '↑', color: 'text-orange-500', label: 'High' },
  CRITICAL: { icon: '⚡', color: 'text-red-500',   label: 'Critical' },
};

export default function PriorityBadge({ priority, size = 'md' }: Props) {
  const c = config[priority];
  return (
    <span className={`inline-flex items-center gap-1 font-medium ${size === 'sm' ? 'text-[11px]' : 'text-xs'} ${c.color}`}>
      <span className="leading-none">{c.icon}</span>
      {c.label}
    </span>
  );
}
