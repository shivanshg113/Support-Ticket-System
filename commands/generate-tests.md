# Command: Generate Tests

## Purpose
Generate or expand test coverage for a given class or scenario.

## Instructions for AI

When asked to generate tests:

1. Read the relevant spec file first (usually `spec/test-strategy.md` and `spec/state-machine.md`).
2. Read the class under test.
3. Identify untested paths.
4. Generate tests following these rules:

### Test class rules
- Annotate with `@SpringBootTest + @AutoConfigureMockMvc + @ActiveProfiles("test")` for integration tests.
- Use plain JUnit 5 (no Spring) for domain unit tests.
- `@BeforeEach` cleans state: `commentRepository.deleteAll()` then `ticketRepository.deleteAll()`.
- Each test is independent — never rely on order.

### Naming
- Class: `<Subject>Test` or `<Subject>IntegrationTest`.
- Method: `<scenario>_<expectedOutcome>` e.g. `transitionClosedToOpen_returns409`.
- `@DisplayName` with plain English.

### State machine tests
- Generate one test per row in the transition matrix.
- PASS rows: assert HTTP 200 and verify the new status in the response.
- FAIL rows: assert HTTP 409 and verify error code `INVALID_STATUS_TRANSITION`.

### Validation tests
- Blank/null title → 400 with `VALIDATION_FAILED`.
- Blank/null description → 400.
- Missing/null priority → 400.
- Blank assignee → 400.
- Blank comment content → 400.

### Not-found tests
- Request for ticket id `99999` → 404 with `TICKET_NOT_FOUND`.
- Comment on ticket id `99999` → 404 with `TICKET_NOT_FOUND`.

## Output format
Produce complete, compilable Java test methods. Do not omit imports.
