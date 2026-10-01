'use client';

import React, { useState } from 'react';
import { QuestionResult } from '@/lib/scoring/types';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  RotateCcw,
} from 'lucide-react';

interface AnswerReviewProps {
  results: QuestionResult[];
  onRetryMistakes?: () => void;
}

type ReviewFilter = 'all' | 'correct' | 'incorrect' | 'unanswered';

export function AnswerReview({ results, onRetryMistakes }: AnswerReviewProps) {
  const [filter, setFilter] = useState<ReviewFilter>('all');

  const filteredResults = results.filter((res) => {
    if (filter === 'correct') return res.isCorrect;
    if (filter === 'incorrect') return !res.isCorrect && !res.isUnanswered;
    if (filter === 'unanswered') return res.isUnanswered;
    return true;
  });

  const correctCount = results.filter((r) => r.isCorrect).length;
  const unansweredCount = results.filter((r) => r.isUnanswered).length;
  const incorrectCount = results.length - correctCount - unansweredCount;

  const formatAnswerValue = (val: string | string[] | boolean | null) => {
    if (val === null || val === undefined) {
      return <span className="italic text-[#C4B5FD]/50">(No answer provided)</span>;
    }
    if (typeof val === 'boolean') {
      return val ? 'True' : 'False';
    }
    if (Array.isArray(val)) {
      if (val.length === 0) {
        return <span className="italic text-[#C4B5FD]/50">(No options selected)</span>;
      }
      return (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {val.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center rounded-lg bg-[#211C32] border border-[#2A2440] px-2 py-0.5 text-xs text-[#F3F0FA]"
            >
              {item}
            </span>
          ))}
        </div>
      );
    }
    return <span>{val}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A2440]">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>📝 Detailed Answer Breakdown</span>
          </h2>
          <p className="text-xs text-[#C4B5FD]/75 mt-1">
            Review question outcomes, compare your responses with correct answers, and study explanations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onRetryMistakes && results.some((r) => !r.isCorrect) && (
            <button
              type="button"
              onClick={onRetryMistakes}
              className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500/25 hover:border-rose-400 hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry Mistakes 🎯</span>
            </button>
          )}

          {/* Filter Tabs */}
          <div
          className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[#2A2440] bg-[#12101D] p-1.5 self-start sm:self-auto"
          role="tablist"
          aria-label="Filter answers by outcome"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            onClick={() => setFilter('all')}
            className={`btn-tactile px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] cursor-pointer ${
              filter === 'all'
                ? 'bg-[#8B5CF6] text-white shadow-sm glow-purple-sm'
                : 'text-[#C4B5FD]/70 hover:text-white hover:bg-[#181526]'
            }`}
          >
            All ({results.length})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter === 'correct'}
            onClick={() => setFilter('correct')}
            className={`btn-tactile flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34D399] cursor-pointer ${
              filter === 'correct'
                ? 'bg-[#059669] text-white shadow-sm glow-green-sm'
                : 'text-[#C4B5FD]/70 hover:text-[#34D399] hover:bg-[#181526]'
            }`}
          >
            <span>✓ Correct ({correctCount})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter === 'incorrect'}
            onClick={() => setFilter('incorrect')}
            className={`btn-tactile flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer ${
              filter === 'incorrect'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-[#C4B5FD]/70 hover:text-rose-400 hover:bg-[#181526]'
            }`}
          >
            <span>✗ Incorrect ({incorrectCount})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter === 'unanswered'}
            onClick={() => setFilter('unanswered')}
            className={`btn-tactile flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] cursor-pointer ${
              filter === 'unanswered'
                ? 'bg-[#211C32] text-white shadow-sm'
                : 'text-[#C4B5FD]/70 hover:text-white hover:bg-[#181526]'
            }`}
          >
            <span>○ Skipped ({unansweredCount})</span>
          </button>
        </div>
      </div>
    </div>

      {/* Filtered Question Cards */}
      {filteredResults.length > 0 ? (
        <div className="space-y-5">
          {filteredResults.map((res) => {
            const originalIndex = results.findIndex((r) => r.questionId === res.questionId);

            return (
              <div
                key={res.questionId}
                className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                  res.isCorrect
                    ? 'border-[#34D399]/40 bg-[#161224] shadow-md'
                    : res.isUnanswered
                    ? 'border-[#2A2440] bg-[#161224]'
                    : 'border-rose-500/40 bg-[#161224] shadow-md'
                }`}
              >
                {/* Question Status Badge and Topic */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#A78BFA]">
                      Question {originalIndex + 1}
                    </span>
                    <span className="inline-flex items-center rounded-lg bg-[#211C32] border border-[#2A2440] px-2.5 py-0.5 text-xs font-semibold text-[#F3F0FA]">
                      {res.topic}
                    </span>
                  </div>

                  {/* Status Indicator (Text + Symbolic Icon) */}
                  {res.isCorrect ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#34D399]/15 border border-[#34D399]/40 px-3 py-1 text-xs font-bold text-[#34D399] glow-green-sm">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>✓ Correct</span>
                    </span>
                  ) : res.isUnanswered ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#211C32] border border-[#2A2440] px-3 py-1 text-xs font-semibold text-[#C4B5FD]/70">
                      <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>○ Unanswered</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/40 px-3 py-1 text-xs font-bold text-rose-300">
                      <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>✗ Incorrect</span>
                    </span>
                  )}
                </div>

                {/* Prompt */}
                <h3 className="text-base font-bold text-white mb-4 leading-relaxed">
                  {res.questionPrompt}
                </h3>

                {/* Response Comparison Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {/* Student's Selection */}
                  <div
                    className={`rounded-xl border p-3.5 text-xs ${
                      res.isCorrect
                        ? 'border-[#34D399]/30 bg-[#34D399]/10 text-white'
                        : res.isUnanswered
                        ? 'border-[#2A2440] bg-[#12101D] text-[#C4B5FD]/70'
                        : 'border-rose-500/30 bg-rose-500/10 text-white'
                    }`}
                  >
                    <span className="block font-bold uppercase tracking-wider text-[#A78BFA] text-[10px] mb-1">
                      Your Answer:
                    </span>
                    <div className="font-semibold">{formatAnswerValue(res.studentAnswer)}</div>
                  </div>

                  {/* Correct Answer */}
                  <div className="rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 p-3.5 text-xs text-white">
                    <span className="block font-bold uppercase tracking-wider text-[#34D399] text-[10px] mb-1">
                      Correct Answer:
                    </span>
                    <div className="font-semibold">{formatAnswerValue(res.correctAnswer)}</div>
                  </div>
                </div>

                {/* Explanation Callout */}
                <div className="rounded-xl border border-[#2A2440] bg-[#12101D]/80 p-3.5 text-xs text-[#C4B5FD]">
                  <div className="flex items-center gap-1.5 font-bold text-[#A78BFA] text-[11px] mb-1">
                    <Info className="h-3.5 w-3.5 text-[#34D399]" />
                    <span>Explanation:</span>
                  </div>
                  <p className="leading-relaxed text-[#F3F0FA] pl-5">{res.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#2A2440] bg-[#181526]/30 p-8 text-center text-xs text-[#C4B5FD]/60">
          No questions match the selected filter (&ldquo;{filter}&rdquo;).
        </div>
      )}
    </div>
  );
}
