package com.stms.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for TicketStatus state machine logic.
 * Covers the full transition matrix from spec/state-machine.md and spec/test-strategy.md.
 * No Spring context required — pure domain logic.
 */
@DisplayName("TicketStatus — state machine unit tests")
class TicketStatusTest {

    // ─── Allowed transitions ─────────────────────────────────────────────────

    @Test @DisplayName("OPEN → IN_PROGRESS is allowed")
    void open_to_inProgress_allowed() {
        assertTrue(TicketStatus.OPEN.isTransitionAllowed(TicketStatus.IN_PROGRESS));
    }

    @Test @DisplayName("OPEN → CANCELLED is allowed")
    void open_to_cancelled_allowed() {
        assertTrue(TicketStatus.OPEN.isTransitionAllowed(TicketStatus.CANCELLED));
    }

    @Test @DisplayName("IN_PROGRESS → RESOLVED is allowed")
    void inProgress_to_resolved_allowed() {
        assertTrue(TicketStatus.IN_PROGRESS.isTransitionAllowed(TicketStatus.RESOLVED));
    }

    @Test @DisplayName("IN_PROGRESS → CANCELLED is allowed")
    void inProgress_to_cancelled_allowed() {
        assertTrue(TicketStatus.IN_PROGRESS.isTransitionAllowed(TicketStatus.CANCELLED));
    }

    @Test @DisplayName("RESOLVED → CLOSED is allowed")
    void resolved_to_closed_allowed() {
        assertTrue(TicketStatus.RESOLVED.isTransitionAllowed(TicketStatus.CLOSED));
    }

    // ─── Forbidden transitions — from CLOSED (terminal) ─────────────────────

    @Test @DisplayName("CLOSED → OPEN is forbidden")
    void closed_to_open_forbidden() {
        assertFalse(TicketStatus.CLOSED.isTransitionAllowed(TicketStatus.OPEN));
    }

    @Test @DisplayName("CLOSED → IN_PROGRESS is forbidden")
    void closed_to_inProgress_forbidden() {
        assertFalse(TicketStatus.CLOSED.isTransitionAllowed(TicketStatus.IN_PROGRESS));
    }

    @Test @DisplayName("CLOSED → RESOLVED is forbidden")
    void closed_to_resolved_forbidden() {
        assertFalse(TicketStatus.CLOSED.isTransitionAllowed(TicketStatus.RESOLVED));
    }

    // ─── Forbidden transitions — from CANCELLED (terminal) ──────────────────

    @Test @DisplayName("CANCELLED → OPEN is forbidden")
    void cancelled_to_open_forbidden() {
        assertFalse(TicketStatus.CANCELLED.isTransitionAllowed(TicketStatus.OPEN));
    }

    @Test @DisplayName("CANCELLED → IN_PROGRESS is forbidden")
    void cancelled_to_inProgress_forbidden() {
        assertFalse(TicketStatus.CANCELLED.isTransitionAllowed(TicketStatus.IN_PROGRESS));
    }

    // ─── Forbidden transitions — from RESOLVED ───────────────────────────────

    @Test @DisplayName("RESOLVED → OPEN is forbidden")
    void resolved_to_open_forbidden() {
        assertFalse(TicketStatus.RESOLVED.isTransitionAllowed(TicketStatus.OPEN));
    }

    @Test @DisplayName("RESOLVED → IN_PROGRESS is forbidden")
    void resolved_to_inProgress_forbidden() {
        assertFalse(TicketStatus.RESOLVED.isTransitionAllowed(TicketStatus.IN_PROGRESS));
    }

    // ─── Forbidden transitions — from OPEN ──────────────────────────────────

    @Test @DisplayName("OPEN → RESOLVED is forbidden")
    void open_to_resolved_forbidden() {
        assertFalse(TicketStatus.OPEN.isTransitionAllowed(TicketStatus.RESOLVED));
    }

    @Test @DisplayName("OPEN → CLOSED is forbidden")
    void open_to_closed_forbidden() {
        assertFalse(TicketStatus.OPEN.isTransitionAllowed(TicketStatus.CLOSED));
    }

    // ─── Forbidden transitions — from IN_PROGRESS ───────────────────────────

    @Test @DisplayName("IN_PROGRESS → CLOSED is forbidden")
    void inProgress_to_closed_forbidden() {
        assertFalse(TicketStatus.IN_PROGRESS.isTransitionAllowed(TicketStatus.CLOSED));
    }

    @Test @DisplayName("IN_PROGRESS → OPEN is forbidden")
    void inProgress_to_open_forbidden() {
        assertFalse(TicketStatus.IN_PROGRESS.isTransitionAllowed(TicketStatus.OPEN));
    }

    // ─── Terminal state checks ────────────────────────────────────────────────

    @Test @DisplayName("CLOSED is terminal")
    void closed_is_terminal() {
        assertTrue(TicketStatus.CLOSED.isTerminal());
    }

    @Test @DisplayName("CANCELLED is terminal")
    void cancelled_is_terminal() {
        assertTrue(TicketStatus.CANCELLED.isTerminal());
    }

    @Test @DisplayName("OPEN is not terminal")
    void open_is_not_terminal() {
        assertFalse(TicketStatus.OPEN.isTerminal());
    }

    @Test @DisplayName("IN_PROGRESS is not terminal")
    void inProgress_is_not_terminal() {
        assertFalse(TicketStatus.IN_PROGRESS.isTerminal());
    }

    @Test @DisplayName("RESOLVED is not terminal")
    void resolved_is_not_terminal() {
        assertFalse(TicketStatus.RESOLVED.isTerminal());
    }
}
