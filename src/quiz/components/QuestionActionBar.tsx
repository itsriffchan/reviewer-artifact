'use client';

import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, Sparkles, Zap } from 'lucide-react';
import { FeedbackTiming } from '../types';

interface QuestionActionBarProps {
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
  isSticky?: boolean;
  feedbackTiming?: FeedbackTiming;
  isChecked?: boolean;
  canCheck?: boolean;
  onCheckAnswer?: () => void;
  onTryAgain?: () => void;
  jumpToUnanswered?: boolean;
  onToggleUnanswered?: () => void;
  unansweredCount?: number;
  isAutoCheckType?: boolean;
}

export function QuestionActionBar({
  currentIndex,
  total,
  onPrev,
  onNext,
  onFinish,
  isSticky = false,
  feedbackTiming,
  isChecked = false,
  canCheck = false,
  onCheckAnswer,
  onTryAgain,
  jumpToUnanswered = false,
  onToggleUnanswered,
  unansweredCount = 0,
  isAutoCheckType = false,
}: QuestionActionBarProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  // Keyboard shortcut listener for Left/Right arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger if typing in an input or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowRight' && !isLast) {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft' && !isFirst) {
        e.preventDefault();
        onPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFirst, isLast, onNext, onPrev]);

  return (
    <div
      className={`flex items-center justify-between gap-2 sm:gap-3 pt-4 border-t border-[#2A2440] ${
        isSticky
          ? 'sticky bottom-3 z-20 bg-[#12101D] border border-[#2A2440] p-3 rounded-2xl shadow-2xl'
          : ''
      }`}
    >
      {/* Previous Button */}
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirst}
        className={`btn-tactile inline-flex items-center justify-center gap-1.5 rounded-xl min-h-[38px] px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-bold shrink-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] cursor-pointer ${
          isFirst
            ? 'opacity-30 !cursor-not-allowed bg-[#12101D] border border-[#2A2440] text-[#C4B5FD]/40'
            : 'bg-[#181526] border border-[#2A2440] text-[#C4B5FD] hover:bg-[#211C32] hover:text-white hover:border-[#8B5CF6]/40'
        }`}
      >
        <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
        <span>Previous</span>
      </button>

      {/* Center Group: Question Counter */}
      <div className="flex items-center justify-center">
        <span className="text-xs text-[#C4B5FD]/75 font-medium hidden sm:inline-block whitespace-nowrap">
          Question <strong className="text-white">{currentIndex + 1}</strong> of{' '}
          <strong className="text-white">{total}</strong>
        </span>
      </div>

      {/* Action Buttons: Unanswered Toggle, Check Answer / Retry, and Next / Finish */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Toggle jump to next unanswered question */}
        {onToggleUnanswered && total > 1 && (
          <button
            type="button"
            onClick={onToggleUnanswered}
            disabled={unansweredCount === 0}
            aria-pressed={jumpToUnanswered}
            title={
              unansweredCount === 0
                ? 'All questions answered'
                : jumpToUnanswered
                ? 'Skip to unanswered is ON. Click to turn off.'
                : 'Toggle jump to next unanswered question'
            }
            className={`btn-tactile inline-flex items-center justify-center gap-1.5 rounded-xl min-h-[38px] px-2.5 sm:px-3 py-2 text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              unansweredCount === 0
                ? 'opacity-30 !cursor-not-allowed bg-[#181526] border border-[#2A2440] text-[#C4B5FD]/40'
                : jumpToUnanswered
                ? 'bg-[#8B5CF6]/25 border border-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/30 glow-purple-sm ring-1 ring-[#8B5CF6]'
                : 'bg-[#181526] border border-[#2A2440] text-[#C4B5FD] hover:bg-[#211C32] hover:text-white hover:border-[#8B5CF6]/40'
            }`}
          >
            <Zap className={`h-3.5 w-3.5 shrink-0 ${jumpToUnanswered ? 'text-[#34D399] fill-[#34D399]' : 'text-[#A78BFA]'}`} />
            <span className="hidden sm:inline">Unanswered</span>
            {unansweredCount > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                  jumpToUnanswered ? 'bg-[#34D399] text-[#0B0914]' : 'bg-[#2A2440] text-[#C4B5FD]'
                }`}
              >
                {unansweredCount}
              </span>
            )}
          </button>
        )}

        {/* Check Answer or Retry (Immediate Feedback Mode) - positioned beside Next Question */}
        {feedbackTiming === 'immediate' && (
          <>
            {!isChecked && !isAutoCheckType && onCheckAnswer && (
              <button
                type="button"
                onClick={onCheckAnswer}
                disabled={!canCheck}
                title={canCheck ? 'Check if your answer is correct' : 'Select an answer first to check'}
                className={`btn-tactile inline-flex items-center justify-center gap-1.5 rounded-xl min-h-[38px] px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-extrabold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34D399] shrink-0 cursor-pointer ${
                  canCheck
                    ? 'bg-[#34D399]/15 border-2 border-[#34D399]/80 text-[#34D399] hover:bg-[#34D399]/25 hover:border-[#34D399] hover:text-white shadow-md shadow-[#34D399]/20 glow-green-sm'
                    : 'opacity-40 !cursor-not-allowed bg-[#181526] border border-[#2A2440] text-[#C4B5FD]/40'
                }`}
              >
                <Sparkles className={`h-3.5 w-3.5 shrink-0 ${canCheck ? 'text-[#34D399]' : 'text-[#C4B5FD]/40'}`} />
                <span className="hidden sm:inline">Check Answer</span>
                <span className="sm:hidden">Check</span>
              </button>
            )}

            {isChecked && onTryAgain && (
              <button
                type="button"
                onClick={onTryAgain}
                className="btn-tactile inline-flex items-center justify-center gap-1.5 rounded-xl min-h-[38px] px-3 py-2 text-xs sm:text-sm font-semibold bg-[#181526] border border-amber-500/50 text-amber-300 hover:text-white hover:bg-amber-500/20 hover:border-amber-400 transition-all cursor-pointer shrink-0"
                title="Unlock and change your answer"
              >
                <RotateCcw className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Retry</span>
              </button>
            )}
          </>
        )}

        {!isLast ? (
          <button
            type="button"
            onClick={onNext}
            className="btn-tactile inline-flex items-center justify-center gap-1.5 rounded-xl min-h-[38px] bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#8B5CF6]/30 hover:from-[#7C3AED] hover:to-[#9333EA] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] shrink-0 cursor-pointer glow-purple-sm"
          >
            <span>Next</span>
            <span className="hidden sm:inline">&nbsp;Question</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onFinish}
            className="btn-tactile inline-flex items-center justify-center gap-1.5 rounded-xl min-h-[38px] bg-gradient-to-r from-[#059669] to-[#34D399] px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-[#34D399]/30 hover:from-[#047857] hover:to-[#10B981] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34D399] shrink-0 cursor-pointer glow-green-sm"
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Finish & View Score 🏆</span>
            <span className="sm:hidden">Finish 🏆</span>
          </button>
        )}
      </div>
    </div>
  );
}
