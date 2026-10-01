
# AGENTS.md

This file contains instructions for AI coding agents working on this repository.

## Project Context

This project is a centralized academic reviewer website.

Students browse reviewers by year level and subject, answer interactive questions, receive scores, and review their answers.

Reviewer questions are generated **outside this application** and supplied as standardized JSON files.

The core content pipeline is:

```text
Academic Module PDFs
        ↓
External Question Bank Generator
        ↓
Reviewer JSON
        ↓
/reviewers
        ↓
Website
```

The website is responsible for **delivering and scoring reviewer content**, not generating it.

---

# Required Reading

Before making significant changes, read:

1. `SPEC.md`
2. `IMPLEMENTATION_PLAN.md`
3. `TASKS.md`
4. `README.md`

These documents serve different purposes.

### `SPEC.md`

Authoritative project requirements.

If another document conflicts with `SPEC.md`, follow `SPEC.md`.

Do not modify `SPEC.md` unless the user explicitly requests a requirements change.

### `IMPLEMENTATION_PLAN.md`

Technical implementation strategy.

Update when significant architectural or implementation decisions change.

### `TASKS.md`

Implementation checklist and progress tracker.

Update this file as work is completed.

### `README.md`

Human-facing project documentation.

Update it when installation steps, commands, directory structures, schemas, or workflows change.

---

# Core Architecture Rule

Maintain a strict separation between:

```text
CONTENT GENERATION
        ↓
reviewer.json
        ↓
CONTENT DELIVERY
```

Content generation happens externally.

Do not add PDF processing, AI question generation, LLM calls, or external-answer lookup to the website unless explicitly requested.

---

# Reviewer JSON Contract

Reviewer JSON is the interface between the external Question Bank Generator and this application.

Treat the reviewer schema as a public contract.

Do not casually change:

- property names
- question type names
- required fields
- answer formats
- source formats
- schema-version behavior

A schema change may break externally generated reviewer files.

If a schema change is necessary:

1. Explain why.
2. Update the schema version when appropriate.
3. Preserve backward compatibility when reasonably possible.
4. Update validation.
5. Update TypeScript types.
6. Update tests.
7. Update sample reviewer files.
8. Update `README.md`.
9. Update the Question Bank Generator contract if applicable.

---

# Content-Driven Architecture

Do not hard-code individual:

- subjects
- year levels derived from content
- reviewers
- questions
- correct answers

into React components when they can be derived from reviewer data.

Adding a valid reviewer JSON file should not require creating a new React page or modifying application logic.

Expected workflow:

```text
add reviewer JSON
        ↓
validation
        ↓
automatic discovery
        ↓
year/subject grouping
        ↓
website
```

---

# Reviewer Directory

Reviewer content belongs under:

```text
/reviewers
```

Recommended organization:

```text
reviewers/
├── year-1/
│   └── IT0123/
│       ├── midterm.json
│       └── module-1.json
│
├── year-2/
├── year-3/
└── year-4/
```

Do not use directory names as the sole source of academic metadata.

The reviewer JSON remains authoritative for reviewer metadata.

---

# Validation

All reviewer content must be validated against the project's reviewer schema.

Do not silently accept malformed reviewer content.

Validation errors should identify:

- reviewer file
- affected field
- question ID when applicable
- reason validation failed

Examples of invalid content include:

- unsupported schema version
- duplicate question IDs
- unsupported question types
- missing choices
- invalid correct answers
- empty accepted-answer arrays
- malformed source metadata
- empty reviewer question banks

---

# Supported Question Types

The MVP supports:

```text
multiple-choice
multiple-answer
true-false
fill-blank
```

Question rendering should remain extensible so additional types can be introduced later.

Do not build question-type logic directly into unrelated page components.

Use the quiz/question-rendering abstraction defined by the project architecture.

---

# Scoring Rules

Scoring must be deterministic.

Never use:

- generative AI
- LLM APIs
- web searches
- external knowledge
- semantic similarity models

to determine whether a student's answer is correct.

Use only the correct-answer information contained in reviewer JSON.

Keep scoring logic separate from presentation logic.

Scoring functions should be independently testable.

---

# Multiple Choice

A single-answer multiple-choice response is correct only when it matches the configured correct answer.

---

# Multiple Answer

A multiple-answer response is correct only when the student's selected answer set exactly matches the configured correct-answer set.

Selecting additional incorrect options makes the response incorrect.

---

# True or False

Compare against the configured Boolean answer.

---

# Fill in the Blank

Normalize answers using only explicitly supported deterministic transformations.

At minimum:

1. Trim leading/trailing whitespace.
2. Normalize capitalization.

Example:

```text
DHCP
dhcp
 DHCP 
```

should be equivalent.

Alternative valid answers must be explicitly included in:

```text
acceptedAnswers
```

Do not introduce fuzzy matching without an explicit requirements change.

---

# Source Metadata

Generated questions contain source metadata identifying where the content originated.

Example:

```json
{
  "source": {
    "module": "Module 2",
    "page": 14
  }
}
```

This information exists primarily for verification and auditing.

Do not expose it prominently in the student interface unless explicitly requested.

Do not remove source metadata from the underlying reviewer contract without a requirements change.

---

# Quiz State

Quiz state should preserve:

- reviewer ID
- current question
- selected answers
- question order
- shuffled choice order
- start time
- completion status

Refreshing the application should not unexpectedly change question or choice ordering during an active attempt.

---

# Randomization

Randomization occurs when an attempt starts.

Do not reshuffle questions or choices because of:

- React rerenders
- route transitions
- state updates
- Previous/Next navigation
- browser refresh

Persist randomized order as part of the attempt.

Do not unnecessarily shuffle True/False options.

---

# Student Accounts

Student accounts are outside MVP scope.

Do not introduce authentication infrastructure unless explicitly requested.

Use browser-local persistence for MVP reviewer attempts.

---

# Database

A database is not required for the MVP.

Do not introduce:

- PostgreSQL
- MySQL
- MongoDB
- Firebase
- Supabase
- Prisma
- other persistence infrastructure

unless a concrete new requirement requires server-side persistence.

Reviewer JSON files are the MVP content source.

---

# Dependencies

Prefer existing project dependencies and platform capabilities.

Before adding a dependency:

1. Determine whether the project already provides the functionality.
2. Consider whether a small internal implementation would be simpler.
3. Avoid dependencies for trivial functionality.
4. Add dependencies only when they provide clear maintainability or reliability benefits.

Document important new dependencies.

---

# Code Quality

Prefer:

- TypeScript strictness
- small reusable components
- pure scoring functions
- explicit types
- descriptive names
- straightforward control flow
- reusable content loaders
- reusable validation logic

Avoid:

- unnecessary abstraction
- deeply nested components
- duplicated scoring logic
- duplicated question rendering
- `any` when a reasonable type exists
- giant components containing unrelated responsibilities
- premature optimization

Optimize for maintainability by future student developers.

---

# UI Development

The current visual direction is the purple/green **Connected Learning** system documented in `DESIGN.md`.

- Use a deep purple foundation, purple active states, and green progress/success accents.
- Prefer solid cards with clear borders and restrained shadows over glassmorphism, backdrop blur, or translucent panels.
- Keep the tone lively through sparse connected-line motifs and tactile micro-interactions, not through game mechanics or decorative clutter.
- When changing UI, preserve readable contrast, visible focus states, and the content-first quiz experience.

The application should be:

- responsive
- mobile-friendly
- keyboard-accessible
- readable
- academically focused

Do not make the reviewer unnecessarily game-like unless explicitly requested.

Prioritize the question content over decorative UI.

---

# Accessibility

Use:

- semantic HTML
- labels for form controls
- keyboard-accessible interactions
- visible focus states
- sufficient contrast
- accessible radio/checkbox controls

Do not indicate correctness using color alone.

Use textual or symbolic indicators such as:

```text
✓ Correct
✗ Incorrect
```

---

# Testing Requirements

Do not consider core functionality complete without appropriate verification.

Tests should cover important deterministic logic, including:

- schema validation
- scoring
- fill-blank normalization
- multiple-answer comparison
- unanswered questions
- randomization
- persisted attempt restoration

When fixing a bug in core logic, add or update a test when reasonably possible.

---

# Before Marking a Task Complete

Verify the relevant implementation.

Depending on the change, this may include:

```bash
npm test
npm run lint
npm run build
```

Use the actual commands configured by the project.

Do not mark tasks complete merely because code was written.

---

# TASKS.md Maintenance

Update `TASKS.md` after verified work.

Use:

```text
- [ ] Not started
- [x] Completed
```

Do not mark an entire phase complete if required subtasks remain unfinished.

Update the Current Status section when moving between major phases.

---

# README Maintenance

Update `README.md` when changes affect:

- installation
- commands
- architecture
- directories
- reviewer schema
- content workflow
- testing
- deployment
- contributor instructions

README documentation should reflect the actual repository rather than planned behavior once implementation

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
