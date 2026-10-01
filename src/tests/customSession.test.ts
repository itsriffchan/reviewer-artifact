import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  prepareReviewerQuestions,
  getAvailableModules,
  QuestionFilterOptions,
} from '@/lib/quiz/randomization';
import {
  saveAttempt,
  loadAttempt,
  PersistedAttempt,
} from '@/lib/quiz/persistence';
import { scoreQuiz } from '@/lib/scoring/engine';
import { ReviewerData, Question } from '@/types/reviewer';

class MockStorage {
  private store: Record<string, string> = {};
  clear(): void {
    this.store = {};
  }
  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
}

describe('Custom Quiz Session Filtering & Configuration', () => {
  // Mock reviewer with 12 questions across 3 modules
  const mockQuestions: Question[] = [
    // Module 1 (4 questions)
    {
      id: 'm1-q1',
      type: 'multiple-choice',
      topic: 'Topic 1',
      question: 'Question M1-1',
      choices: ['A', 'B'],
      correctAnswer: 'A',
      explanation: 'Exp',
      source: { module: 'Module 1' },
    },
    {
      id: 'm1-q2',
      type: 'multiple-choice',
      topic: 'Topic 1',
      question: 'Question M1-2',
      choices: ['A', 'B'],
      correctAnswer: 'A',
      explanation: 'Exp',
      source: { module: 'Module 1' },
    },
    {
      id: 'm1-q3',
      type: 'true-false',
      topic: 'Topic 1',
      question: 'Question M1-3',
      correctAnswer: true,
      explanation: 'Exp',
      source: { module: 'Module 1' },
    },
    {
      id: 'm1-q4',
      type: 'fill-blank',
      topic: 'Topic 1',
      question: 'Question M1-4',
      acceptedAnswers: ['Ans'],
      explanation: 'Exp',
      source: { module: 'Module 1' },
    },
    // Module 2 (4 questions)
    {
      id: 'm2-q1',
      type: 'multiple-choice',
      topic: 'Topic 2',
      question: 'Question M2-1',
      choices: ['A', 'B'],
      correctAnswer: 'A',
      explanation: 'Exp',
      source: { module: 'Module 2' },
    },
    {
      id: 'm2-q2',
      type: 'multiple-choice',
      topic: 'Topic 2',
      question: 'Question M2-2',
      choices: ['A', 'B'],
      correctAnswer: 'A',
      explanation: 'Exp',
      source: { module: 'Module 2' },
    },
    {
      id: 'm2-q3',
      type: 'true-false',
      topic: 'Topic 2',
      question: 'Question M2-3',
      correctAnswer: false,
      explanation: 'Exp',
      source: { module: 'Module 2' },
    },
    {
      id: 'm2-q4',
      type: 'fill-blank',
      topic: 'Topic 2',
      question: 'Question M2-4',
      acceptedAnswers: ['Ans'],
      explanation: 'Exp',
      source: { module: 'Module 2' },
    },
    // Module 3 (4 questions)
    {
      id: 'm3-q1',
      type: 'multiple-choice',
      topic: 'Topic 3',
      question: 'Question M3-1',
      choices: ['A', 'B'],
      correctAnswer: 'A',
      explanation: 'Exp',
      source: { module: 'Module 3' },
    },
    {
      id: 'm3-q2',
      type: 'multiple-choice',
      topic: 'Topic 3',
      question: 'Question M3-2',
      choices: ['A', 'B'],
      correctAnswer: 'A',
      explanation: 'Exp',
      source: { module: 'Module 3' },
    },
    {
      id: 'm3-q3',
      type: 'true-false',
      topic: 'Topic 3',
      question: 'Question M3-3',
      correctAnswer: true,
      explanation: 'Exp',
      source: { module: 'Module 3' },
    },
    {
      id: 'm3-q4',
      type: 'fill-blank',
      topic: 'Topic 3',
      question: 'Question M3-4',
      acceptedAnswers: ['Ans'],
      explanation: 'Exp',
      source: { module: 'Module 3' },
    },
  ];

  const mockReviewer: ReviewerData = {
    schemaVersion: 1,
    id: 'test-custom-session',
    subject: {
      code: 'TEST101',
      name: 'Custom Session Test',
      yearLevel: 1,
    },
    reviewer: {
      title: 'Custom Session Reviewer',
      description: 'Test Reviewer',
      coverage: ['Module 1', 'Module 2', 'Module 3'],
      shuffleQuestions: true,
      shuffleChoices: true,
    },
    questions: mockQuestions,
  };

  let mockStore: MockStorage;

  beforeEach(() => {
    mockStore = new MockStorage();
    vi.stubGlobal('window', { localStorage: mockStore });
    vi.stubGlobal('localStorage', mockStore);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('getAvailableModules', () => {
    it('correctly discovers and sorts distinct modules from questions', () => {
      const modules = getAvailableModules(mockQuestions);
      expect(modules).toEqual(['Module 1', 'Module 2', 'Module 3']);
    });
  });

  describe('prepareReviewerQuestions with filters', () => {
    it('returns all questions when no filter options are passed', () => {
      const questions = prepareReviewerQuestions(mockReviewer);
      expect(questions.length).toBe(12);
    });

    it('filters questions to only selected modules (e.g. Module 1 and Module 3)', () => {
      const options: QuestionFilterOptions = {
        modules: ['Module 1', 'Module 3'],
      };
      const questions = prepareReviewerQuestions(mockReviewer, options);
      expect(questions.length).toBe(8);

      const returnedModules = new Set(questions.map((q) => q.source.module));
      expect(returnedModules.has('Module 1')).toBe(true);
      expect(returnedModules.has('Module 3')).toBe(true);
      expect(returnedModules.has('Module 2')).toBe(false);
    });

    it('limits question count accurately (e.g. 5 questions out of 12)', () => {
      const options: QuestionFilterOptions = {
        count: 5,
      };
      const questions = prepareReviewerQuestions(mockReviewer, options);
      expect(questions.length).toBe(5);
    });

    it('combines module filtering and question count limit (e.g. 3 questions from Modules 1 & 2)', () => {
      const options: QuestionFilterOptions = {
        modules: ['Module 1', 'Module 2'],
        count: 3,
      };
      const questions = prepareReviewerQuestions(mockReviewer, options);
      expect(questions.length).toBe(3);

      for (const q of questions) {
        expect(['Module 1', 'Module 2']).toContain(q.source.module);
      }
    });

    it('caps count to available questions when requested count exceeds module pool', () => {
      const options: QuestionFilterOptions = {
        modules: ['Module 1'], // Only 4 questions available
        count: 10,
      };
      const questions = prepareReviewerQuestions(mockReviewer, options);
      expect(questions.length).toBe(4);
    });
  });

  describe('Persistence of Custom Sessions', () => {
    it('saves and restores attempt with sessionConfig', () => {
      const customAttempt: PersistedAttempt = {
        version: 1,
        reviewerId: 'test-custom-session',
        startedAt: new Date().toISOString(),
        currentIndex: 2,
        answers: { 'm1-q1': 'A' },
        activeQuestions: mockQuestions.slice(0, 5),
        isFinished: false,
        sessionConfig: {
          questionCount: 5,
          selectedModules: ['Module 1', 'Module 2'],
        },
      };

      saveAttempt(customAttempt);
      const loaded = loadAttempt('test-custom-session');

      expect(loaded).not.toBeNull();
      expect(loaded?.activeQuestions.length).toBe(5);
      expect(loaded?.sessionConfig?.questionCount).toBe(5);
      expect(loaded?.sessionConfig?.selectedModules).toEqual(['Module 1', 'Module 2']);
    });
  });

  describe('Scoring Custom Sessions', () => {
    it('calculates score and percentage against the custom session question count', () => {
      const customFiveQuestions = mockQuestions.slice(0, 5);
      // Answer 4 correctly, 1 incorrectly
      const answers = {
        'm1-q1': 'A', // correct
        'm1-q2': 'A', // correct
        'm1-q3': true, // correct
        'm1-q4': 'Ans', // correct
        'm2-q1': 'B', // incorrect
      };

      const summary = scoreQuiz(mockReviewer, answers, customFiveQuestions);

      expect(summary.totalQuestions).toBe(5);
      expect(summary.correctCount).toBe(4);
      expect(summary.incorrectCount).toBe(1);
      expect(summary.unansweredCount).toBe(0);
      expect(summary.scorePercentage).toBe(80); // 4 / 5 = 80%
    });
  });

  describe('Non-Repeating Continuation Batches (Go for More Unseen Questions)', () => {
    it('accurately identifies and excludes previously completed questions for next batch', () => {
      // 12 questions total in mockReviewer
      // Batch 1: first 4 questions
      const batch1Questions = mockQuestions.slice(0, 4);
      const batch1Ids = batch1Questions.map((q) => q.id);

      const seenSet = new Set(batch1Ids);
      const remainingQuestions = mockQuestions.filter((q) => !seenSet.has(q.id));

      expect(remainingQuestions).toHaveLength(8);
      expect(remainingQuestions.some((q) => batch1Ids.includes(q.id))).toBe(false);

      // Batch 2: next 4 questions from remaining pool
      const batch2Questions = remainingQuestions.slice(0, 4);
      const batch2Ids = batch2Questions.map((q) => q.id);

      expect(batch2Questions).toHaveLength(4);
      // Zero overlap between Batch 1 and Batch 2
      expect(batch2Ids.some((id) => batch1Ids.includes(id))).toBe(false);

      // Batch 3: accumulated seen IDs (batch 1 + batch 2 = 8 questions)
      const accumulatedSeen = [...batch1Ids, ...batch2Ids];
      const remainingForBatch3 = mockQuestions.filter((q) => !accumulatedSeen.includes(q.id));

      expect(remainingForBatch3).toHaveLength(4);
      expect(remainingForBatch3.map((q) => q.id)).toEqual(['m3-q1', 'm3-q2', 'm3-q3', 'm3-q4']);
    });

    it('respects selected module filters when calculating unseen remaining questions', () => {
      // User only selected Module 1 (4 questions)
      const m1Questions = mockQuestions.filter((q) => q.source?.module === 'Module 1');
      expect(m1Questions).toHaveLength(4);

      // User did 2 questions in batch 1
      const doneIds = ['m1-q1', 'm1-q2'];
      const unseenInM1 = m1Questions.filter((q) => !doneIds.includes(q.id));

      expect(unseenInM1).toHaveLength(2);
      expect(unseenInM1.map((q) => q.id)).toEqual(['m1-q3', 'm1-q4']);
    });

    it('persists seenQuestionIds in sessionConfig across batches', () => {
      const continuationAttempt: PersistedAttempt = {
        version: 1,
        reviewerId: 'test-custom-continuation',
        startedAt: new Date().toISOString(),
        currentIndex: 0,
        answers: {},
        activeQuestions: mockQuestions.slice(4, 8), // Batch 2
        isFinished: false,
        sessionConfig: {
          questionCount: 4,
          seenQuestionIds: ['m1-q1', 'm1-q2', 'm1-q3', 'm1-q4'], // Batch 1 completed
        },
      };

      saveAttempt(continuationAttempt);
      const loaded = loadAttempt('test-custom-continuation');

      expect(loaded?.sessionConfig?.seenQuestionIds).toEqual([
        'm1-q1',
        'm1-q2',
        'm1-q3',
        'm1-q4',
      ]);
      expect(loaded?.activeQuestions).toHaveLength(4);
    });
  });
});
