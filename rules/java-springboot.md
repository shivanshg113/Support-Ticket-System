# Rule: Java / Spring Boot Coding Standards

These rules apply to all Java source files in `backend/`.

## Architecture
- Follow Controller → Service → Repository → Database layering strictly.
- Controllers are thin: parse request, call service, return response. No business logic.
- All business logic (including state machine) lives in the service layer.
- Repositories handle persistence only; no business decisions.

## Dependency injection
- Use constructor injection exclusively. No field injection (`@Autowired` on fields).
- Declare all dependencies `private final`.

## DTOs
- Never expose JPA entities in HTTP responses. Always use DTOs.
- Separate request DTOs (TicketCreateRequest, etc.) from response DTOs (TicketResponse).

## Enums
- Store enums as strings (`@Enumerated(EnumType.STRING)`).
- Never rely on ordinal position.

## Validation
- All input validated via Jakarta Bean Validation annotations on request DTOs.
- Backend is the authoritative validator — frontend validation is supplementary only.

## Exception handling
- All exceptions mapped in `GlobalExceptionHandler` (`@RestControllerAdvice`).
- Never expose stack traces or internal class names in HTTP response bodies.
- Custom exceptions: `TicketNotFoundException` (404), `InvalidStateTransitionException` (409).

## Timestamps
- Store as `Instant` (UTC). Managed via `@PrePersist` / `@PreUpdate`.
- Never allow the client to set `createdAt` or `updatedAt`.

## Security
- No credentials in source code. Use environment variables for DB config.
- `application-example.yml` as reference only; real values in env vars or `.gitignore`d local files.

## Testing
- Tests use `test` profile (H2, `create-drop`).
- Each test cleans state in `@BeforeEach`.
- State machine must be tested at both unit (domain) and HTTP (integration) level.
