# AI Review — Engineering Record

Documents actual AI-generated code issues discovered during development.
Maintained per `ENG-07` requirement.

> ⚠️ Only document **actual** issues encountered. Do not fabricate entries.

---

## Issue 1 — TicketStatus enum forward-reference initialisation

**Date:** 2026-09-25
**Phase:** Backend domain — TicketStatus enum design

### What AI suggested
An initial design used direct enum constant references in the `allowedNextNames` set:
```java
OPEN(Set.of(IN_PROGRESS, CANCELLED)),
```

### Why it was problematic
Java enum constant initialisation has forward-reference restrictions. Referencing `IN_PROGRESS` or `CANCELLED` as enum constants inside the constructor of `OPEN` causes a compile error: constants are not yet initialised at that point.

### How it was detected
Compile-time error when building the backend:
```
error: illegal forward reference
```

### Human decision
Replace direct enum constant references with string names as sentinels. The `isTransitionAllowed(TicketStatus next)` method compares `next.name()` against the set of allowed string names.

### Correction made
```java
OPEN(Set.of(TicketStatus.IN_PROGRESS_NAME, TicketStatus.CANCELLED_NAME)),
// ...
static final String IN_PROGRESS_NAME = "IN_PROGRESS";
// etc.
```

### Test added
The full `TicketStatusTest` unit test suite (21 tests) covers every transition and validates the corrected implementation.

---

## Issue 2 — N+1 query on ticket list

**Date:** 2026-09-25
**Phase:** Backend service — TicketService.listTickets

### What AI suggested
Initial `listTickets` implementation mapped each `Ticket` to `TicketResponse` with `includeComments = true`. Since comments are lazily loaded, this would trigger one additional SELECT per ticket in the list.

### Why it was problematic
For a list of 100 tickets, this causes 101 database queries (1 for the list + 100 for comments). This is the classic N+1 problem and becomes a serious performance issue at scale.

### How it was detected
Code review of `TicketService.listTickets` against the spec. The list endpoint (`GET /api/tickets`) does not need comments, which are only shown on the detail view.

### Human decision
Pass `includeComments = false` in `listTickets`. Comments are only loaded and mapped in `getTicket` (detail call), which fetches a single ticket.

### Correction made
```java
// listTickets
.map(t -> mapper.toResponse(t, false))   // no comments

// getTicket (detail)
return mapper.toResponse(ticket, true);  // with comments
```

### Test added
`ticketDetail_includesComments` integration test verifies the detail response contains comments.
`listTickets_returnsAll` verifies the list response does not cause errors (implicitly not fetching comments).

---

## Issue 3 — H2 dialect override not complete in test profile

**Date:** 2026-09-25
**Phase:** Testing — integration test run (actual regression)

### What AI suggested
The initial `application-test.yml` set `spring.jpa.database-platform: org.hibernate.dialect.H2Dialect` to tell Hibernate to use H2 for tests. The main `application.yml` set `spring.jpa.properties.hibernate.dialect: org.hibernate.dialect.PostgreSQLDialect`.

### Why it was problematic
Spring Boot merges profiles: `application.yml` is loaded first, then `application-test.yml` overlays it. The test config set `database-platform` but did NOT explicitly override `spring.jpa.properties.hibernate.dialect`. As a result, Hibernate still used `PostgreSQLDialect` during tests, which generates `INSERT ... RETURNING id` — a PostgreSQL-specific syntax that H2 does not support. All integration tests that tried to persist a ticket failed with HTTP 500.

### How it was detected
Running `mvn test` produced:
```
Syntax error in SQL statement "insert into tickets (...) values (?) [*]returning id"
Tests run: 29, Failures: 25, Errors: 0
```

### Human decision
Explicitly add `spring.jpa.properties.hibernate.dialect: org.hibernate.dialect.H2Dialect` to `application-test.yml` so that it fully overrides the main config entry, not just the alias property.

### Correction made
Updated `backend/src/test/resources/application-test.yml`:
```yaml
spring:
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    properties:
      hibernate:
        dialect: org.hibernate.dialect.H2Dialect
```

### Test evidence
After fix: `Tests run: 55, Failures: 0, Errors: 0 — BUILD SUCCESS`.

---

*Add new entries as additional issues are discovered during development.*
