# Support Ticket Management System (STMS)

A full-stack support ticket management application built using **Spec-Driven Development (SDD)** with responsible AI-assisted engineering.

---

## Table of contents

1. [Project overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Technology stack](#3-technology-stack)
4. [Repository structure](#4-repository-structure)
5. [Prerequisites](#5-prerequisites)
6. [Backend setup](#6-backend-setup)
7. [Frontend setup](#7-frontend-setup)
8. [PostgreSQL setup](#8-postgresql-setup)
9. [H2 / test configuration](#9-h2--test-configuration)
10. [How to run](#10-how-to-run)
11. [How to test](#11-how-to-test)
12. [API overview](#12-api-overview)
13. [State machine](#13-state-machine)
14. [AI-assisted development workflow](#14-ai-assisted-development-workflow)
15. [Prompt history](#15-prompt-history)
16. [AI review findings](#16-ai-review-findings)
17. [Known limitations](#17-known-limitations)

---

## 1. Project overview

STMS allows support agents and operators to:
- Create, view, update, and search tickets.
- Move tickets through a controlled lifecycle via a server-enforced state machine.
- Add comments to tickets.
- Filter tickets by status and keyword.

The backend enforces all business rules. The frontend is a React/Next.js interface that communicates exclusively via REST.

---

## 2. Architecture

```
Browser (Next.js / React + TypeScript)
         │
         │  REST / JSON
         ▼
Spring Boot API (Java 21)
  ┌─────────────────────┐
  │  Controller (thin)  │
  │  Service (domain)   │
  │  Repository (JPA)   │
  └─────────────────────┘
         │
         ▼
   PostgreSQL  (production)
   H2          (tests)
```

Details: [`spec/architecture.md`](spec/architecture.md)

---

## 3. Technology stack

| Layer | Technology |
| --- | --- |
| Backend language | Java 21 |
| Backend framework | Spring Boot 3.3 |
| Build tool | Maven |
| ORM | Spring Data JPA / Hibernate |
| Validation | Jakarta Bean Validation |
| Primary database | PostgreSQL |
| Test database | H2 |
| Test framework | JUnit 5, MockMvc |
| Frontend framework | Next.js 14 |
| Frontend language | TypeScript |
| Styling | Tailwind CSS |

---

## 4. Repository structure

```
C2-Assignment/
├── spec/                   # All specification documents
│   ├── requirements.md
│   ├── architecture.md
│   ├── data-model.md
│   ├── api-contract.md
│   ├── state-machine.md
│   ├── ui-flow.md
│   └── test-strategy.md
├── rules/                  # Reusable AI engineering rules
├── commands/               # Reusable AI review commands
├── skills/                 # AI skill definitions
├── docs/                   # Engineering records
│   ├── prompt-history.md
│   └── ai-review.md
├── .specstory/history/     # Prompt capture
├── backend/                # Spring Boot application
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/stms/
│       │   ├── config/
│       │   ├── controller/
│       │   ├── domain/
│       │   ├── dto/
│       │   ├── exception/
│       │   ├── repository/
│       │   └── service/
│       └── test/java/com/stms/
│           ├── domain/     # Unit tests
│           └── controller/ # Integration tests
└── frontend/               # Next.js application
    └── src/
        ├── app/
        ├── components/
        ├── lib/
        └── types/
```

---

## 5. Prerequisites

| Tool | Minimum version |
| --- | --- |
| JDK | 21 |
| Maven | 3.9+ |
| Node.js | 18+ |
| npm | 9+ |
| PostgreSQL | 15+ (for production run) |

---

## 6. Backend setup

```bash
cd backend

# Build without running tests
mvn package -DskipTests

# Or compile only
mvn compile
```

### Configuration

The backend reads database credentials from **environment variables**. Never hardcode credentials.

| Variable | Purpose | Example |
| --- | --- | --- |
| `DB_URL` | JDBC URL | `jdbc:postgresql://localhost:5432/stms` |
| `DB_USERNAME` | DB user | `stms_user` |
| `DB_PASSWORD` | DB password | *(set securely)* |

See [`backend/src/main/resources/application-example.yml`](backend/src/main/resources/application-example.yml) for reference.

---

## 7. Frontend setup

```bash
cd frontend
npm install
```

Create a local environment file (git-ignored):
```bash
cp .env.local.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

---

## 8. PostgreSQL setup

```sql
-- Run as a superuser (e.g. postgres)
CREATE DATABASE stms;
CREATE USER stms_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE stms TO stms_user;
```

Then set environment variables:
```bash
export DB_URL=jdbc:postgresql://localhost:5432/stms
export DB_USERNAME=stms_user
export DB_PASSWORD=your_secure_password
```

The schema is created automatically on first start (`spring.jpa.hibernate.ddl-auto=update`).

### Persistence verification

1. Start backend with PostgreSQL credentials set.
2. Create tickets via UI or API.
3. Stop the backend (`Ctrl+C`).
4. Restart the backend.
5. `GET http://localhost:8080/api/tickets` — previously created tickets are present. ✅

---

## 9. H2 / test configuration

Tests use the `test` Spring profile (H2 in-memory, `create-drop` DDL). No PostgreSQL instance is needed to run tests.

Test profile config: [`backend/src/test/resources/application-test.yml`](backend/src/test/resources/application-test.yml)

---

## 10. How to run

### Backend

```bash
cd backend
export DB_URL=jdbc:postgresql://localhost:5432/stms
export DB_USERNAME=stms_user
export DB_PASSWORD=your_secure_password

mvn spring-boot:run
```

Backend listens on `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm run dev
```

Frontend available at `http://localhost:3000`.

---

## 11. How to test

### Backend tests (JUnit 5 + MockMvc + H2)

```bash
cd backend
mvn test
```

Test output shows:
- Unit tests: `TicketStatusTest` — 21 state machine tests
- Integration tests: `TicketControllerIntegrationTest`, `CommentControllerIntegrationTest`

### Build and test report

```bash
mvn verify
```

---

## 12. API overview

Base URL: `http://localhost:8080/api`

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/tickets` | Create ticket |
| `GET` | `/tickets` | List (+ search/filter) |
| `GET` | `/tickets/{id}` | Get detail |
| `PATCH` | `/tickets/{id}` | Update fields |
| `PATCH` | `/tickets/{id}/status` | Transition status |
| `POST` | `/tickets/{id}/comments` | Add comment |

Query parameters: `?search=keyword`, `?status=OPEN`, combinable.

Full contract: [`spec/api-contract.md`](spec/api-contract.md)

### Error response format

```json
{
  "timestamp": "2026-09-25T12:30:00Z",
  "status": 409,
  "error": "INVALID_STATUS_TRANSITION",
  "message": "Ticket cannot transition from CLOSED to OPEN",
  "path": "/api/tickets/1/status"
}
```

---

## 13. State machine

```
OPEN
 ├──→ IN_PROGRESS
 │      ├──→ RESOLVED → CLOSED
 │      └──→ CANCELLED
 └──→ CANCELLED
```

| From | To | Allowed |
| --- | --- | --- |
| OPEN | IN_PROGRESS, CANCELLED | ✅ |
| IN_PROGRESS | RESOLVED, CANCELLED | ✅ |
| RESOLVED | CLOSED | ✅ |
| CLOSED | *(any)* | ❌ 409 |
| CANCELLED | *(any)* | ❌ 409 |

**Enforcement:** Server-side only (`TicketService.transitionStatus` → `TicketStatus.isTransitionAllowed()`). The frontend shows only valid options as a UX convenience but the backend rejects invalid requests regardless.

Detail: [`spec/state-machine.md`](spec/state-machine.md)

---

## 14. AI-assisted development workflow

This project follows **Spec-Driven Development**:

```
Requirements (spec/requirements.md)
     ↓
Specifications (spec/*.md)
     ↓
Implementation plan + task breakdown
     ↓
Incremental AI-assisted implementation
     ↓
Human review of generated code
     ↓
Tests (unit + integration)
     ↓
AI mistake identification + correction
     ↓
Regression tests
     ↓
Documentation
```

AI was used as an engineering assistant. Humans retained responsibility for:
- Architectural decisions (layering, state machine design)
- Specification review and consistency
- Code review against specs
- Identifying and correcting AI mistakes
- Test coverage validation

---

## 15. Prompt history

See [`docs/prompt-history.md`](docs/prompt-history.md) for all meaningful prompts used during development.

---

## 16. AI review findings

See [`docs/ai-review.md`](docs/ai-review.md) for documented AI-generated issues, how they were detected, and the corrections made.

Summary:
1. **TicketStatus enum forward-reference** — compile error; corrected by using string sentinels.
2. **N+1 query on ticket list** — detected in code review; corrected by not loading comments in list queries.

---

## 17. Known limitations

| Limitation | Notes |
| --- | --- |
| No authentication or authorisation | All operators share the same access. V1 scope. |
| Assignee is a plain string | No user directory or validation beyond non-blank. |
| No pagination | Full ticket list returned. Acceptable at low volume. |
| RESOLVED → CANCELLED not allowed | Intentional per spec — RESOLVED can only go to CLOSED. |
| No email / SLA notifications | Out of scope for v1. |
| No attachment support | Out of scope for v1. |
| Frontend is not tested | No Jest/RTL tests in v1 — backend tests are comprehensive. |
