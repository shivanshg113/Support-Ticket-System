# Command: Review Code

## Purpose
Perform a structured code review of changed or newly written source files.

## Instructions for AI

When reviewing code, check and report on all of the following:

### Architecture compliance
- [ ] Controller is thin (no business logic)?
- [ ] Business rules (including state machine) in service layer only?
- [ ] Repository does not contain business decisions?
- [ ] Constructor injection used (not field injection)?

### DTO discipline
- [ ] No JPA entities exposed directly in HTTP responses?
- [ ] Separate request/response DTOs used?

### Validation
- [ ] All input validated with Bean Validation annotations?
- [ ] Backend validates independently of frontend?

### State machine
- [ ] `isTransitionAllowed()` called before `setStatus()`?
- [ ] `InvalidStateTransitionException` thrown on violation?
- [ ] No transition logic duplicated outside `TicketStatus` enum?

### Error handling
- [ ] `GlobalExceptionHandler` handles all exception types?
- [ ] No stack traces in HTTP response bodies?
- [ ] Correct HTTP status codes used?

### Security
- [ ] No secrets hardcoded?
- [ ] No user input concatenated into queries?

### Tests
- [ ] New behaviour has a test?
- [ ] State machine matrix fully covered?
- [ ] Tests clean state in `@BeforeEach`?

### Specification alignment
- [ ] Implementation matches `spec/api-contract.md`?
- [ ] Error codes match `spec/api-contract.md`?
- [ ] Timestamps managed server-side?

## Output format
Report each check as PASS / FAIL / NOT_APPLICABLE with a brief explanation for any FAIL.
List all discovered issues and propose a correction for each.
