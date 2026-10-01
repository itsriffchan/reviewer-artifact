import { describe, it, expect } from 'vitest';
import { scoreQuiz, isAnswerProvided, getNextUnansweredIndex } from '@/lib/scoring/engine';
import { ReviewerData } from '@/types/reviewer';

describe('Phase 10 Submission Handling Verification', () => {
  const sampleReviewer: ReviewerData = {
    schemaVersion: 1,
    id: 'sub-test',
    subject: { code: 'SUB101', name: 'Submission Test Subject', yearLevel: 1 },
    reviewer: {
      title: 'Submission Reviewer',
      description: 'Testing partial and empty submission',
      coverage: ['Module 1'],
      shuffleQuestions: false,
      shuffleChoices: false,
    },
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        topic: 'Basics',
        question: 'What is 1+1?',
        choices: ['1', '2', '3', '4'],
        correctAnswer: '2',
        explanation: '1+1 = 2',
        source: { module: 'M1' },
      },
      {
        id: 'q2',
        type: 'true-false',
        topic: 'Basics',
        question: 'Sky is blue?',
        correctAnswer: true,
        explanation: 'Atmospheric scattering makes it blue',
        source: { module: 'M1' },
      },
      {
        id: 'q3',
        type: 'multiple-answer',
        topic: 'Basics',
        question: 'Select primary colors',
        choices: ['Red', 'Blue', 'Green', 'Purple'],
        correctAnswers: ['Red', 'Blue'],
        explanation: 'Red and Blue are primary colors',
        source: { module: 'M1' },
      },
      {
        id: 'q4',
        type: 'fill-blank',
        topic: 'Basics',
        question: 'Name the protocol for web browsing',
        acceptedAnswers: ['HTTP', 'HTTPS'],
        explanation: 'HTTP/HTTPS are web protocols',
        source: { module: 'M1' },
      },
    ],
  };

  describe('Unanswered question detection', () => {
    it('detects null and undefined as unanswered', () => {
      expect(isAnswerProvided(null)).toBe(false);
      expect(isAnswerProvided(undefined as unknown as null)).toBe(false);
    });

    it('detects empty or whitespace-only strings as unanswered', () => {
      expect(isAnswerProvided('')).toBe(false);
      expect(isAnswerProvided('   ')).toBe(false);
      expect(isAnswerProvided('\t\n')).toBe(false);
    });

    it('detects empty array as unanswered for multiple-answer', () => {
      expect(isAnswerProvided([])).toBe(false);
      expect(isAnswerProvided(['Red'])).toBe(true);
    });

    it('detects false as an answered value for true-false', () => {
      expect(isAnswerProvided(false)).toBe(true);
      expect(isAnswerProvided(true)).toBe(true);
    });
  });

  describe('Submitting with 0 answered questions', () => {
    it('allows submission before any question is answered and scores correctly', () => {
      const emptyAnswers = {};
      const summary = scoreQuiz(sampleReviewer, emptyAnswers);

      expect(summary.totalQuestions).toBe(4);
      expect(summary.correctCount).toBe(0);
      expect(summary.incorrectCount).toBe(0);
      expect(summary.unansweredCount).toBe(4);
      expect(summary.scorePercentage).toBe(0);

      // All individual results should be marked unanswered
      expect(summary.results.every((r) => r.isUnanswered)).toBe(true);
      expect(summary.results.every((r) => !r.isCorrect)).toBe(true);
    });
  });

  describe('Submitting with partial answers', () => {
    it('accurately scores completed questions and marks remaining as unanswered', () => {
      // Student answers:
      // q1: '2' (correct)
      // q2: false (incorrect)
      // q3: unanswered
      // q4: unanswered
      const partialAnswers = {
        q1: '2',
        q2: false,
      };

      const summary = scoreQuiz(sampleReviewer, partialAnswers);

      expect(summary.totalQuestions).toBe(4);
      expect(summary.correctCount).toBe(1);
      expect(summary.incorrectCount).toBe(1);
      expect(summary.unansweredCount).toBe(2);
      expect(summary.scorePercentage).toBe(25);

      const r1 = summary.results.find((r) => r.questionId === 'q1');
      expect(r1?.isCorrect).toBe(true);
      expect(r1?.isUnanswered).toBe(false);

      const r2 = summary.results.find((r) => r.questionId === 'q2');
      expect(r2?.isCorrect).toBe(false);
      expect(r2?.isUnanswered).toBe(false);

      const r3 = summary.results.find((r) => r.questionId === 'q3');
      expect(r3?.isCorrect).toBe(false);
      expect(r3?.isUnanswered).toBe(true);

      const r4 = summary.results.find((r) => r.questionId === 'q4');
      expect(r4?.isCorrect).toBe(false);
      expect(r4?.isUnanswered).toBe(true);
    });
  });

  describe('Next Unanswered Question Jump Navigation', () => {
    it('finds the next forward unanswered question', () => {
      // Questions: q1 (index 0), q2 (index 1), q3 (index 2), q4 (index 3)
      // q1 answered, q2 answered, q3 unanswered, q4 unanswered
      const answers = { q1: '2', q2: true };
      const nextIdx = getNextUnansweredIndex(sampleReviewer.questions, answers, 0);
      expect(nextIdx).toBe(2); // jumps past q2 (answered) straight to q3 (unanswered)
    });

    it('wraps around to earlier unanswered questions if current index is near end', () => {
      // q1 unanswered, q2 answered, q3 answered, q4 answered
      const answers = { q2: true, q3: ['Red'], q4: 'HTTP' };
      // User is on question index 2 (q3)
      const nextIdx = getNextUnansweredIndex(sampleReviewer.questions, answers, 2);
      expect(nextIdx).toBe(0); // wraps around to q1
    });

    it('returns null when all questions are answered', () => {
      const allAnswered = {
        q1: '2',
        q2: false,
        q3: ['Red', 'Blue'],
        q4: 'HTTP',
      };
      const nextIdx = getNextUnansweredIndex(sampleReviewer.questions, allAnswered, 0);
      expect(nextIdx).toBeNull();
    });

    it('returns next index after clearing a previously selected answer', () => {
      // User had answered q1 and q2, then cleared q1 (set to null)
      const answers = { q1: null, q2: true };
      const nextIdx = getNextUnansweredIndex(sampleReviewer.questions, answers, 1);
      expect(nextIdx).toBe(2); // q3 is next unanswered forward
      
      // If at end (index 3) and q1 was cleared to null
      const answersNearEnd = { q1: null, q2: true, q3: ['Red'], q4: 'HTTP' };
      const wrapIdx = getNextUnansweredIndex(sampleReviewer.questions, answersNearEnd, 3);
      expect(wrapIdx).toBe(0); // wraps around to cleared q1
    });
  });

  describe('Retry All Mistakes / Incorrect Questions Workflow', () => {
    it('accurately identifies mistake question IDs from a scored attempt', () => {
      // q1 correct ('2'), q2 incorrect (false vs true), q3 incorrect (['Red'] vs ['Red', 'Blue']), q4 skipped
      const answers = {
        q1: '2',
        q2: false,
        q3: ['Red'],
      };

      const summary = scoreQuiz(sampleReviewer, answers);
      const mistakeQuestionIds = summary.results
        .filter((r) => !r.isCorrect)
        .map((r) => r.questionId);

      expect(mistakeQuestionIds).toEqual(['q2', 'q3', 'q4']);
      expect(mistakeQuestionIds).not.toContain('q1');
    });

    it('filters reviewer questions to only missed/incorrect questions for retry attempt', () => {
      const answers = {
        q1: '2', // correct
        q2: false, // incorrect
        q3: ['Red', 'Blue'], // correct
        q4: 'FTP', // incorrect
      };

      const summary = scoreQuiz(sampleReviewer, answers);
      const mistakeIds = new Set(
        summary.results.filter((r) => !r.isCorrect).map((r) => r.questionId)
      );

      const retryQuestions = sampleReviewer.questions.filter((q) => mistakeIds.has(q.id));

      expect(retryQuestions).toHaveLength(2);
      expect(retryQuestions.map((q) => q.id)).toEqual(['q2', 'q4']);
    });

    it('allows full mastery when all mistakes are answered correctly on retry', () => {
      // First attempt has mistakes on q2 and q4
      const firstAnswers = { q1: '2', q2: false, q3: ['Red', 'Blue'], q4: 'FTP' };
      const firstSummary = scoreQuiz(sampleReviewer, firstAnswers);
      const mistakeIds = new Set(
        firstSummary.results.filter((r) => !r.isCorrect).map((r) => r.questionId)
      );

      const retryQuestions = sampleReviewer.questions.filter((q) => mistakeIds.has(q.id));

      // Retry attempt answers only the retry questions correctly
      const retryAnswers = {
        q2: true, // corrected
        q4: 'HTTP', // corrected
      };

      const retryReviewer: ReviewerData = {
        ...sampleReviewer,
        questions: retryQuestions,
      };

      const retrySummary = scoreQuiz(retryReviewer, retryAnswers, retryQuestions);
      expect(retrySummary.totalQuestions).toBe(2);
      expect(retrySummary.correctCount).toBe(2);
      expect(retrySummary.incorrectCount).toBe(0);
      expect(retrySummary.scorePercentage).toBe(100);
      expect(retrySummary.results.filter((r) => !r.isCorrect)).toHaveLength(0);
    });
  });
});
