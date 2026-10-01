/**
 * Deterministic string normalization for Fill-in-the-Blank answers.
 * Rules per SPEC.md and AGENTS.md:
 * 1. Trim leading and trailing whitespace.
 * 2. Convert text to lowercase.
 * No fuzzy matching or semantic similarity is applied.
 */
export function normalizeAnswer(text: string): string {
  return text.trim().toLowerCase();
}
