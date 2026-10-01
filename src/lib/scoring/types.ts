import { QuestionType } from '@/types/reviewer';
import { AnswerValue } from '@/quiz/types';

export interface QuestionResult {
  questionId: string;
  questionType: QuestionType;
  topic: string;
  questionPrompt: string;
  studentAnswer: AnswerValue;
  correctAnswer: string | string[] | boolean;
  isCorrect: boolean;
  isUnanswered: boolean;
  explanation: string;
}

export interface QuizScoreSummary {
  reviewerId: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  scorePercentage: number;
  results: QuestionResult[];
}
