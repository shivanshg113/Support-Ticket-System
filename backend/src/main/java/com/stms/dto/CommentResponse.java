package com.stms.dto;

import java.time.Instant;

/**
 * API response DTO for a comment.
 */
public class CommentResponse {

    private Long id;
    private Long ticketId;
    private String author;
    private String content;
    private Instant createdAt;

    public CommentResponse() {}

    public CommentResponse(Long id, Long ticketId, String author, String content, Instant createdAt) {
        this.id        = id;
        this.ticketId  = ticketId;
        this.author    = author;
        this.content   = content;
        this.createdAt = createdAt;
    }

    public Long getId()           { return id; }
    public Long getTicketId()     { return ticketId; }
    public String getAuthor()     { return author; }
    public String getContent()    { return content; }
    public Instant getCreatedAt() { return createdAt; }
}
