'use client';

import React from 'react';
import { Question } from '@/types/reviewer';
import { AnswerValue } from '../types';
import { scoreQuestion, isAnswerProvided } from '@/lib/scoring/engine';
import {
  CheckCircle2,
  XCircle,
  BookOpen,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface ImmediateFeedbackProps {
  question: Question;
  studentAnswer: AnswerValue;
  isChecked: boolean;
  onCheckAnswer: () => void;
  onTryAgain: () => void;
}

export function ImmediateFeedback({
  question,
  studentAnswer,
  isChecked,
  onCheckAnswer,
  onTryAgain,
}: ImmediateFeedbackProps) {
  const answered = isAnswerProvided(studentAnswer);

  if (!isChecked) {
    return (
      <div className="rounded-2xl border border-[#2A2440] bg-[#12101D] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#C4B5FD]/75">
          <Sparkles className="h-4 w-4 text-[#34D399] shrink-0" />
          <span>
            {answered
              ? 'Answer selected. Ready to verify correctness?'
              : 'Select or input an answer to verify right away.'}
          </span>
        </div>

        <button
          type="button"
          onClick={onCheckAnswer}
          disabled={!answered}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#34D399]/15 border-2 border-[#34D399]/70 px-5 py-2.5 text-xs font-bold text-[#34D399] hover:bg-[#34D399]/25 hover:border-[#34D399] hover:text-white shadow hover:opacity-90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34D399] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer w-full sm:w-auto glow-green-sm"
        >
          <Sparkles className="h-4 w-4 text-[#34D399]" />
          <span>Check Answer</span>
        </button>
      </div>
    );
  }

  const evalResult = scoreQuestion(question, studentAnswer);
  const isCorrect = evalResult.isCorrect;

  // Format expected answer for display
  const formatExpected = () => {
    if (typeof evalResult.correctAnswer === 'boolean') {
      return evalResult.correctAnswer ? 'True' : 'False';
    }
    if (Array.isArray(evalResult.correctAnswer)) {
      return evalResult.correctAnswer.join(', ');
    }
    return String(evalResult.correctAnswer);
  };

  return (
    <div className="space-y-3 animate-fadeIn">
      {/* Result Status Banner */}
      <div
        className={`rounded-2xl border p-4 sm:p-5 ${
          isCorrect
            ? 'border-[#34D399] bg-[#0F261F]'
            : 'border-rose-500 bg-[#260F16]'
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            {isCorrect ? (
              <CheckCircle2 className="h-5 w-5 text-[#34D399] shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
            )}
            <div>
              <span
                className={`text-sm font-extrabold ${
                  isCorrect ? 'text-[#34D399]' : 'text-rose-300'
                }`}
              >
                {isCorrect ? '✓ Correct Answer' : '✗ Incorrect Answer'}
              </span>
              <p className="text-xs text-[#C4B5FD]/80 mt-0.5">
                {isCorrect
                  ? 'Great job! Your selection accurately matches the syllabus.'
                  : 'Your answer is not correct. Review the explanation below.'}
              </p>
            </div>
          </div>

          {!isCorrect && (
            <button
              type="button"
              onClick={onTryAgain}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#181526] border border-[#2A2440] px-3 py-1.5 text-xs font-semibold text-[#C4B5FD] hover:text-white hover:bg-[#211C32] transition-colors cursor-pointer shrink-0"
              title="Clear check to choose another option"
            >
              <RotateCcw className="h-3 w-3 text-[#A78BFA]" />
              <span>Try Again</span>
            </button>
          )}
        </div>

        {!isCorrect && (
          <div className="mt-3 pt-3 border-t border-rose-500/20 text-xs">
            <span className="font-semibold text-[#C4B5FD]/70">Correct Answer: </span>
            <span className="font-bold text-white bg-[#12101D] px-2 py-1 rounded border border-[#2A2440]">
              {formatExpected()}
            </span>
          </div>
        )}
      </div>

      {/* Rationale and Source Details */}
      <div className="rounded-2xl border border-[#2A2440] bg-[#181526]/80 p-4 sm:p-5 text-xs text-[#F3F0FA]">
        <div className="flex items-center gap-2 text-[#A78BFA] font-bold mb-2">
          <BookOpen className="h-4 w-4" />
          <span>Detailed Explanation & Rationale</span>
        </div>

        <p className="leading-relaxed text-[#C4B5FD]/85">{question.explanation}</p>

        {question.source?.module && (
          <div className="mt-3 pt-3 border-t border-[#2A2440] flex items-center gap-2 text-[11px] text-[#A78BFA]/75 font-semibold">
            <span>Syllabus Source:</span>
            <span className="text-[#34D399]">{question.source.module}</span>
            {question.source.page !== undefined && <span>(p. {question.source.page})</span>}
          </div>
        )}
      </div>
    </div>
  );
}
