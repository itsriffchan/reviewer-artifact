import { describe, it, expect } from 'vitest';
import { shuffleArray, prepareReviewerQuestions } from '@/lib/quiz/randomization';
import { scoreQuestion, scoreQuiz } from '@/lib/scoring/engine';
import { ReviewerData, MultipleChoiceQuestion, MultipleAnswerQuestion } from '@/types/reviewer';

describe('Phase 8 Randomization Verification', () => {
  describe('shuffleArray (Fisher-Yates)', () => {
    it('handles empty and single-element arrays', () => {
      expect(shuffleArray([])).toEqual([]);
      expect(shuffleArray(['alpha'])).toEqual(['alpha']);
    });

    it('preserves all elements and array length', () => {
      const original = ['A', 'B', 'C', 'D', 'E'];
      const shuffled = shuffleArray(original);
      expect(shuffled).toHaveLength(original.length);
      expect([...shuffled].sort()).toEqual([...original].sort());
    });

    it('does not mutate the source array', () => {
      const original = ['A', 'B', 'C', 'D'];
      const copy = [...original];
      shuffleArray(original);
      expect(original).toEqual(copy);
    });

    it('produces deterministic shuffle with controlled RNG', () => {
      // Deterministic constant RNG (always swap with index 0)
      const fakeRng = () => 0;

      const input = [1, 2, 3];
      const result = shuffleArray(input, fakeRng);
      expect(result).toHaveLength(3);
      expect(result.sort()).toEqual([1, 2, 3]);
    });
  });

  describe('prepareReviewerQuestions', () => {
    const mockReviewer: ReviewerData = {
      schemaVersion: 1,
      id: 'test-rand',
      subject: { code: 'TEST101', name: 'Randomization Test', yearLevel: 1 },
      reviewer: {
        title: 'Random Reviewer',
        description: 'Test Reviewer',
        coverage: ['Module 1'],
        shuffleQuestions: true,
        shuffleChoices: true,
      },
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          topic: 'Basics',
          question: 'Question 1',
          choices: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option C',
          explanation: 'Option C is correct',
          source: { module: 'M1' },
        },
        {
          id: 'q2',
          type: 'multiple-answer',
          topic: 'Basics',
          question: 'Question 2',
          choices: ['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4'],
          correctAnswers: ['Choice 1', 'Choice 3'],
          explanation: 'Choices 1 and 3 are correct',
          source: { module: 'M1' },
        },
        {
          id: 'q3',
          type: 'true-false',
          topic: 'Basics',
          question: 'Question 3',
          correctAnswer: true,
          explanation: 'It is true',
          source: { module: 'M1' },
        },
        {
          id: 'q4',
          type: 'fill-blank',
          topic: 'Basics',
          question: 'Question 4',
          acceptedAnswers: ['keyword', 'keyword2'],
          explanation: 'It is keyword',
          source: { module: 'M1' },
        },
      ],
    };

    it('preserves exact question and choice order when shuffle flags are false', () => {
      const unrandomizedReviewer: ReviewerData = {
        ...mockReviewer,
        reviewer: {
          ...mockReviewer.reviewer,
          shuffleQuestions: false,
          shuffleChoices: false,
        },
      };

      const prepared = prepareReviewerQuestions(unrandomizedReviewer);
      expect(prepared.map((q) => q.id)).toEqual(['q1', 'q2', 'q3', 'q4']);

      const mc = prepared[0] as MultipleChoiceQuestion;
      expect(mc.choices).toEqual(['Option A', 'Option B', 'Option C', 'Option D']);

      const ma = prepared[1] as MultipleAnswerQuestion;
      expect(ma.choices).toEqual(['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4']);
    });

    it('shuffles choices when shuffleChoices is true but preserves questions when shuffleQuestions is false', () => {
      const choiceOnlyReviewer: ReviewerData = {
        ...mockReviewer,
        reviewer: {
          ...mockReviewer.reviewer,
          shuffleQuestions: false,
          shuffleChoices: true,
        },
      };

      // Invert RNG sequence to ensure choice order alters
      let counter = 0;
      const deterministicRng = () => {
        counter++;
        return (counter * 0.37) % 1;
      };

      const prepared = prepareReviewerQuestions(choiceOnlyReviewer, deterministicRng);
      expect(prepared.map((q) => q.id)).toEqual(['q1', 'q2', 'q3', 'q4']);

      const mc = prepared[0] as MultipleChoiceQuestion;
      expect(mc.choices).toHaveLength(4);
      expect([...mc.choices].sort()).toEqual(['Option A', 'Option B', 'Option C', 'Option D'].sort());
    });

    it('does not mutate true-false or fill-blank questions during choice shuffling', () => {
      const prepared = prepareReviewerQuestions(mockReviewer);

      const tf = prepared.find((q) => q.id === 'q3');
      expect(tf?.type).toBe('true-false');
      if (tf?.type === 'true-false') {
        expect(tf.correctAnswer).toBe(true);
      }

      const fb = prepared.find((q) => q.id === 'q4');
      expect(fb?.type).toBe('fill-blank');
      if (fb?.type === 'fill-blank') {
        expect(fb.acceptedAnswers).toEqual(['keyword', 'keyword2']);
      }
    });

    it('does not mutate the source reviewer or its question objects', () => {
      const originalChoices = [...(mockReviewer.questions[0] as MultipleChoiceQuestion).choices];
      prepareReviewerQuestions(mockReviewer);
      expect((mockReviewer.questions[0] as MultipleChoiceQuestion).choices).toEqual(originalChoices);
    });
  });

  describe('Scoring correctness with shuffled choices', () => {
    it('scores multiple-choice correctly regardless of choice permutation', () => {
      const mcQuestion: MultipleChoiceQuestion = {
        id: 'q-mc',
        type: 'multiple-choice',
        topic: 'Networking',
        question: 'Which is layer 3?',
        choices: ['Network Layer', 'Transport Layer', 'Application Layer', 'Physical Layer'],
        correctAnswer: 'Network Layer',
        explanation: 'Network is Layer 3',
        source: { module: 'OSI' },
      };

      // Shuffled choices where 'Network Layer' is not at index 0
      const shuffledQuestion: MultipleChoiceQuestion = {
        ...mcQuestion,
        choices: ['Application Layer', 'Physical Layer', 'Network Layer', 'Transport Layer'],
      };

      const correctResult = scoreQuestion(shuffledQuestion, 'Network Layer');
      expect(correctResult.isCorrect).toBe(true);

      const wrongResult = scoreQuestion(shuffledQuestion, 'Physical Layer');
      expect(wrongResult.isCorrect).toBe(false);
    });

    it('scores multiple-answer correctly regardless of choice permutation', () => {
      const maQuestion: MultipleAnswerQuestion = {
        id: 'q-ma',
        type: 'multiple-answer',
        topic: 'Protocols',
        question: 'Select transport protocols',
        choices: ['TCP', 'UDP', 'IP', 'HTTP'],
        correctAnswers: ['TCP', 'UDP'],
        explanation: 'TCP and UDP operate at Layer 4',
        source: { module: 'Transport' },
      };

      const shuffledQuestion: MultipleAnswerQuestion = {
        ...maQuestion,
        choices: ['HTTP', 'UDP', 'IP', 'TCP'],
      };

      // Student selects in arbitrary order
      const correctResult = scoreQuestion(shuffledQuestion, ['UDP', 'TCP']);
      expect(correctResult.isCorrect).toBe(true);

      const wrongResult = scoreQuestion(shuffledQuestion, ['UDP', 'HTTP']);
      expect(wrongResult.isCorrect).toBe(false);
    });

    it('scores full quiz maintaining the provided shuffled question presentation order', () => {
      const reviewer: ReviewerData = {
        schemaVersion: 1,
        id: 'order-test',
        subject: { code: 'ORD', name: 'Order Test', yearLevel: 1 },
        reviewer: {
          title: 'Order Test Reviewer',
          description: 'Testing order preservation in scoreQuiz',
          coverage: ['Mod 1'],
          shuffleQuestions: true,
          shuffleChoices: true,
        },
        questions: [
          {
            id: 'first',
            type: 'true-false',
            topic: 'Order',
            question: 'First?',
            correctAnswer: true,
            explanation: 'Yes',
            source: { module: 'M1' },
          },
          {
            id: 'second',
            type: 'true-false',
            topic: 'Order',
            question: 'Second?',
            correctAnswer: false,
            explanation: 'No',
            source: { module: 'M1' },
          },
        ],
      };

      // Shuffled order: 'second' comes first
      const shuffledQuestions = [reviewer.questions[1], reviewer.questions[0]];
      const answers = { second: false, first: true };

      const summary = scoreQuiz(reviewer, answers, shuffledQuestions);
      expect(summary.results[0].questionId).toBe('second');
      expect(summary.results[1].questionId).toBe('first');
      expect(summary.correctCount).toBe(2);
      expect(summary.scorePercentage).toBe(100);
    });
  });
});
