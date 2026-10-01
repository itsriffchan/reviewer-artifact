import { Question } from '@/types/reviewer';
import { QuizAnswers, SessionConfig } from '@/quiz/types';

export interface PersistedAttempt {
  version: 1;
  reviewerId: string;
  startedAt: string; // ISO 8601 string
  currentIndex: number;
  answers: QuizAnswers;
  activeQuestions: Question[];
  isFinished: boolean;
  sessionConfig?: SessionConfig;
  checkedQuestions?: Record<string, boolean>;
}

const STORAGE_PREFIX = 'acm_reviewer_attempt_';

export function getAttemptStorageKey(reviewerId: string): string {
  return `${STORAGE_PREFIX}${reviewerId}`;
}

/**
 * Checks if browser storage is accessible
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const testKey = '__acm_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely persists an active quiz attempt to localStorage
 */
export function saveAttempt(attempt: PersistedAttempt): boolean {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    const key = getAttemptStorageKey(attempt.reviewerId);
    const serialized = JSON.stringify(attempt);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.warn('[Storage] Failed to save quiz attempt:', error);
    return false;
  }
}

/**
 * Safely loads and validates a saved quiz attempt from localStorage
 */
export function loadAttempt(
  reviewerId: string,
  expectedQuestionCount?: number
): PersistedAttempt | null {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    const key = getAttemptStorageKey(reviewerId);
    const data = window.localStorage.getItem(key);
    if (!data) {
      return null;
    }

    const parsed = JSON.parse(data);

    // Validate minimum structural integrity
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      parsed.version !== 1 ||
      parsed.reviewerId !== reviewerId ||
      typeof parsed.currentIndex !== 'number' ||
      typeof parsed.answers !== 'object' ||
      !Array.isArray(parsed.activeQuestions) ||
      parsed.activeQuestions.length === 0
    ) {
      console.warn('[Storage] Discarding corrupted attempt state for:', reviewerId);
      clearAttempt(reviewerId);
      return null;
    }

    // Check if question count matches currently loaded reviewer content
    if (
      expectedQuestionCount !== undefined &&
      parsed.activeQuestions.length !== expectedQuestionCount
    ) {
      console.warn(
        `[Storage] Question count mismatch for ${reviewerId}. Expected ${expectedQuestionCount}, found ${parsed.activeQuestions.length}. Resetting attempt.`
      );
      clearAttempt(reviewerId);
      return null;
    }

    return parsed as PersistedAttempt;
  } catch (error) {
    console.warn('[Storage] Error reading attempt state:', error);
    clearAttempt(reviewerId);
    return null;
  }
}

/**
 * Safely clears a saved quiz attempt from localStorage
 */
export function clearAttempt(reviewerId: string): boolean {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    const key = getAttemptStorageKey(reviewerId);
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn('[Storage] Failed to clear attempt state:', error);
    return false;
  }
}

/**
 * Checks whether an unfinished attempt exists for a given reviewer
 */
export function hasUnfinishedAttempt(
  reviewerId: string,
  expectedQuestionCount?: number
): boolean {
  const attempt = loadAttempt(reviewerId, expectedQuestionCount);
  return attempt !== null && !attempt.isFinished;
}
