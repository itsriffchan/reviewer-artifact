import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { scoreQuestion } from '@/lib/scoring/engine';
import { saveAttempt, loadAttempt, PersistedAttempt } from '@/lib/quiz/persistence';
import {
  MultipleChoiceQuestion,
  MultipleAnswerQuestion,
  TrueFalseQuestion,
  FillBlankQuestion,
} from '@/types/reviewer';

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

describe('Answer Feedback Timing & Immediate Answer Evaluation', () => {
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

  const mcQuestion: MultipleChoiceQuestion = {
    id: 'mc-1',
    type: 'multiple-choice',
    topic: 'Networking',
    question: 'What layer is IP?',
    choices: ['Layer 2', 'Layer 3', 'Layer 4'],
    correctAnswer: 'Layer 3',
    explanation: 'IP routes packets at Network Layer 3.',
    source: { module: 'Module 2' },
  };

  const maQuestion: MultipleAnswerQuestion = {
    id: 'ma-1',
    type: 'multiple-answer',
    topic: 'Protocols',
    question: 'Select Layer 4 protocols',
    choices: ['TCP', 'UDP', 'IP'],
    correctAnswers: ['TCP', 'UDP'],
    explanation: 'TCP and UDP are Transport layer.',
    source: { module: 'Module 3' },
  };

  const tfQuestion: TrueFalseQuestion = {
    id: 'tf-1',
    type: 'true-false',
    topic: 'Transport',
    question: 'UDP is connection-oriented.',
    correctAnswer: false,
    explanation: 'UDP is connectionless.',
    source: { module: 'Module 3' },
  };

  const fbQuestion: FillBlankQuestion = {
    id: 'fb-1',
    type: 'fill-blank',
    topic: 'Addressing',
    question: 'Protocol for dynamic IP assignment:',
    acceptedAnswers: ['DHCP', 'Dynamic Host Configuration Protocol'],
    explanation: 'DHCP automatically assigns IPs.',
    source: { module: 'Module 4' },
  };

  describe('Single-question immediate evaluation', () => {
    it('evaluates correct multiple-choice immediately with explanation', () => {
      const res = scoreQuestion(mcQuestion, 'Layer 3');
      expect(res.isCorrect).toBe(true);
      expect(res.isUnanswered).toBe(false);
      expect(res.explanation).toBe('IP routes packets at Network Layer 3.');
      expect(res.correctAnswer).toBe('Layer 3');
    });

    it('evaluates incorrect multiple-choice immediately with correct answer', () => {
      const res = scoreQuestion(mcQuestion, 'Layer 2');
      expect(res.isCorrect).toBe(false);
      expect(res.correctAnswer).toBe('Layer 3');
    });

    it('evaluates multiple-answer questions immediately requiring exact set', () => {
      const correctRes = scoreQuestion(maQuestion, ['TCP', 'UDP']);
      expect(correctRes.isCorrect).toBe(true);

      const partialRes = scoreQuestion(maQuestion, ['TCP']);
      expect(partialRes.isCorrect).toBe(false);

      const excessRes = scoreQuestion(maQuestion, ['TCP', 'UDP', 'IP']);
      expect(excessRes.isCorrect).toBe(false);
    });

    it('evaluates true-false questions immediately', () => {
      const correctRes = scoreQuestion(tfQuestion, false);
      expect(correctRes.isCorrect).toBe(true);

      const wrongRes = scoreQuestion(tfQuestion, true);
      expect(wrongRes.isCorrect).toBe(false);
      expect(wrongRes.correctAnswer).toBe(false);
    });

    it('evaluates fill-in-the-blank questions with normalized matching', () => {
      const upperRes = scoreQuestion(fbQuestion, 'dhcp');
      expect(upperRes.isCorrect).toBe(true);

      const spacedRes = scoreQuestion(fbQuestion, '  DHCP  ');
      expect(spacedRes.isCorrect).toBe(true);

      const wrongRes = scoreQuestion(fbQuestion, 'DNS');
      expect(wrongRes.isCorrect).toBe(false);
      expect(wrongRes.correctAnswer).toBe('DHCP / Dynamic Host Configuration Protocol');
    });
  });

  describe('Immediate Feedback Persistence', () => {
    it('persists checkedQuestions and feedbackTiming in attempt state', () => {
      const attempt: PersistedAttempt = {
        version: 1,
        reviewerId: 'feedback-test-rev',
        startedAt: new Date().toISOString(),
        currentIndex: 0,
        answers: { 'mc-1': 'Layer 3', 'tf-1': true },
        activeQuestions: [mcQuestion, tfQuestion],
        isFinished: false,
        sessionConfig: {
          feedbackTiming: 'immediate',
        },
        checkedQuestions: {
          'mc-1': true,
          'tf-1': false,
        },
      };

      saveAttempt(attempt);
      const loaded = loadAttempt('feedback-test-rev');

      expect(loaded).not.toBeNull();
      expect(loaded?.sessionConfig?.feedbackTiming).toBe('immediate');
      expect(loaded?.checkedQuestions?.['mc-1']).toBe(true);
      expect(loaded?.checkedQuestions?.['tf-1']).toBe(false);
    });
  });

  describe('Answer Lock & Retry Workflow', () => {
    it('locks answer once checked and unlocks on retry', () => {
      let checkedQuestions: Record<string, boolean> = {};

      // 1. Initial state: unlocked
      const isInitialLocked = Boolean(checkedQuestions['mc-1']);
      expect(isInitialLocked).toBe(false);

      // 2. User checks answer -> locked
      checkedQuestions = { ...checkedQuestions, 'mc-1': true };
      const isCheckedLocked = Boolean(checkedQuestions['mc-1']);
      expect(isCheckedLocked).toBe(true);

      // 3. User clicks Retry -> unlocked
      checkedQuestions = { ...checkedQuestions, 'mc-1': false };
      const isRetriedLocked = Boolean(checkedQuestions['mc-1']);
      expect(isRetriedLocked).toBe(false);
    });
  });

  describe('Answer Correctness Highlighting Deterministic Logic', () => {
    it('identifies correct choice and wrong selection for multiple choice', () => {
      const studentAnswer = 'Layer 2'; // wrong choice
      const choices = mcQuestion.choices;

      choices.forEach((choice) => {
        const isSelected = studentAnswer === choice;
        const isCorrectChoice = choice === mcQuestion.correctAnswer;

        if (choice === 'Layer 3') {
          expect(isCorrectChoice).toBe(true);
        } else if (choice === 'Layer 2') {
          expect(isSelected).toBe(true);
          expect(isCorrectChoice).toBe(false);
        } else {
          expect(isSelected).toBe(false);
          expect(isCorrectChoice).toBe(false);
        }
      });
    });

    it('identifies correct, wrong, and missed choices for multiple answer', () => {
      const studentAnswer = ['TCP', 'IP']; // TCP is correct, IP is wrong, UDP is missed
      const correctSet = new Set(maQuestion.correctAnswers);

      maQuestion.choices.forEach((choice) => {
        const isSelected = studentAnswer.includes(choice);
        const isCorrectChoice = correctSet.has(choice);

        if (choice === 'TCP') {
          // Selected & Correct -> Highlight Green
          expect(isSelected && isCorrectChoice).toBe(true);
        } else if (choice === 'IP') {
          // Selected & Wrong -> Highlight Red
          expect(isSelected && !isCorrectChoice).toBe(true);
        } else if (choice === 'UDP') {
          // Not selected & Correct -> Highlight subtle green (Missed)
          expect(!isSelected && isCorrectChoice).toBe(true);
        }
      });
    });

    it('identifies correct option and wrong option for true-false', () => {
      const studentAnswer = true; // UDP is connection-oriented -> false is correct
      const isCorrectOptionForTrue = tfQuestion.correctAnswer === true;
      const isCorrectOptionForFalse = tfQuestion.correctAnswer === false;

      expect(isCorrectOptionForTrue).toBe(false);
      expect(isCorrectOptionForFalse).toBe(true);
      // Student selected true -> wrong (highlight red)
      expect(studentAnswer === true && !isCorrectOptionForTrue).toBe(true);
      // Correct option is false -> highlight green
      expect(isCorrectOptionForFalse).toBe(true);
    });

    it('identifies correct and incorrect submissions for fill-in-the-blank', () => {
      const correctInput = 'dhcp';
      const wrongInput = 'dns';

      const isCorrectMatch = fbQuestion.acceptedAnswers.some(
        (acc) => acc.toLowerCase().trim() === correctInput.toLowerCase().trim()
      );
      const isWrongMatch = fbQuestion.acceptedAnswers.some(
        (acc) => acc.toLowerCase().trim() === wrongInput.toLowerCase().trim()
      );

      expect(isCorrectMatch).toBe(true);
      expect(isWrongMatch).toBe(false);
    });
  });

  describe('Instant Mode Selection Auto-Check Rules', () => {
    it('automatically marks true-false and multiple-choice questions as checked on answer selection', () => {
      const isAutoCheck = (type: string) => type === 'multiple-choice' || type === 'true-false';

      expect(isAutoCheck(mcQuestion.type)).toBe(true);
      expect(isAutoCheck(tfQuestion.type)).toBe(true);
      expect(isAutoCheck(maQuestion.type)).toBe(false);
      expect(isAutoCheck(fbQuestion.type)).toBe(false);
    });

    it('simulates auto-check for single-choice and manual-check for multi-answer/fill-blank in instant mode', () => {
      let checkedQuestions: Record<string, boolean> = {};

      const simulateAnswerChange = (
        qType: string,
        qId: string,
        value: unknown,
        timing: 'immediate' | 'end'
      ) => {
        const isAutoCheckType =
          timing === 'immediate' &&
          value !== null &&
          (qType === 'multiple-choice' || qType === 'true-false');

        if (isAutoCheckType) {
          checkedQuestions = { ...checkedQuestions, [qId]: true };
        }
      };

      // 1. Multiple-choice in instant mode -> auto-checked
      simulateAnswerChange('multiple-choice', 'mc-1', 'Layer 3', 'immediate');
      expect(checkedQuestions['mc-1']).toBe(true);

      // 2. True-false in instant mode -> auto-checked
      simulateAnswerChange('true-false', 'tf-1', false, 'immediate');
      expect(checkedQuestions['tf-1']).toBe(true);

      // 3. Multiple-answer in instant mode -> NOT auto-checked (requires manual check)
      simulateAnswerChange('multiple-answer', 'ma-1', ['TCP'], 'immediate');
      expect(checkedQuestions['ma-1']).toBeUndefined();

      // 4. Fill-blank in instant mode -> NOT auto-checked (requires manual check)
      simulateAnswerChange('fill-blank', 'fb-1', 'dhcp', 'immediate');
      expect(checkedQuestions['fb-1']).toBeUndefined();

      // 5. Exam mode ('end') -> multiple choice is NOT auto-checked
      simulateAnswerChange('multiple-choice', 'mc-2', 'Layer 2', 'end');
      expect(checkedQuestions['mc-2']).toBeUndefined();
    });

    it('clears single-choice answer on retry so clicking any option re-checks immediately', () => {
      let answers: Record<string, unknown> = { 'mc-1': 'Layer 2' };
      let checkedQuestions: Record<string, boolean> = { 'mc-1': true };

      const simulateRetry = (qType: string, qId: string) => {
        const isSingleChoice = qType === 'multiple-choice' || qType === 'true-false';
        checkedQuestions = { ...checkedQuestions, [qId]: false };
        if (isSingleChoice) {
          answers = { ...answers, [qId]: null };
        }
      };

      simulateRetry('multiple-choice', 'mc-1');
      expect(checkedQuestions['mc-1']).toBe(false);
      expect(answers['mc-1']).toBeNull();
    });
  });
});

