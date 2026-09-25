package com.stms.dto;

import com.stms.domain.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request body for POST /api/tickets.
 * Status is intentionally absent — the server always sets OPEN.
 */
public class TicketCreateRequest {

    @NotBlank(message = "Title must not be blank")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @NotBlank(message = "Description must not be blank")
    private String description;

    @NotNull(message = "Priority must not be null")
    private TicketPriority priority;

    @NotBlank(message = "Assignee must not be blank")
    @Size(max = 100, message = "Assignee must not exceed 100 characters")
    private String assignee;

    // ─── Getters / Setters ─────────────────────────────────────────────────────

    public String getTitle()                    { return title; }
    public void setTitle(String title)          { this.title = title; }
    public String getDescription()              { return description; }
    public void setDescription(String desc)     { this.description = desc; }
    public TicketPriority getPriority()         { return priority; }
    public void setPriority(TicketPriority p)   { this.priority = p; }
    public String getAssignee()                 { return assignee; }
    public void setAssignee(String assignee)    { this.assignee = assignee; }
}
