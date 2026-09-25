# Support Ticket Management System — Requirements Specification

| Field | Value |
| --- | --- |
| **Document ID** | STM-REQ-001 |
| **Version** | 1.0 |
| **Status** | Approved for specification phase |
| **Last updated** | 2026-09-25 |
| **Related documents** | `architecture.md`, `data-model.md`, `api-contract.md`, `state-machine.md`, `ui-flow.md`, `test-strategy.md` |

---

## 1. Purpose and scope

### 1.1 Purpose

This document defines **what** the Support Ticket Management System (STMS) must do, the constraints under which it must operate, and the criteria by which completion will be judged. It is the authoritative source for product and engineering requirements. Detailed design belongs in sibling specifications under `spec/`.

### 1.2 In scope

- End-to-end ticket lifecycle management (create, read, update, status transitions, comments).
- REST backend with persistent storage and server-side business rules.
- Web frontend for agents/operators to manage tickets.
- Automated tests covering domain rules, API behavior, and persistence expectations.
- Engineering artifacts that support spec-driven development (SDD), review, and accountable AI-assisted delivery (see §10).

### 1.3 Out of scope (unless explicitly added in a future revision)

- Full authentication and authorization (login, roles, SSO).
- User/assignee directory service (assignee is a string identifier).
- Email/SMS notifications, SLA engines, attachments, tagging, or multi-tenant isolation.
- Production deployment, CI/CD pipelines, and observability stacks beyond what is needed for local/dev operation.
- Mobile-native clients.

### 1.4 Primary success criterion

Delivery is successful only when:

1. The application meets the functional and non-functional requirements below, **and**
2. The repository demonstrates a credible engineering process: requirements → specifications → incremental implementation → tests → review → corrections → regression tests → documentation, with human accountability for architecture, validation, and quality.

---

## 2. Stakeholders and users

| Role | Need |
| --- | --- |
| **Support agent / operator** | Create and work tickets, assign work, comment, search and filter. |
| **Engineering team** | Maintainable codebase, testable domain rules, clear API contract. |
| **Evaluator / reviewer** | Traceability from requirements to specs, tests, and known AI corrections. |

There is no differentiated end-user persona in v1; all UI users are treated as trusted operators without login.

---

## 3. Assumptions and dependencies

| ID | Assumption |
| --- | --- |
| **ASM-01** | Assignee is a non-empty string identifier (e.g. `support-agent-1`), not a foreign key to a users table. |
| **ASM-02** | Comment `author` is a client-supplied string identifier; integrity is not cryptographically enforced. |
| **ASM-03** | Single logical deployment; no multi-region or distributed transaction requirements. |
| **ASM-04** | PostgreSQL is available for non-test runtime; H2 is acceptable for automated tests and optional lightweight local runs. |
| **ASM-05** | Frontend and backend may run on different origins; CORS configuration is an implementation concern documented in `architecture.md`. |
| **ASM-06** | Timestamps are stored in UTC (or with explicit offset) and presented in a consistent format in the API. |

**Dependencies:** JDK 21, Maven, Node.js (for frontend toolchain), PostgreSQL instance for persistence validation.

---

## 4. Technology constraints

These are **mandatory** unless a formal change request updates this document and dependent specs.

### 4.1 Backend

| Requirement | Detail |
| --- | --- |
| **TEC-BE-01** | Java 21 |
| **TEC-BE-02** | Spring Boot with Maven |
| **TEC-BE-03** | Spring Web, Spring Data JPA, Jakarta Bean Validation |
| **TEC-BE-04** | PostgreSQL for primary persistence |
| **TEC-BE-05** | H2 for tests / lightweight execution |
| **TEC-BE-06** | JUnit 5, Spring Boot Test; HTTP tests via MockMvc or equivalent |
| **TEC-BE-07** | No additional frameworks or infrastructure without documented justification |

### 4.2 Frontend

| Requirement | Detail |
| --- | --- |
| **TEC-FE-01** | React with TypeScript |
| **TEC-FE-02** | Next.js or equivalent modern React framework |
| **TEC-FE-03** | All business rules enforced on backend; frontend may only improve UX for obvious invalid input |
| **TEC-FE-04** | Integration exclusively via REST APIs |

### 4.3 Architecture style (backend)

| Requirement | Detail |
| --- | --- |
| **TEC-AR-01** | Layered design: Controller → Service (domain logic) → Repository → Database |
| **TEC-AR-02** | Thin controllers; business rules not embedded in controllers |
| **TEC-AR-03** | Constructor-based dependency injection |
| **TEC-AR-04** | Public API uses DTOs; persistence entities are not exposed as the HTTP contract by default |

---

## 5. Domain vocabulary

### 5.1 Ticket priority (enumeration)

`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

### 5.2 Ticket status (enumeration)

`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `CANCELLED`

### 5.3 Terminal statuses

`CLOSED`, `CANCELLED` — no further status transitions permitted.

Detailed transition rules: **REQ-SM-*** and `state-machine.md`.

---

## 6. Functional requirements

### 6.1 Ticket creation

| ID | Requirement | Priority |
| --- | --- | --- |
| **FR-01** | The system shall allow creation of a ticket with: title, description, priority, assignee. | Must |
| **FR-01.1** | On create, `status` shall be set to `OPEN` by the server; clients shall not set initial status to an arbitrary lifecycle state. | Must |
| **FR-01.2** | The system shall persist `createdAt` and `updatedAt` (server-managed). | Must |
| **FR-01.3** | Successful create shall return the created ticket representation including server-assigned `id` and timestamps. | Must |

### 6.2 Ticket listing

| ID | Requirement | Priority |
| --- | --- | --- |
| **FR-02** | The system shall provide a list of tickets exposing at minimum: id, title, priority, status, assignee, createdAt, updatedAt. | Must |
| **FR-02.1** | The UI shall present a ticket list with navigation to detail and an action to create a ticket. | Must |

### 6.3 Ticket detail

| ID | Requirement | Priority |
| --- | --- | --- |
| **FR-03** | The system shall return full ticket detail: id, title, description, priority, status, assignee, timestamps, and associated comments. | Must |
| **FR-03.1** | Request for a non-existent ticket shall yield a not-found response (see §8). | Must |

### 6.4 Ticket update (fields)

| ID | Requirement | Priority |
| --- | --- | --- |
| **FR-04** | The system shall allow updating title, description, priority, and assignee on an existing ticket. | Must |
| **FR-04.1** | Updates shall refresh `updatedAt`. | Must |
| **FR-04.2** | Status shall not be changed via the general field-update operation unless `api-contract.md` documents a single combined endpoint; status changes use the dedicated status transition operation (**FR-09**). | Must |

### 6.5 Assignee change

| ID | Requirement | Priority |
| --- | --- | --- |
| **FR-05** | Assignee shall be changeable as part of field update and/or a dedicated operation if specified in `api-contract.md`. | Must |
| **FR-05.1** | Assignee value shall be validated (non-blank, reasonable length); format is opaque string. | Must |

### 6.6 Comments

| ID | Requirement | Priority |
| --- | --- | --- |
| **FR-06** | Users shall add comments to a ticket. | Must |
| **FR-06.1** | A comment shall include: id, ticketId, author, content, createdAt (server-assigned id and timestamp). | Must |
| **FR-06.2** | Each comment belongs to exactly one ticket; orphan comments are not permitted. | Must |
| **FR-06.3** | Comments shall persist across application restarts (PostgreSQL). | Must |

### 6.7 Search

| ID | Requirement | Priority |
| --- | --- | --- |
| **FR-07** | The system shall support keyword search on tickets, matching at minimum **title** and **description**. | Must |
| **FR-07.1** | Search shall be case-insensitive where practical. | Should |
| **FR-07.2** | Example capability: `GET /api/tickets?search={keyword}` (exact path/query names per `api-contract.md`). | Must |

### 6.8 Filter by status

| ID | Requirement | Priority |
| --- | --- | --- |
| **FR-08** | The system shall filter tickets by `status`. | Must |
| **FR-08.1** | Search and status filter shall be combinable when both query parameters are present. | Must |

### 6.9 Status transitions (lifecycle)

| ID | Requirement | Priority |
| --- | --- | --- |
| **FR-09** | The system shall expose an operation to transition ticket status according to the state machine (**REQ-SM-***). | Must |
| **FR-09.1** | Invalid transitions shall be rejected by the backend regardless of client. | Must |
| **FR-09.2** | Tickets in terminal states shall reject any status change. | Must |

### 6.10 Validation

| ID | Requirement | Priority |
| --- | --- | --- |
| **FR-10** | All externally supplied input shall be validated on the server using Jakarta Bean Validation (or equivalent Spring mechanisms). | Must |
| **FR-10.1** | Examples: title and description not blank; priority and status enum-valid; comment content not blank; required fields present. | Must |
| **FR-10.2** | Frontend validation is supplementary only. | Must |

### 6.11 Error reporting to clients

| ID | Requirement | Priority |
| --- | --- | --- |
| **FR-11** | The API shall return structured, meaningful errors without exposing stack traces to clients. | Must |
| **FR-11.1** | Error categories shall be distinguishable: validation failure, not found, invalid state transition, malformed request, unexpected server error. | Must |
| **FR-11.2** | The UI shall surface user-readable messages for the above cases. | Must |

---

## 7. State machine requirements (business rules)

The backend is the **sole authority** for lifecycle transitions.

### 7.1 Allowed transitions

| Current state | Allowed next state(s) |
| --- | --- |
| `OPEN` | `IN_PROGRESS`, `CANCELLED` |
| `IN_PROGRESS` | `RESOLVED`, `CANCELLED` |
| `RESOLVED` | `CLOSED` |
| `CLOSED` | *(none — terminal)* |
| `CANCELLED` | *(none — terminal)* |

```text
OPEN
 ├──→ IN_PROGRESS
 │      ├──→ RESOLVED → CLOSED
 │      └──→ CANCELLED
 └──→ CANCELLED
```

| ID | Requirement |
| --- | --- |
| **REQ-SM-01** | Only the transitions in §7.1 shall succeed. |
| **REQ-SM-02** | All transitions not listed in §7.1 shall fail (examples: `OPEN→RESOLVED`, `IN_PROGRESS→CLOSED`, `RESOLVED→OPEN`, any transition from `CLOSED` or `CANCELLED`). |
| **REQ-SM-03** | Direct API calls that attempt invalid transitions shall receive an error response; HTTP status code per `api-contract.md` (e.g. 409 Conflict for business rule violation). |
| **REQ-SM-04** | UI may hide disallowed transitions but shall not be relied upon for enforcement. |

Acceptance test matrix for transitions is defined in `test-strategy.md` and is mandatory for release.

---

## 8. API requirements (summary)

Full contract: **`spec/api-contract.md`**.

| ID | Requirement |
| --- | --- |
| **API-01** | RESTful JSON API under a consistent base path (e.g. `/api/tickets`). |
| **API-02** | Minimum operations: create ticket, list (with search/filter), get by id, patch fields, patch status, add comment. |
| **API-03** | Use appropriate HTTP status codes: 201 Created, 200 OK, 204 No Content where applicable, 400 Bad Request, 404 Not Found, 409 Conflict (if chosen for state conflicts), 500 Internal Server Error. |
| **API-04** | Consistent error body schema (e.g. timestamp, status, error code, message, path). |
| **API-05** | Create ticket request shall not require `status`; server sets `OPEN`. |

**Illustrative payloads** (normative field names may be refined in `api-contract.md`):

- Create: `{ "title", "description", "priority", "assignee" }`
- Update: `{ "title", "description", "priority", "assignee" }`
- Status: `{ "status" }`
- Comment: `{ "author", "content" }`

---

## 9. Data and persistence requirements

| ID | Requirement |
| --- | --- |
| **DATA-01** | Core entities: **Ticket** (id, title, description, priority, status, assignee, createdAt, updatedAt) and **Comment** (id, ticketId, author, content, createdAt). |
| **DATA-02** | Relationship: one Ticket to many Comments; referential integrity enforced at database or application layer. |
| **DATA-03** | Application data shall persist in PostgreSQL; restart of the application shall not erase committed PostgreSQL data. |
| **DATA-04** | In-memory-only stores, static collections, or mock repositories shall not back production persistence paths. |
| **DATA-05** | H2 may be used for automated tests; test profile configuration documented in README and example config. |

Details: **`spec/data-model.md`**.

---

## 10. Engineering process and repository requirements

These requirements govern **how** the product is built and evaluated, not runtime behavior of STMS.

| ID | Requirement |
| --- | --- |
| **ENG-01** | Before implementation: analyze requirements, resolve ambiguities, produce specifications, review for consistency, produce an implementation plan and task breakdown. |
| **ENG-02** | Implementation shall be incremental with tests for each meaningful feature. |
| **ENG-03** | Maintain under `spec/`: `requirements.md`, `architecture.md`, `data-model.md`, `api-contract.md`, `state-machine.md`, `ui-flow.md`, `test-strategy.md`; keep mutually consistent. |
| **ENG-04** | Maintain reusable AI steering under `rules/` (`java-springboot.md`, `testing.md`, `api-standards.md`, `security.md`) and `skills/documentation/skill.md`. |
| **ENG-05** | Maintain review command templates under `commands/` (`review-code.md`, `review-spec.md`, `generate-tests.md`). |
| **ENG-06** | Record meaningful prompts in `.specstory/history/` and `docs/prompt-history.md` (manual if no IDE capture). |
| **ENG-07** | Maintain `docs/ai-review.md` with **actual** AI mistakes (not fabricated): suggestion, problem, detection, human decision, correction, test if any. |
| **ENG-08** | Major architectural or scope decisions shall be documented; ambiguities flagged for human review—not silently invented. |
| **ENG-09** | On defect discovery: reproduce, add regression test, fix, run full relevant suite. |

Recommended delivery phases (setup → specs → backend → domain → API → frontend → integration → testing → review → documentation) are planning guidance; task tracking is implementation-specific.

---

## 11. Frontend requirements (summary)

Detail: **`spec/ui-flow.md`**.

| ID | Requirement |
| --- | --- |
| **UI-01** | **Ticket list:** title, status, priority, assignee, creation date; search; status filter; link to detail; create action. |
| **UI-02** | **Create ticket:** fields title, description, priority, assignee; show validation errors; navigate after success. |
| **UI-03** | **Ticket detail:** full fields, comments list, edit fields, change assignee, add comments, offer only valid status transitions. |
| **UI-04** | Handle API failures gracefully (not found, validation, invalid transition, server errors) without raw stack traces or primary UX as raw JSON. |

---

## 12. Non-functional requirements

| ID | Category | Requirement |
| --- | --- | --- |
| **NFR-01** | Maintainability | Layered backend, DTO separation, no unnecessary architectural complexity. |
| **NFR-02** | Testability | Domain logic (especially state machine) unit-testable without HTTP; API covered by integration tests. |
| **NFR-03** | Security | No secrets in repository; credentials via env/config; `.gitignore` excludes `.env`, `*.env`, local override files. |
| **NFR-04** | Security | Error responses do not leak internal implementation details. |
| **NFR-05** | Configurability | Example configuration (e.g. `application-example.yml`) documents DB URL, username, password placeholders without real secrets. |
| **NFR-06** | Documentation | README covers overview, stack, structure, setup (backend, frontend, PostgreSQL, H2), run, test, API overview, state machine, AI workflow, prompt history, AI review, known limitations. |
| **NFR-07** | Correctness | Behavior verified by automated tests before claiming completion. |

---

## 13. Testing requirements

Detail: **`spec/test-strategy.md`**.

| ID | Requirement |
| --- | --- |
| **TEST-01** | Unit tests for state transitions, validation, and service-level behavior. |
| **TEST-02** | Integration tests: CRUD, comments, search, filter, valid/invalid transitions, not found, validation failures, persistence. |
| **TEST-03** | Full state-machine matrix (all allowed transitions pass; listed forbidden transitions fail). |
| **TEST-04** | Regression test added for each significant defect fixed. |
| **TEST-05** | Demonstrate PostgreSQL persistence survives application restart (manual or automated procedure documented). |

---

## 14. Definition of done (acceptance checklist)

### 14.1 Application behavior

| Criterion | Requirement refs |
| --- | --- |
| Create, list, view, update ticket from UI | FR-01–FR-04, UI-* |
| Change assignee | FR-05 |
| Add comments | FR-06 |
| Search and filter | FR-07, FR-08 |
| Valid transitions work; invalid rejected by API | FR-09, REQ-SM-* |
| Data persists in PostgreSQL | DATA-03 |
| Backend validation and meaningful UI errors | FR-10, FR-11 |

### 14.2 Engineering artifacts

| Criterion | Requirement refs |
| --- | --- |
| Stack and architecture as specified | §4, TEC-* |
| Spec set complete and aligned | ENG-03 |
| AI rules, commands, prompt history, ai-review | ENG-04–ENG-07 |
| README and example config | NFR-05, NFR-06 |

### 14.3 Verification

| Criterion | Requirement refs |
| --- | --- |
| All automated tests pass | TEST-* |
| Final review procedure executed (read specs, review code, run tests, check secrets, update docs) | ENG-01, §15 |

Completion status for each line item shall be reported as **PASS**, **FAIL**, or **NOT APPLICABLE** with evidence—not assumed.

---

## 15. Final review procedure (release gate)

Before declaring the project complete:

1. Read all documents in `spec/` for internal consistency.
2. Review backend and frontend against `api-contract.md` and `state-machine.md`.
3. Run the full automated test suite.
4. Verify error handling and absence of secrets in source control.
5. Review prompt history and `docs/ai-review.md`.
6. Fix issues; rerun regression and suite.
7. Update documentation and produce final engineering report (implementation, architecture, specs, testing, AI usage, mistakes/corrections, limitations, acceptance checklist).

---

## 16. Open items and change control

| ID | Item | Owner | Resolution |
| --- | --- | --- | --- |
| **OQ-01** | HTTP code for invalid transition (400 vs 409) | API design | Resolve in `api-contract.md` |
| **OQ-02** | Pagination for ticket list | Product | v1 may return full list; document limit in `api-contract.md` if added |
| **OQ-03** | Partial vs full PATCH semantics for ticket update | API design | Document in `api-contract.md` |
| **OQ-04** | Maximum lengths for title, description, comment | Data model | Document in `data-model.md` |

Changes to this document require version increment and synchronized updates to affected specifications.

---

## 17. Traceability matrix (functional → verification)

| Requirement | Primary verification |
| --- | --- |
| FR-01 – FR-04 | Integration tests + UI flows |
| FR-05 | Integration + UI |
| FR-06 | Integration + persistence test |
| FR-07, FR-08 | Integration tests (query params) |
| FR-09, REQ-SM-* | Unit (state machine) + integration matrix |
| FR-10 | Unit + integration validation cases |
| FR-11 | Integration error contract tests + UI error handling |
| DATA-03 | Manual/automated restart test on PostgreSQL |
| NFR-03 | Repository scan + `.gitignore` review |

---

## 18. Document history

| Version | Date | Author | Changes |
| --- | --- | --- | --- |
| 1.0 | 2026-09-25 | Engineering | Initial requirements specification derived from agent development brief v1.0 |
