import { describe, expect, it } from 'vitest';
import { getQuestionTypeCounts } from '@/lib/content/questionStats';
import { Question } from '@/types/reviewer';

describe('question type statistics', () => {
  it('counts each supported format in a stable display order', () => {
    const questions = [
      { type: 'fill-blank' },
      { type: 'multiple-choice' },
      { type: 'multiple-choice' },
      { type: 'true-false' },
      { type: 'multiple-answer' },
    ] as Question[];

    expect(getQuestionTypeCounts(questions)).toEqual([
      { type: 'multiple-choice', count: 2 },
      { type: 'multiple-answer', count: 1 },
      { type: 'true-false', count: 1 },
      { type: 'fill-blank', count: 1 },
    ]);
  });

  it('omits formats that are not present', () => {
    const questions = [{ type: 'true-false' }] as Question[];

    expect(getQuestionTypeCounts(questions)).toEqual([
      { type: 'true-false', count: 1 },
    ]);
  });
});
