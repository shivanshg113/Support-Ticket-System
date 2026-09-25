package com.stms.domain;

/**
 * Ticket priority levels, ordered from lowest to highest urgency.
 * Stored as string in the database (EnumType.STRING) to avoid positional fragility.
 */
public enum TicketPriority {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL
}
