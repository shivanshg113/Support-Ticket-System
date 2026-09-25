package com.stms.exception;

import com.stms.domain.TicketStatus;

/**
 * Thrown when a requested status transition violates the state machine.
 * Maps to HTTP 409 Conflict in GlobalExceptionHandler.
 */
public class InvalidStateTransitionException extends RuntimeException {

    public InvalidStateTransitionException(TicketStatus from, TicketStatus to) {
        super(String.format("Ticket cannot transition from %s to %s", from, to));
    }
}
