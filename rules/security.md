# Rule: Security Standards

## Secrets management
- Never commit passwords, API keys, tokens, database credentials, or private keys.
- Use environment variables: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.
- Provide `application-example.yml` with placeholder values only.
- `.gitignore` must exclude `.env`, `*.env`, `application-local.yml`, `application-local.properties`.

## Error responses
- Never expose Java stack traces, class names, or internal error details in HTTP responses.
- `GlobalExceptionHandler` catches all exceptions and returns sanitised `ErrorResponse`.
- The generic handler logs the real exception server-side; clients receive only a generic message.

## Input validation
- All externally supplied input validated at the backend via Jakarta Bean Validation.
- Frontend validation is a UX convenience — backend is authoritative.
- Reject null, blank, and out-of-range values before they reach business logic.

## SQL injection prevention
- Use Spring Data JPA with named parameters (`@Param`) in JPQL queries.
- Never concatenate user input into query strings.

## CORS
- Allow only known frontend origins. Do not use `*` in production.

## Future considerations (out of scope for v1)
- Authentication and authorisation (login, roles).
- CSRF protection (relevant when auth is added).
- Rate limiting.
- Input length limits enforced at DB level (already present via `@Column(length = ...)` and `@Size`).
