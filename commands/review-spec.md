# Command: Review Specification

## Purpose
Check all specification documents for internal consistency and alignment with the implementation.

## Instructions for AI

Read the following files and cross-check:

1. `spec/requirements.md`
2. `spec/architecture.md`
3. `spec/data-model.md`
4. `spec/api-contract.md`
5. `spec/state-machine.md`
6. `spec/ui-flow.md`
7. `spec/test-strategy.md`

Then check:

### Cross-spec consistency
- [ ] State machine in `state-machine.md` matches allowed transitions in `api-contract.md` (409 on violation)?
- [ ] Data model in `data-model.md` matches entity fields in `api-contract.md` examples?
- [ ] Test matrix in `test-strategy.md` covers every transition in `state-machine.md`?
- [ ] UI allowed-next-states in `ui-flow.md` match `state-machine.md`?
- [ ] Error codes in `api-contract.md` match what `GlobalExceptionHandler` returns?

### Spec vs implementation
- [ ] API endpoints in `api-contract.md` match `TicketController.java` route mappings?
- [ ] HTTP codes in `api-contract.md` match what `GlobalExceptionHandler` returns?
- [ ] Field names in `api-contract.md` examples match DTO field names?
- [ ] Status enum values in `state-machine.md` match `TicketStatus.java`?
- [ ] Priority enum values in `requirements.md` match `TicketPriority.java`?

### Completeness
- [ ] All FR-01–FR-11 requirements have at least one test in `test-strategy.md`?
- [ ] OQ (open questions) all resolved?

## Output format
List each check as PASS / FAIL / STALE with notes. For FAIL or STALE, identify which document needs updating.
