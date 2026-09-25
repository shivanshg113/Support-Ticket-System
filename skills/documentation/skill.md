# Skill: Documentation

## Purpose
Generate and maintain project documentation consistently with the codebase and specifications.

## When to use
- Writing or updating `README.md`.
- Writing or updating any file in `spec/` or `docs/`.
- Adding entries to `docs/prompt-history.md` or `docs/ai-review.md`.

## Instructions

### README.md
Must always contain all sections defined in `spec/requirements.md §12 NFR-06`:
overview, architecture, stack, structure, prerequisites, backend setup, frontend setup,
PostgreSQL setup, H2/test, how to run, how to test, API overview, state machine,
AI workflow, prompt history, AI review, known limitations.

### Spec documents
When updating a spec:
1. Identify all other specs that reference the same element.
2. Update all affected specs in the same commit.
3. Never leave specs in a contradictory state.

### docs/ai-review.md
Only document **actual** AI mistakes — not invented ones.
For each entry:
- What AI suggested
- Why it was problematic
- How it was detected
- Human decision
- Correction made
- Test added (if applicable)

### docs/prompt-history.md
Record every meaningful prompt that influenced architecture, API design, or implementation decisions.
Format:
```
## <short description>
**Date:** YYYY-MM-DD
**Context:** <which task / phase>
**Prompt:** <the prompt text>
**Outcome:** <what the AI generated / decided>
**Review note:** <what was accepted, changed, or rejected>
```

### Language and tone
- Technical, precise.
- No marketing language.
- State facts ("The system does X") not aspirations ("The system will try to X").
- Use tables for comparisons and matrices.
