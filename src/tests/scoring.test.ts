import { describe, it, expect } from 'vitest';
import { scoreQuestion, scoreQuiz } from '@/lib/scoring/engine';
import { normalizeAnswer } from '@/lib/scoring/normalizer';
import {
  MultipleChoiceQuestion,
  MultipleAnswerQuestion,
  TrueFalseQuestion,
  FillBlankQuestion,
  ReviewerData,
} from '@/types/reviewer';

describe('Phase 6 Scoring Engine Verification', () => {
  describe('Fill-in-the-Blank Normalizer', () => {
    it('trims leading and trailing whitespace', () => {
      expect(normalizeAnswer('  DHCP  ')).toBe('dhcp');
      expect(normalizeAnswer('\tOSI Model\n')).toBe('osi model');
    });

    it('converts uppercase to lowercase', () => {
      expect(normalizeAnswer('STACK')).toBe('stack');
      expect(normalizeAnswer('Queue')).toBe('queue');
    });
  });

  describe('Multiple Choice Scoring', () => {
    const mcQuestion: MultipleChoiceQuestion = {
      id: 'mc1',
      type: 'multiple-choice',
      topic: 'OSI',
      question: 'Which layer routes packets?',
      choices: ['Physical', 'Network', 'Transport'],
      correctAnswer: 'Network',
      explanation: 'Network routes.',
      source: { module: 'Mod 1' },
    };

    it('scores exact match as correct', () => {
      const res = scoreQuestion(mcQuestion, 'Network');
      expect(res.isCorrect).toBe(true);
      expect(res.isUnanswered).toBe(false);
    });

    it('scores incorrect choice as incorrect', () => {
      const res = scoreQuestion(mcQuestion, 'Physical');
      expect(res.isCorrect).toBe(false);
      expect(res.isUnanswered).toBe(false);
    });

    it('identifies unanswered questions', () => {
      const resNull = scoreQuestion(mcQuestion, null);
      expect(resNull.isUnanswered).toBe(true);
      expect(resNull.isCorrect).toBe(false);

      const resEmpty = scoreQuestion(mcQuestion, '   ');
      expect(resEmpty.isUnanswered).toBe(true);
      expect(resEmpty.isCorrect).toBe(false);
    });
  });

  describe('Multiple Answer Scoring', () => {
    const maQuestion: MultipleAnswerQuestion = {
      id: 'ma1',
      type: 'multiple-answer',
      topic: 'Protocols',
      question: 'Select transport protocols:',
      choices: ['TCP', 'UDP', 'IP', 'HTTP'],
      correctAnswers: ['TCP', 'UDP'],
      explanation: 'TCP and UDP.',
      source: { module: 'Mod 1' },
    };

    it('scores exact answer set in matching order as correct', () => {
      const res = scoreQuestion(maQuestion, ['TCP', 'UDP']);
      expect(res.isCorrect).toBe(true);
      expect(res.isUnanswered).toBe(false);
    });

    it('scores exact answer set in different order as correct', () => {
      const res = scoreQuestion(maQuestion, ['UDP', 'TCP']);
      expect(res.isCorrect).toBe(true);
      expect(res.isUnanswered).toBe(false);
    });

    it('scores subset of correct answers as incorrect', () => {
      const res = scoreQuestion(maQuestion, ['TCP']);
      expect(res.isCorrect).toBe(false);
      expect(res.isUnanswered).toBe(false);
    });

    it('scores selection with extra incorrect option as incorrect', () => {
      const res = scoreQuestion(maQuestion, ['TCP', 'UDP', 'IP']);
      expect(res.isCorrect).toBe(false);
      expect(res.isUnanswered).toBe(false);
    });

    it('identifies empty selection as unanswered', () => {
      const res = scoreQuestion(maQuestion, []);
      expect(res.isUnanswered).toBe(true);
      expect(res.isCorrect).toBe(false);
    });
  });

  describe('True/False Scoring', () => {
    const tfQuestion: TrueFalseQuestion = {
      id: 'tf1',
      type: 'true-false',
      topic: 'TCP',
      question: 'TCP is connection-oriented.',
      correctAnswer: true,
      explanation: 'TCP uses 3-way handshake.',
      source: { module: 'Mod 1' },
    };

    it('scores matching boolean as correct', () => {
      const res = scoreQuestion(tfQuestion, true);
      expect(res.isCorrect).toBe(true);
      expect(res.isUnanswered).toBe(false);
    });

    it('scores mismatched boolean as incorrect', () => {
      const res = scoreQuestion(tfQuestion, false);
      expect(res.isCorrect).toBe(false);
      expect(res.isUnanswered).toBe(false);
    });

    it('identifies null as unanswered', () => {
      const res = scoreQuestion(tfQuestion, null);
      expect(res.isUnanswered).toBe(true);
      expect(res.isCorrect).toBe(false);
    });
  });

  describe('Fill in the Blank Scoring', () => {
    const fibQuestion: FillBlankQuestion = {
      id: 'fib1',
      type: 'fill-blank',
      topic: 'DHCP',
      question: 'Dynamic IP assignment protocol is _____.',
      acceptedAnswers: ['DHCP', 'Dynamic Host Configuration Protocol'],
      explanation: 'DHCP assigns IPs.',
      source: { module: 'Mod 1' },
    };

    it('scores exact match as correct', () => {
      const res = scoreQuestion(fibQuestion, 'DHCP');
      expect(res.isCorrect).toBe(true);
    });

    it('scores case-insensitive match as correct', () => {
      const resLower = scoreQuestion(fibQuestion, 'dhcp');
      expect(resLower.isCorrect).toBe(true);

      const resMixed = scoreQuestion(fibQuestion, 'DhCp');
      expect(resMixed.isCorrect).toBe(true);
    });

    it('scores trimmed whitespace match as correct', () => {
      const resTrimmed = scoreQuestion(fibQuestion, '   DHCP   ');
      expect(resTrimmed.isCorrect).toBe(true);
    });

    it('scores alternative accepted answer as correct', () => {
      const resAlt = scoreQuestion(fibQuestion, 'Dynamic Host Configuration Protocol');
      expect(resAlt.isCorrect).toBe(true);

      const resAltLower = scoreQuestion(fibQuestion, 'dynamic host configuration protocol');
      expect(resAltLower.isCorrect).toBe(true);
    });

    it('does not accept fuzzy matches or typos (strict deterministic rule)', () => {
      const resTypo = scoreQuestion(fibQuestion, 'dhcpp');
      expect(resTypo.isCorrect).toBe(false);
      expect(resTypo.isUnanswered).toBe(false);
    });

    it('identifies whitespace-only as unanswered', () => {
      const resEmpty = scoreQuestion(fibQuestion, '    ');
      expect(resEmpty.isUnanswered).toBe(true);
      expect(resEmpty.isCorrect).toBe(false);
    });
  });

  describe('Full Reviewer Scoring & Score Percentage', () => {
    const mockReviewer: ReviewerData = {
      schemaVersion: 1,
      id: 'mock-rev',
      subject: { code: 'TEST101', name: 'Test Subject', yearLevel: 1 },
      reviewer: {
        title: 'Mock Exam',
        description: 'Mock',
        coverage: ['Mod 1'],
        shuffleQuestions: false,
        shuffleChoices: false,
      },
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          topic: 'T1',
          question: 'Q1',
          choices: ['A', 'B'],
          correctAnswer: 'A',
          explanation: 'E1',
          source: { module: 'M1' },
        },
        {
          id: 'q2',
          type: 'multiple-answer',
          topic: 'T2',
          question: 'Q2',
          choices: ['A', 'B', 'C'],
          correctAnswers: ['A', 'B'],
          explanation: 'E2',
          source: { module: 'M1' },
        },
        {
          id: 'q3',
          type: 'true-false',
          topic: 'T3',
          question: 'Q3',
          correctAnswer: true,
          explanation: 'E3',
          source: { module: 'M1' },
        },
        {
          id: 'q4',
          type: 'fill-blank',
          topic: 'T4',
          question: 'Q4',
          acceptedAnswers: ['Ans'],
          explanation: 'E4',
          source: { module: 'M1' },
        },
      ],
    };

    it('correctly calculates counts and percentage for mixed answers', () => {
      const answers = {
        q1: 'A',          // Correct
        q2: ['A', 'B'],   // Correct
        q3: false,        // Incorrect
        // q4 unanswered
      };

      const summary = scoreQuiz(mockReviewer, answers);

      expect(summary.totalQuestions).toBe(4);
      expect(summary.correctCount).toBe(2);
      expect(summary.incorrectCount).toBe(1);
      expect(summary.unansweredCount).toBe(1);
      expect(summary.scorePercentage).toBe(50); // 2/4 = 50%
      expect(summary.results.length).toBe(4);
    });

    it('calculates 100% for all correct answers', () => {
      const answers = {
        q1: 'A',
        q2: ['A', 'B'],
        q3: true,
        q4: 'Ans',
      };

      const summary = scoreQuiz(mockReviewer, answers);
      expect(summary.correctCount).toBe(4);
      expect(summary.scorePercentage).toBe(100);
      expect(summary.incorrectCount).toBe(0);
      expect(summary.unansweredCount).toBe(0);
    });
  });
});
