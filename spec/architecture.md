# Architecture Specification — Support Ticket Management System

| Field | Value |
| --- | --- |
| **Document ID** | STM-ARCH-001 |
| **Version** | 1.0 |
| **Status** | Approved |
| **Last updated** | 2026-09-25 |

---

## 1. Overview

The system is a two-tier web application:

```
Browser (Next.js / React)  ──REST/JSON──►  Spring Boot API  ──JPA──►  PostgreSQL
```

There is no server-side rendering of ticket data; the Next.js app acts as a pure client-side SPA communicating exclusively with the REST backend.

---

## 2. Backend layers

```
HTTP Request
    │
    ▼
┌─────────────────────────────────────────┐
│  Controller Layer                        │
│  (TicketController)                      │
│  – Parses request, calls service,        │
│    maps response; contains no business   │
│    logic                                 │
└──────────────┬──────────────────────────┘
               │ DTO in / DTO out
               ▼
┌─────────────────────────────────────────┐
│  Service / Domain Layer                  │
│  (TicketService)                         │
│  – Business rules, state machine,        │
│    validation orchestration,             │
│    entity ↔ DTO mapping                  │
└──────────────┬──────────────────────────┘
               │ Entity
               ▼
┌─────────────────────────────────────────┐
│  Repository Layer                        │
│  (TicketRepository, CommentRepository)  │
│  – Spring Data JPA; persistence only    │
└──────────────┬──────────────────────────┘
               │ JPA / JDBC
               ▼
         PostgreSQL / H2
```

### Rules
- **Controllers** are thin. They validate HTTP-layer concerns (binding, 404 on null) and delegate entirely to the service.
- **Service** owns all business rules: state machine enforcement, field validation delegation, timestamp management.
- **Repositories** are Spring Data interfaces; no business logic inside.
- **DTOs** are the public contract; entities are never serialised directly into HTTP responses.
- **Dependency injection** is constructor-based throughout.

---

## 3. Package structure

```
com.stms
├── StmsApplication.java
├── config/
│   └── CorsConfig.java
├── controller/
│   └── TicketController.java
├── domain/
│   ├── Ticket.java          (JPA entity)
│   ├── Comment.java         (JPA entity)
│   ├── TicketStatus.java    (enum)
│   └── TicketPriority.java  (enum)
├── dto/
│   ├── TicketCreateRequest.java
│   ├── TicketUpdateRequest.java
│   ├── TicketStatusUpdateRequest.java
│   ├── TicketResponse.java
│   ├── CommentCreateRequest.java
│   ├── CommentResponse.java
│   └── ErrorResponse.java
├── exception/
│   ├── TicketNotFoundException.java
│   ├── InvalidStateTransitionException.java
│   └── GlobalExceptionHandler.java
├── repository/
│   ├── TicketRepository.java
│   └── CommentRepository.java
└── service/
    ├── TicketService.java
    └── TicketMapper.java
```

---

## 4. Frontend structure

```
src/
├── app/
│   ├── layout.tsx           (root layout, global styles)
│   ├── page.tsx             (ticket list)
│   ├── globals.css
│   └── tickets/
│       ├── new/page.tsx     (create ticket)
│       └── [id]/page.tsx    (ticket detail + edit + comments)
├── components/
│   ├── TicketTable.tsx
│   ├── TicketForm.tsx
│   ├── StatusBadge.tsx
│   ├── PriorityBadge.tsx
│   ├── CommentSection.tsx
│   └── ErrorMessage.tsx
├── lib/
│   └── api.ts               (all fetch calls; single source of truth)
└── types/
    └── index.ts             (shared TypeScript types)
```

---

## 5. CORS

The backend allows requests from `http://localhost:3000` (Next.js dev server).
Configured in `CorsConfig.java` using `WebMvcConfigurer`.
For production, the allowed origin must be updated via environment variable.

---

## 6. Database profiles

| Profile | Database | Purpose |
| --- | --- | --- |
| default | PostgreSQL | Production / local dev |
| test | H2 in-memory | Automated tests |

Profile activation via `spring.profiles.active` or `SPRING_PROFILES_ACTIVE` env var.

---

## 7. Configuration management

Secrets are injected via environment variables only. No passwords or URLs appear in committed files.
`application-example.yml` documents required variables without values.

---

## 8. Error handling

A single `GlobalExceptionHandler` (`@RestControllerAdvice`) intercepts:
- `TicketNotFoundException` → 404
- `InvalidStateTransitionException` → 409
- `MethodArgumentNotValidException` → 400
- `HttpMessageNotReadableException` → 400
- All other `Exception` → 500

All responses use `ErrorResponse` DTO; no stack traces in HTTP bodies.
