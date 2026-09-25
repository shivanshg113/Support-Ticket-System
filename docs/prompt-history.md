# Prompt History

Records meaningful prompts that influenced architecture, design, or implementation decisions.
Maintained per `ENG-06` requirement.

---

## 1. Initial requirements ingestion

**Date:** 2026-09-25
**Context:** Phase 1 — requirements analysis
**Prompt:**
> Analyze the Support Ticket Management System agent development brief. Identify ambiguities and assumptions. Create `spec/requirements.md` acting as a senior software engineer with 10+ years of full-stack experience.

**Outcome:**
Generated `spec/requirements.md` with traceable FR-* IDs, assumption table (ASM-*), technology constraints (TEC-*), open questions (OQ-*), and a traceability matrix.

**Review note:**
Accepted with the following observations:
- OQ-01 (409 vs 400 for invalid transitions) was resolved as 409 Conflict in `api-contract.md`.
- OQ-03 (PATCH semantics) resolved as partial PATCH.
- OQ-04 (field lengths) resolved in `data-model.md`.

---

## 2. Full application build

**Date:** 2026-09-25
**Context:** Phase 2–10 — all phases
**Prompt:**
> Use spec/requirements.md and build a full stack working application. Backend: Java 21, Spring Boot, Maven, PostgreSQL/H2. Frontend: Next.js TypeScript. Then push to GitHub.

**Outcome:**
Generated the complete application including:
- `spec/` — all 7 specification documents
- `backend/` — Spring Boot application with entities, repositories, service, controller, DTOs, exception handling, and full test suite
- `frontend/` — Next.js 14 + TypeScript application with ticket list, create, and detail pages
- `rules/`, `commands/`, `skills/`, `docs/` — engineering artifacts
- `README.md`, `.gitignore`, `application-example.yml`

**Review note:**
The following design decisions were made explicitly:
- `TicketStatus` enum carries its own transition rules via `isTransitionAllowed()`. This keeps the state machine in one place (domain layer).
- `TicketMapper` is a separate `@Component` — not a static utility — to support future testing with mocks.
- JPQL queries in `TicketRepository` use `LOWER()` + `CONCAT` for case-insensitive search to remain portable across PostgreSQL and H2.
- Comments list in `listTickets` is always empty (no N+1 problem); it is populated only in `getTicket` detail call.

---

---

## 3. H2 dialect test fix

**Date:** 2026-09-25
**Context:** Phase 8 — regression fix after test run failure
**Prompt:** (Observed from actual `mvn test` output — no AI prompt needed; human code review identified root cause)
**Outcome:** Updated `application-test.yml` to add `spring.jpa.properties.hibernate.dialect: org.hibernate.dialect.H2Dialect` alongside `database-platform`, ensuring the PostgreSQLDialect from the main config is fully overridden.
**Review note:** All 55 tests pass after fix. Documented in `docs/ai-review.md` as Issue 3.

---

*Add entries below as new prompts are used during development.*
