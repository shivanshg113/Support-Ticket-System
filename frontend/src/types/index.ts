// ─── Domain enumerations ──────────────────────────────────────────────────────

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED';

// ─── API response types ───────────────────────────────────────────────────────

export interface CommentResponse {
  id: number;
  ticketId: number;
  author: string;
  content: string;
  createdAt: string; // ISO-8601
}

export interface TicketResponse {
  id: number;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee: string;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
  comments: CommentResponse[];
}

// ─── API request types ────────────────────────────────────────────────────────

export interface TicketCreateRequest {
  title: string;
  description: string;
  priority: TicketPriority;
  assignee: string;
}

export interface TicketUpdateRequest {
  title?: string;
  description?: string;
  priority?: TicketPriority;
  assignee?: string;
}

export interface TicketStatusUpdateRequest {
  status: TicketStatus;
}

export interface CommentCreateRequest {
  author: string;
  content: string;
}

// ─── Stats response type ──────────────────────────────────────────────────────

export interface StatsResponse {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  cancelled: number;
  low: number;
  medium: number;
  high: number;
  critical: number;
  createdLast24h: number;
  resolvedLast24h: number;
}

// ─── Error response type ──────────────────────────────────────────────────────

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

// ─── State machine helpers ────────────────────────────────────────────────────

/**
 * Returns the list of valid next statuses for a given current status.
 * This is used only for UI hints (hiding invalid buttons).
 * The backend always enforces the real state machine.
 */
export function allowedNextStatuses(current: TicketStatus): TicketStatus[] {
  switch (current) {
    case 'OPEN':        return ['IN_PROGRESS', 'CANCELLED'];
    case 'IN_PROGRESS': return ['RESOLVED', 'CANCELLED'];
    case 'RESOLVED':    return ['CLOSED'];
    case 'CLOSED':      return [];
    case 'CANCELLED':   return [];
  }
}

export const PRIORITIES: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED'];
