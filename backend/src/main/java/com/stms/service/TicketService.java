package com.stms.service;

import com.stms.domain.Comment;
import com.stms.domain.Ticket;
import com.stms.domain.TicketPriority;
import com.stms.domain.TicketStatus;
import com.stms.dto.*;
import com.stms.exception.InvalidStateTransitionException;
import com.stms.exception.TicketNotFoundException;
import com.stms.repository.CommentRepository;
import com.stms.repository.TicketRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Business logic layer for ticket and comment operations.
 *
 * <p>All business rules — including state machine enforcement — live here.
 * Controllers are thin and delegate entirely to this service.
 */
@Service
@Transactional
public class TicketService {

    /** Columns that callers are permitted to sort by. */
    private static final Set<String> ALLOWED_SORT_COLUMNS =
            Set.of("id", "createdAt", "updatedAt", "priority", "status");

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final TicketMapper mapper;

    public TicketService(TicketRepository ticketRepository,
                         CommentRepository commentRepository,
                         TicketMapper mapper) {
        this.ticketRepository  = ticketRepository;
        this.commentRepository = commentRepository;
        this.mapper            = mapper;
    }

    // ─── Create ───────────────────────────────────────────────────────────────

    public TicketResponse createTicket(TicketCreateRequest request) {
        Ticket ticket = new Ticket(
                request.getTitle(),
                request.getDescription(),
                request.getPriority(),
                request.getAssignee()
        );
        return mapper.toResponse(ticketRepository.save(ticket), false);
    }

    // ─── List / Search / Filter / Sort (paginated) ───────────────────────────

    @Transactional(readOnly = true)
    public PagedResponse<TicketResponse> listTickets(String search, TicketStatus status,
                                                     TicketPriority priority, String assignee,
                                                     int page, int size,
                                                     String sortBy, String sortDir) {
        // Sanitise sort column — never allow arbitrary column injection
        String col = ALLOWED_SORT_COLUMNS.contains(sortBy) ? sortBy : "createdAt";
        Sort.Direction dir = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(
                Math.max(0, page),
                Math.min(Math.max(1, size), 100),
                Sort.by(dir, col)
        );

        // Normalise empty strings to null so the unified query treats them as "no filter"
        String kw  = (search   != null && !search.isBlank())   ? search.trim()   : null;
        String asn = (assignee != null && !assignee.isBlank()) ? assignee.trim() : null;

        Page<Ticket> ticketPage = ticketRepository.findByFilters(kw, status, priority, asn, pageable);

        List<TicketResponse> content = ticketPage.getContent().stream()
                .map(t -> mapper.toResponse(t, false))
                .collect(Collectors.toList());

        return new PagedResponse<>(content, ticketPage.getNumber(), ticketPage.getSize(),
                ticketPage.getTotalElements(), ticketPage.getTotalPages());
    }

    // ─── Get by ID ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public TicketResponse getTicket(Long id) {
        return mapper.toResponse(findOrThrow(id), true);
    }

    // ─── Update fields ────────────────────────────────────────────────────────

    public TicketResponse updateTicket(Long id, TicketUpdateRequest request) {
        Ticket ticket = findOrThrow(id);

        if (request.getTitle()       != null && !request.getTitle().isBlank())       ticket.setTitle(request.getTitle());
        if (request.getDescription() != null && !request.getDescription().isBlank()) ticket.setDescription(request.getDescription());
        if (request.getPriority()    != null)                                         ticket.setPriority(request.getPriority());
        if (request.getAssignee()    != null && !request.getAssignee().isBlank())    ticket.setAssignee(request.getAssignee());

        return mapper.toResponse(ticketRepository.save(ticket), true);
    }

    // ─── Status transition ────────────────────────────────────────────────────

    /**
     * Enforces the server-side state machine. Throws {@link InvalidStateTransitionException}
     * if the transition is not in the allowed-next set for the current status.
     */
    public TicketResponse transitionStatus(Long id, TicketStatusUpdateRequest request) {
        Ticket ticket     = findOrThrow(id);
        TicketStatus from = ticket.getStatus();
        TicketStatus to   = request.getStatus();

        if (!from.isTransitionAllowed(to)) {
            throw new InvalidStateTransitionException(from, to);
        }

        ticket.setStatus(to);
        return mapper.toResponse(ticketRepository.save(ticket), true);
    }

    // ─── Delete ───────────────────────────────────────────────────────────────

    /**
     * Permanently deletes a ticket and all its comments (cascade).
     * The ticket must exist; throws {@link TicketNotFoundException} otherwise.
     */
    public void deleteTicket(Long id) {
        Ticket ticket = findOrThrow(id);
        ticketRepository.delete(ticket);
    }

    // ─── Comments ─────────────────────────────────────────────────────────────

    public CommentResponse addComment(Long ticketId, CommentCreateRequest request) {
        Ticket ticket = findOrThrow(ticketId);
        Comment comment = new Comment(ticket, request.getAuthor(), request.getContent());
        return mapper.toCommentResponse(commentRepository.save(comment));
    }

    public void deleteComment(Long ticketId, Long commentId) {
        // Verify the ticket exists first (gives a proper 404 if not)
        findOrThrow(ticketId);
        commentRepository.findById(commentId).ifPresent(commentRepository::delete);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Ticket findOrThrow(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));
    }
}
