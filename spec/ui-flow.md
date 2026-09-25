# UI Flow Specification — Support Ticket Management System

| Field | Value |
| --- | --- |
| **Document ID** | STM-UI-001 |
| **Version** | 1.0 |
| **Status** | Approved |
| **Last updated** | 2026-09-25 |

---

## 1. Pages

| Route | Component | Purpose |
| --- | --- | --- |
| `/` | Ticket list | Browse, search, filter |
| `/tickets/new` | Create ticket form | Submit new ticket |
| `/tickets/[id]` | Ticket detail | View, edit, comment, transition |

---

## 2. Ticket list page (`/`)

**Elements:**
- Page heading: "Support Tickets"
- "New Ticket" button → navigates to `/tickets/new`
- Search input (debounced or on Enter) → `?search=` query param
- Status filter dropdown: (All | OPEN | IN_PROGRESS | RESOLVED | CLOSED | CANCELLED) → `?status=` param
- Table/card rows with: ID, Title, Priority badge, Status badge, Assignee, Created date
- Clicking a row → navigates to `/tickets/[id]`
- Empty state message when no tickets match

**Error states:**
- API unavailable → error banner
- Invalid status query param → ignored client-side; backend validates

---

## 3. Create ticket page (`/tickets/new`)

**Fields:**
| Field | Type | Validation (client hint) |
| --- | --- | --- |
| Title | text input | Required |
| Description | textarea | Required |
| Priority | select: LOW / MEDIUM / HIGH / CRITICAL | Required |
| Assignee | text input | Required |

**Behaviour:**
- "Create Ticket" submit button
- On success (201) → navigate to `/tickets/[id]`
- On 400 validation error → display field-level messages from API
- On other error → display generic error banner

---

## 4. Ticket detail page (`/tickets/[id]`)

**Display section:**
- All ticket fields: ID, Title, Description, Priority, Status, Assignee, Created, Updated

**Edit section (inline or modal):**
- Editable: Title, Description, Priority, Assignee
- "Save Changes" → PATCH /api/tickets/{id}
- On 400 → field errors
- On 404 → redirect to list

**Status transition section:**
- Current status displayed
- Dropdown / button list showing only allowed next states (determined from current status)
- "Transition" button → PATCH /api/tickets/{id}/status
- On 409 → display "Invalid transition" error message
- Terminal states (CLOSED, CANCELLED): no transition controls shown

**Comments section:**
- Ordered list of existing comments (author, content, timestamp)
- "Add Comment" form: Author (text), Content (textarea)
- Submit → POST /api/tickets/{id}/comments
- New comment appended to list on success
- On 400 → field errors

---

## 5. Allowed-next-states logic (frontend hint only)

| Current status | Show options |
| --- | --- |
| OPEN | IN_PROGRESS, CANCELLED |
| IN_PROGRESS | RESOLVED, CANCELLED |
| RESOLVED | CLOSED |
| CLOSED | *(none — read-only)* |
| CANCELLED | *(none — read-only)* |

This drives only which options are visible. The backend rejects any invalid request regardless.

---

## 6. Error display conventions

- Field-level validation errors appear beneath the relevant input in red.
- API-level errors (404, 409, 500) appear as a red banner/alert at the top of the page.
- Network/offline errors: "Unable to reach server. Please try again."
- No raw JSON or stack traces displayed.
