package com.stms.dto;

import com.stms.domain.TicketStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Request body for PATCH /api/tickets/{id}/status.
 */
public class TicketStatusUpdateRequest {

    @NotNull(message = "Status must not be null")
    private TicketStatus status;

    public TicketStatus getStatus()           { return status; }
    public void setStatus(TicketStatus status){ this.status = status; }
}
