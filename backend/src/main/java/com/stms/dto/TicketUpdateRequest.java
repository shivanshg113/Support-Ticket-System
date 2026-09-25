package com.stms.dto;

import com.stms.domain.TicketPriority;
import jakarta.validation.constraints.Size;

/**
 * Request body for PATCH /api/tickets/{id}.
 * All fields are optional; only non-null values are applied (partial PATCH).
 * Status is not updatable via this endpoint.
 */
public class TicketUpdateRequest {

    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private String description;

    private TicketPriority priority;

    @Size(max = 100, message = "Assignee must not exceed 100 characters")
    private String assignee;

    // ─── Getters / Setters ─────────────────────────────────────────────────────

    public String getTitle()                  { return title; }
    public void setTitle(String title)        { this.title = title; }
    public String getDescription()            { return description; }
    public void setDescription(String desc)   { this.description = desc; }
    public TicketPriority getPriority()       { return priority; }
    public void setPriority(TicketPriority p) { this.priority = p; }
    public String getAssignee()               { return assignee; }
    public void setAssignee(String assignee)  { this.assignee = assignee; }
}
