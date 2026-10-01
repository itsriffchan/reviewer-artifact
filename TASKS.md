
# Project Tasks

This file tracks implementation progress for the Centralized Academic Reviewer Website.

For complete project requirements, refer to [`SPEC.md`](./SPEC.md).

For technical implementation decisions, refer to [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).

## Agent Instructions

- Treat `SPEC.md` as the authoritative source of requirements.
- Do not modify `SPEC.md` unless explicitly instructed.
- Keep this file updated as implementation progresses.
- Mark a task complete only after its implementation has been tested or otherwise verified.
- Do not mark an entire phase complete while required subtasks remain incomplete.
- Record important implementation notes or blockers under the relevant phase.
- Keep the application in a runnable state after each major phase.

---

# Phase 1 — Foundation

## Project Setup

- [x] Initialize Next.js project.
- [x] Configure TypeScript.
- [x] Configure Tailwind CSS.
- [x] Configure linting.
- [x] Establish project folder structure.
- [x] Create shared application layout.
- [x] Create basic navigation/header.
- [x] Configure base responsive styles.
- [x] Add basic error/not-found handling.

## Verification

- [x] Development server starts successfully.
- [x] Production build succeeds.
- [x] No TypeScript errors.
- [x] Base application renders correctly on desktop.
- [x] Base application renders correctly on mobile.

---

# Phase 2 — Reviewer Contract

This phase must be completed before the external Question Bank Generator is finalized.

## Type Definitions

- [x] Define `Reviewer` type.
- [x] Define `Subject` type.
- [x] Define reviewer metadata types.
- [x] Define source metadata type.
- [x] Define shared base question type.
- [x] Define `MultipleChoiceQuestion`.
- [x] Define `MultipleAnswerQuestion`.
- [x] Define `TrueFalseQuestion`.
- [x] Define `FillBlankQuestion`.
- [x] Define union type for all supported questions.

## Schema

- [x] Establish `schemaVersion: 1`.
- [x] Create formal reviewer validation schema using Zod.
- [x] Validate subject metadata.
- [x] Validate reviewer metadata.
- [x] Validate question IDs.
- [x] Validate question types.
- [x] Validate choices.
- [x] Validate correct answers.
- [x] Validate accepted fill-in-the-blank answers.
- [x] Validate source metadata.
- [x] Reject unsupported schema versions.

## Content Discovery

- [x] Create `/reviewers` content directory.
- [x] Implement automatic JSON reviewer discovery.
- [x] Load reviewer metadata.
- [x] Group reviewers by year level.
- [x] Group reviewers by subject.
- [x] Prevent application components from requiring a manually maintained reviewer list.

## Validation Errors

- [x] Produce readable errors for malformed reviewer files.
- [x] Include filename in validation errors.
- [x] Include question ID when applicable.
- [x] Reject duplicate question IDs.
- [x] Reject invalid correct answers.
- [x] Reject reviewers containing zero questions.

## Verification

- [x] Valid reviewer JSON passes validation.
- [x] Invalid reviewer JSON fails validation.
- [x] Unsupported schema version fails validation.
- [x] Duplicate IDs are detected.
- [x] Invalid answer references are detected.
- [x] Adding a valid reviewer requires no React component changes.

---

# Phase 3 — Seed Content

- [x] Add at least two sample year levels.
- [x] Add at least three sample subjects.
- [x] Add at least two complete sample reviewers.
- [x] Add 15–20 total sample questions.
- [x] Include single-answer multiple choice.
- [x] Include multiple-answer questions.
- [x] Include true/false questions.
- [x] Include fill-in-the-blank questions.
- [x] Include explanations.
- [x] Include source metadata.
- [x] Clearly identify content as demo/seed content.

## Verification

- [x] All seed reviewer files pass schema validation.
- [x] Every supported question type is represented.
- [x] Seed content can be removed without affecting application logic.

---

# Phase 4 — Content Browsing

## Home Page

- [x] Create landing page.
- [x] Add project title/description.
- [x] Add year-level navigation.
- [x] Add reviewer counts where appropriate.
- [x] Add search interface.

## Year-Level Pages

- [x] Display subjects for selected year level.
- [x] Display subject codes.
- [x] Display subject names.
- [x] Display available reviewer counts.

## Subject Pages

- [x] Display subject metadata.
- [x] Display available reviewers.
- [x] Display reviewer coverage.
- [x] Display question counts.

## Reviewer Information

- [x] Create reviewer information page.
- [x] Display title.
- [x] Display description.
- [x] Display coverage.
- [x] Display total questions.
- [x] Display included question types.
- [x] Add Start Reviewer action.

## Search

- [x] Search by subject code.
- [x] Search by subject name.
- [x] Search by reviewer title.
- [x] Search by coverage.
- [x] Search by topic.
- [x] Provide useful empty search state.

## Verification

- [x] Browser content is derived from reviewer JSON.
- [x] No subject/reviewer pages require hard-coded content.
- [x] Invalid URLs display appropriate error/not-found state.

---

# Phase 5 — Quiz Engine

## Core Engine

- [x] Create `QuizEngine`.
- [x] Create `QuestionRenderer`.
- [x] Create answer-state model.
- [x] Track current question.
- [x] Track answered/unanswered state.

## Question Components

- [x] Create `MultipleChoiceQuestion`.
- [x] Create `MultipleAnswerQuestion`.
- [x] Create `TrueFalseQuestion`.
- [x] Create `FillBlankQuestion`.

## Navigation

- [x] Add Previous button.
- [x] Add Next button.
- [x] Add Finish Reviewer button.
- [x] Preserve answers when navigating.
- [x] Display current question number.
- [x] Display progress.
- [x] Consider question navigator/grid if appropriate.

## Verification

- [x] Every question type renders correctly.
- [x] Answers remain selected after navigating backward/forward.
- [x] Quiz works on desktop.
- [x] Quiz works on mobile.
- [x] Keyboard interaction works where applicable.

---

# Phase 6 — Scoring

- [x] Create scoring logic separate from UI components.
- [x] Implement multiple-choice checking.
- [x] Implement multiple-answer checking.
- [x] Implement true/false checking.
- [x] Implement fill-in-the-blank checking.
- [x] Normalize fill-in-the-blank whitespace.
- [x] Normalize fill-in-the-blank capitalization.
- [x] Support multiple accepted fill-in answers.
- [x] Detect unanswered questions.
- [x] Calculate correct count.
- [x] Calculate incorrect count.
- [x] Calculate unanswered count.
- [x] Calculate percentage.

## Verification

- [x] Scoring functions have automated tests.
- [x] Multiple-answer questions require an exact correct set.
- [x] Fill-in answers do not use fuzzy/AI matching.
- [x] Unanswered questions are distinguished from incorrect answers.
- [x] No external service is used for scoring.

---

# Phase 7 — Results and Answer Review

## Results

- [x] Create results page.
- [x] Display raw score.
- [x] Display percentage.
- [x] Display correct count.
- [x] Display incorrect count.
- [x] Display unanswered count.
- [x] Add Retry Reviewer.
- [x] Add Return to Subject.

## Answer Review

- [x] Display question.
- [x] Display student's answer.
- [x] Display correct answer.
- [x] Display correctness status.
- [x] Display explanation.
- [x] Add All filter.
- [x] Add Correct filter.
- [x] Add Incorrect filter.
- [x] Add Unanswered filter.

## Verification

- [x] Results match scoring engine output.
- [x] Answer-review filters work correctly.
- [x] Source metadata is not unnecessarily exposed in student UI.

---

# Phase 8 — Randomization

- [x] Implement optional question shuffling.
- [x] Implement optional choice shuffling.
- [x] Do not shuffle True/False ordering unnecessarily.
- [x] Shuffle only when an attempt begins.
- [x] Preserve shuffled question order during session.
- [x] Preserve shuffled choice order during session.
- [x] Generate new shuffle on retry when enabled.

## Verification

- [x] React rerenders do not reshuffle questions.
- [x] Navigation does not reshuffle questions.
- [x] Correct-answer checking still works after choice shuffling.

---

# Phase 8.5 — Custom Practice Sessions & Question Filtering

- [x] Implement dynamic module extraction (`getAvailableModules`) from question sources.
- [x] Support module filtering in question preparation (`prepareReviewerQuestions`).
- [x] Support custom question count limits in question preparation (e.g. 5, 10, 20, 50, custom).
- [x] Randomly sample questions when count is less than pool and question shuffling is active.
- [x] Cap question count gracefully to available pool in selected modules.
- [x] Create interactive session configuration UI (`ReviewerSessionConfig`) on Reviewer Overview page.
- [x] Add module selection multi-checkbox grid with live per-module question counts.
- [x] Add question count preset buttons and custom number stepper.
- [x] Add dynamic session preview notice ("Will draw X questions from Y modules").
- [x] Support URL search parameters for session configuration (`?count=10&modules=...`).
- [x] Display custom session badge in quiz header with direct link to reconfigure.
- [x] Persist `sessionConfig` in `localStorage` attempt state and restore on refresh.
- [x] Score and review answers against custom session count with percentage accuracy.
- [x] Add "Change Settings" action to ScoreCard to easily configure another custom session.
- [x] Automated test suite for custom session filtering, persistence, and scoring.
- [x] Implement Answer Feedback Timing option (Show answers right away vs. at the end).
- [x] Create interactive immediate feedback component (`ImmediateFeedback`) with textual indicators (`✓ Correct`, `✗ Incorrect`).
- [x] Display question rationales, source references, and expected answers on immediate check.
- [x] Add "Try Again" capability on incorrect answers in immediate mode.
- [x] Color-code and label question palette buttons in `QuestionNav` based on immediate check results.
- [x] Add live "Instant Answers: ON/OFF" toggle in the quiz header toolbar.
- [x] Persist `checkedQuestions` and `feedbackTiming` across browser refresh.
- [x] Automated test suite verifying immediate answer checking and persistence.

---

# Phase 9 — Progress Persistence

- [x] Define persisted attempt structure.
- [x] Save active attempt to `localStorage`.
- [x] Save answers.
- [x] Save current question.
- [x] Save question order.
- [x] Save shuffled choice order.
- [x] Save start time.
- [x] Detect unfinished attempts.
- [x] Implement Resume.
- [x] Implement Start Over.
- [x] Clear/replace active state when retrying.
- [x] Handle corrupted saved state.
- [x] Handle unavailable browser storage gracefully.

## Verification

- [x] Refreshing preserves progress.
- [x] Closing/reopening can restore progress.
- [x] Resumed shuffled attempts preserve their original order.
- [x] Starting over clears the old attempt.

---

# Phase 10 — Submission Handling

- [x] Allow submission before every question is answered.
- [x] Detect unanswered questions.
- [x] Show confirmation when unanswered questions remain.
- [x] Allow student to return to reviewer.
- [x] Allow student to submit anyway.
- [x] Prevent accidental duplicate submission behavior.

---

# Phase 11 — Responsive Design and Accessibility

## Responsive Design

- [x] Verify desktop layouts.
- [x] Verify laptop layouts.
- [x] Verify tablet layouts.
- [x] Verify mobile layouts.
- [x] Ensure no required horizontal scrolling.
- [x] Ensure touch targets are appropriately sized.

## Accessibility

- [x] Use semantic HTML.
- [x] Add appropriate form labels.
- [x] Support keyboard navigation.
- [x] Add visible focus indicators.
- [x] Check text/background contrast.
- [x] Do not communicate correctness using color alone.
- [x] Verify radio-button accessibility.
- [x] Verify checkbox accessibility.

---

# Phase 12 — Automated Testing

- [x] Test schema validation.
- [x] Test malformed reviewer rejection.
- [x] Test unsupported schema versions.
- [x] Test duplicate IDs.
- [x] Test multiple-choice scoring.
- [x] Test multiple-answer scoring.
- [x] Test true/false scoring.
- [x] Test fill-blank normalization.
- [x] Test alternative accepted answers.
- [x] Test unanswered questions.
- [x] Test score calculation.
- [x] Test randomization.
- [x] Test persistence/restoration.

---

# Phase 13 — Documentation

- [x] Complete `README.md`.
- [x] Document project architecture.
- [x] Document reviewer directory structure.
- [x] Document reviewer JSON schema.
- [x] Document all question types.
- [x] Document how to add a reviewer.
- [x] Document validation.
- [x] Document testing.
- [x] Document production build.
- [x] Document deployment.
- [x] Include complete example reviewer JSON.

---

# Phase 14 — Final QA

Perform the complete intended workflow:

- [x] Add a new valid reviewer JSON file.
- [x] Verify that no application-code changes are necessary.
- [x] Verify reviewer is discovered.
- [x] Verify reviewer appears under correct year.
- [x] Verify reviewer appears under correct subject.
- [x] Start reviewer.
- [x] Answer all four question types.
- [x] Navigate backward and forward.
- [x] Refresh during reviewer.
- [x] Resume reviewer.
- [x] Submit with unanswered questions.
- [x] Verify confirmation.
- [x] Submit reviewer.
- [x] Verify score.
- [x] Review answers.
- [x] Retry reviewer.
- [x] Verify mobile experience.
- [x] Run automated tests.
- [x] Run production build.
- [x] Resolve remaining TypeScript/lint errors.

---

# Phase 15 — Deployment

- [x] Prepare production configuration.
- [ ] Deploy application.
- [x] Verify production reviewer loading.
- [x] Verify production routes.
- [x] Verify production quiz sessions.
- [x] Verify production mobile experience.

---

# Phase 16 — Connected Learning UI Design System Revamp

- [x] Define theme tokens in `globals.css` (Background `#0B0914`, Secondary `#12101D`, Surface `#181526`, Elevated `#211C32`, Border `#2A2440`, Purple primary/bright/soft/dark, Green primary/bright/soft/dark).
- [x] Implement subtle connected-node and signal background patterns.
- [x] Update Layout, Navbar, and Footer to the purple/green connected-learning theme.
- [x] Revamp Home Page (`src/app/page.tsx`) with constellation/synapse hero, metrics bar, and year cards.
- [x] Revamp Year & Subject pages (`src/app/year/[yearLevel]/page.tsx`, `src/app/subject/[code]/page.tsx`).
- [x] Revamp Reviewer Detail page (`src/app/reviewer/[id]/page.tsx`) and Session Config (`ReviewerSessionConfig.tsx`).
- [x] Revamp Quiz Engine UI (`QuizEngine.tsx`, `QuestionSidebar.tsx`, `QuestionActionBar.tsx`).
- [x] Revamp Question Components (`MultipleChoice.tsx`, `MultipleAnswer.tsx`, `TrueFalse.tsx`, `FillBlank.tsx`, `ImmediateFeedback.tsx`).
- [x] Revamp ScoreCard, AnswerReview, Error, and Not Found pages.
- [x] Verify accessibility, test suites (`npm test`), and production build (`npm run build`).

---

# Phase 17 — UX Refinements (Jump to Unanswered Toggle, Selection Clearing, & Pill Decluttering)

- [x] Implement toggleable jump to next unanswered question (`getNextUnansweredIndex`, `jumpToUnanswered` mode).
- [x] Integrate "Skip to Unanswered" toggle button into `QuestionActionBar` with real-time remaining count, preserving stationary action bar ergonomics.
- [x] Add "Clear selection" option for `MultipleChoice` and `MultipleAnswer` questions (along with toggle unselect on single choice).
- [x] Remove the "Hub" pill in `Navbar.tsx`.
- [x] Declutter redundant/unnecessary pills across the app (Verified Reviewer in reviewer details, redundant Year pill in year page, decorative badges on year cards, char counter in FillBlank).
- [x] Verify all 16 test suites pass with new test cases covering `getNextUnansweredIndex` and clearing selections (128 tests passing).

---

# Phase 18 — Connected Learning Visual Refresh

- [x] Refine the purple/green connected-learning palette while removing glassmorphism and excessive glow.
- [x] Document the new color, surface, shape, motion, and accessibility rules in `DESIGN.md`.
- [x] Update the UI guidance in `AGENTS.md`, `README.md`, and `IMPLEMENTATION_PLAN.md`.
- [x] Keep reviewer content, scoring, persistence, and navigation behavior unchanged.
- [x] Simplify home navigation so year-level choices are immediately visible, with no marketing metrics or scoring CTA.
- [ ] Complete visual QA across desktop and mobile breakpoints after the production build.

---

# Post-MVP Backlog

Do not implement these unless explicitly requested.

- [ ] Student accounts
- [ ] Cloud-synchronized attempts
- [ ] Admin dashboard
- [ ] Reviewer upload interface
- [ ] Database-backed content
- [ ] Instructor accounts
- [ ] Usage analytics
- [ ] Leaderboards
- [ ] Multiplayer quizzes
- [ ] Favorites/bookmarks
- [ ] Reviewer history
- [ ] CSV import
- [ ] Excel import
- [ ] Additional question types
- [ ] Student-facing source references

---

# Current Status

**Current Phase:** Phase 18 — Connected Learning Visual Refresh

**Overall Status:** MVP and UX Refinements Verified; Connected Learning visual refresh implemented and awaiting final responsive visual QA.

**Blockers:** None

**Notes:**

- Phase 2 reviewer schema remains the authoritative shared contract between the website and external Question Bank Generator.
- Added toggleable "Skip to Unanswered" mode on `QuestionActionBar` (`getNextUnansweredIndex`) that smoothly advances forward and wraps around to unanswered questions without creating competing primary forward buttons.
- Added dedicated accessible "Clear selection" buttons for multiple-choice and multiple-answer questions, allowing students to easily reset their answer choices.
- Removed decorative and redundant pills across Navbar, Year pages, Reviewer detail headers, and input fields to maintain an uncluttered aesthetic.
- Refined the purple/green connected-learning treatment into solid, focused surfaces without changing functional quiz behavior or the reviewer JSON contract.



