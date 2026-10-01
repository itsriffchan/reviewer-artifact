# This file marks down the changes that need to be implemented in the website

- [x] Add a button to jump to the next unanswered question. Ideally as a toggle, as to not block the main next question and clean overall UI
- [x] Add a "clear" option to remove the current selection (multiple choice and multiple answer)
- [x] Remove the "hub" pill and all unecessary pills
- [x] Refine the purple/green connected-learning theme while removing glassmorphism

## Implementation Summary
- **Jump to Unanswered Toggle**: Added `onToggleUnanswered` and `jumpToUnanswered` to `QuestionActionBar` and `QuizEngine`. It features a sleek toggle button (`Skip to Unanswered` with remaining count badge). When toggled ON, the Next button dynamically becomes `Next Unanswered` and advances forward/wraps around directly to the next unanswered question, maintaining a clean UI without competing forward buttons.
- **Clear Selection**: Added accessible "Clear selection" options to `MultipleChoice` and `MultipleAnswer` (as well as `TrueFalse`), enabling users to clear selected options. Additionally allows clicking selected single-choice options to unselect them.
- **Pill Decluttering**: Removed the decorative `Hub` pill in `Navbar`, removed redundant `Verified Reviewer` pill in the reviewer details page, removed redundant `Year X` pill in year curriculum headers, removed badge pills in year cards, and removed character counter pills in `FillBlank`.
- **Connected Learning Refresh**: Preserved the purple/green synapse concept while removing glassmorphism and excessive glow. The reviewer contract, scoring, persistence, and question behavior are unchanged.
