export type AnswerValue =
  | string           // multiple-choice or fill-blank
  | string[]         // multiple-answer
  | boolean          // true-false
  | null;            // unanswered

export type QuizAnswers = Record<string, AnswerValue>;

export type FeedbackTiming = 'end' | 'immediate';

export interface SessionConfig {
  questionCount?: number;
  selectedModules?: string[];
  feedbackTiming?: FeedbackTiming;
  isMistakeRetry?: boolean;
  seenQuestionIds?: string[];
}

export interface QuizSessionState {
  currentQuestionIndex: number;
  answers: QuizAnswers;
  isFinished: boolean;
  sessionConfig?: SessionConfig;
}
