# Rule: REST API Standards

## Base path
All endpoints: `/api/tickets` and `/api/tickets/{id}/comments`.

## HTTP methods
- `POST` — create resource, return 201 Created.
- `GET`  — retrieve, return 200 OK.
- `PATCH` — partial update, return 200 OK.
- Do not use `PUT` (full replace) unless documented.

## HTTP status codes
| Situation | Code |
| --- | --- |
| Successful create | 201 |
| Successful read / update | 200 |
| Validation failure | 400 |
| Ticket not found | 404 |
| Invalid state transition | 409 |
| Unexpected error | 500 |

Never return 200 for an error condition.

## Error body schema (mandatory)
```json
{
  "timestamp": "<ISO-8601 UTC>",
  "status": <http-code>,
  "error": "<MACHINE_READABLE_CODE>",
  "message": "<human readable>",
  "path": "<request URI>"
}
```
Always include all five fields. Never include stack traces or Java class names.

## Error codes
`VALIDATION_FAILED` | `MALFORMED_REQUEST` | `TICKET_NOT_FOUND` | `INVALID_STATUS_TRANSITION` | `INTERNAL_ERROR`

## Request / response
- Always `Content-Type: application/json`.
- Enums: serialise as strings (`OPEN`, `HIGH`), not integers.
- Timestamps: ISO-8601 with UTC offset.
- Status field in create request: **must not be accepted**. Server sets `OPEN`.

## PATCH semantics
Partial PATCH: only non-null fields in the request body are applied. Absent fields are ignored.

## CORS
Allowed origin: `http://localhost:3000` in development. Configurable for production.
