package com.stms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for POST /api/tickets/{id}/comments.
 */
public class CommentCreateRequest {

    @NotBlank(message = "Author must not be blank")
    @Size(max = 100, message = "Author must not exceed 100 characters")
    private String author;

    @NotBlank(message = "Content must not be blank")
    private String content;

    public String getAuthor()              { return author; }
    public void setAuthor(String author)   { this.author = author; }
    public String getContent()             { return content; }
    public void setContent(String content) { this.content = content; }
}
