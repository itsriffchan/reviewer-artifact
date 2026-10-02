/**
 * Core Reviewer Domain Types
 * Defines the public contract between the external Question Bank Generator
 * and the Centralized Academic Reviewer application.
 */

export type QuestionType =
  | 'multiple-choice'
  | 'multiple-answer'
  | 'true-false'
  | 'fill-blank';

export interface QuestionSource {
  module: string;
  page?: number | string;
}

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  topic: string;
  question: string;
  explanation: string;
  source: QuestionSource;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  choices: string[];
  correctAnswer: string;
}

export interface MultipleAnswerQuestion extends BaseQuestion {
  type: 'multiple-answer';
  choices: string[];
  correctAnswers: string[];
  maxChoices?: number;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true-false';
  correctAnswer: boolean;
}

export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill-blank';
  acceptedAnswers: string[];
}

export type Question =
  | MultipleChoiceQuestion
  | MultipleAnswerQuestion
  | TrueFalseQuestion
  | FillBlankQuestion;

export interface QuestionTypeCount {
  type: QuestionType;
  count: number;
}

export interface SubjectMetadata {
  code: string;
  name: string;
  yearLevel: number;
}

export interface ReviewerMetadata {
  title: string;
  description: string;
  coverage: string[];
  shuffleQuestions: boolean;
  shuffleChoices: boolean;
}

export interface ReviewerData {
  schemaVersion: 1;
  id: string;
  subject: SubjectMetadata;
  reviewer: ReviewerMetadata;
  questions: Question[];
}

/**
 * Catalog index types for grouped discovery
 */
export interface SubjectWithReviewers {
  code: string;
  name: string;
  yearLevel: number;
  reviewers: ReviewerSummary[];
}

export interface YearLevelGroup {
  yearLevel: number;
  subjects: SubjectWithReviewers[];
  totalReviewers: number;
}

export interface ReviewerSummary {
  id: string;
  title: string;
  description: string;
  coverage: string[];
  subjectCode: string;
  subjectName: string;
  yearLevel: number;
  questionCount: number;
  questionTypes: QuestionType[];
  questionTypeCounts: QuestionTypeCount[];
  topics: string[];
  shuffleQuestions: boolean;
  shuffleChoices: boolean;
  filePath: string;
}
