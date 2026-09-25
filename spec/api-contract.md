# API Contract — Support Ticket Management System

| Field | Value |
| --- | --- |
| **Document ID** | STM-API-001 |
| **Version** | 1.0 |
| **Status** | Approved |
| **Last updated** | 2026-09-25 |
| **Base URL** | `http://localhost:8080/api` |
| **Content-Type** | `application/json` |

---

## OQ resolutions recorded in this document

| Item | Decision |
| --- | --- |
| OQ-01 — HTTP code for invalid transition | **409 Conflict** |
| OQ-03 — PATCH semantics | Full replace of provided fields; omitted fields are not updated (partial PATCH). Fields absent from the request body are ignored. |

---

## 1. Ticket endpoints

### POST /api/tickets — Create ticket

**Request body**
```json
{
  "title": "Unable to access account",
  "description": "User receives an error while logging in.",
  "priority": "HIGH",
  "assignee": "support-agent-1"
}
```

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| title | string | Yes | Non-blank, max 255 chars |
| description | string | Yes | Non-blank |
| priority | string | Yes | LOW \| MEDIUM \| HIGH \| CRITICAL |
| assignee | string | Yes | Non-blank, max 100 chars |

**Responses**

| Code | Meaning | Body |
| --- | --- | --- |
| 201 | Created | TicketResponse |
| 400 | Validation error | ErrorResponse |

**TicketResponse**
```json
{
  "id": 1,
  "title": "Unable to access account",
  "description": "User receives an error while logging in.",
  "priority": "HIGH",
  "status": "OPEN",
  "assignee": "support-agent-1",
  "createdAt": "2026-09-25T12:00:00Z",
  "updatedAt": "2026-09-25T12:00:00Z",
  "comments": []
}
```

---

### GET /api/tickets — List tickets

Query parameters (all optional, combinable):

| Param | Type | Example | Behaviour |
| --- | --- | --- | --- |
| `search` | string | `?search=login` | Case-insensitive match in title OR description |
| `status` | string | `?status=OPEN` | Filter by exact status enum value |

**Examples**
```
GET /api/tickets
GET /api/tickets?search=login
GET /api/tickets?status=OPEN
GET /api/tickets?search=login&status=OPEN
```

**Response 200**
```json
[
  {
    "id": 1,
    "title": "Unable to access account",
    "description": "User receives an error while logging in.",
    "priority": "HIGH",
    "status": "OPEN",
    "assignee": "support-agent-1",
    "createdAt": "2026-09-25T12:00:00Z",
    "updatedAt": "2026-09-25T12:00:00Z",
    "comments": []
  }
]
```

---

### GET /api/tickets/{id} — Get ticket details

**Path param:** `id` — ticket ID (Long)

**Responses**

| Code | Body |
| --- | --- |
| 200 | TicketResponse (with full comments list) |
| 404 | ErrorResponse |

---

### PATCH /api/tickets/{id} — Update ticket fields

**Request body** (all fields optional; at least one should be present):
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "CRITICAL",
  "assignee": "support-agent-2"
}
```

Status is NOT changeable via this endpoint.

**Responses**

| Code | Body |
| --- | --- |
| 200 | Updated TicketResponse |
| 400 | ErrorResponse (validation) |
| 404 | ErrorResponse (not found) |

---

### PATCH /api/tickets/{id}/status — Transition ticket status

**Request body**
```json
{
  "status": "IN_PROGRESS"
}
```

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| status | string | Yes | Valid TicketStatus enum value |

**Responses**

| Code | Body | Condition |
| --- | --- | --- |
| 200 | Updated TicketResponse | Transition allowed |
| 400 | ErrorResponse | Invalid/missing status value |
| 404 | ErrorResponse | Ticket not found |
| 409 | ErrorResponse | State transition not permitted |

---

### POST /api/tickets/{id}/comments — Add comment

**Request body**
```json
{
  "author": "support-agent-1",
  "content": "Investigating the issue."
}
```

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| author | string | Yes | Non-blank, max 100 chars |
| content | string | Yes | Non-blank |

**Responses**

| Code | Body |
| --- | --- |
| 201 | CommentResponse |
| 400 | ErrorResponse |
| 404 | ErrorResponse (ticket not found) |

**CommentResponse**
```json
{
  "id": 1,
  "ticketId": 1,
  "author": "support-agent-1",
  "content": "Investigating the issue.",
  "createdAt": "2026-09-25T12:05:00Z"
}
```

---

## 2. Error response schema

```json
{
  "timestamp": "2026-09-25T12:30:00Z",
  "status": 409,
  "error": "INVALID_STATUS_TRANSITION",
  "message": "Ticket cannot transition from CLOSED to OPEN",
  "path": "/api/tickets/1/status"
}
```

| Field | Type | Always present | Notes |
| --- | --- | --- | --- |
| timestamp | ISO-8601 string | Yes | UTC |
| status | integer | Yes | HTTP status code |
| error | string | Yes | Machine-readable error code |
| message | string | Yes | Human-readable explanation |
| path | string | Yes | Request URI |

### Error codes

| Code | HTTP | Meaning |
| --- | --- | --- |
| `VALIDATION_FAILED` | 400 | Bean Validation constraint violation |
| `MALFORMED_REQUEST` | 400 | Unparseable JSON / missing required field |
| `TICKET_NOT_FOUND` | 404 | Ticket id does not exist |
| `INVALID_STATUS_TRANSITION` | 409 | State machine violation |
| `INTERNAL_ERROR` | 500 | Unexpected server exception |

---

## 3. HTTP status code usage

| Code | Used for |
| --- | --- |
| 200 OK | Successful GET / PATCH |
| 201 Created | Successful POST (ticket or comment) |
| 400 Bad Request | Validation or parse failure |
| 404 Not Found | Resource does not exist |
| 409 Conflict | Business rule / state machine violation |
| 500 Internal Server Error | Unhandled exception |
