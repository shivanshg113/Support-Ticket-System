package com.stms.controller;

import com.stms.domain.TicketPriority;
import com.stms.domain.TicketStatus;
import com.stms.dto.*;
import com.stms.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for ticket and comment operations.
 * Thin by design — all business logic lives in TicketService.
 */
@RestController
@RequestMapping("/api/tickets")
@Tag(name = "Tickets", description = "Support ticket lifecycle management")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    // ─── Create ───────────────────────────────────────────────────────────────

    @Operation(summary = "Create a new support ticket")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Ticket created"),
        @ApiResponse(responseCode = "400", description = "Validation failed")
    })
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody TicketCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(request));
    }

    // ─── List (with all filters + sort + pagination) ─────────────────────────

    @Operation(summary = "List tickets — filter by keyword, status, priority, assignee; sort and paginate")
    @GetMapping
    public ResponseEntity<PagedResponse<TicketResponse>> listTickets(
            @Parameter(description = "Keyword search on title and description")
            @RequestParam(required = false) String search,

            @Parameter(description = "Filter by status")
            @RequestParam(required = false) TicketStatus status,

            @Parameter(description = "Filter by priority")
            @RequestParam(required = false) TicketPriority priority,

            @Parameter(description = "Filter by assignee (partial match)")
            @RequestParam(required = false) String assignee,

            @Parameter(description = "Sort field: id | createdAt | updatedAt | priority | status", example = "createdAt")
            @RequestParam(defaultValue = "createdAt") String sortBy,

            @Parameter(description = "Sort direction: asc | desc", example = "desc")
            @RequestParam(defaultValue = "desc") String sortDir,

            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Page size (max 100)", example = "20")
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(
                ticketService.listTickets(search, status, priority, assignee, page, size, sortBy, sortDir));
    }

    // ─── Get by ID ────────────────────────────────────────────────────────────

    @Operation(summary = "Get ticket details including comments")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Ticket found"),
        @ApiResponse(responseCode = "404", description = "Ticket not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicket(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicket(id));
    }

    // ─── Update ───────────────────────────────────────────────────────────────

    @Operation(summary = "Update ticket fields (partial PATCH)")
    @PatchMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request));
    }

    // ─── Status transition ────────────────────────────────────────────────────

    @Operation(summary = "Transition ticket to a new status (server-enforced state machine)")
    @ApiResponses({
        @ApiResponse(responseCode = "200",  description = "Transition applied"),
        @ApiResponse(responseCode = "409",  description = "Invalid state transition"),
        @ApiResponse(responseCode = "404",  description = "Ticket not found")
    })
    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> transitionStatus(
            @PathVariable Long id,
            @Valid @RequestBody TicketStatusUpdateRequest request) {
        return ResponseEntity.ok(ticketService.transitionStatus(id, request));
    }

    // ─── Delete ticket ────────────────────────────────────────────────────────

    @Operation(summary = "Permanently delete a ticket and all its comments")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Ticket deleted"),
        @ApiResponse(responseCode = "404", description = "Ticket not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Comments ─────────────────────────────────────────────────────────────

    @Operation(summary = "Add a comment to a ticket")
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.addComment(id, request));
    }

    @Operation(summary = "Delete a comment from a ticket")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Comment deleted"),
        @ApiResponse(responseCode = "404", description = "Ticket not found")
    })
    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @PathVariable Long commentId) {
        ticketService.deleteComment(id, commentId);
        return ResponseEntity.noContent().build();
    }
}
