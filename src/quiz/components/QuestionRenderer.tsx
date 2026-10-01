'use client';

import React from 'react';
import { Question } from '@/types/reviewer';
import { AnswerValue } from '../types';
import { MultipleChoice } from './MultipleChoice';
import { MultipleAnswer } from './MultipleAnswer';
import { TrueFalse } from './TrueFalse';
import { FillBlank } from './FillBlank';

interface QuestionRendererProps {
  question: Question;
  answer: AnswerValue;
  onAnswerChange: (value: AnswerValue) => void;
  choices?: string[];
  disabled?: boolean;
  showFeedback?: boolean;
}

export function QuestionRenderer({
  question,
  answer,
  onAnswerChange,
  choices,
  disabled = false,
  showFeedback = false,
}: QuestionRendererProps) {
  switch (question.type) {
    case 'multiple-choice':
      return (
        <MultipleChoice
          question={question}
          value={typeof answer === 'string' ? answer : null}
          onChange={(val) => onAnswerChange(val)}
          choices={choices}
          disabled={disabled}
          showFeedback={showFeedback}
        />
      );

    case 'multiple-answer':
      return (
        <MultipleAnswer
          question={question}
          value={Array.isArray(answer) ? answer : null}
          onChange={(val) => onAnswerChange(val)}
          choices={choices}
          disabled={disabled}
          showFeedback={showFeedback}
        />
      );

    case 'true-false':
      return (
        <TrueFalse
          question={question}
          value={typeof answer === 'boolean' ? answer : null}
          onChange={(val) => onAnswerChange(val)}
          disabled={disabled}
          showFeedback={showFeedback}
        />
      );

    case 'fill-blank':
      return (
        <FillBlank
          question={question}
          value={typeof answer === 'string' ? answer : null}
          onChange={(val) => onAnswerChange(val)}
          disabled={disabled}
          showFeedback={showFeedback}
        />
      );

    default: {
      const exhaustiveCheck: never = question;
      return (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          Unsupported question type: {(exhaustiveCheck as { type?: string })?.type}
        </div>
      );
    }
  }
}
