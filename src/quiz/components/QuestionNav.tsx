'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { QuizAnswers } from '../types';
import { Question } from '@/types/reviewer';

interface QuestionNavProps {
  questions: Question[];
  currentIndex: number;
  answers: QuizAnswers;
  feedbackResults?: Record<string, { isChecked: boolean; isCorrect: boolean }>;
  onSelectIndex: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export function QuestionNav({
  questions,
  currentIndex,
  answers,
  feedbackResults,
  onSelectIndex,
  onPrev,
  onNext,
  onFinish,
}: QuestionNavProps) {
  const total = questions.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  // Determine if a question is answered
  const isAnswered = (qId: string) => {
    const ans = answers[qId];
    if (ans === null || ans === undefined) return false;
    if (typeof ans === 'string') return ans.trim().length > 0;
    if (Array.isArray(ans)) return ans.length > 0;
    if (typeof ans === 'boolean') return true;
    return false;
  };

  const answeredCount = questions.filter((q) => isAnswered(q.id)).length;
  const progressPercent = Math.round((answeredCount / total) * 100);

  return (
    <div className="space-y-6">
      {/* Question Palette Grid */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-semibold text-slate-300 uppercase tracking-wider">
            Question Navigator
          </span>
          <span className="text-slate-400">
            {answeredCount} of {total} answered ({progressPercent}%)
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {questions.map((q, idx) => {
            const answered = isAnswered(q.id);
            const isCurrent = idx === currentIndex;
            const checkedStatus = feedbackResults?.[q.id];

            let buttonStyle = 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800';

            if (isCurrent) {
              buttonStyle = 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-md shadow-indigo-600/30';
            } else if (checkedStatus?.isChecked) {
              if (checkedStatus.isCorrect) {
                buttonStyle = 'bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 font-bold hover:bg-emerald-500/30';
              } else {
                buttonStyle = 'bg-rose-500/20 border border-rose-500/60 text-rose-300 font-bold hover:bg-rose-500/30';
              }
            } else if (answered) {
              buttonStyle = 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30';
            }

            const statusText = checkedStatus?.isChecked
              ? checkedStatus.isCorrect
                ? ' (correct)'
                : ' (incorrect)'
              : answered
              ? ' (answered)'
              : '';

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onSelectIndex(idx)}
                aria-label={`Jump to question ${idx + 1}${statusText}${isCurrent ? ' (current)' : ''}`}
                className={`h-10 w-10 sm:h-9 sm:w-9 rounded-xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer ${buttonStyle}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prev / Next / Finish Controls */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirst}
          className={`inline-flex items-center justify-center gap-2 rounded-xl min-h-[44px] px-5 py-2.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer ${
            isFirst
              ? 'opacity-40 !cursor-not-allowed bg-slate-900 border border-slate-800 text-slate-500'
              : 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-3">
          {!isLast ? (
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center justify-center gap-2 rounded-xl min-h-[44px] bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onFinish}
              className="inline-flex items-center justify-center gap-2 rounded-xl min-h-[44px] bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Finish Reviewer</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
