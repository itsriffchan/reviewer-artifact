import { Question, ReviewerData } from '@/types/reviewer';

/**
 * Fisher-Yates array shuffling algorithm.
 * Accepts an optional random number generator function (defaults to Math.random)
 * to support deterministic testing and seeding.
 */
export function shuffleArray<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export interface QuestionFilterOptions {
  count?: number;
  modules?: string[];
}

/**
 * Extracts distinct, sorted module names from an array of questions.
 */
export function getAvailableModules(questions: Question[]): string[] {
  const set = new Set<string>();
  for (const q of questions) {
    if (q.source?.module) {
      set.add(q.source.module.trim());
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

/**
 * Prepares questions for a quiz attempt by applying:
 * - Module filtering (if modules specified)
 * - Question count limit / sampling (if count specified)
 * - Choice shuffling (if reviewer.shuffleChoices is enabled)
 * - Question order shuffling (if reviewer.shuffleQuestions is enabled)
 *
 * Supports both signatures:
 * prepareReviewerQuestions(reviewer, filterOptions, rng)
 * prepareReviewerQuestions(reviewer, rng) // backwards compatible
 */
export function prepareReviewerQuestions(
  reviewer: ReviewerData,
  filterOrRng?: QuestionFilterOptions | (() => number),
  rngArg?: () => number
): Question[] {
  let filterOptions: QuestionFilterOptions | undefined;
  let rng: () => number = Math.random;

  if (typeof filterOrRng === 'function') {
    rng = filterOrRng;
  } else if (filterOrRng) {
    filterOptions = filterOrRng;
    if (rngArg) {
      rng = rngArg;
    }
  }

  const { reviewer: meta, questions } = reviewer;
  let pool = [...questions];

  // 1. Filter by selected modules if provided
  if (filterOptions?.modules && filterOptions.modules.length > 0) {
    const selectedNormalized = filterOptions.modules.map((m) => m.trim().toLowerCase());
    const filtered = pool.filter((q) => {
      const qMod = q.source?.module?.trim().toLowerCase() || '';
      return selectedNormalized.some(
        (sel) => qMod === sel || qMod.startsWith(sel) || sel.startsWith(qMod)
      );
    });

    if (filtered.length > 0) {
      pool = filtered;
    }
  }

  // 2. Sample question count if specified and less than pool size
  let selected = [...pool];
  if (
    filterOptions?.count !== undefined &&
    filterOptions.count > 0 &&
    filterOptions.count < selected.length
  ) {
    // If questions are shuffled (or sampling from larger pool), shuffle before slicing
    if (meta.shuffleQuestions) {
      selected = shuffleArray(selected, rng);
    }
    selected = selected.slice(0, filterOptions.count);
  }

  // 3. Process choices (optionally shuffle choices for MC/MA)
  const prepared: Question[] = selected.map((q) => {
    if (meta.shuffleChoices) {
      if (q.type === 'multiple-choice') {
        return {
          ...q,
          choices: shuffleArray(q.choices, rng),
        };
      }
      if (q.type === 'multiple-answer') {
        return {
          ...q,
          choices: shuffleArray(q.choices, rng),
        };
      }
    }
    return { ...q };
  });

  // 4. Optionally shuffle question order
  if (meta.shuffleQuestions) {
    return shuffleArray(prepared, rng);
  }

  return prepared;
}
