import { describe, it, expect } from 'vitest';
import { getMaxChoices } from '@/quiz/components/MultipleAnswer';
import { multipleAnswerQuestionSchema } from '@/schemas/reviewerSchema';
import { loadReviewerFile } from '@/lib/content/reviewerLoader';
import { MultipleAnswerQuestion } from '@/types/reviewer';
import path from 'path';

describe('Multiple-Answer Choice Restriction & (Choose X) Indicator Logic', () => {
  const baseQuestion: MultipleAnswerQuestion = {
    id: 'test-q1',
    type: 'multiple-answer',
    topic: 'Testing Topic',
    question: '(Choose 3) Select all objectives included in the lab.',
    choices: ['Choice A', 'Choice B', 'Choice C', 'Choice D', 'Choice E'],
    correctAnswers: ['Choice A', 'Choice B', 'Choice C'],
    explanation: 'Explanation text',
    source: {
      module: 'Module 1',
      page: 10,
    },
  };

  it('correctly parses numeric "(Choose X)" indicators from question prompt', () => {
    expect(getMaxChoices(baseQuestion)).toBe(3);
    expect(getMaxChoices({ ...baseQuestion, question: '(Choose 2) Select two options.' })).toBe(2);
    expect(getMaxChoices({ ...baseQuestion, question: '(Choose 4) Select four options.' })).toBe(4);
    expect(getMaxChoices({ ...baseQuestion, question: '(Choose 6) Select six options.' })).toBe(6);
    expect(getMaxChoices({ ...baseQuestion, question: 'Choose 5 items from the list.' })).toBe(5);
    expect(getMaxChoices({ ...baseQuestion, question: '(Select 3) Select the items.' })).toBe(3);
  });

  it('correctly parses word "(Choose three)" indicators from question prompt', () => {
    expect(getMaxChoices({ ...baseQuestion, question: '(Choose two) options.' })).toBe(2);
    expect(getMaxChoices({ ...baseQuestion, question: '(Choose three) options.' })).toBe(3);
    expect(getMaxChoices({ ...baseQuestion, question: '(Choose four) options.' })).toBe(4);
  });

  it('prioritizes explicit maxChoices property when present', () => {
    const qWithExplicit: MultipleAnswerQuestion = {
      ...baseQuestion,
      question: '(Choose 3) Select all objectives.',
      maxChoices: 3,
    };
    expect(getMaxChoices(qWithExplicit)).toBe(3);

    const qWithCustomExplicit: MultipleAnswerQuestion = {
      ...baseQuestion,
      question: 'Select the options.',
      maxChoices: 4,
    };
    expect(getMaxChoices(qWithCustomExplicit)).toBe(4);
  });

  it('returns null when no choose restriction is specified', () => {
    const unconstrained: MultipleAnswerQuestion = {
      ...baseQuestion,
      question: 'Which of the following protocols operate primarily at Layer 4?',
    };
    expect(getMaxChoices(unconstrained)).toBeNull();
  });

  it('validates optional maxChoices property against reviewerSchema', () => {
    const valid = multipleAnswerQuestionSchema.safeParse({
      ...baseQuestion,
      maxChoices: 3,
    });
    expect(valid.success).toBe(true);

    // maxChoices < correctAnswers.length must fail
    const invalidLow = multipleAnswerQuestionSchema.safeParse({
      ...baseQuestion,
      maxChoices: 2, // correctAnswers has 3!
    });
    expect(invalidLow.success).toBe(false);

    // maxChoices > choices.length must fail
    const invalidHigh = multipleAnswerQuestionSchema.safeParse({
      ...baseQuestion,
      maxChoices: 10, // choices only has 5!
    });
    expect(invalidHigh.success).toBe(false);
  });

  describe('CS0016 Updated Reviewer JSON Audit', () => {
    const filePath = path.resolve('reviewers/year-3/CS0016/CS0016-midterm.json');
    const res = loadReviewerFile(filePath);

    it('loads the CS0016 reviewer file successfully', () => {
      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
    });

    it('verifies all 43 multiple-answer questions have explicit (Choose X) matching correctAnswers.length', () => {
      const reviewer = res.data!;
      const maQuestions = reviewer.questions.filter((q) => q.type === 'multiple-answer');
      expect(maQuestions.length).toBe(43);

      for (const q of maQuestions) {
        if (q.type !== 'multiple-answer') continue;

        const max = getMaxChoices(q);
        expect(max).not.toBeNull();
        expect(max).toBe(q.correctAnswers.length);
        expect(max).toBeLessThan(q.choices.length);
        expect(max).toBeGreaterThanOrEqual(2);
      }
    });
  });
});
