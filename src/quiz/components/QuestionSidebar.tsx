'use client';

import React from 'react';
import { Question } from '@/types/reviewer';
import { QuizAnswers, FeedbackTiming } from '../types';
import { CheckCircle2, XCircle, BookOpen, RotateCcw, Sparkles } from 'lucide-react';
import { scoreQuestion } from '@/lib/scoring/engine';

interface QuestionSidebarProps {
  questions: Question[];
  currentIndex: number;
  answers: QuizAnswers;
  feedbackResults?: Record<string, { isChecked: boolean; isCorrect: boolean }>;
  onSelectIndex: (index: number) => void;
  onFinish: () => void;
  feedbackTiming?: FeedbackTiming;
  currentQuestion?: Question;
  isCheckedCurrent?: boolean;
  onTryAgain?: () => void;
  onCheckAnswer?: () => void;
}

export function QuestionSidebar({
  questions,
  currentIndex,
  answers,
  feedbackResults,
  onSelectIndex,
  onFinish,
  feedbackTiming,
  currentQuestion,
  isCheckedCurrent = false,
  onTryAgain,
  onCheckAnswer,
}: QuestionSidebarProps) {
  const total = questions.length;

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

  const hasImmediateFeedback = Boolean(feedbackResults);
  const correctCount = feedbackResults
    ? Object.values(feedbackResults).filter((r) => r.isChecked && r.isCorrect).length
    : 0;
  const incorrectCount = feedbackResults
    ? Object.values(feedbackResults).filter((r) => r.isChecked && !r.isCorrect).length
    : 0;

  // Immediate evaluation for current question
  const isAutoCheckType =
    currentQuestion?.type === 'multiple-choice' || currentQuestion?.type === 'true-false';
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] ?? null : null;
  const currentAnswerProvided = isAnswered(currentQuestion?.id ?? '');
  const evalResult =
    isCheckedCurrent && currentQuestion
      ? scoreQuestion(currentQuestion, currentAnswer)
      : null;

  const formatExpected = () => {
    if (!evalResult) return '';
    if (typeof evalResult.correctAnswer === 'boolean') {
      return evalResult.correctAnswer ? 'True' : 'False';
    }
    if (Array.isArray(evalResult.correctAnswer)) {
      return evalResult.correctAnswer.join(', ');
    }
    return String(evalResult.correctAnswer);
  };

  return (
    <div className="rounded-3xl border border-[#2A2440] bg-[#161224] p-4 sm:p-5 shadow-xl flex flex-col space-y-3.5">
      {/* Sidebar Header & Stats */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#A78BFA]">
            Question Navigator
          </h3>
          <span className="text-xs font-extrabold text-[#34D399]">
            {answeredCount} / {total}
          </span>
        </div>

        {/* Mini progress bar */}
        <div className="h-1.5 w-full rounded-full bg-[#12101D] border border-[#2A2440] overflow-hidden mb-1.5">
          <div
            className="h-full bg-gradient-to-r from-[#6D28D9] via-[#8B5CF6] to-[#34D399] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="text-[11px] text-[#C4B5FD]/70 flex items-center justify-between">
          <span>{progressPercent}% Complete</span>
          {hasImmediateFeedback && (
            <span className="text-[#34D399] font-bold">
              ✓ {correctCount} • ✗ {incorrectCount}
            </span>
          )}
        </div>
      </div>

      {/* Immediate Mode: Side Explanation & Result Card */}
      {feedbackTiming === 'immediate' && (
        <div className="space-y-2 pt-1 border-t border-[#2A2440]">
          {isCheckedCurrent && currentQuestion && evalResult ? (
            <div
              className={`rounded-2xl border p-3.5 text-xs transition-all animate-fadeIn ${
                evalResult.isCorrect
                  ? 'border-[#34D399] bg-[#0F261F] text-[#34D399]'
                  : 'border-rose-500 bg-[#260F16] text-rose-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 font-bold">
                  {evalResult.isCorrect ? (
                    <CheckCircle2 className="h-4 w-4 text-[#34D399] shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  )}
                  <span className={evalResult.isCorrect ? 'text-[#34D399]' : 'text-rose-300'}>
                    {evalResult.isCorrect ? '✓ Correct Answer' : '✗ Incorrect Answer'}
                  </span>
                </div>
                {onTryAgain && (
                  <button
                    type="button"
                    onClick={onTryAgain}
                    title="Unlock and change your answer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#181526] border border-[#2A2440] text-[11px] font-semibold text-[#C4B5FD] hover:text-white cursor-pointer"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    <span>Retry</span>
                  </button>
                )}
              </div>

              {!evalResult.isCorrect && (
                <div className="mb-2 text-[11px] text-[#C4B5FD]">
                  <span className="text-[#C4B5FD]/70">Correct: </span>
                  <span className="font-bold text-white bg-[#12101D] px-1.5 py-0.5 rounded border border-[#2A2440]">
                    {formatExpected()}
                  </span>
                </div>
              )}

              <div className="text-[#F3F0FA] leading-relaxed text-[11px] bg-[#12101D] p-2.5 rounded-xl border border-[#2A2440]">
                <div className="flex items-center gap-1 text-[#A78BFA] font-bold mb-1">
                  <BookOpen className="h-3 w-3" />
                  <span>Rationale</span>
                </div>
                <p>{currentQuestion.explanation}</p>
                {currentQuestion.source?.module && (
                  <div className="mt-1.5 text-[10px] text-[#C4B5FD]/60 font-medium">
                    {currentQuestion.source.module}
                    {currentQuestion.source.page !== undefined ? ` • p. ${currentQuestion.source.page}` : ''}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-[#2A2440] bg-[#12101D] p-2.5 text-[11px] text-[#C4B5FD]/75 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#34D399] shrink-0" />
                <span>
                  {isAutoCheckType
                    ? 'Select an option to check instantly'
                    : currentAnswerProvided
                    ? 'Answer selected. Ready to verify?'
                    : 'Instant Answers ON'}
                </span>
              </div>
              {!isAutoCheckType && currentAnswerProvided && onCheckAnswer && (
                <button
                  type="button"
                  onClick={onCheckAnswer}
                  className="px-2.5 py-1 rounded-lg bg-[#34D399]/20 border border-[#34D399]/60 text-[#34D399] font-bold text-[11px] hover:bg-[#34D399]/30 hover:border-[#34D399] hover:text-white cursor-pointer shadow-sm glow-green-sm transition-all"
                >
                  Check
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="py-2 px-2.5 rounded-xl bg-[#12101D] border border-[#2A2440] text-[10px] flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[#C4B5FD]/70">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#8B5CF6] ring-2 ring-[#A78BFA]" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#8B5CF6]/50" />
          <span>Answered</span>
        </div>
        {hasImmediateFeedback ? (
          <>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#34D399]" />
              <span>Correct</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              <span>Incorrect</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#2A2440]" />
            <span>Unanswered</span>
          </div>
        )}
      </div>

      {/* Question Number Buttons Grid */}
      <div
        className="max-h-[calc(100vh-27rem)] min-h-[120px] overflow-y-auto pr-1 space-y-2 overscroll-contain"
        style={{ scrollbarWidth: 'thin' }}
      >
        <div className="grid grid-cols-5 gap-1.5">
          {questions.map((q, idx) => {
            const answered = isAnswered(q.id);
            const isCurrent = idx === currentIndex;
            const checkedStatus = feedbackResults?.[q.id];

            let buttonStyle =
              'bg-[#12101D] border border-[#2A2440] text-[#C4B5FD]/60 hover:border-[#8B5CF6]/40 hover:bg-[#181526] hover:text-white';

            if (isCurrent) {
              buttonStyle =
                'bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white ring-2 ring-[#A78BFA] shadow-md shadow-[#8B5CF6]/30 glow-purple-sm';
            } else if (checkedStatus?.isChecked) {
              if (checkedStatus.isCorrect) {
                buttonStyle =
                  'bg-[#34D399]/20 border border-[#34D399]/60 text-[#34D399] font-bold hover:bg-[#34D399]/30';
              } else {
                buttonStyle =
                  'bg-rose-500/20 border border-rose-500/60 text-rose-300 font-bold hover:bg-rose-500/30';
              }
            } else if (answered) {
              buttonStyle =
                'bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#C4B5FD] hover:bg-[#8B5CF6]/30';
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
                className={`h-8.5 rounded-xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] cursor-pointer ${buttonStyle}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Finish Reviewer Quick Action in Sidebar */}
      <div className="pt-2.5 border-t border-[#2A2440]">
        <button
          type="button"
          onClick={onFinish}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold bg-[#12101D] border border-[#2A2440] text-[#F3F0FA] hover:bg-[#059669] hover:border-[#34D399] hover:text-white transition-all cursor-pointer shadow-sm glow-green-sm"
        >
          <CheckCircle2 className="h-4 w-4 text-[#34D399]" />
          <span>Finish & View Score</span>
        </button>
      </div>
    </div>
  );
}
