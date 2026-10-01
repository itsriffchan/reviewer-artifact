# Contributing

Thanks for improving Midterm Reviewer. Contributions can add reviewer content, improve the quiz experience, fix bugs, or improve documentation.

## Before you start

- Read [`AGENTS.md`](./AGENTS.md) for repository rules.
- Read [`SPEC.md`](./SPEC.md) before changing behavior.
- Read [`REVIEWER_TEMPLATE.md`](./REVIEWER_TEMPLATE.md) before adding question banks.
- Keep content generation separate from content delivery.

## Code changes

1. Create a focused branch.
2. Make the smallest change that solves the problem.
3. Keep scoring pure and deterministic.
4. Preserve the reviewer JSON contract unless a versioned schema change is explicitly required.
5. Add or update tests for core behavior.
6. Update documentation when commands, structure, or workflows change.

Run the checks before opening a pull request:

```bash
npm test
npm run lint
npm run build
```

## Reviewer content changes

1. Add JSON under `reviewers/year-X/SUBJECT_CODE/`.
2. Use a unique reviewer `id` and unique question IDs within that reviewer.
3. Include explanations and source metadata for every question.
4. Use only supported question types and exact answer formats.
5. Validate locally with the standard checks.

Do not add PDF processing, AI generation, external answer lookup, fuzzy grading, or database persistence.

## Pull requests

Describe:

- what changed;
- why it changed;
- how it was tested;
- any reviewer schema or documentation impact.

For UI changes, include the affected route and a screenshot when useful. Keep visual changes aligned with [`DESIGN.md`](./DESIGN.md).
