package com.stms.controller;

import com.stms.domain.TicketStatus;
import com.stms.dto.*;
import com.stms.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for ticket and comment operations.
 * Thin by design — all business logic lives in TicketService.
 */
@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    // ─── POST /api/tickets ───────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody TicketCreateRequest request) {
        TicketResponse response = ticketService.createTicket(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ─── GET /api/tickets ────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<TicketResponse>> listTickets(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TicketStatus status) {
        return ResponseEntity.ok(ticketService.listTickets(search, status));
    }

    // ─── GET /api/tickets/{id} ───────────────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicket(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicket(id));
    }

    // ─── PATCH /api/tickets/{id} ─────────────────────────────────────────────

    @PatchMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request));
    }

    // ─── PATCH /api/tickets/{id}/status ─────────────────────────────────────

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> transitionStatus(
            @PathVariable Long id,
            @Valid @RequestBody TicketStatusUpdateRequest request) {
        return ResponseEntity.ok(ticketService.transitionStatus(id, request));
    }

    // ─── POST /api/tickets/{id}/comments ────────────────────────────────────

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentCreateRequest request) {
        CommentResponse response = ticketService.addComment(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
