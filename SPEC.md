
# Centralized Academic Reviewer Website

## 1. Project Overview

Build a responsive web application that serves as a centralized repository of interactive academic reviewers for multiple subjects and year levels.

The website is a **content delivery platform**, not a question-generation platform.

Reviewer questions will be created externally through a separate Question Bank Generator that processes academic module PDFs and outputs standardized JSON reviewer files.

The website's responsibility is to:

1. Discover valid reviewer JSON files.
2. Organize them by year level and subject.
3. Display available reviewers.
4. Run interactive review sessions.
5. Validate student answers.
6. Calculate scores.
7. Display results and answer explanations.

Students should not need an account to access reviewers.

---

# 2. System Architecture

The overall workflow is:

```text
Academic Module PDFs
        â”‚
        â–¼
External Question Bank Generator
        â”‚
        â”‚ Generates standardized JSON
        â–¼
Reviewer JSON File
        â”‚
        â–¼
Website Reviewer Directory
        â”‚
        â–¼
Schema Validation
        â”‚
    â”Œâ”€â”€â”€â”´â”€â”€â”€â”€â”
    â”‚        â”‚
  VALID    INVALID
    â”‚        â”‚
    â–¼        â–¼
Website    Build /
Reviewer   Validation Error
```

The two systems must remain independent.

## Question Bank Generator

Responsible for:

- reading module PDFs
- identifying examinable concepts
- generating questions
- generating answer choices
- determining correct answers
- generating explanations
- tracking source information
- outputting valid reviewer JSON

## Reviewer Website

Responsible for:

- loading JSON
- validating JSON structure
- displaying reviewers
- presenting questions
- accepting answers
- checking answers
- calculating scores
- displaying explanations
- saving local progress

The website must **not**:

- read academic PDFs
- generate questions using AI
- call an AI API to answer questions
- use external sources to determine correctness
- modify generated questions automatically

---

# 3. Core Design Principle

The JSON schema is the contract between the Question Bank Generator and the website.

```text
                 reviewer.schema
                       â”‚
              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”
              â–¼                 â–¼
       Question Generator     Website
          PRODUCES            CONSUMES
             â”‚                   â”‚
             â””â”€â”€â”€â”€ JSON â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

Both systems must follow the same schema.

Changing the schema should be treated as an explicit versioned change.

---

# 4. Primary User Flow

The student flow should be:

```text
Home
 â†“
Year Level
 â†“
Subject
 â†“
Reviewer
 â†“
Reviewer Session
 â†“
Results
 â†“
Answer Review
```

Example:

```text
Home
 â†“
1st Year
 â†“
IT0123 â€” Networking Fundamentals
 â†“
Midterm Reviewer
 â†“
60 Questions
 â†“
47 / 60
 â†“
Review Incorrect Answers
```

Users should also be able to search directly for subjects and reviewers.

---

# 5. Content Directory

Reviewer content should exist separately from application logic.

Recommended structure:

```text
reviewers/

â”œâ”€â”€ year-1/
â”‚   â”œâ”€â”€ IT0123/
â”‚   â”‚   â”œâ”€â”€ midterm.json
â”‚   â”‚   â””â”€â”€ module-1.json
â”‚   â”‚
â”‚   â”œâ”€â”€ CS001/
â”‚   â”‚   â””â”€â”€ midterm.json
â”‚
â”œâ”€â”€ year-2/
â”‚   â”œâ”€â”€ CS020/
â”‚   â”‚   â””â”€â”€ midterm.json
â”‚
â”œâ”€â”€ year-3/
â”‚
â””â”€â”€ year-4/
```

The system must not require frontend code changes when a valid reviewer file is added.

For example:

```text
reviewers/year-1/IT0123/midterm.json
```

should automatically become available through the website's content-loading system.

---

# 6. Reviewer JSON Format

Every reviewer must follow a standardized structure.

Example:

```json
{
  "schemaVersion": 1,
  "id": "it0123-midterm",
  "subject": {
    "code": "IT0123",
    "name": "Networking Fundamentals",
    "yearLevel": 1
  },
  "reviewer": {
    "title": "Midterm Reviewer",
    "description": "Reviewer covering Modules 1â€“4.",
    "coverage": [
      "Module 1",
      "Module 2",
      "Module 3",
      "Module 4"
    ],
    "shuffleQuestions": true,
    "shuffleChoices": true
  },
  "questions": []
}
```

The exact schema should be formally defined within the project.

---

# 7. Question Schema

Every question requires:

```text
id
type
question
topic
explanation
source
```

Additional fields depend on the question type.

Example multiple-choice question:

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

The `source` field exists primarily for content verification and provenance.

The student-facing interface does **not** need to display the source unless explicitly enabled later.

---

# 8. Supported Question Types

The MVP must support four question types.

## 8.1 Multiple Choice â€” Single Answer

```json
{
  "id": "q001",
  "type": "multiple-choice",
  "topic": "OSI Model",
  "question": "Which layer handles routing?",
  "choices": [
    "Physical",
    "Data Link",
    "Network",
    "Transport"
  ],
  "correctAnswer": "Network",
  "explanation": "Routing occurs at the Network layer.",
  "source": {
    "module": "Module 2",
    "page": 14
  }
}
```

Render using radio buttons or equivalent single-selection controls.

---

# 8.2 Multiple Choice â€” Multiple Answers

```json
{
  "id": "q002",
  "type": "multiple-answer",
  "topic": "Transport Layer",
  "question": "Which protocols operate at the transport layer?",
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
  "explanation": "TCP and UDP are transport-layer protocols.",
  "source": {
    "module": "Module 2",
    "page": 20
  }
}
```

Render using checkboxes.

The answer is correct only when the selected set exactly matches the correct-answer set.

---

# 8.3 True or False

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

# 8.4 Fill in the Blank

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

Answer validation must:

- trim leading/trailing whitespace
- ignore capitalization
- support multiple accepted answers

For example:

```text
DHCP
dhcp
 DHCP
```

should be considered equivalent.

Do not use generative AI to determine whether a fill-in-the-blank answer is correct.

---

# 9. Schema Versioning

Every reviewer must contain:

```json
"schemaVersion": 1
```

The application should reject unsupported schema versions with a clear development/build error.

This allows the JSON format to evolve later without silently breaking existing reviewers.

---

# 10. Reviewer Validation

Create a formal reviewer schema using Zod or an equivalent validation library.

Validate reviewer files before making them available.

Check:

- required fields
- supported schema version
- valid year level
- valid question types
- unique reviewer IDs
- unique question IDs within a reviewer
- non-empty question text
- non-empty choices where required
- correct answers exist among available choices
- multiple-answer questions contain valid answers
- fill-blank questions contain at least one accepted answer
- valid source metadata
- valid subject metadata

Invalid content should fail clearly during development/build.

Example:

```text
Reviewer validation failed:

reviewers/year-1/IT0123/midterm.json

Question q017:
correctAnswer "Router" does not exist in choices.
```

Do not silently ignore malformed questions.

---

# 11. Home Page

Create a clean landing page containing:

- project name
- short description
- search bar
- year-level cards
- recently added or featured reviewers, if useful
- available reviewer count

Example:

```text
MIDTERM REVIEWERS

Study reviewers from your subjects.

[ Search subjects or reviewers... ]

1st Year
24 Reviewers

2nd Year
18 Reviewers

3rd Year
12 Reviewers

4th Year
8 Reviewers
```

Exact visual design may vary.

---

# 12. Year-Level Browser

Selecting a year level should show the subjects with available reviewers.

Example:

```text
1ST YEAR

IT0123
Networking Fundamentals
2 Reviewers

CS001
Computer Programming
1 Reviewer

MATH001
College Mathematics
1 Reviewer
```

Subjects should be derived from reviewer metadata rather than manually hard-coded.

---

# 13. Subject Page

Display:

- subject code
- subject name
- year level
- available reviewers

Example:

```text
IT0123
Networking Fundamentals

Available Reviewers

Midterm Reviewer
Modules 1â€“4
60 Questions

Module 1 Reviewer
25 Questions
```

---

# 14. Reviewer Information Page

Before beginning, display:

- subject
- reviewer title
- description
- coverage
- number of questions
- question types included

Example:

```text
Networking Fundamentals

MIDTERM REVIEWER

Coverage:
Modules 1â€“4

60 Questions

Question Types:
â€¢ Multiple Choice
â€¢ Multiple Answer
â€¢ True / False
â€¢ Fill in the Blank

[ Start Reviewer ]
```

Source pages/module references do not need to be shown here.

---

# 15. Quiz Interface

The quiz interface should prioritize the current question.

Display:

- reviewer title
- question number
- progress
- question
- answer controls
- Previous
- Next
- Finish Reviewer

Example:

```text
Networking Fundamentals

Question 14 of 60                  23%

----------------------------------------

Which OSI layer handles routing?

â—‹ Physical

â—‹ Data Link

â—‹ Network

â—‹ Transport

----------------------------------------

[ Previous ]              [ Next ]
```

Selected answers must remain selected when navigating between questions.

---

# 16. Reviewer Modes

Support two possible modes.

## Practice Mode

Allow students to check an answer before continuing.

Display:

```text
âœ“ Correct
```

or:

```text
âœ— Incorrect

Correct answer:
Network

Explanation:
The Network layer is responsible for routing.
```

## Test Mode

Do not reveal answers during the reviewer.

Answers and explanations are shown after submission.

For the initial MVP, Practice Mode may be implemented first if implementing both modes adds unnecessary complexity.

The architecture should allow Test Mode to be added without rewriting the quiz engine.

---

# 17. Question Navigation

Students should be able to:

- go forward
- go backward
- modify answers before final submission
- see progress

Optionally provide a question navigator:

```text
1  2  3  4  5
6  7  8  9  10
```

States can indicate:

- answered
- unanswered
- current question

Do not expose correctness before submission when using Test Mode.

---

# 18. Question Randomization

Reviewer metadata controls randomization:

```json
"shuffleQuestions": true,
"shuffleChoices": true
```

When enabled:

- shuffle questions once when an attempt starts
- shuffle eligible answer choices once
- preserve the shuffled order throughout the attempt

Do not reshuffle because of React rerenders, navigation, or refreshes.

True/False options should normally remain:

```text
True
False
```

rather than being randomly reordered.

---

# 19. Progress Persistence

Use browser storage for the MVP.

Store:

- reviewer ID
- schema version
- start time
- current question
- question order
- shuffled choice order
- selected answers
- completion state

Refreshing or accidentally closing the browser should not immediately destroy an unfinished attempt.

When returning to an unfinished reviewer, provide:

```text
You have an unfinished attempt.

[ Resume ]

[ Start Over ]
```

---

# 20. Submission

Allow students to submit at any point.

If questions remain unanswered, display a confirmation:

```text
You have 7 unanswered questions.

Submit anyway?

[ Continue Reviewing ]

[ Submit ]
```

Unanswered questions count as incorrect for score calculation but should remain distinguishable as `unanswered` in the results.

---

# 21. Results

After completion display:

```text
REVIEWER COMPLETE

47 / 60

78.3%

Correct       47
Incorrect      9
Unanswered     4

[ Review Answers ]

[ Retry Reviewer ]

[ Return to Subject ]
```

Calculate results deterministically from the reviewer JSON and student's answers.

No AI should participate in scoring.

---

# 22. Answer Review

Allow students to inspect completed questions.

For each question display:

- question
- student's answer
- correct answer
- status
- explanation

Provide filters:

```text
All | Correct | Incorrect | Unanswered
```

Source metadata does not need to be displayed to students.

It should remain available internally in the reviewer data for content auditing.

---

# 23. Retry Behavior

Provide:

```text
Retry Reviewer
```

Starting a new attempt should clear the previous active attempt.

If question shuffling is enabled, a retry may generate a new randomized question/choice order.

---

# 24. Search

Implement site-wide search.

Search:

- subject code
- subject name
- reviewer title
- coverage
- topics

Examples:

```text
IT0123

networking

programming

module 3
```

Searching individual question text is not necessary for the MVP.

---

# 25. Content Discovery

Do not maintain a manually coded list of every reviewer.

The content-loading system should discover valid reviewer files automatically.

Conceptually:

```text
/reviewers
     â†“
discover JSON files
     â†“
validate
     â†“
extract metadata
     â†“
group by year
     â†“
group by subject
     â†“
display
```

Adding:

```text
reviewers/year-2/CS020/midterm.json
```

should not require editing a React component containing something like:

```text
reviewers = [...]
```

---

# 26. External Question Generation

Question generation exists outside this application.

The expected content pipeline is:

```text
Module PDFs
     â†“
Question Bank Generator
     â†“
reviewer.json
     â†“
Website repository
```

The website should make no assumptions about how the JSON was generated.

Its only requirement is that the file conforms to the reviewer schema.

This means reviewer files could theoretically be:

- AI-generated
- manually written
- converted from another system

without affecting the website.

---

# 27. Source Metadata

Questions generated from academic material should include:

```json
"source": {
  "module": "Module 2",
  "page": 14
}
```

Multiple source pages may eventually be supported.

This metadata exists so maintainers can verify generated questions against the original material.

Source metadata should:

- remain part of reviewer JSON
- be validated
- remain accessible to maintainers
- not necessarily appear to students

The website should never use external sources to alter or verify answers at runtime.

---

# 28. Recommended Technology Stack

Use:

### Framework

Next.js

### Language

TypeScript

### UI

React

### Styling

Tailwind CSS

### Schema Validation

Zod

### Reviewer Storage

JSON

### Progress Storage

Browser `localStorage`

### Testing

Use the testing framework most appropriate for the chosen Next.js setup.

### Deployment

Vercel or equivalent.

Avoid unnecessary infrastructure during the MVP.

Do not introduce a database unless later features require one.

---

# 29. Application Structure

Recommended architecture:

```text
project/

â”œâ”€â”€ reviewers/
â”‚   â”œâ”€â”€ year-1/
â”‚   â”œâ”€â”€ year-2/
â”‚   â”œâ”€â”€ year-3/
â”‚   â””â”€â”€ year-4/
â”‚
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ quiz/
â”‚   â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ schemas/
â”‚   â”œâ”€â”€ types/
â”‚   â””â”€â”€ utils/
â”‚
â”œâ”€â”€ public/
â”‚
â”œâ”€â”€ SPEC.md
â”œâ”€â”€ TASKS.md
â”œâ”€â”€ README.md
â””â”€â”€ package.json
```

Exact organization may vary when technically justified.

---

# 30. Quiz Architecture

Build reusable components.

Example:

```text
quiz/

â”œâ”€â”€ QuizEngine
â”œâ”€â”€ QuestionRenderer
â”œâ”€â”€ QuizProgress
â”œâ”€â”€ QuizNavigation
â”œâ”€â”€ AnswerFeedback
â”œâ”€â”€ QuizResults
â”‚
â””â”€â”€ questions/
    â”œâ”€â”€ MultipleChoiceQuestion
    â”œâ”€â”€ MultipleAnswerQuestion
    â”œâ”€â”€ TrueFalseQuestion
    â””â”€â”€ FillBlankQuestion
```

`QuestionRenderer` should select the correct UI according to:

```text
question.type
```

Conceptually:

```text
multiple-choice
      â†“
MultipleChoiceQuestion

multiple-answer
      â†“
MultipleAnswerQuestion

true-false
      â†“
TrueFalseQuestion

fill-blank
      â†“
FillBlankQuestion
```

Adding future question types should not require rewriting the entire quiz engine.

---

# 31. Scoring Architecture

Keep scoring logic separate from visual components.

For example, conceptually:

```text
checkAnswer(question, studentAnswer)
```

returns:

```text
correct
incorrect
unanswered
```

Scoring functions should be pure and independently testable.

Do not determine correctness by:

- AI
- fuzzy semantic similarity
- external APIs
- web searches

Use only the answer information contained in the reviewer JSON.

---

# 32. Fill-in-the-Blank Normalization

Normalize answers before comparison.

At minimum:

```text
trim whitespace
convert to lowercase
```

Therefore:

```text
"DHCP"
"dhcp"
" DHCP "
```

should match.

Do not introduce aggressive fuzzy matching because it may incorrectly accept wrong academic answers.

Accepted variants should instead be explicitly included:

```json
"acceptedAnswers": [
  "DHCP",
  "Dynamic Host Configuration Protocol"
]
```

---

# 33. Responsive Design

Support:

- desktop
- laptop
- tablet
- mobile

Prioritize mobile usability because students may use the reviewer from phones.

Requirements include:

- large touch targets
- readable text
- responsive cards
- no required horizontal scrolling
- quiz navigation accessible on small screens

---

# 34. Accessibility

Implement:

- semantic HTML
- keyboard navigation
- visible focus indicators
- appropriate labels
- accessible radio buttons
- accessible checkboxes
- sufficient contrast

Do not communicate correctness through color alone.

Use:

```text
âœ“ Correct
```

and:

```text
âœ— Incorrect
```

along with visual styling.

---

# 35. Error Handling

Handle:

- reviewer not found
- subject not found
- malformed JSON
- unsupported schema version
- invalid question
- zero-question reviewer
- duplicate question IDs
- invalid correct answers
- browser storage unavailable
- corrupted saved attempt
- direct navigation to invalid results
- unanswered questions

Development errors involving reviewer content should clearly identify the relevant file and question.

---

# 36. MVP Scope

## Required

Implement:

- home page
- year-level browsing
- subject pages
- reviewer pages
- search
- JSON content loading
- JSON schema validation
- automatic reviewer discovery
- multiple choice
- multiple answer
- true/false
- fill in the blank
- quiz navigation
- progress tracking
- scoring
- results
- answer review
- explanations
- question randomization
- choice randomization
- local progress persistence
- responsive design
- accessibility basics

## Not Required

Do not prioritize:

- student accounts
- AI integration
- PDF processing
- question generation
- instructor accounts
- database
- leaderboards
- multiplayer
- social features
- cloud-synchronized attempts
- analytics dashboards
- Excel imports
- CSV imports

These may be considered later.

---

# 37. Initial Seed Content

Create demo reviewer files for development.

Include at least:

- 2 year levels
- 3 subjects
- 2 complete reviewers
- 15â€“20 total demo questions

Include examples of every supported question type.

Clearly identify demo questions so they can be removed when real generated reviewer files are available.

---

# 38. Automated Testing

At minimum test:

- reviewer schema validation
- invalid schema rejection
- duplicate IDs
- multiple-choice scoring
- multiple-answer scoring
- true/false scoring
- fill-blank normalization
- alternative accepted answers
- unanswered questions
- score calculation
- question randomization
- choice randomization
- persistence
- restored attempts

The core scoring and validation systems should be testable without rendering the entire UI.

---

# 39. README

Create a comprehensive `README.md`.

Document:

- project purpose
- installation
- development setup
- running locally
- building
- testing
- deployment
- folder structure
- reviewer JSON schema
- supported question types
- how scoring works
- how to add a reviewer
- how schema validation works

Most importantly, document the content workflow:

```text
1. Generate reviewer JSON externally.
2. Validate that it conforms to the project's schema.
3. Place it in the appropriate /reviewers directory.
4. Run validation/tests.
5. Reviewer becomes available through the application.
```

Provide a complete example reviewer JSON file.

---

# 40. TASKS.md

Create and maintain:

```text
TASKS.md
```

Use it to track implementation progress.

The coding agent may update `TASKS.md`.

The coding agent should **not modify `SPEC.md`** unless explicitly instructed to change project requirements.

---

# 41. Development Sequence

## Phase 1 â€” Foundation

Set up:

- Next.js
- TypeScript
- Tailwind
- project structure
- shared layout
- routing

Verify that the application runs.

---

## Phase 2 â€” Reviewer Contract

Implement before building the quiz UI:

- TypeScript reviewer types
- question types
- reviewer JSON schema
- schema versioning
- Zod validation
- reviewer discovery
- content-loading utilities

This phase is especially important.

The final schema created here becomes the contract used by the external Question Bank Generator.

---

## Phase 3 â€” Seed Content

Create representative reviewer JSON files containing all supported question types.

Verify that invalid files are rejected.

---

## Phase 4 â€” Content Browsing

Implement:

- home page
- year levels
- subjects
- reviewer listings
- reviewer information page
- search

All content should derive from reviewer metadata.

---

## Phase 5 â€” Quiz Engine

Implement:

- QuizEngine
- QuestionRenderer
- MultipleChoiceQuestion
- MultipleAnswerQuestion
- TrueFalseQuestion
- FillBlankQuestion
- answer state
- navigation
- progress

---

## Phase 6 â€” Scoring

Implement and test:

- answer checking
- unanswered detection
- score calculation
- fill-blank normalization
- multiple-answer comparison

---

## Phase 7 â€” Results

Implement:

- result summary
- answer review
- filtering
- explanations
- retry

---

## Phase 8 â€” Randomization

Implement:

- question shuffling
- choice shuffling
- stable randomized sessions

---

## Phase 9 â€” Persistence

Implement:

- localStorage
- resume
- restart
- corrupted-state handling

---

## Phase 10 â€” QA

Verify:

- mobile
- desktop
- accessibility
- keyboard usage
- refresh/resume
- scoring
- invalid reviewer files
- malformed URLs
- edge cases

---

## Phase 11 â€” Documentation

Complete:

- README
- schema documentation
- sample reviewer
- contributor/content instructions

---

## Phase 12 â€” Deployment

Prepare production build and deployment.

---

# 42. Important Engineering Requirements

Throughout development:

1. Do not hard-code reviewer questions into React components.
2. Do not hard-code the list of subjects when it can be derived from reviewer metadata.
3. Keep reviewer content separate from application logic.
4. Treat reviewer JSON as the authoritative runtime content.
5. Validate reviewer files.
6. Version the reviewer schema.
7. Keep scoring deterministic.
8. Keep scoring logic separate from UI logic.
9. Do not use AI at runtime.
10. Do not use external information to determine correct answers.
11. Do not require student accounts.
12. Do not introduce a database without a concrete requirement.
13. Make adding reviewer content simple.
14. Maintain mobile usability.
15. Keep the codebase understandable for future student maintainers.

---

# 43. Definition of Done

The MVP is complete when this workflow works:

```text
Question Bank Generator
        â†“
generates reviewer JSON
        â†“
maintainer places JSON in /reviewers
        â†“
website validates JSON
        â†“
reviewer automatically becomes discoverable
        â†“
student opens website
        â†“
selects year
        â†“
selects subject
        â†“
selects reviewer
        â†“
answers mixed question types
        â†“
submits
        â†“
receives score
        â†“
reviews answers and explanations
```

Adding a valid reviewer JSON file must **not require changing application logic or manually creating a new webpage**.

The website and Question Bank Generator are separate systems connected through the standardized reviewer JSON schema.