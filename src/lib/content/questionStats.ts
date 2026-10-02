import { Question, QuestionType, QuestionTypeCount } from '@/types/reviewer';

const QUESTION_TYPE_ORDER: QuestionType[] = [
  'multiple-choice',
  'multiple-answer',
  'true-false',
  'fill-blank',
];

/**
 * Derives a stable question-format breakdown from reviewer content.
 * Types with no questions are omitted from the result.
 */
export function getQuestionTypeCounts(questions: Question[]): QuestionTypeCount[] {
  return QUESTION_TYPE_ORDER.flatMap((type) => {
    const count = questions.filter((question) => question.type === type).length;
    return count > 0 ? [{ type, count }] : [];
  });
}
