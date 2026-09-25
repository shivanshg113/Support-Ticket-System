package com.stms.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA entity representing a support ticket.
 * This class is an internal persistence model — it is never serialised directly
 * into HTTP responses. Use DTOs (TicketResponse, etc.) for the public API contract.
 */
@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketStatus status;

    @Column(nullable = false, length = 100)
    private String assignee;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    private List<Comment> comments = new ArrayList<>();

    // ─── Lifecycle callbacks ───────────────────────────────────────────────────

    @PrePersist
    void onPrePersist() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = TicketStatus.OPEN;
        }
    }

    @PreUpdate
    void onPreUpdate() {
        this.updatedAt = Instant.now();
    }

    // ─── Constructors ──────────────────────────────────────────────────────────

    protected Ticket() {}

    public Ticket(String title, String description, TicketPriority priority, String assignee) {
        this.title       = title;
        this.description = description;
        this.priority    = priority;
        this.assignee    = assignee;
        this.status      = TicketStatus.OPEN;
    }

    // ─── Getters / Setters ─────────────────────────────────────────────────────

    public Long getId()                      { return id; }
    public String getTitle()                 { return title; }
    public void setTitle(String title)       { this.title = title; }
    public String getDescription()           { return description; }
    public void setDescription(String desc)  { this.description = desc; }
    public TicketPriority getPriority()      { return priority; }
    public void setPriority(TicketPriority p){ this.priority = p; }
    public TicketStatus getStatus()          { return status; }
    public void setStatus(TicketStatus s)    { this.status = s; }
    public String getAssignee()              { return assignee; }
    public void setAssignee(String assignee) { this.assignee = assignee; }
    public Instant getCreatedAt()            { return createdAt; }
    public Instant getUpdatedAt()            { return updatedAt; }
    public List<Comment> getComments()       { return comments; }
}
