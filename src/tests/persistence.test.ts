import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  saveAttempt,
  loadAttempt,
  clearAttempt,
  hasUnfinishedAttempt,
  getAttemptStorageKey,
  PersistedAttempt,
} from '@/lib/quiz/persistence';
import { Question } from '@/types/reviewer';

class MockStorage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
}

describe('Phase 9 Progress Persistence Verification', () => {
  let mockStore: MockStorage;

  const sampleQuestions: Question[] = [
    {
      id: 'q1',
      type: 'multiple-choice',
      topic: 'Topic 1',
      question: 'Question 1',
      choices: ['A', 'B', 'C'],
      correctAnswer: 'A',
      explanation: 'Explanation 1',
      source: { module: 'M1' },
    },
    {
      id: 'q2',
      type: 'true-false',
      topic: 'Topic 2',
      question: 'Question 2',
      correctAnswer: true,
      explanation: 'Explanation 2',
      source: { module: 'M1' },
    },
  ];

  const sampleAttempt: PersistedAttempt = {
    version: 1,
    reviewerId: 'test-reviewer-123',
    startedAt: '2026-09-25T12:00:00.000Z',
    currentIndex: 1,
    answers: { q1: 'A' },
    activeQuestions: sampleQuestions,
    isFinished: false,
  };

  beforeEach(() => {
    mockStore = new MockStorage();
    vi.stubGlobal('window', {
      localStorage: mockStore,
    });
    vi.stubGlobal('localStorage', mockStore);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('saveAttempt and loadAttempt', () => {
    it('persists and restores an active attempt identically', () => {
      const saved = saveAttempt(sampleAttempt);
      expect(saved).toBe(true);

      const loaded = loadAttempt('test-reviewer-123');
      expect(loaded).toEqual(sampleAttempt);
    });

    it('returns null if no attempt is saved for the reviewer', () => {
      const loaded = loadAttempt('nonexistent-reviewer');
      expect(loaded).toBeNull();
    });

    it('verifies expected question count when specified', () => {
      saveAttempt(sampleAttempt);

      // Matches expected count (2)
      const matching = loadAttempt('test-reviewer-123', 2);
      expect(matching).not.toBeNull();

      // Mismatched expected count (e.g., reviewer questions updated to 3)
      const mismatch = loadAttempt('test-reviewer-123', 3);
      expect(mismatch).toBeNull();
      // Verifies mismatched attempt was cleared from storage
      expect(loadAttempt('test-reviewer-123')).toBeNull();
    });
  });

  describe('Corrupted and invalid state recovery', () => {
    it('handles malformed JSON in localStorage safely', () => {
      const key = getAttemptStorageKey('test-reviewer-123');
      mockStore.setItem(key, '{ invalid json: broken');

      const loaded = loadAttempt('test-reviewer-123');
      expect(loaded).toBeNull();
      // Verifies broken entry was cleared
      expect(mockStore.getItem(key)).toBeNull();
    });

    it('handles schema mismatch or missing fields safely', () => {
      const key = getAttemptStorageKey('test-reviewer-123');
      mockStore.setItem(
        key,
        JSON.stringify({
          version: 2, // Unsupported version
          reviewerId: 'test-reviewer-123',
        })
      );

      const loaded = loadAttempt('test-reviewer-123');
      expect(loaded).toBeNull();
    });
  });

  describe('hasUnfinishedAttempt', () => {
    it('returns true for an in-progress attempt', () => {
      saveAttempt({ ...sampleAttempt, isFinished: false });
      expect(hasUnfinishedAttempt('test-reviewer-123')).toBe(true);
    });

    it('returns false for a finished attempt', () => {
      saveAttempt({ ...sampleAttempt, isFinished: true });
      expect(hasUnfinishedAttempt('test-reviewer-123')).toBe(false);
    });

    it('returns false when no attempt exists', () => {
      expect(hasUnfinishedAttempt('unknown-reviewer')).toBe(false);
    });
  });

  describe('clearAttempt', () => {
    it('removes attempt from localStorage', () => {
      saveAttempt(sampleAttempt);
      expect(hasUnfinishedAttempt('test-reviewer-123')).toBe(true);

      const cleared = clearAttempt('test-reviewer-123');
      expect(cleared).toBe(true);
      expect(hasUnfinishedAttempt('test-reviewer-123')).toBe(false);
      expect(loadAttempt('test-reviewer-123')).toBeNull();
    });
  });

  describe('Graceful degradation when storage throws or is absent', () => {
    it('returns false/null when window is undefined (SSR)', () => {
      vi.unstubAllGlobals(); // removes window and localStorage
      expect(saveAttempt(sampleAttempt)).toBe(false);
      expect(loadAttempt('test-reviewer-123')).toBeNull();
      expect(clearAttempt('test-reviewer-123')).toBe(false);
    });

    it('handles setItem throwing (e.g. QuotaExceededError)', () => {
      vi.spyOn(mockStore, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const result = saveAttempt(sampleAttempt);
      expect(result).toBe(false);
    });

    it('handles getItem throwing gracefully', () => {
      vi.spyOn(mockStore, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError: Access Denied');
      });

      const result = loadAttempt('test-reviewer-123');
      expect(result).toBeNull();
    });
  });
});
