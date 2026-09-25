package com.stms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stms.dto.TicketCreateRequest;
import com.stms.domain.TicketPriority;
import com.stms.domain.TicketStatus;
import com.stms.dto.TicketStatusUpdateRequest;
import com.stms.dto.TicketUpdateRequest;
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

/**
 * Integration tests for TicketController using MockMvc + H2 (test profile).
 * Tests verify actual HTTP behaviour including state machine enforcement.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("TicketController — integration tests")
class TicketControllerIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired TicketRepository ticketRepository;
    @Autowired CommentRepository commentRepository;

    @BeforeEach
    void cleanUp() {
        commentRepository.deleteAll();
        ticketRepository.deleteAll();
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private Long createTicket(String title, String description, TicketPriority priority, String assignee) throws Exception {
        TicketCreateRequest req = new TicketCreateRequest();
        req.setTitle(title);
        req.setDescription(description);
        req.setPriority(priority);
        req.setAssignee(assignee);

        MvcResult result = mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private void transition(Long id, TicketStatus to, int expectedStatus) throws Exception {
        TicketStatusUpdateRequest req = new TicketStatusUpdateRequest();
        req.setStatus(to);
        mockMvc.perform(patch("/api/tickets/{id}/status", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().is(expectedStatus));
    }

    // ─── Create ───────────────────────────────────────────────────────────────

    @Test @DisplayName("POST /api/tickets — 201, status is OPEN")
    void createTicket_returns201_statusOpen() throws Exception {
        TicketCreateRequest req = new TicketCreateRequest();
        req.setTitle("Login issue");
        req.setDescription("Cannot log in.");
        req.setPriority(TicketPriority.HIGH);
        req.setAssignee("agent-1");

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andExpect(jsonPath("$.title").value("Login issue"))
                .andExpect(jsonPath("$.priority").value("HIGH"))
                .andExpect(jsonPath("$.createdAt").exists());
    }

    @Test @DisplayName("POST /api/tickets — 400 when title is blank")
    void createTicket_400_blankTitle() throws Exception {
        TicketCreateRequest req = new TicketCreateRequest();
        req.setTitle("   ");
        req.setDescription("desc");
        req.setPriority(TicketPriority.LOW);
        req.setAssignee("agent-1");

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"));
    }

    @Test @DisplayName("POST /api/tickets — 400 when description is blank")
    void createTicket_400_blankDescription() throws Exception {
        TicketCreateRequest req = new TicketCreateRequest();
        req.setTitle("Valid title");
        req.setDescription("");
        req.setPriority(TicketPriority.LOW);
        req.setAssignee("agent-1");

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test @DisplayName("POST /api/tickets — 400 when priority is missing")
    void createTicket_400_missingPriority() throws Exception {
        String body = "{\"title\":\"T\",\"description\":\"D\",\"assignee\":\"agent-1\"}";
        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    // ─── List ─────────────────────────────────────────────────────────────────

    @Test @DisplayName("GET /api/tickets — returns all tickets")
    void listTickets_returnsAll() throws Exception {
        createTicket("T1", "desc1", TicketPriority.LOW, "agent-1");
        createTicket("T2", "desc2", TicketPriority.HIGH, "agent-2");

        mockMvc.perform(get("/api/tickets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test @DisplayName("GET /api/tickets?search= — filters by title keyword")
    void searchByTitle() throws Exception {
        createTicket("Login error", "Cannot access account", TicketPriority.HIGH, "agent-1");
        createTicket("Billing issue", "Invoice not generated", TicketPriority.LOW, "agent-2");

        mockMvc.perform(get("/api/tickets").param("search", "login"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Login error"));
    }

    @Test @DisplayName("GET /api/tickets?search= — filters by description keyword")
    void searchByDescription() throws Exception {
        createTicket("Issue A", "This is about the login flow", TicketPriority.HIGH, "agent-1");
        createTicket("Issue B", "Unrelated content", TicketPriority.LOW, "agent-2");

        mockMvc.perform(get("/api/tickets").param("search", "login flow"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test @DisplayName("GET /api/tickets?status=OPEN — filters by status")
    void filterByStatus() throws Exception {
        Long id = createTicket("T1", "desc", TicketPriority.LOW, "agent-1");
        createTicket("T2", "desc", TicketPriority.HIGH, "agent-2");
        // Transition T1 to IN_PROGRESS
        transition(id, TicketStatus.IN_PROGRESS, 200);

        mockMvc.perform(get("/api/tickets").param("status", "OPEN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].status").value("OPEN"));
    }

    @Test @DisplayName("GET /api/tickets?search=&status= — combined filter")
    void combinedSearchAndFilter() throws Exception {
        Long id1 = createTicket("Login error", "Account inaccessible", TicketPriority.HIGH, "agent-1");
        createTicket("Login warning", "Warning page appears", TicketPriority.MEDIUM, "agent-2");
        transition(id1, TicketStatus.IN_PROGRESS, 200);

        mockMvc.perform(get("/api/tickets").param("search", "login").param("status", "OPEN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Login warning"));
    }

    // ─── Get detail ───────────────────────────────────────────────────────────

    @Test @DisplayName("GET /api/tickets/{id} — returns full detail")
    void getTicketDetail() throws Exception {
        Long id = createTicket("Detail ticket", "Full description", TicketPriority.CRITICAL, "agent-3");

        mockMvc.perform(get("/api/tickets/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.description").value("Full description"))
                .andExpect(jsonPath("$.comments").isArray());
    }

    @Test @DisplayName("GET /api/tickets/{id} — 404 for non-existent ticket")
    void getTicket_404() throws Exception {
        mockMvc.perform(get("/api/tickets/99999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("TICKET_NOT_FOUND"));
    }

    // ─── Update ───────────────────────────────────────────────────────────────

    @Test @DisplayName("PATCH /api/tickets/{id} — updates fields, refreshes updatedAt")
    void updateTicket() throws Exception {
        Long id = createTicket("Old title", "Old desc", TicketPriority.LOW, "agent-1");

        TicketUpdateRequest req = new TicketUpdateRequest();
        req.setTitle("New title");
        req.setPriority(TicketPriority.CRITICAL);
        req.setAssignee("agent-2");

        mockMvc.perform(patch("/api/tickets/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("New title"))
                .andExpect(jsonPath("$.priority").value("CRITICAL"))
                .andExpect(jsonPath("$.assignee").value("agent-2"))
                .andExpect(jsonPath("$.description").value("Old desc")); // unchanged
    }

    // ─── State machine — allowed transitions ──────────────────────────────────

    @Test @DisplayName("OPEN → IN_PROGRESS returns 200")
    void transitionOpenToInProgress_succeeds() throws Exception {
        Long id = createTicket("T", "D", TicketPriority.LOW, "a");
        transition(id, TicketStatus.IN_PROGRESS, 200);
        mockMvc.perform(get("/api/tickets/{id}", id))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test @DisplayName("OPEN → CANCELLED returns 200")
    void transitionOpenToCancelled_succeeds() throws Exception {
        Long id = createTicket("T", "D", TicketPriority.LOW, "a");
        transition(id, TicketStatus.CANCELLED, 200);
    }

    @Test @DisplayName("IN_PROGRESS → RESOLVED returns 200")
    void transitionInProgressToResolved_succeeds() throws Exception {
        Long id = createTicket("T", "D", TicketPriority.LOW, "a");
        transition(id, TicketStatus.IN_PROGRESS, 200);
        transition(id, TicketStatus.RESOLVED, 200);
    }

    @Test @DisplayName("IN_PROGRESS → CANCELLED returns 200")
    void transitionInProgressToCancelled_succeeds() throws Exception {
        Long id = createTicket("T", "D", TicketPriority.LOW, "a");
        transition(id, TicketStatus.IN_PROGRESS, 200);
        transition(id, TicketStatus.CANCELLED, 200);
    }

    @Test @DisplayName("RESOLVED → CLOSED returns 200")
    void transitionResolvedToClosed_succeeds() throws Exception {
        Long id = createTicket("T", "D", TicketPriority.LOW, "a");
        transition(id, TicketStatus.IN_PROGRESS, 200);
        transition(id, TicketStatus.RESOLVED, 200);
        transition(id, TicketStatus.CLOSED, 200);
    }

    // ─── State machine — forbidden transitions (409) ──────────────────────────

    @Test @DisplayName("CLOSED → OPEN returns 409")
    void transitionClosedToOpen_returns409() throws Exception {
        Long id = createTicket("T", "D", TicketPriority.LOW, "a");
        transition(id, TicketStatus.IN_PROGRESS, 200);
        transition(id, TicketStatus.RESOLVED, 200);
        transition(id, TicketStatus.CLOSED, 200);
        transition(id, TicketStatus.OPEN, 409);
    }

    @Test @DisplayName("CLOSED → IN_PROGRESS returns 409")
    void transitionClosedToInProgress_returns409() throws Exception {
        Long id = createTicket("T", "D", TicketPriority.LOW, "a");
        transition(id, TicketStatus.IN_PROGRESS, 200);
        transition(id, TicketStatus.RESOLVED, 200);
        transition(id, TicketStatus.CLOSED, 200);
        transition(id, TicketStatus.IN_PROGRESS, 409);
    }

    @Test @DisplayName("CLOSED → RESOLVED returns 409")
    void transitionClosedToResolved_returns409() throws Exception {
        Long id = createTicket("T", "D", TicketPriority.LOW, "a");
        transition(id, TicketStatus.IN_PROGRESS, 200);
        transition(id, TicketStatus.RESOLVED, 200);
        transition(id, TicketStatus.CLOSED, 200);
        transition(id, TicketStatus.RESOLVED, 409);
    }

    @Test @DisplayName("CANCELLED → OPEN returns 409")
    void transitionCancelledToOpen_returns409() throws Exception {
        Long id = createTicket("T", "D", TicketPriority.LOW, "a");
        transition(id, TicketStatus.CANCELLED, 200);
        transition(id, TicketStatus.OPEN, 409);
    }

    @Test @DisplayName("CANCELLED → IN_PROGRESS returns 409")
    void transitionCancelledToInProgress_returns409() throws Exception {
        Long id = createTicket("T", "D", TicketPriority.LOW, "a");
        transition(id, TicketStatus.CANCELLED, 200);
        transition(id, TicketStatus.IN_PROGRESS, 409);
    }

    @Test @DisplayName("RESOLVED → OPEN returns 409")
    void transitionResolvedToOpen_returns409() throws Exception {
        Long id = createTicket("T", "D", TicketPriority.LOW, "a");
        transition(id, TicketStatus.IN_PROGRESS, 200);
        transition(id, TicketStatus.RESOLVED, 200);
        transition(id, TicketStatus.OPEN, 409);
    }

    @Test @DisplayName("RESOLVED → IN_PROGRESS returns 409")
    void transitionResolvedToInProgress_returns409() throws Exception {
        Long id = createTicket("T", "D", TicketPriority.LOW, "a");
        transition(id, TicketStatus.IN_PROGRESS, 200);
        transition(id, TicketStatus.RESOLVED, 200);
        transition(id, TicketStatus.IN_PROGRESS, 409);
    }

    @Test @DisplayName("OPEN → RESOLVED returns 409")
    void transitionOpenToResolved_returns409() throws Exception {
        Long id = createTicket("T", "D", TicketPriority.LOW, "a");
        transition(id, TicketStatus.RESOLVED, 409);
    }

    @Test @DisplayName("OPEN → CLOSED returns 409")
    void transitionOpenToClosed_returns409() throws Exception {
        Long id = createTicket("T", "D", TicketPriority.LOW, "a");
        transition(id, TicketStatus.CLOSED, 409);
    }

    @Test @DisplayName("IN_PROGRESS → CLOSED returns 409")
    void transitionInProgressToClosed_returns409() throws Exception {
        Long id = createTicket("T", "D", TicketPriority.LOW, "a");
        transition(id, TicketStatus.IN_PROGRESS, 200);
        transition(id, TicketStatus.CLOSED, 409);
    }

    @Test @DisplayName("IN_PROGRESS → OPEN returns 409")
    void transitionInProgressToOpen_returns409() throws Exception {
        Long id = createTicket("T", "D", TicketPriority.LOW, "a");
        transition(id, TicketStatus.IN_PROGRESS, 200);
        transition(id, TicketStatus.OPEN, 409);
    }

    @Test @DisplayName("409 response includes INVALID_STATUS_TRANSITION error code")
    void invalidTransition_errorBodyContainsCode() throws Exception {
        Long id = createTicket("T", "D", TicketPriority.LOW, "a");
        TicketStatusUpdateRequest req = new TicketStatusUpdateRequest();
        req.setStatus(TicketStatus.CLOSED);

        mockMvc.perform(patch("/api/tickets/{id}/status", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("INVALID_STATUS_TRANSITION"))
                .andExpect(jsonPath("$.message").value(containsString("OPEN")))
                .andExpect(jsonPath("$.status").value(409));
    }
}
