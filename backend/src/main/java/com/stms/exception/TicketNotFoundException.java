package com.stms.exception;

/**
 * Thrown when a requested ticket ID does not exist in the database.
 * Maps to HTTP 404 in GlobalExceptionHandler.
 */
public class TicketNotFoundException extends RuntimeException {

    public TicketNotFoundException(Long id) {
        super("Ticket not found with id: " + id);
    }
}
