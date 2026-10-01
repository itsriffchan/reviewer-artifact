'use client';

import React from 'react';
import Link from 'next/link';
import { QuizScoreSummary } from '@/lib/scoring/types';
import {
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  SlidersHorizontal,
  Play,
  Sparkles,
} from 'lucide-react';

interface ScoreCardProps {
  summary: QuizScoreSummary;
  subjectCode: string;
  reviewerTitle: string;
  reviewerId?: string;
  onRetry: () => void;
  onRetryMistakes?: () => void;
  remainingUnseenCount?: number;
  continueBatchOptions?: number[];
  onContinueCustom?: (count: number) => void;
}

export function ScoreCard({
  summary,
  subjectCode,
  reviewerTitle,
  reviewerId,
  onRetry,
  onRetryMistakes,
  remainingUnseenCount,
  continueBatchOptions,
  onContinueCustom,
}: ScoreCardProps) {
  const { totalQuestions, correctCount, incorrectCount, unansweredCount, scorePercentage } = summary;
  const mistakeCount = incorrectCount + unansweredCount;

  // Academic rating based on percentage with playful character
  const getRating = (pct: number) => {
    if (pct >= 90) {
      return {
        emoji: '🏆',
        label: 'Legendary Mastery!',
        subtitle: 'Outstanding grasp of the concepts! You are fully exam-ready.',
        badgeStyle: 'border-[#34D399]/40 bg-[#34D399]/15 text-[#34D399]',
        scoreColor: 'text-[#34D399]',
      };
    }
    if (pct >= 75) {
      return {
        emoji: '🌟',
        label: 'High Honors!',
        subtitle: 'Strong conceptual foundation. Excellent performance!',
        badgeStyle: 'border-[#8B5CF6]/40 bg-[#8B5CF6]/15 text-[#A78BFA]',
        scoreColor: 'text-[#A78BFA]',
      };
    }
    if (pct >= 50) {
      return {
        emoji: '📚',
        label: 'Solid Practice Run!',
        subtitle: 'Passing mark achieved. Review missed questions to level up!',
        badgeStyle: 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300',
        scoreColor: 'text-cyan-300',
      };
    }
    return {
      emoji: '🌱',
      label: 'Practice Makes Progress!',
      subtitle: "Don't fret — review the explanations below and run another practice drill.",
      badgeStyle: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
      scoreColor: 'text-amber-400',
    };
  };

  const rating = getRating(scorePercentage);

  return (
    <div className="rounded-3xl border border-[#2A2440] bg-[#161224] p-6 sm:p-10 shadow-xl mb-8">
      {/* Header Info */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative mb-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#12101D] border border-[#2A2440] text-4xl shadow-inner">
            <span>{rating.emoji}</span>
          </div>
          <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center h-7 w-7 rounded-full bg-[#8B5CF6] text-white border-2 border-[#161224] shadow-sm">
            <Award className="h-4 w-4" />
          </span>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl bg-[#181526] border border-[#2A2440] px-3.5 py-1 text-xs font-bold text-[#C4B5FD] mb-3">
          <span className="text-[#A78BFA]">{subjectCode}</span>
          <span className="text-[#2A2440]">•</span>
          <span className="truncate max-w-[280px]">{reviewerTitle}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
          {rating.label}
        </h1>

        <p className="text-xs sm:text-sm text-[#C4B5FD]/80 max-w-md font-medium">
          {rating.subtitle}
        </p>
      </div>

      {/* Primary Score Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="sm:col-span-1 rounded-2xl border border-[#2A2440] bg-[#12101D] p-5 text-center flex flex-col justify-center items-center shadow-inner">
          <span className={`block text-5xl font-black tracking-tight mb-1 ${rating.scoreColor}`}>
            {scorePercentage}%
          </span>
          <span className="text-xs text-[#C4B5FD]/70 font-bold uppercase tracking-wider">Overall Score</span>
          <span className="text-xs font-black text-white mt-1.5 px-2.5 py-0.5 rounded-lg bg-[#181526] border border-[#2A2440]">
            {correctCount} / {totalQuestions} Points
          </span>
        </div>

        <div className="rounded-2xl border border-[#34D399]/40 bg-[#34D399]/10 p-4 text-center flex flex-col justify-center items-center">
          <div className="flex items-center gap-1.5 text-[#34D399] mb-1 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="h-4 w-4" />
            <span>Correct</span>
          </div>
          <span className="text-3xl font-black text-white">{correctCount}</span>
          <span className="text-xs font-semibold text-[#34D399] mt-1">
            {totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0}% accuracy
          </span>
        </div>

        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-center flex flex-col justify-center items-center">
          <div className="flex items-center gap-1.5 text-rose-400 mb-1 font-bold text-xs uppercase tracking-wider">
            <XCircle className="h-4 w-4" />
            <span>Incorrect</span>
          </div>
          <span className="text-3xl font-black text-white">{incorrectCount}</span>
          <span className="text-xs font-semibold text-rose-300 mt-1">
            {totalQuestions > 0 ? Math.round((incorrectCount / totalQuestions) * 100) : 0}% missed
          </span>
        </div>

        <div className="rounded-2xl border border-[#2A2440] bg-[#12101D] p-4 text-center flex flex-col justify-center items-center">
          <div className="flex items-center gap-1.5 text-[#C4B5FD]/70 mb-1 font-bold text-xs uppercase tracking-wider">
            <HelpCircle className="h-4 w-4" />
            <span>Skipped</span>
          </div>
          <span className="text-3xl font-black text-white">{unansweredCount}</span>
          <span className="text-xs font-semibold text-[#C4B5FD]/60 mt-1">
            {totalQuestions > 0 ? Math.round((unansweredCount / totalQuestions) * 100) : 0}% skipped
          </span>
        </div>
      </div>

      {/* Continue Custom Drill with Next Unseen Questions */}
      {remainingUnseenCount !== undefined && remainingUnseenCount > 0 && onContinueCustom && (
        <div className="rounded-2xl border border-[#34D399]/40 bg-[#0F261F] p-4 sm:p-5 mb-6 text-left shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#34D399]/20 border border-[#34D399]/40 text-lg">
                🚀
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>Continue Practice with Unseen Questions</span>
                  <span className="px-2 py-0.5 rounded-lg bg-[#34D399]/20 border border-[#34D399]/40 text-[#34D399] text-xs font-bold">
                    {remainingUnseenCount} unseen left
                  </span>
                </h3>
                <p className="text-xs text-[#C4B5FD]/80 mt-0.5">
                  Keep your momentum going! Practice another batch without repeating any questions from previous sets.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#34D399]/20">
            <span className="text-xs font-bold text-[#C4B5FD]/90 mr-1">Choose Next Batch:</span>
            {continueBatchOptions &&
              continueBatchOptions.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => onContinueCustom(count)}
                  className="btn-tactile inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#059669] to-[#34D399] text-[#0B0914] font-black text-xs hover:from-[#10B981] hover:to-[#6EE7B7] shadow-md shadow-[#34D399]/20 transition-all cursor-pointer glow-green-sm"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>+{count} More</span>
                </button>
              ))}

            {remainingUnseenCount > 0 &&
              (!continueBatchOptions || !continueBatchOptions.includes(remainingUnseenCount)) && (
                <button
                  type="button"
                  onClick={() => onContinueCustom(remainingUnseenCount)}
                  className="btn-tactile inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#181526] border border-[#34D399]/50 text-[#34D399] font-bold text-xs hover:bg-[#34D399]/20 hover:text-white transition-all cursor-pointer"
                >
                  <Sparkles className="h-3 w-3 text-[#34D399]" />
                  <span>All Remaining ({remainingUnseenCount})</span>
                </button>
              )}
          </div>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3.5 pt-6 border-t border-[#2A2440]">
        {mistakeCount > 0 && onRetryMistakes && (
          <button
            type="button"
            onClick={onRetryMistakes}
            className="btn-tactile inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-rose-600/30 hover:from-rose-500 hover:to-amber-400 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 stroke-[2.5]" />
            <span>
              {unansweredCount > 0 && incorrectCount === 0
                ? `Retry Skipped Questions (${unansweredCount}) 🎯`
                : `Retry Mistakes (${mistakeCount}) 🎯`}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={onRetry}
          className={`btn-tactile inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] cursor-pointer ${
            mistakeCount > 0
              ? 'bg-[#181526] border border-[#2A2440] hover:bg-[#211C32] hover:border-[#8B5CF6]/50'
              : 'bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] shadow-lg shadow-[#8B5CF6]/30 hover:from-[#7C3AED] hover:to-[#9333EA] glow-purple-sm'
          }`}
        >
          <RotateCcw className="h-4 w-4 stroke-[2.5]" />
          <span>{mistakeCount > 0 ? 'Retry Full Reviewer 🔄' : 'Retry Reviewer 🔄'}</span>
        </button>

        {reviewerId && (
          <Link
            href={`/reviewer/${reviewerId}`}
            className="btn-tactile inline-flex items-center gap-2 rounded-2xl bg-[#181526] border border-[#2A2440] px-5 py-3.5 text-sm font-bold text-[#F3F0FA] hover:bg-[#211C32] hover:text-white hover:border-[#8B5CF6]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
          >
            <SlidersHorizontal className="h-4 w-4 text-[#34D399]" />
            <span>Custom Drill ⚙️</span>
          </Link>
        )}

        <Link
          href={`/subject/${subjectCode}`}
          className="btn-tactile inline-flex items-center gap-2 rounded-2xl bg-[#181526] border border-[#2A2440] px-5 py-3.5 text-sm font-bold text-[#F3F0FA] hover:bg-[#211C32] hover:text-white hover:border-[#8B5CF6]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to {subjectCode}</span>
        </Link>
      </div>
    </div>
  );
}
