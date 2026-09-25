package com.stms.domain;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * JPA entity representing a comment attached to a support ticket.
 */
@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @Column(nullable = false, length = 100)
    private String author;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onPrePersist() {
        this.createdAt = Instant.now();
    }

    // ─── Constructors ──────────────────────────────────────────────────────────

    protected Comment() {}

    public Comment(Ticket ticket, String author, String content) {
        this.ticket  = ticket;
        this.author  = author;
        this.content = content;
    }

    // ─── Getters ──────────────────────────────────────────────────────────────

    public Long getId()       { return id; }
    public Ticket getTicket() { return ticket; }
    public String getAuthor() { return author; }
    public String getContent(){ return content; }
    public Instant getCreatedAt() { return createdAt; }
}
