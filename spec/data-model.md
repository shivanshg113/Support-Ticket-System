# Data Model Specification — Support Ticket Management System

| Field | Value |
| --- | --- |
| **Document ID** | STM-DM-001 |
| **Version** | 1.0 |
| **Status** | Approved |
| **Last updated** | 2026-09-25 |

---

## 1. Entities

### 1.1 Ticket

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| `id` | BIGINT | PK, auto-generated | Surrogate key |
| `title` | VARCHAR(255) | NOT NULL, non-blank, max 255 | Human-readable summary |
| `description` | TEXT | NOT NULL, non-blank | Full description |
| `priority` | VARCHAR(20) | NOT NULL | Enum: LOW, MEDIUM, HIGH, CRITICAL |
| `status` | VARCHAR(20) | NOT NULL, default 'OPEN' | Enum per state machine |
| `assignee` | VARCHAR(100) | NOT NULL, non-blank, max 100 | String identifier |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, server-set | UTC |
| `updated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, server-managed | UTC, updated on every write |

### 1.2 Comment

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| `id` | BIGINT | PK, auto-generated | Surrogate key |
| `ticket_id` | BIGINT | NOT NULL, FK → ticket.id ON DELETE CASCADE | Owning ticket |
| `author` | VARCHAR(100) | NOT NULL, non-blank | String identifier |
| `content` | TEXT | NOT NULL, non-blank | Comment body |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, server-set | UTC |

---

## 2. Relationships

```
Ticket (1) ────────── (*) Comment
```

- A ticket has zero or more comments.
- A comment belongs to exactly one ticket.
- Deleting a ticket cascades deletion of its comments (ON DELETE CASCADE).

---

## 3. Enumerations

### TicketPriority
```
LOW | MEDIUM | HIGH | CRITICAL
```

### TicketStatus
```
OPEN | IN_PROGRESS | RESOLVED | CLOSED | CANCELLED
```

Stored as strings (EnumType.STRING) to prevent silent breakage on column reorder.

---

## 4. Field size decisions (OQ-04 resolution)

| Field | Max length | Rationale |
| --- | --- | --- |
| title | 255 chars | Fits in a VARCHAR, scannable in list views |
| description | unbounded TEXT | Support descriptions can be lengthy |
| assignee | 100 chars | String identifier, not a full name field |
| author | 100 chars | Same as assignee |
| content | unbounded TEXT | Comments can be detailed |

---

## 5. Timestamp handling

- All timestamps stored as UTC (`TIMESTAMP WITH TIME ZONE` in PostgreSQL, `DATETIME` in H2).
- `created_at` set once on insert via `@PrePersist`.
- `updated_at` set on insert and every update via `@PrePersist` / `@PreUpdate`.
- API returns timestamps in ISO-8601 format: `2026-09-25T12:30:00Z`.

---

## 6. Pagination (OQ-02 resolution)

Version 1.0: no server-side pagination. Full list returned.
Known limitation documented in README. Pagination will be added if record volume requires it.
