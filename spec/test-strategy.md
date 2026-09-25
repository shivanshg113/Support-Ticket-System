# Test Strategy — Support Ticket Management System

| Field | Value |
| --- | --- |
| **Document ID** | STM-TEST-001 |
| **Version** | 1.0 |
| **Status** | Approved |
| **Last updated** | 2026-09-25 |

---

## 1. Objectives

- Verify all functional requirements (FR-01–FR-11).
- Prove state-machine transitions exhaustively (REQ-SM-01, REQ-SM-02).
- Validate backend enforcement independent of the UI.
- Ensure data persistence across service restart (DATA-03).

---

## 2. Test types

### 2.1 Unit tests — Domain / service layer

Target: business logic that can be exercised without a running server.

| Test class | Covers |
| --- | --- |
| `TicketStatusTest` | `isTransitionAllowed()` for all 16 matrix rows |
| `TicketServiceTest` | Service logic; mocked repository |

### 2.2 Integration tests — API layer (MockMvc + H2)

Target: HTTP behaviour of each endpoint with a real Spring context.

| Test class | Covers |
| --- | --- |
| `TicketControllerIntegrationTest` | Create, list, get, update, status transition (valid + invalid), 404, validation |
| `CommentControllerIntegrationTest` | Add comment, get detail with comments, 404 |

---

## 3. State-machine test matrix (mandatory)

| Transition | Expected | Test method |
| --- | --- | --- |
| OPEN → IN_PROGRESS | PASS (200) | `transitionOpenToInProgress_succeeds` |
| OPEN → CANCELLED | PASS (200) | `transitionOpenToCancelled_succeeds` |
| IN_PROGRESS → RESOLVED | PASS (200) | `transitionInProgressToResolved_succeeds` |
| IN_PROGRESS → CANCELLED | PASS (200) | `transitionInProgressToCancelled_succeeds` |
| RESOLVED → CLOSED | PASS (200) | `transitionResolvedToClosed_succeeds` |
| CLOSED → OPEN | FAIL (409) | `transitionClosedToOpen_returns409` |
| CLOSED → IN_PROGRESS | FAIL (409) | `transitionClosedToInProgress_returns409` |
| CLOSED → RESOLVED | FAIL (409) | `transitionClosedToResolved_returns409` |
| CANCELLED → OPEN | FAIL (409) | `transitionCancelledToOpen_returns409` |
| CANCELLED → IN_PROGRESS | FAIL (409) | `transitionCancelledToInProgress_returns409` |
| RESOLVED → OPEN | FAIL (409) | `transitionResolvedToOpen_returns409` |
| RESOLVED → IN_PROGRESS | FAIL (409) | `transitionResolvedToInProgress_returns409` |
| OPEN → RESOLVED | FAIL (409) | `transitionOpenToResolved_returns409` |
| OPEN → CLOSED | FAIL (409) | `transitionOpenToClosed_returns409` |
| IN_PROGRESS → CLOSED | FAIL (409) | `transitionInProgressToClosed_returns409` |
| IN_PROGRESS → OPEN | FAIL (409) | `transitionInProgressToOpen_returns409` |

---

## 4. Additional integration test scenarios

| Scenario | Endpoint | Expected |
| --- | --- | --- |
| Create ticket with missing title | POST /api/tickets | 400 |
| Create ticket with blank description | POST /api/tickets | 400 |
| Create ticket with invalid priority | POST /api/tickets | 400 |
| Get non-existent ticket | GET /api/tickets/99999 | 404 |
| Update ticket fields | PATCH /api/tickets/{id} | 200, fields updated, updatedAt refreshed |
| Search by keyword in title | GET /api/tickets?search=login | 200, filtered list |
| Search by keyword in description | GET /api/tickets?search=error | 200, filtered list |
| Filter by status | GET /api/tickets?status=OPEN | 200, only OPEN |
| Combined search+filter | GET /api/tickets?search=login&status=OPEN | 200, intersection |
| Add comment to ticket | POST /api/tickets/{id}/comments | 201 |
| Add comment with blank content | POST /api/tickets/{id}/comments | 400 |
| Add comment to non-existent ticket | POST /api/tickets/{id}/comments | 404 |
| Get detail includes comments | GET /api/tickets/{id} | 200, comments array |

---

## 5. Regression test policy

For any defect found during development:
1. Write a failing test that reproduces the defect.
2. Fix the implementation.
3. Confirm test now passes.
4. Run the complete suite.
5. Document in `docs/ai-review.md` if AI-generated code was the source.

---

## 6. Test configuration

- Profile: `test` (H2 in-memory, `spring.jpa.hibernate.ddl-auto=create-drop`).
- H2 console disabled in test profile.
- No real credentials in test config.
- Tests are repeatable and independent (each test resets data via `@Transactional` rollback or repository `deleteAll`).

---

## 7. Persistence verification (DATA-03)

Manual procedure:
1. Start backend with PostgreSQL profile.
2. Create tickets via API or UI.
3. Stop application.
4. Restart application.
5. Query `GET /api/tickets` — data must be present.
6. Result documented in README.
