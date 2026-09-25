package com.stms.service;

import com.stms.domain.Comment;
import com.stms.domain.Ticket;
import com.stms.dto.CommentResponse;
import com.stms.dto.TicketResponse;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

/**
 * Stateless mapper between domain entities and API DTOs.
 * Kept in the service layer because mapping is a service concern, not a persistence concern.
 */
@Component
public class TicketMapper {

    /**
     * Maps a Ticket entity to a TicketResponse DTO.
     *
     * @param ticket        the entity
     * @param includeComments whether to populate the comments list
     */
    public TicketResponse toResponse(Ticket ticket, boolean includeComments) {
        TicketResponse r = new TicketResponse();
        r.setId(ticket.getId());
        r.setTitle(ticket.getTitle());
        r.setDescription(ticket.getDescription());
        r.setPriority(ticket.getPriority());
        r.setStatus(ticket.getStatus());
        r.setAssignee(ticket.getAssignee());
        r.setCreatedAt(ticket.getCreatedAt());
        r.setUpdatedAt(ticket.getUpdatedAt());

        if (includeComments) {
            List<CommentResponse> comments = ticket.getComments().stream()
                    .map(this::toCommentResponse)
                    .toList();
            r.setComments(comments);
        } else {
            r.setComments(Collections.emptyList());
        }
        return r;
    }

    public CommentResponse toCommentResponse(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getTicket().getId(),
                comment.getAuthor(),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }
}
