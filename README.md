
# Centralized Academic Reviewer

A centralized web application for interactive academic reviewers across multiple subjects and year levels.

Students can browse available subjects, select a reviewer, answer interactive questions, receive a score, and review their answers.

The application is designed around a simple content workflow:

```text
Academic Module PDFs
        ↓
Question Bank Generator
        ↓
Reviewer JSON
        ↓
Website /reviewers directory
        ↓
Interactive Reviewer
```

The website does **not** generate questions itself. Reviewer content is created externally and provided to the application as standardized JSON files.

---

## Project Status

✅ **MVP Completed & Fully Verified.**

The core application architecture, schema validation, seed reviewer catalog, quiz engine, deterministic scoring, answer review, attempt persistence, and responsive UI have all been implemented and verified with automated test suites (`vitest`), ESLint, production Next.js builds, and browser end-to-end testing.

See:

- [`SPEC.md`](./SPEC.md) — project requirements and authoritative behavioral contract
- [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) — technical implementation architecture
- [`TASKS.md`](./TASKS.md) — phase progress and verification checklist

---

# Features

The planned MVP includes:

- Multiple year levels
- Multiple subjects
- Multiple reviewers per subject
- Reviewer search
- Interactive quiz sessions
- Desktop side-by-side Question Navigator palette
- Immediately visible stationary navigation bar with "Previous" and "Next Question" controls (no scrolling down required)
- Toggleable "Skip to Unanswered" mode in the action bar to jump straight to next unanswered questions without competing buttons
- Global arrow key navigation shortcuts (`←` Previous / `→` Next)
- Configurable answer feedback mode (Instant Feedback after each question or at the End of the Quiz)
- Custom practice sessions (filter by module & select question count)
- Module selection (e.g. Modules 1 & 3)
- Adjustable session length (e.g. 10, 20, 50 questions or custom)
- Single-answer multiple choice with option clearing and click-to-unselect
- Multiple-answer questions with choice restriction (automatically parses `(Choose X)` or optional `maxChoices`, disables unselected options once limit is reached, and provides a clear selection button)
- True or False with toggle unselect and clear
- Fill in the Blank with deterministic normalization
- Question randomization
- Choice randomization
- Progress saving
- Resume unfinished attempts
- Automatic scoring
- Results summary
- Answer review
- Explanations
- Mobile-responsive interface with collapsible navigator drawer
- JSON-based reviewer content
- Automatic reviewer discovery
- Reviewer schema validation

No student account is required for the MVP.

---

# Architecture

The application separates **content generation** from **content delivery**.

## Content Generation

A separate Question Bank Generator is responsible for processing academic materials and producing reviewer JSON files.

Conceptually:

```text
Module PDFs
     ↓
Question Bank Generator
     ↓
reviewer.json
```

The Question Bank Generator is not part of this repository's runtime application.

## Content Delivery

This application consumes valid reviewer JSON:

```text
reviewer.json
     ↓
Schema Validation
     ↓
Content Discovery
     ↓
Website
     ↓
Student Reviewer Session
```

The JSON schema is the contract between the two systems.

---

# Technology Stack

The planned stack is:

- **Framework:** Next.js
- **UI:** React
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Validation:** Zod
- **Reviewer Content:** JSON
- **Local Progress:** Browser `localStorage`
- **Deployment:** Vercel or equivalent

The project intentionally avoids requiring a database for the initial MVP.

---

# Project Structure

The intended structure is approximately:

```text
project/
│
├── reviewers/
│   ├── year-1/
│   ├── year-2/
│   ├── year-3/
│   └── year-4/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── quiz/
│   ├── lib/
│   ├── schemas/
│   ├── types/
│   └── utils/
│
├── public/
│
├── SPEC.md
├── IMPLEMENTATION_PLAN.md
├── TASKS.md
├── README.md
└── package.json
```

The exact source structure may evolve during implementation.

---

# Reviewer Content

Reviewer files are stored separately from application logic.

Example:

```text
reviewers/
└── year-1/
    └── IT0123/
        ├── midterm.json
        └── module-1.json
```

A subject can contain multiple reviewers.

For example:

```text
IT0123
├── Midterm Reviewer
├── Module 1 Reviewer
└── Finals Reviewer
```

The application should discover these reviewers from their JSON metadata rather than requiring manually created pages.

---

# Adding a Reviewer

The intended workflow is:

## 1. Prepare the academic modules

Gather the PDFs containing the material covered by the reviewer.

Example:

```text
Module-1.pdf
Module-2.pdf
Module-3.pdf
Module-4.pdf
```

## 2. Generate the reviewer

Provide the modules to the external Question Bank Generator.

The generator outputs a standardized reviewer file such as:

```text
IT0123-midterm.json
```

## 3. Add the reviewer

Place the generated file into the appropriate subject directory.

Example:

```text
reviewers/year-1/IT0123/midterm.json
```

## 4. Validate

Run the project's validation/build process.

The reviewer must conform to the supported reviewer schema.

## 5. Publish

Once valid, the reviewer should automatically become discoverable by the application without requiring a new React page or manually adding it to a hard-coded reviewer list.

---

# Reviewer JSON Schema (Version 1)

Every reviewer file must conform to the **Version 1 Reviewer JSON Schema** validated by Zod at [`src/schemas/reviewerSchema.ts`](file:///c:/Users/raisi/Documents/Coding%20Projects/acm_reviewer_artifacts/src/schemas/reviewerSchema.ts).

### Contract Rules & Invariants:
1. `schemaVersion`: Must strictly equal `1`.
2. `id`: Lowercase alphanumeric kebab-case identifier (e.g., `it0123-midterm`).
3. `subject`:
   - `code`: Standard alphanumeric subject code (e.g., `IT0123`, `CS101`).
   - `name`: Human-readable course title.
   - `yearLevel`: Integer from `1` to `4`.
4. `reviewer`:
   - `title`: Reviewer display title.
   - `description`: Explanatory description of the reviewer.
   - `coverage`: Array of syllabus modules covered (must not be empty).
   - `shuffleQuestions`: Boolean flag controlling question presentation order.
   - `shuffleChoices`: Boolean flag controlling choices presentation order.
5. `questions`:
   - Non-empty array of questions conforming to one of the 4 supported question types.
   - Question IDs must be unique across the reviewer.
   - Choices arrays must contain no duplicate values.
   - `multiple-answer` questions must contain at least 2 distinct correct answers. They may optionally define `maxChoices?: number` to enforce selection limits.
   - `correctAnswers` must contain no duplicate values and all items must exist within `choices`.
   - `fill-blank` questions must specify at least one accepted answer in `acceptedAnswers`.
   - Every question must include an `explanation` and `source` (`module` and optional `page`).

---

# Supported Question Types

## Multiple Choice

Single correct answer.

```json
{
  "id": "q001",
  "type": "multiple-choice",
  "topic": "OSI Model",
  "question": "Which OSI layer is responsible for routing packets?",
  "choices": [
    "Physical",
    "Data Link",
    "Network",
    "Transport"
  ],
  "correctAnswer": "Network",
  "explanation": "The Network layer handles logical addressing and routing.",
  "source": {
    "module": "Module 2",
    "page": 14
  }
}
```

---

## Multiple Answer

More than one answer may be correct. The schema supports an optional `maxChoices` property to restrict the maximum number of selectable options. If omitted, prompts with `(Choose X)` or `(Select X)` are automatically parsed to enforce the restriction.

```json
{
  "id": "q002",
  "type": "multiple-answer",
  "topic": "Transport Layer",
  "question": "Which protocols operate at the transport layer? (Choose 2)",
  "choices": [
    "TCP",
    "UDP",
    "IP",
    "Ethernet"
  ],
  "correctAnswers": [
    "TCP",
    "UDP"
  ],
  "maxChoices": 2,
  "explanation": "TCP and UDP are transport-layer protocols.",
  "source": {
    "module": "Module 2",
    "page": 20
  }
}
```

The selected answers must exactly match the correct-answer set. When the student reaches the selection limit, unselected choices are automatically disabled until an option is deselected.

---

## True or False

```json
{
  "id": "q003",
  "type": "true-false",
  "topic": "TCP",
  "question": "TCP is connection-oriented.",
  "correctAnswer": true,
  "explanation": "TCP establishes a connection before exchanging data.",
  "source": {
    "module": "Module 3",
    "page": 8
  }
}
```

---

## Fill in the Blank

```json
{
  "id": "q004",
  "type": "fill-blank",
  "topic": "DHCP",
  "question": "The protocol used to automatically assign IP addresses is _____.",
  "acceptedAnswers": [
    "DHCP",
    "Dynamic Host Configuration Protocol"
  ],
  "explanation": "DHCP provides automatic IP configuration.",
  "source": {
    "module": "Module 3",
    "page": 16
  }
}
```

Fill-in-the-blank comparison should ignore capitalization and leading/trailing whitespace.

Accepted alternative answers must be explicitly included in `acceptedAnswers`.

The application does not use AI or fuzzy semantic matching to determine correctness.

---

# Complete Example Reviewer JSON

The following is an exhaustive, production-ready reviewer JSON example demonstrating all 4 supported question types, source metadata, shuffle configuration, and metadata fields:

```json
{
  "schemaVersion": 1,
  "id": "sample-reviewer-complete",
  "subject": {
    "code": "CS101",
    "name": "Introduction to Computer Programming",
    "yearLevel": 1
  },
  "reviewer": {
    "title": "Complete Sample Reviewer",
    "description": "Demonstration reviewer showcasing all four supported question types, syllabus coverage, and deterministic rules.",
    "coverage": [
      "Module 1 - Syntax & Data Types",
      "Module 2 - Control Structures",
      "Module 3 - Functions & Scope"
    ],
    "shuffleQuestions": true,
    "shuffleChoices": true
  },
  "questions": [
    {
      "id": "cs101-q01",
      "type": "multiple-choice",
      "topic": "Data Types",
      "question": "Which of the following data types represents a sequence of characters?",
      "choices": [
        "Integer",
        "String",
        "Boolean",
        "Float"
      ],
      "correctAnswer": "String",
      "explanation": "A string data type is used in programming languages to represent a sequence of textual characters.",
      "source": {
        "module": "Module 1 - Syntax & Data Types",
        "page": 8
      }
    },
    {
      "id": "cs101-q02",
      "type": "multiple-answer",
      "topic": "Control Structures",
      "question": "Which of the following are iterative loop structures in standard programming languages?",
      "choices": [
        "for loop",
        "while loop",
        "if-else statement",
        "switch statement"
      ],
      "correctAnswers": [
        "for loop",
        "while loop"
      ],
      "explanation": "for and while loops repeatedly execute blocks of code based on a condition; if-else and switch are conditional branching constructs.",
      "source": {
        "module": "Module 2 - Control Flow & Loops",
        "page": 14
      }
    },
    {
      "id": "cs101-q03",
      "type": "true-false",
      "topic": "Functions & Scope",
      "question": "Variables declared inside a function are accessible anywhere outside that function by default.",
      "correctAnswer": false,
      "explanation": "Local variables declared within a function possess local/function scope and are not accessible outside the function.",
      "source": {
        "module": "Module 3 - Functions & Recursion",
        "page": 22
      }
    },
    {
      "id": "cs101-q04",
      "type": "fill-blank",
      "topic": "Functions & Scope",
      "question": "A function that calls itself during its execution is known as a _____ function.",
      "acceptedAnswers": [
        "recursive",
        "recursion"
      ],
      "explanation": "Recursion occurs when a function solves a problem by calling copies of itself to solve smaller instances of the same problem.",
      "source": {
        "module": "Module 3 - Functions & Recursion",
        "page": 28
      }
    }
  ]
}
```

---

# Source Metadata

Each generated question includes source information:

```json
"source": {
  "module": "Module 2",
  "page": 14
}
```

Source metadata exists primarily for maintainers to verify generated questions against the original academic material.

The student interface does not need to display source metadata.

---

# Reviewer Validation

Reviewer files are validated before being used.

Validation should detect problems including:

- Missing required fields
- Unsupported schema versions
- Unsupported question types
- Duplicate question IDs
- Missing choices
- Correct answers not present in choices
- Missing fill-in accepted answers
- Invalid source metadata
- Empty reviewers

Example validation error:

```text
Reviewer validation failed:

reviewers/year-1/IT0123/midterm.json

Question q017:
correctAnswer "Router" does not exist in choices.
```

Invalid reviewer data should not silently enter the application.

---

# Scoring

Scoring is deterministic.

The application uses only information contained in reviewer JSON.

It does not use:

- Generative AI
- External APIs
- Web searches
- Semantic answer evaluation

Conceptually:

```text
question + student answer
            ↓
       scoring engine
            ↓
 correct / incorrect / unanswered
```

---

# Fill-in-the-Blank Matching

Before comparison, answers are normalized.

At minimum:

1. Trim leading/trailing whitespace.
2. Convert text to lowercase.

Therefore:

```text
DHCP
dhcp
 DHCP 
```

are equivalent.

If several answers should be accepted, they must appear explicitly in `acceptedAnswers`.

---

# Reviewer Progress

The MVP stores unfinished attempts locally in the student's browser.

Saved information includes:

- Reviewer ID
- Current question
- Answers
- Question order
- Choice order
- Start time
- Completion state

This allows an unfinished attempt to be resumed after a refresh or accidental browser closure.

No account or cloud synchronization is required for the MVP.

---

# Custom Practice Sessions

Students can customize their study sessions rather than taking an entire reviewer at once:

1. **Module & Syllabus Filtering**:
   - Students can select any combination of modules (e.g. only Module 1 and Module 3).
   - Module options and available question counts are dynamically derived from `q.source.module` without any hardcoding.
2. **Session Question Count**:
   - Students can choose how many questions they wish to answer in a session (e.g. 5, 10, 20, 50, or a custom number).
   - If the selected question count is smaller than the available pool in the chosen modules, questions are randomly sampled according to reviewer shuffle settings.
3. **Answer Feedback Timing (Instant vs. At End)**:
   - **At the End (Exam Mode)**: Answer all questions under standard exam conditions; receive score, correctness status, and explanations upon submission.
   - **Right Away (Practice Mode)**: Verify answers immediately with a "Check Answer" action; shows instant `✓ Correct` or `✗ Incorrect` status, expected answers, and complete explanations.
   - **Live In-Quiz Toggle**: Students can switch Instant Answers ON or OFF on the fly during any active session.
4. **Session State & Scoring**:
   - The question palette, progress bar, deterministic scoring, and answer review automatically adjust to the exact subset selected (e.g. `Score: 8 / 10 (80%)`).
   - In immediate feedback mode, checked questions are highlighted in the question palette (emerald for correct, rose for incorrect).
   - Browser `localStorage` persists the session configuration (`sessionConfig: { questionCount, selectedModules, feedbackTiming }`) and checked questions, so refreshing resumes cleanly.
   - After completing a session, students can retry with identical settings or reconfigure.

---

# Development

## Install Dependencies

Once the project is initialized:

```bash
npm install
```

## Start Development Server

```bash
npm run dev
```

Then open the local URL reported by Next.js.

---

# Testing

The repository uses **Vitest** for fast, deterministic unit and integration testing.

Run all automated test suites:

```bash
npm test
```

Run tests with interactive watcher during development:

```bash
npx vitest
```

### Test Suites Covered:
- **Schema Validation** (`src/tests/reviewerSchema.test.ts`): Strict schema rejection, duplicate choice/ID rejection, multiple-answer requirements.
- **Content Discovery** (`src/tests/reviewerCatalog.test.ts`, `src/tests/contentBrowsing.test.ts`, `src/tests/seedContent.test.ts`): Dynamic grouping, multi-field search.
- **Deterministic Scoring** (`src/tests/scoring.test.ts`): Whitespace/case normalization, set equality, true/false, percentage scoring.
- **Randomization** (`src/tests/randomization.test.ts`): Fisher-Yates shuffle, option preservation, attempt-level freezing.
- **Session Persistence** (`src/tests/persistence.test.ts`): `localStorage` save/load/clear, corrupted state recovery, question count verification.
- **Submission Handling** (`src/tests/submissionHandling.test.ts`): Unanswered warnings, partial submissions, zero-answer scoring.
- **Accessibility & Review** (`src/tests/accessibility.test.ts`, `src/tests/answerReview.test.ts`, `src/tests/quizEngine.test.ts`).

---

# Code Quality & Linting

Run ESLint to check for code standards and accessibility linting:

```bash
npm run lint
```

---

# Production Build

Compile an optimized production Next.js build:

```bash
npm run build
```

The production build runs TypeScript type checking, static page pre-rendering, and asset optimization. Ensure `npm test` and `npm run lint` both pass before building for production.

To run the production server locally after building:

```bash
npm start
```

---

# Deployment

### Vercel Deployment (Recommended)
This Next.js application is pre-configured for zero-configuration deployment to [Vercel](https://vercel.com):
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Import the repository in the Vercel dashboard.
3. Keep the default Framework Preset (`Next.js`).
4. Click **Deploy**.

Reviewers stored in `reviewers/` are automatically packaged with the server runtime and discovered on demand. No external database or credentials are required for MVP operation.

### Node.js / Container Deployment
The application can also be deployed to any Docker or Node.js hosting platform:
```bash
npm run build
NODE_ENV=production npm start
```

---

# Practice Sessions & Instant Feedback

In addition to full reviewer attempts, students can customize practice sessions:

- **Module Filtering**: Select specific modules (e.g. Modules 1 & 3) to focus study on target topics.
- **Adjustable Session Length**: Choose preset question counts (5, 10, 20, 50) or specify a custom count. Questions are sampled deterministically.
- **Answer Feedback Timing**:
  - **Instant Answers Mode**: Immediate per-question checking with `✓ Correct` / `✗ Incorrect` badges, option color-coding, rationale display, and retry capabilities.
  - **End of Quiz Mode**: Score and detailed breakdown presented upon submission.
- **Desktop Sidebar Question Navigator**: Sticky question grid palette on desktop displays question status and provides instant jump-to-question navigation without vertical page scrolling.
- **Stationary Action Bar**: Fixed Next / Previous / Finish buttons positioned immediately beneath question options.
- **Keyboard Shortcuts**: `←` Left Arrow for Previous question, `→` Right Arrow for Next question.

---

# Visual Design System: Connected Learning

The UI implements the purple/green connected-learning direction defined in [`DESIGN.md`](./DESIGN.md):

- **Deep purple foundation**: `#0B0914`, `#12101D`, and `#181526` provide a focused reading environment.
- **Purple signal**: `#8B5CF6` and `#A78BFA` mark brand, active states, and navigation.
- **Green progress**: `#34D399` and `#059669` signal movement, completion, and verified correctness.
- **Sparse synapse motif**: connected lines and nodes suggest relationships between subjects without crowding question content.
- **Solid surfaces**: clear borders and restrained depth replace glassmorphism, backdrop blur, and translucent panels.
- **Accessible indicators**: correctness is never communicated via color alone; text and symbols (`✓ Correct`, `✗ Incorrect`, `○ Unanswered`) accompany all state changes.

---

# Development Documents

The project uses three primary planning documents.

## `SPEC.md`

Defines **what the application must do**.

This is the authoritative requirements document.

Do not modify it unless project requirements intentionally change.

## `IMPLEMENTATION_PLAN.md`

Defines **how the application will be built**.

It may contain:

- architectural decisions
- component plans
- file structures
- library decisions
- implementation approaches

This document may evolve as implementation progresses.

## `TASKS.md`

Tracks **what work has been completed and what remains**.

The coding agent should update this file throughout development.

---

# Content Pipeline

The long-term content workflow should remain simple:

```text
Professor / Course Modules
            ↓
     Question Bank GPT
            ↓
     reviewer-name.json
            ↓
       /reviewers
            ↓
    automatic validation
            ↓
          website
            ↓
         students
```

The primary goal is that adding academic content should be a **content-management task rather than a software-development task**.

A maintainer should not need to understand React or modify application logic simply to add another reviewer.

---

# MVP Philosophy

Prioritize:

- Reliability
- Accurate scoring
- Simple content management
- Mobile usability
- Maintainability
- Clear separation between content and code

Avoid unnecessary complexity during the initial release.

Features such as accounts, databases, dashboards, analytics, leaderboards, and cloud synchronization can be added later if they solve an actual project requirement.
