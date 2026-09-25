/**
 * API client — single source of truth for all backend calls.
 * All fetch calls originate here; components never call fetch directly.
 */

import type {
  ApiError,
  CommentCreateRequest,
  CommentResponse,
  StatsResponse,
  TicketCreateRequest,
  TicketPriority,
  TicketResponse,
  TicketStatus,
  TicketStatusUpdateRequest,
  TicketUpdateRequest,
} from '@/types';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api';

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!response.ok) {
    let errorBody: ApiError;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = {
        timestamp: new Date().toISOString(),
        status: response.status,
        error: 'NETWORK_ERROR',
        message: `Unexpected response: ${response.status} ${response.statusText}`,
        path,
      };
    }
    throw errorBody;
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ─── Stats API ────────────────────────────────────────────────────────────────

export async function getStats(): Promise<StatsResponse> {
  return apiFetch<StatsResponse>('/stats');
}

// ─── Ticket API ───────────────────────────────────────────────────────────────

export async function getTickets(params?: {
  search?:   string;
  status?:   TicketStatus;
  priority?: TicketPriority;
  assignee?: string;
  sortBy?:   string;
  sortDir?:  'asc' | 'desc';
  page?:     number;
  size?:     number;
}): Promise<PagedResponse<TicketResponse>> {
  const query = new URLSearchParams();
  if (params?.search)               query.set('search',   params.search);
  if (params?.status)               query.set('status',   params.status);
  if (params?.priority)             query.set('priority', params.priority);
  if (params?.assignee)             query.set('assignee', params.assignee);
  if (params?.sortBy)               query.set('sortBy',   params.sortBy);
  if (params?.sortDir)              query.set('sortDir',  params.sortDir);
  if (params?.page  !== undefined)  query.set('page',     String(params.page));
  if (params?.size  !== undefined)  query.set('size',     String(params.size));
  const qs = query.toString() ? `?${query.toString()}` : '';
  return apiFetch<PagedResponse<TicketResponse>>(`/tickets${qs}`);
}

export async function getTicket(id: number): Promise<TicketResponse> {
  return apiFetch<TicketResponse>(`/tickets/${id}`);
}

export async function createTicket(data: TicketCreateRequest): Promise<TicketResponse> {
  return apiFetch<TicketResponse>('/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTicket(id: number, data: TicketUpdateRequest): Promise<TicketResponse> {
  return apiFetch<TicketResponse>(`/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function transitionStatus(id: number, data: TicketStatusUpdateRequest): Promise<TicketResponse> {
  return apiFetch<TicketResponse>(`/tickets/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteTicket(id: number): Promise<void> {
  return apiFetch<void>(`/tickets/${id}`, { method: 'DELETE' });
}

// ─── Comment API ──────────────────────────────────────────────────────────────

export async function addComment(ticketId: number, data: CommentCreateRequest): Promise<CommentResponse> {
  return apiFetch<CommentResponse>(`/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteComment(ticketId: number, commentId: number): Promise<void> {
  return apiFetch<void>(`/tickets/${ticketId}/comments/${commentId}`, { method: 'DELETE' });
}

// ─── Error helper ─────────────────────────────────────────────────────────────

export function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    return (err as ApiError).message;
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred. Please try again.';
}
