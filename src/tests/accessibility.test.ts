import { describe, it, expect } from 'vitest';
import { scoreQuestion, scoreQuiz } from '@/lib/scoring/engine';
import { MultipleChoiceQuestion, ReviewerData } from '@/types/reviewer';

describe('Phase 11 Accessibility & Formatting Standards Verification', () => {
  describe('Non-color correctness indicators', () => {
    const question: MultipleChoiceQuestion = {
      id: 'q-a11y',
      type: 'multiple-choice',
      topic: 'Accessibility',
      question: 'Which WCAG criterion requires text alternatives for non-text content?',
      choices: ['1.1.1 Non-text Content', '1.4.3 Contrast', '2.1.1 Keyboard', '3.1.1 Language'],
      correctAnswer: '1.1.1 Non-text Content',
      explanation: 'Guideline 1.1 requires text alternatives.',
      source: { module: 'A11y Module' },
    };

    it('scoreQuestion provides explicit boolean status and textual feedback properties', () => {
      const correct = scoreQuestion(question, '1.1.1 Non-text Content');
      expect(correct.isCorrect).toBe(true);
      expect(correct.isUnanswered).toBe(false);
      // Correct answer string is explicitly exposed as text, not color
      expect(correct.correctAnswer).toBe('1.1.1 Non-text Content');

      const incorrect = scoreQuestion(question, '1.4.3 Contrast');
      expect(incorrect.isCorrect).toBe(false);
      expect(incorrect.isUnanswered).toBe(false);
      expect(incorrect.studentAnswer).toBe('1.4.3 Contrast');

      const unanswered = scoreQuestion(question, null);
      expect(unanswered.isCorrect).toBe(false);
      expect(unanswered.isUnanswered).toBe(true);
      expect(unanswered.studentAnswer).toBeNull();
    });

    it('scoreQuiz results distinguish unanswered questions with explicit boolean flags', () => {
      const reviewer: ReviewerData = {
        schemaVersion: 1,
        id: 'rev-a11y',
        subject: { code: 'A11Y', name: 'Web Accessibility', yearLevel: 1 },
        reviewer: {
          title: 'A11y Reviewer',
          description: 'Testing accessibility standards',
          coverage: ['Module 1'],
          shuffleQuestions: false,
          shuffleChoices: false,
        },
        questions: [question],
      };

      const summary = scoreQuiz(reviewer, {});
      expect(summary.unansweredCount).toBe(1);
      expect(summary.correctCount).toBe(0);
      expect(summary.incorrectCount).toBe(0);
      expect(summary.results[0].isUnanswered).toBe(true);
    });
  });
});
