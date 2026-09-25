# Rule: Testing Standards

## Philosophy
- Tests verify behaviour, not implementation details.
- Tests must be independent and repeatable.
- A failing test is evidence — never delete it to make the build pass.

## Backend unit tests (domain)
- Target: `TicketStatus.isTransitionAllowed()` and service-level logic.
- No Spring context; plain JUnit 5.
- Cover every row of the state-machine transition matrix.

## Backend integration tests (MockMvc + H2)
- `@SpringBootTest + @AutoConfigureMockMvc + @ActiveProfiles("test")`.
- `@BeforeEach` calls `commentRepository.deleteAll()` then `ticketRepository.deleteAll()`.
- Test HTTP status codes, response body structure, and error codes.
- Do not assert on internal class names in error responses.

## State machine matrix
- Every allowed transition must have a passing test.
- Every forbidden transition must have a test expecting 409.
- Tests named clearly: `transitionOpenToInProgress_succeeds`, `transitionClosedToOpen_returns409`.

## Regression policy
- When a bug is found: write a failing test first, fix the code, verify test passes, run full suite.
- Document in `docs/ai-review.md` if AI-generated code caused the defect.

## Test naming
- Use `@DisplayName` with plain-English descriptions.
- Method names use snake_case with expected outcome suffix: `_succeeds`, `_returns400`, `_returns409`, `_returns404`.

## Coverage expectations (minimum)
- All FR-01–FR-11 requirements have at least one test.
- Full 16-row state machine matrix covered.
- Validation (blank title, blank description, missing priority) covered.
- Not-found (ticket 99999) covered.
- Search and filter covered.
