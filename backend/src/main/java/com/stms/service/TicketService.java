package com.stms.service;

import com.stms.domain.Comment;
import com.stms.domain.Ticket;
import com.stms.domain.TicketStatus;
import com.stms.dto.*;
import com.stms.exception.InvalidStateTransitionException;
import com.stms.exception.TicketNotFoundException;
import com.stms.repository.CommentRepository;
import com.stms.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
        Ticket saved = ticketRepository.save(ticket);
        return mapper.toResponse(saved, false);
    }

    // ─── List / Search / Filter ───────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TicketResponse> listTickets(String search, TicketStatus status) {
        List<Ticket> tickets;

        boolean hasSearch = search != null && !search.isBlank();
        boolean hasStatus = status != null;

        if (hasSearch && hasStatus) {
            tickets = ticketRepository.findByKeywordAndStatus(search.trim(), status);
        } else if (hasSearch) {
            tickets = ticketRepository.findByKeyword(search.trim());
        } else if (hasStatus) {
            tickets = ticketRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            tickets = ticketRepository.findAllByOrderByCreatedAtDesc();
        }

        return tickets.stream()
                .map(t -> mapper.toResponse(t, false))
                .collect(Collectors.toList());
    }

    // ─── Get by ID ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public TicketResponse getTicket(Long id) {
        Ticket ticket = findOrThrow(id);
        return mapper.toResponse(ticket, true);
    }

    // ─── Update fields ────────────────────────────────────────────────────────

    public TicketResponse updateTicket(Long id, TicketUpdateRequest request) {
        Ticket ticket = findOrThrow(id);

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            ticket.setTitle(request.getTitle());
        }
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            ticket.setDescription(request.getDescription());
        }
        if (request.getPriority() != null) {
            ticket.setPriority(request.getPriority());
        }
        if (request.getAssignee() != null && !request.getAssignee().isBlank()) {
            ticket.setAssignee(request.getAssignee());
        }

        Ticket saved = ticketRepository.save(ticket);
        return mapper.toResponse(saved, true);
    }

    // ─── Status transition ────────────────────────────────────────────────────

    /**
     * Transitions a ticket to a new status, enforcing the state machine.
     * Throws InvalidStateTransitionException if the transition is not allowed.
     * This is enforced here — not in the controller or frontend.
     */
    public TicketResponse transitionStatus(Long id, TicketStatusUpdateRequest request) {
        Ticket ticket      = findOrThrow(id);
        TicketStatus from  = ticket.getStatus();
        TicketStatus to    = request.getStatus();

        if (!from.isTransitionAllowed(to)) {
            throw new InvalidStateTransitionException(from, to);
        }

        ticket.setStatus(to);
        Ticket saved = ticketRepository.save(ticket);
        return mapper.toResponse(saved, true);
    }

    // ─── Comments ─────────────────────────────────────────────────────────────

    public CommentResponse addComment(Long ticketId, CommentCreateRequest request) {
        Ticket ticket = findOrThrow(ticketId);
        Comment comment = new Comment(ticket, request.getAuthor(), request.getContent());
        Comment saved = commentRepository.save(comment);
        return mapper.toCommentResponse(saved);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Ticket findOrThrow(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));
    }
}
