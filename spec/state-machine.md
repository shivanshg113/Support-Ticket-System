# State Machine Specification — Support Ticket Management System

| Field | Value |
| --- | --- |
| **Document ID** | STM-SM-001 |
| **Version** | 1.0 |
| **Status** | Approved |
| **Last updated** | 2026-09-25 |

---

## 1. States

| State | Terminal? | Meaning |
| --- | --- | --- |
| `OPEN` | No | Ticket created, not yet assigned / started |
| `IN_PROGRESS` | No | Actively being worked |
| `RESOLVED` | No | Work done; awaiting closure confirmation |
| `CLOSED` | **Yes** | Successfully completed and closed |
| `CANCELLED` | **Yes** | Ticket abandoned or invalid |

---

## 2. Allowed transitions

```
OPEN
 ├──→ IN_PROGRESS
 └──→ CANCELLED

IN_PROGRESS
 ├──→ RESOLVED
 └──→ CANCELLED

RESOLVED
 └──→ CLOSED

CLOSED      (terminal — no outgoing transitions)
CANCELLED   (terminal — no outgoing transitions)
```

### Transition table

| From | To | Allowed |
| --- | --- | --- |
| OPEN | IN_PROGRESS | ✅ |
| OPEN | CANCELLED | ✅ |
| IN_PROGRESS | RESOLVED | ✅ |
| IN_PROGRESS | CANCELLED | ✅ |
| RESOLVED | CLOSED | ✅ |
| CLOSED | *(any)* | ❌ |
| CANCELLED | *(any)* | ❌ |
| OPEN | RESOLVED | ❌ |
| OPEN | CLOSED | ❌ |
| IN_PROGRESS | CLOSED | ❌ |
| IN_PROGRESS | OPEN | ❌ |
| RESOLVED | OPEN | ❌ |
| RESOLVED | IN_PROGRESS | ❌ |
| RESOLVED | CANCELLED | ❌ |

---

## 3. Enforcement location

The state machine is enforced **exclusively in the service layer** (`TicketService`).
No enforcement logic exists in the controller or repository.
The frontend may hide disallowed transitions in the UI but must never be relied upon for enforcement.

---

## 4. Implementation approach

`TicketStatus` enum contains an `isTransitionAllowed(TicketStatus next)` method.
A `Set<TicketStatus>` of allowed next states is associated with each enum constant.

```java
OPEN(Set.of(IN_PROGRESS, CANCELLED)),
IN_PROGRESS(Set.of(RESOLVED, CANCELLED)),
RESOLVED(Set.of(CLOSED)),
CLOSED(Set.of()),
CANCELLED(Set.of());
```

`TicketService.transitionStatus()` delegates to this method and throws `InvalidStateTransitionException` on violation.

---

## 5. HTTP response on violation

`InvalidStateTransitionException` → `GlobalExceptionHandler` → HTTP 409 Conflict with `ErrorResponse`:

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

## 6. Required test matrix

All rows below must have automated test coverage. See `test-strategy.md`.

| Transition | Expected result |
| --- | --- |
| OPEN → IN_PROGRESS | PASS |
| OPEN → CANCELLED | PASS |
| IN_PROGRESS → RESOLVED | PASS |
| IN_PROGRESS → CANCELLED | PASS |
| RESOLVED → CLOSED | PASS |
| CLOSED → OPEN | FAIL (409) |
| CLOSED → IN_PROGRESS | FAIL (409) |
| CLOSED → RESOLVED | FAIL (409) |
| CANCELLED → OPEN | FAIL (409) |
| CANCELLED → IN_PROGRESS | FAIL (409) |
| RESOLVED → OPEN | FAIL (409) |
| RESOLVED → IN_PROGRESS | FAIL (409) |
| OPEN → RESOLVED | FAIL (409) |
| OPEN → CLOSED | FAIL (409) |
| IN_PROGRESS → CLOSED | FAIL (409) |
| IN_PROGRESS → OPEN | FAIL (409) |
