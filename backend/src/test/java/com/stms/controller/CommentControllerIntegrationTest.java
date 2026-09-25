package com.stms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stms.domain.TicketPriority;
import com.stms.dto.CommentCreateRequest;
import com.stms.dto.TicketCreateRequest;
import com.stms.repository.CommentRepository;
import com.stms.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Comment endpoints — integration tests")
class CommentControllerIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired TicketRepository ticketRepository;
    @Autowired CommentRepository commentRepository;

    @BeforeEach
    void cleanUp() {
        commentRepository.deleteAll();
        ticketRepository.deleteAll();
    }

    private Long createTicket() throws Exception {
        TicketCreateRequest req = new TicketCreateRequest();
        req.setTitle("Test ticket");
        req.setDescription("Test description");
        req.setPriority(TicketPriority.LOW);
        req.setAssignee("agent-1");

        MvcResult result = mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    @Test @DisplayName("POST /api/tickets/{id}/comments — 201 with comment body")
    void addComment_201() throws Exception {
        Long id = createTicket();

        CommentCreateRequest req = new CommentCreateRequest();
        req.setAuthor("agent-1");
        req.setContent("Investigating the issue.");

        mockMvc.perform(post("/api/tickets/{id}/comments", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.ticketId").value(id))
                .andExpect(jsonPath("$.author").value("agent-1"))
                .andExpect(jsonPath("$.content").value("Investigating the issue."))
                .andExpect(jsonPath("$.createdAt").exists());
    }

    @Test @DisplayName("POST comment — 400 when content is blank")
    void addComment_400_blankContent() throws Exception {
        Long id = createTicket();

        CommentCreateRequest req = new CommentCreateRequest();
        req.setAuthor("agent-1");
        req.setContent("  ");

        mockMvc.perform(post("/api/tickets/{id}/comments", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"));
    }

    @Test @DisplayName("POST comment — 400 when author is blank")
    void addComment_400_blankAuthor() throws Exception {
        Long id = createTicket();

        CommentCreateRequest req = new CommentCreateRequest();
        req.setAuthor("");
        req.setContent("Some content");

        mockMvc.perform(post("/api/tickets/{id}/comments", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test @DisplayName("POST comment — 404 for non-existent ticket")
    void addComment_404() throws Exception {
        CommentCreateRequest req = new CommentCreateRequest();
        req.setAuthor("agent-1");
        req.setContent("Content");

        mockMvc.perform(post("/api/tickets/99999/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("TICKET_NOT_FOUND"));
    }

    @Test @DisplayName("GET /api/tickets/{id} — response includes comments")
    void ticketDetail_includesComments() throws Exception {
        Long id = createTicket();

        CommentCreateRequest req = new CommentCreateRequest();
        req.setAuthor("agent-1");
        req.setContent("First comment");
        mockMvc.perform(post("/api/tickets/{id}/comments", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/tickets/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.comments", hasSize(1)))
                .andExpect(jsonPath("$.comments[0].content").value("First comment"));
    }
}
