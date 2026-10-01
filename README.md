# Midterm Reviewer

A content-driven Next.js app for browsing and completing academic reviewer question banks.

Students choose a year level, open a subject, complete a reviewer, and receive deterministic results. Reviewer questions are supplied as JSON files; this app delivers, validates, scores, and saves them locally in the browser.

## Quick start

Requirements: Node.js 20+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run dev       # Start local development
npm run lint      # Run ESLint
npm test          # Run the Vitest suite
npm run build     # Create a production build
npm start         # Serve the production build
```

## How content works

```text
Question bank generator or author
              ↓
        reviewer JSON
              ↓
       /reviewers directory
              ↓
       validation + discovery
              ↓
          reviewer UI
```

The website is a content-delivery application. It does not read PDFs, generate questions, call an LLM, search the web, or use outside knowledge to score answers.

## Adding reviewer content

1. Read [`REVIEWER_TEMPLATE.md`](./REVIEWER_TEMPLATE.md).
2. Add a valid JSON file under `reviewers/year-X/SUBJECT_CODE/`.
3. Use the reviewer metadata as the source of truth; do not add subjects or reviewers to React components.
4. Run `npm test`, `npm run lint`, and `npm run build`.

Example path:

```text
reviewers/year-3/CS0016/midterm.json
```

Invalid files fail validation with the file, field, and question context when applicable.

## Supported question types

- `multiple-choice` — one exact answer
- `multiple-answer` — the selected set must exactly match
- `true-false` — Boolean comparison
- `fill-blank` — trimmed, case-insensitive comparison against explicit accepted answers

See [`REVIEWER_TEMPLATE.md`](./REVIEWER_TEMPLATE.md) for JSON examples and required fields.

## Project map

```text
reviewers/       Reviewer JSON content
src/app/         Next.js routes and page layout
src/components/  Shared interface components
src/quiz/        Quiz engine and question renderers
src/lib/content/ Discovery and catalog loading
src/lib/scoring/ Pure deterministic scoring logic
src/schemas/     Reviewer JSON validation
src/tests/       Unit and behavior tests
```

## Documentation

| Document | Purpose |
| --- | --- |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Code and content contribution workflow |
| [`REVIEWER_TEMPLATE.md`](./REVIEWER_TEMPLATE.md) | Reviewer JSON authoring guide and template |
| [`SPEC.md`](./SPEC.md) | Authoritative product requirements |
| [`DESIGN.md`](./DESIGN.md) | Visual and accessibility direction |
| [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) | Technical architecture |
| [`TASKS.md`](./TASKS.md) | Implementation checklist and status |
| [`AGENTS.md`](./AGENTS.md) | Instructions for coding agents |

## Design principles

The interface uses a focused purple/green connected-learning theme with opaque surfaces, clear borders, restrained depth, and no glassmorphism. Quiz content and accessibility take priority over decoration.
