package com.stms.dto;

import com.stms.domain.TicketPriority;
import com.stms.domain.TicketStatus;

import java.time.Instant;
import java.util.List;

/**
 * API response DTO for a ticket — used for both list and detail endpoints.
 * Comments list is populated for detail requests; it is an empty list for list requests
 * to avoid the N+1 overhead.
 */
public class TicketResponse {

    private Long id;
    private String title;
    private String description;
    private TicketPriority priority;
    private TicketStatus status;
    private String assignee;
    private Instant createdAt;
    private Instant updatedAt;
    private List<CommentResponse> comments;

    public TicketResponse() {}

    // ─── Getters / Setters ─────────────────────────────────────────────────────

    public Long getId()                               { return id; }
    public void setId(Long id)                        { this.id = id; }
    public String getTitle()                          { return title; }
    public void setTitle(String title)                { this.title = title; }
    public String getDescription()                    { return description; }
    public void setDescription(String description)    { this.description = description; }
    public TicketPriority getPriority()               { return priority; }
    public void setPriority(TicketPriority priority)  { this.priority = priority; }
    public TicketStatus getStatus()                   { return status; }
    public void setStatus(TicketStatus status)        { this.status = status; }
    public String getAssignee()                       { return assignee; }
    public void setAssignee(String assignee)          { this.assignee = assignee; }
    public Instant getCreatedAt()                     { return createdAt; }
    public void setCreatedAt(Instant createdAt)       { this.createdAt = createdAt; }
    public Instant getUpdatedAt()                     { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt)       { this.updatedAt = updatedAt; }
    public List<CommentResponse> getComments()        { return comments; }
    public void setComments(List<CommentResponse> c)  { this.comments = c; }
}
