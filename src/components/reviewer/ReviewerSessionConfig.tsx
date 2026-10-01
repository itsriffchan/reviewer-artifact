'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReviewerData } from '@/types/reviewer';
import { getAvailableModules } from '@/lib/quiz/randomization';
import { loadAttempt, clearAttempt, PersistedAttempt } from '@/lib/quiz/persistence';
import {
  Play,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
  ArrowRight,
  RotateCcw,
  Eye,
} from 'lucide-react';
import { FeedbackTiming } from '@/quiz/types';

interface ReviewerSessionConfigProps {
  reviewer: ReviewerData;
}

export function ReviewerSessionConfig({ reviewer }: ReviewerSessionConfigProps) {
  const router = useRouter();
  const allModules = getAvailableModules(reviewer.questions);
  const totalReviewerQuestions = reviewer.questions.length;

  // Calculate question count per module
  const moduleCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const mod of allModules) {
      counts[mod] = reviewer.questions.filter(
        (q) => (q.source?.module?.trim() || '').toLowerCase() === mod.toLowerCase()
      ).length;
    }
    return counts;
  }, [allModules, reviewer.questions]);

  // Mode state: 'full' or 'custom'
  const [mode, setMode] = useState<'full' | 'custom'>('full');
  const [selectedModules, setSelectedModules] = useState<string[]>(allModules);
  const [questionCount, setQuestionCount] = useState<number>(() =>
    Math.min(10, totalReviewerQuestions)
  );
  const [feedbackTiming, setFeedbackTiming] = useState<FeedbackTiming>('end');
  const [activeAttempt, setActiveAttempt] = useState<PersistedAttempt | null>(null);

  // Check for existing unfinished attempt in browser storage
  useEffect(() => {
    const attempt = loadAttempt(reviewer.id);
    if (attempt && !attempt.isFinished) {
      queueMicrotask(() => {
        setActiveAttempt(attempt);
      });
    }
  }, [reviewer.id]);

  // Count of total available questions in currently selected modules
  const availableInSelectedModules = React.useMemo(() => {
    if (selectedModules.length === 0) return 0;
    const selectedSet = new Set(selectedModules.map((m) => m.toLowerCase()));
    return reviewer.questions.filter((q) =>
      selectedSet.has((q.source?.module?.trim() || '').toLowerCase())
    ).length;
  }, [selectedModules, reviewer.questions]);

  // Handle module toggling
  const toggleModule = (mod: string) => {
    setSelectedModules((prev) => {
      if (prev.includes(mod)) {
        return prev.filter((m) => m !== mod);
      } else {
        return [...prev, mod];
      }
    });
  };

  const handleSelectAllModules = () => {
    setSelectedModules(allModules);
  };

  const handleDeselectAllModules = () => {
    setSelectedModules([]);
  };

  // Preset count options
  const presets = [5, 10, 20, 50].filter((n) => n <= availableInSelectedModules);

  // Clamp question count when available pool changes
  const effectiveCount = Math.min(
    Math.max(1, questionCount),
    Math.max(1, availableInSelectedModules)
  );

  // Launch custom or full quiz
  const handleStartQuiz = () => {
    const params = new URLSearchParams();
    if (feedbackTiming === 'immediate') {
      params.set('feedback', 'immediate');
    }

    if (mode === 'full') {
      const q = params.toString();
      router.push(`/reviewer/${reviewer.id}/quiz${q ? `?${q}` : ''}`);
    } else {
      if (selectedModules.length === 0) return;
      params.set('count', String(effectiveCount));
      params.set('modules', selectedModules.join(','));
      router.push(`/reviewer/${reviewer.id}/quiz?${params.toString()}`);
    }
  };

  const handleDiscardAttempt = () => {
    clearAttempt(reviewer.id);
    setActiveAttempt(null);
  };

  return (
    <div className="space-y-6">
      {/* Existing Unfinished Attempt Banner */}
      {activeAttempt && (
        <div className="rounded-2xl border border-[#8B5CF6]/50 bg-[#1E1733] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#34D399]" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Active Quiz Session in Progress</h3>
              <p className="text-xs text-[#C4B5FD]/85">
                You have an unfinished attempt at Question {activeAttempt.currentIndex + 1} of{' '}
                {activeAttempt.activeQuestions.length}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              href={`/reviewer/${reviewer.id}/quiz`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] px-4 py-2 text-xs font-bold text-white shadow transition-colors flex-1 sm:flex-initial"
            >
              <span>Resume Session</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={handleDiscardAttempt}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#181526] border border-[#2A2440] px-3 py-2 text-xs font-medium text-[#C4B5FD]/80 hover:text-white hover:bg-[#211C32] transition-colors"
              title="Discard existing attempt and start fresh"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Discard</span>
            </button>
          </div>
        </div>
      )}

      {/* Mode Selection Tabs */}
      <div className="rounded-2xl border border-[#2A2440] bg-[#12101D] p-1.5 flex gap-1.5">
        <button
          type="button"
          onClick={() => setMode('full')}
          className={`btn-tactile flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            mode === 'full'
              ? 'bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/30 glow-purple-sm'
              : 'text-[#C4B5FD]/70 hover:text-white hover:bg-[#181526]'
          }`}
        >
          <span className="text-base">🎯</span>
          <span>Full Reviewer ({totalReviewerQuestions} Questions)</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('custom')}
          className={`btn-tactile flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            mode === 'custom'
              ? 'bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/30 glow-purple-sm'
              : 'text-[#C4B5FD]/70 hover:text-white hover:bg-[#181526]'
          }`}
        >
          <span className="text-base">⚡</span>
          <span>Custom Practice Drill</span>
        </button>
      </div>

      {/* Custom Practice Session Configuration Panel */}
      {mode === 'custom' ? (
        <div className="rounded-2xl border border-[#2A2440] bg-[#12101D] p-5 sm:p-6 space-y-6">
          {/* Module Selection Section */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#A78BFA] flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-[#34D399]" />
                <span>1. Select Modules to Include</span>
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAllModules}
                  className="text-[#34D399] hover:text-[#6EE7B7] font-semibold transition-colors cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-[#2A2440]">•</span>
                <button
                  type="button"
                  onClick={handleDeselectAllModules}
                  className="text-[#C4B5FD]/60 hover:text-white font-medium transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Modules Checkbox Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allModules.map((mod) => {
                const isSelected = selectedModules.includes(mod);
                const count = moduleCounts[mod] || 0;
                return (
                  <button
                    type="button"
                    key={mod}
                    onClick={() => toggleModule(mod)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#8B5CF6] bg-[#221738] text-white ring-1 ring-[#8B5CF6]/50'
                        : 'border-[#2A2440] bg-[#181526] text-[#C4B5FD]/70 hover:border-[#8B5CF6]/30'
                    }`}
                  >
                    <span className="mt-0.5 text-[#34D399] shrink-0">
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 fill-[#8B5CF6] text-[#34D399]" />
                      ) : (
                        <Square className="h-4 w-4 text-[#A78BFA]/50" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold leading-snug truncate text-[#F3F0FA]">
                        {mod}
                      </div>
                      <div className="text-[11px] text-[#C4B5FD]/60 mt-0.5">
                        {count} {count === 1 ? 'question' : 'questions'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedModules.length === 0 && (
              <p className="text-xs text-rose-400 mt-2 font-medium">
                ⚠️ Please select at least one module to practice.
              </p>
            )}
          </div>

          {/* Question Count Selection Section */}
          <div className="pt-5 border-t border-[#2A2440]">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#A78BFA] flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#8B5CF6]" />
                <span>2. Number of Questions</span>
              </label>
              <span className="text-xs text-[#C4B5FD]/70 font-medium">
                Available:{' '}
                <strong className="text-white">{availableInSelectedModules}</strong> questions in
                selected modules
              </span>
            </div>

            {/* Count Presets and Input */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {presets.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setQuestionCount(preset)}
                  disabled={availableInSelectedModules === 0}
                  className={`btn-tactile px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    effectiveCount === preset
                      ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white shadow-sm glow-purple-sm'
                      : 'bg-[#181526] border-[#2A2440] text-[#C4B5FD] hover:border-[#8B5CF6]/40'
                  }`}
                >
                  {preset} Questions
                </button>
              ))}

              <button
                type="button"
                onClick={() => setQuestionCount(availableInSelectedModules)}
                disabled={availableInSelectedModules === 0}
                className={`btn-tactile px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  effectiveCount === availableInSelectedModules && availableInSelectedModules > 0
                    ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white shadow-sm glow-purple-sm'
                    : 'bg-[#181526] border-[#2A2440] text-[#C4B5FD] hover:border-[#8B5CF6]/40'
                }`}
              >
                All ({availableInSelectedModules}) 🏆
              </button>

              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-xs text-[#C4B5FD]/70 font-medium">Custom:</span>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, availableInSelectedModules)}
                  value={effectiveCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setQuestionCount(val);
                    }
                  }}
                  disabled={availableInSelectedModules === 0}
                  className="w-16 rounded-lg bg-[#181526] border border-[#2A2440] px-2 py-1 text-xs font-bold text-white text-center focus:outline-none focus:border-[#8B5CF6] disabled:opacity-40"
                />
              </div>
            </div>

            {/* Dynamic Session Summary Pill */}
            {selectedModules.length > 0 && availableInSelectedModules > 0 && (
              <div className="rounded-xl bg-[#181526] border border-[#2A2440] px-3.5 py-2.5 text-xs text-[#C4B5FD] flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#34D399] shrink-0" />
                <span>
                  This session will randomly sample{' '}
                  <strong className="text-white">{effectiveCount}</strong> questions from{' '}
                  <strong className="text-white">{selectedModules.length}</strong> selected module
                  {selectedModules.length === 1 ? '' : 's'}.
                </span>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Feedback Mode Selection (Show Answers Right Away vs At End) */}
      <div className="rounded-2xl border border-[#2A2440] bg-[#12101D] p-4 sm:p-5">
        <label className="text-xs font-bold uppercase tracking-wider text-[#A78BFA] flex items-center gap-1.5 mb-3">
          <Eye className="h-4 w-4 text-[#34D399]" />
          <span>When Should Answers Be Shown?</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFeedbackTiming('end')}
            className={`btn-tactile flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              feedbackTiming === 'end'
                ? 'border-[#8B5CF6] bg-[#221738] text-white shadow-sm ring-1 ring-[#8B5CF6]/50'
                : 'border-[#2A2440] bg-[#181526] text-[#C4B5FD]/70 hover:border-[#8B5CF6]/30'
            }`}
          >
            <div className="mt-0.5 text-[#A78BFA] shrink-0">
              {feedbackTiming === 'end' ? (
                <CheckSquare className="h-4 w-4 fill-[#8B5CF6] text-white" />
              ) : (
                <Square className="h-4 w-4 text-[#A78BFA]/50" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-[#F3F0FA] flex items-center gap-1.5">
                <span>⏱️ Exam Mode</span>
                <span className="text-[10px] font-semibold text-[#A78BFA] bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 px-1.5 py-0.2 rounded">
                  Simulation
                </span>
              </div>
              <p className="text-[11px] text-[#C4B5FD]/70 mt-0.5 leading-relaxed">
                Answer all questions first; view your total score, correctness, and full explanations upon submission.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFeedbackTiming('immediate')}
            className={`btn-tactile flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              feedbackTiming === 'immediate'
                ? 'border-[#34D399] bg-[#142822] text-white shadow-sm ring-1 ring-[#34D399]/50'
                : 'border-[#2A2440] bg-[#181526] text-[#C4B5FD]/70 hover:border-[#34D399]/30'
            }`}
          >
            <div className="mt-0.5 text-[#34D399] shrink-0">
              {feedbackTiming === 'immediate' ? (
                <CheckSquare className="h-4 w-4 fill-[#34D399] text-white" />
              ) : (
                <Square className="h-4 w-4 text-[#A78BFA]/50" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-[#F3F0FA] flex items-center gap-1.5">
                <span>💡 Practice Mode</span>
                <span className="text-[10px] font-bold bg-[#34D399]/20 text-[#34D399] px-1.5 py-0.5 rounded border border-[#34D399]/30">
                  Instant Feedback
                </span>
              </div>
              <p className="text-[11px] text-[#C4B5FD]/70 mt-0.5 leading-relaxed">
                Check each answer as soon as you select it; view instant verification and detailed question rationales.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
        <button
          type="button"
          onClick={handleStartQuiz}
          disabled={mode === 'custom' && (selectedModules.length === 0 || availableInSelectedModules === 0)}
          className="btn-tactile inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#8B5CF6]/30 hover:from-[#7C3AED] hover:to-[#9333EA] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] w-full sm:w-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed glow-purple-sm"
        >
          <Play className="h-5 w-5 fill-current" />
          <span>
            {mode === 'custom'
              ? `🚀 Launch Practice Drill (${effectiveCount} Questions)`
              : `🚀 Launch Full Reviewer (${totalReviewerQuestions} Questions)`}
          </span>
        </button>

        <Link
          href={`/subject/${reviewer.subject.code}`}
          className="btn-tactile inline-flex items-center justify-center gap-2 rounded-2xl bg-[#181526] border border-[#2A2440] px-6 py-4 text-sm font-semibold text-[#F3F0FA] hover:bg-[#211C32] transition-colors w-full sm:w-auto"
        >
          <span>Back to {reviewer.subject.code}</span>
        </Link>
      </div>
    </div>
  );
}
