package com.stms.domain;

import java.util.Set;

/**
 * Ticket lifecycle states with embedded transition rules.
 *
 * <p>Each constant carries the set of states it is allowed to transition <em>to</em>.
 * CLOSED and CANCELLED are terminal: their allowed-next sets are empty.
 *
 * <p>This is the single authoritative source of the state machine — enforced in
 * TicketService; never rely on the frontend to enforce these rules.
 */
public enum TicketStatus {

    OPEN(Set.of(TicketStatus.IN_PROGRESS_NAME, TicketStatus.CANCELLED_NAME)),
    IN_PROGRESS(Set.of(TicketStatus.RESOLVED_NAME, TicketStatus.CANCELLED_NAME)),
    RESOLVED(Set.of(TicketStatus.CLOSED_NAME)),
    CLOSED(Set.of()),
    CANCELLED(Set.of());

    // String sentinels used to avoid forward-reference initialisation issues in enum
    static final String IN_PROGRESS_NAME = "IN_PROGRESS";
    static final String RESOLVED_NAME    = "RESOLVED";
    static final String CANCELLED_NAME   = "CANCELLED";
    static final String CLOSED_NAME      = "CLOSED";

    private final Set<String> allowedNextNames;

    TicketStatus(Set<String> allowedNextNames) {
        this.allowedNextNames = Set.copyOf(allowedNextNames);
    }

    /**
     * Returns true if transitioning from this state to {@code next} is permitted
     * by the state machine.
     */
    public boolean isTransitionAllowed(TicketStatus next) {
        return allowedNextNames.contains(next.name());
    }

    /**
     * Returns true if this is a terminal state (no further transitions allowed).
     */
    public boolean isTerminal() {
        return allowedNextNames.isEmpty();
    }
}
