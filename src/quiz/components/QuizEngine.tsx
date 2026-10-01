'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ReviewerData, Question } from '@/types/reviewer';
import { QuizAnswers, AnswerValue } from '../types';
import { QuestionRenderer } from './QuestionRenderer';
import { QuestionActionBar } from './QuestionActionBar';
import { QuestionSidebar } from './QuestionSidebar';
import { ScoreCard } from './ScoreCard';
import { AnswerReview } from './AnswerReview';
import { scoreQuiz, isAnswerProvided, getNextUnansweredIndex } from '@/lib/scoring/engine';
import { prepareReviewerQuestions, shuffleArray } from '@/lib/quiz/randomization';
import { loadAttempt, saveAttempt, clearAttempt } from '@/lib/quiz/persistence';
import { SubmitConfirmModal } from './SubmitConfirmModal';
import { Container } from '@/components/ui/Container';
import {
  ArrowLeft,
  RotateCcw,
  SlidersHorizontal,
  Eye,
  EyeOff,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SessionConfig, FeedbackTiming } from '../types';
import { ImmediateFeedback } from './ImmediateFeedback';
import { scoreQuestion } from '@/lib/scoring/engine';

interface QuizEngineProps {
  reviewer: ReviewerData;
  initialConfig?: SessionConfig;
}

interface QuizSession {
  activeQuestions: Question[];
  currentIndex: number;
  answers: QuizAnswers;
  startedAt: string;
  isFinished: boolean;
  isResumed: boolean;
  sessionConfig?: SessionConfig;
  checkedQuestions: Record<string, boolean>;
}

export function QuizEngine({ reviewer, initialConfig }: QuizEngineProps) {
  const { subject, reviewer: meta } = reviewer;
  
  const [session, setSession] = useState<QuizSession>(() => ({
    activeQuestions: prepareReviewerQuestions(reviewer, {
      count: initialConfig?.questionCount,
      modules: initialConfig?.selectedModules,
    }),
    currentIndex: 0,
    answers: {},
    startedAt: new Date().toISOString(),
    isFinished: false,
    isResumed: false,
    sessionConfig: initialConfig,
    checkedQuestions: {},
  }));
  const [isStorageReady, setIsStorageReady] = useState(false);

  // Restore attempt from localStorage if one exists and matches or no conflicting initialConfig
  useEffect(() => {
    const saved = loadAttempt(reviewer.id);
    if (saved) {
      const isCustomSessionRequested =
        initialConfig?.questionCount !== undefined ||
        (initialConfig?.selectedModules && initialConfig.selectedModules.length > 0) ||
        (initialConfig?.feedbackTiming && initialConfig.feedbackTiming !== saved.sessionConfig?.feedbackTiming);

      // If custom session requested, check if saved attempt matches configuration
      const matchesConfig =
        !isCustomSessionRequested ||
        (saved.sessionConfig?.questionCount === initialConfig?.questionCount &&
          JSON.stringify(saved.sessionConfig?.selectedModules) ===
            JSON.stringify(initialConfig?.selectedModules));

      if (matchesConfig) {
        queueMicrotask(() => {
          setSession({
            activeQuestions: saved.activeQuestions,
            currentIndex: saved.currentIndex,
            answers: saved.answers,
            startedAt: saved.startedAt,
            isFinished: saved.isFinished,
            isResumed: !saved.isFinished,
            sessionConfig: saved.sessionConfig ?? initialConfig,
            checkedQuestions: saved.checkedQuestions ?? {},
          });
        });
      } else {
        // Clear conflicting previous attempt to start newly configured session
        clearAttempt(reviewer.id);
      }
    }
    queueMicrotask(() => {
      setIsStorageReady(true);
    });
  }, [reviewer.id, initialConfig]);

  const { activeQuestions, currentIndex, answers, isFinished, startedAt, isResumed, checkedQuestions } = session;
  const feedbackTiming: FeedbackTiming = session.sessionConfig?.feedbackTiming ?? 'end';

  // Persist attempt to localStorage whenever progress updates
  useEffect(() => {
    if (!isStorageReady) return;
    saveAttempt({
      version: 1,
      reviewerId: reviewer.id,
      startedAt,
      currentIndex,
      answers,
      activeQuestions,
      isFinished,
      sessionConfig: session.sessionConfig,
      checkedQuestions: session.checkedQuestions,
    });
  }, [
    isStorageReady,
    reviewer.id,
    startedAt,
    currentIndex,
    answers,
    activeQuestions,
    isFinished,
    session.sessionConfig,
    session.checkedQuestions,
  ]);

  const handleCheckAnswer = (qId: string) => {
    setSession((prev) => ({
      ...prev,
      checkedQuestions: {
        ...prev.checkedQuestions,
        [qId]: true,
      },
    }));
  };

  const handleTryAgain = (qId: string) => {
    setSession((prev) => {
      const q = prev.activeQuestions.find((item) => item.id === qId);
      const isSingleChoice = q?.type === 'multiple-choice' || q?.type === 'true-false';
      return {
        ...prev,
        checkedQuestions: {
          ...prev.checkedQuestions,
          [qId]: false,
        },
        answers: isSingleChoice
          ? {
              ...prev.answers,
              [qId]: null,
            }
          : prev.answers,
      };
    });
  };

  const toggleFeedbackTiming = () => {
    const nextTiming: FeedbackTiming = feedbackTiming === 'immediate' ? 'end' : 'immediate';
    setSession((prev) => ({
      ...prev,
      sessionConfig: {
        ...prev.sessionConfig,
        feedbackTiming: nextTiming,
      },
    }));
  };

  const currentQuestion = activeQuestions[currentIndex];
  const total = activeQuestions.length;

  const handleAnswerChange = (value: AnswerValue) => {
    const isAutoCheckType =
      feedbackTiming === 'immediate' &&
      value !== null &&
      (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false');

    setSession((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: value,
      },
      checkedQuestions: isAutoCheckType
        ? {
            ...prev.checkedQuestions,
            [currentQuestion.id]: true,
          }
        : prev.checkedQuestions,
    }));
  };

  const [jumpToUnanswered, setJumpToUnanswered] = useState(false);

  const unansweredCount = activeQuestions.filter(
    (q) => !isAnswerProvided(answers[q.id])
  ).length;

  const handleNext = () => {
    if (jumpToUnanswered) {
      const nextUnanswered = getNextUnansweredIndex(activeQuestions, answers, currentIndex);
      if (nextUnanswered !== null) {
        setSession((prev) => ({ ...prev, currentIndex: nextUnanswered }));
        return;
      }
    }
    if (currentIndex < total - 1) {
      setSession((prev) => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
    }
  };

  const handleToggleUnanswered = () => {
    const nextState = !jumpToUnanswered;
    setJumpToUnanswered(nextState);
    if (nextState && isAnswerProvided(answers[currentQuestion.id])) {
      const nextUnanswered = getNextUnansweredIndex(activeQuestions, answers, currentIndex);
      if (nextUnanswered !== null) {
        setSession((prev) => ({ ...prev, currentIndex: nextUnanswered }));
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSession((prev) => ({ ...prev, currentIndex: prev.currentIndex - 1 }));
    }
  };

  const handleSelectIndex = (index: number) => {
    if (index >= 0 && index < total) {
      setSession((prev) => ({ ...prev, currentIndex: index }));
    }
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const handleFinishClick = () => {
    if (unansweredCount > 0) {
      setShowConfirmModal(true);
    } else {
      handleConfirmSubmit();
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    setSession((prev) => ({ ...prev, isFinished: true }));
  };

  const handleStartOver = () => {
    setShowConfirmModal(false);
    clearAttempt(reviewer.id);
    const baseConfig = session.sessionConfig?.isMistakeRetry
      ? initialConfig
      : session.sessionConfig;
    const freshQuestions = prepareReviewerQuestions(reviewer, {
      count: baseConfig?.questionCount,
      modules: baseConfig?.selectedModules,
    });
    const now = new Date().toISOString();
    const freshSession: QuizSession = {
      activeQuestions: freshQuestions,
      currentIndex: 0,
      answers: {},
      startedAt: now,
      isFinished: false,
      isResumed: false,
      sessionConfig: baseConfig,
      checkedQuestions: {},
    };
    setSession(freshSession);
    saveAttempt({
      version: 1,
      reviewerId: reviewer.id,
      startedAt: now,
      currentIndex: 0,
      answers: {},
      activeQuestions: freshQuestions,
      isFinished: false,
      sessionConfig: baseConfig,
      checkedQuestions: {},
    });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRetryMistakes = () => {
    setShowConfirmModal(false);
    clearAttempt(reviewer.id);

    const summary = scoreQuiz(reviewer, answers, activeQuestions);
    const mistakeQuestionIds = new Set(
      summary.results.filter((r) => !r.isCorrect).map((r) => r.questionId)
    );

    if (mistakeQuestionIds.size === 0) return;

    // Pull unmutated questions matching mistake IDs from reviewer
    const rawMistakeQuestions = reviewer.questions.filter((q) =>
      mistakeQuestionIds.has(q.id)
    );

    // Shuffle choices if reviewer config has shuffleChoices enabled
    const preparedQuestions = rawMistakeQuestions.map((q) => {
      if (meta.shuffleChoices) {
        if (q.type === 'multiple-choice') {
          return {
            ...q,
            choices: shuffleArray(q.choices),
          };
        }
        if (q.type === 'multiple-answer') {
          return {
            ...q,
            choices: shuffleArray(q.choices),
          };
        }
      }
      return q;
    });

    // Shuffle question order if reviewer config has shuffleQuestions enabled
    const freshQuestions = meta.shuffleQuestions
      ? shuffleArray(preparedQuestions)
      : preparedQuestions;

    const now = new Date().toISOString();
    const freshConfig: SessionConfig = {
      ...session.sessionConfig,
      isMistakeRetry: true,
      questionCount: freshQuestions.length,
    };

    const freshSession: QuizSession = {
      activeQuestions: freshQuestions,
      currentIndex: 0,
      answers: {},
      startedAt: now,
      isFinished: false,
      isResumed: false,
      sessionConfig: freshConfig,
      checkedQuestions: {},
    };

    setSession(freshSession);
    saveAttempt({
      version: 1,
      reviewerId: reviewer.id,
      startedAt: now,
      currentIndex: 0,
      answers: {},
      activeQuestions: freshQuestions,
      isFinished: false,
      sessionConfig: freshConfig,
      checkedQuestions: {},
    });

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleContinueCustom = (count: number) => {
    setShowConfirmModal(false);
    clearAttempt(reviewer.id);

    // 1. Gather all questions seen so far
    const currentActiveIds = activeQuestions.map((q) => q.id);
    const updatedSeenIds = Array.from(
      new Set([...(session.sessionConfig?.seenQuestionIds || []), ...currentActiveIds])
    );

    // 2. Filter reviewer pool by selected modules (if any)
    let pool = [...reviewer.questions];
    if (
      session.sessionConfig?.selectedModules &&
      session.sessionConfig.selectedModules.length > 0
    ) {
      const selectedNormalized = session.sessionConfig.selectedModules.map((m) =>
        m.trim().toLowerCase()
      );
      pool = pool.filter((q) => {
        const qMod = q.source?.module?.trim().toLowerCase() || '';
        return selectedNormalized.some(
          (sel) => qMod === sel || qMod.startsWith(sel) || sel.startsWith(qMod)
        );
      });
    }

    // 3. Exclude all seen questions
    const seenSet = new Set(updatedSeenIds);
    let remainingPool = pool.filter((q) => !seenSet.has(q.id));

    if (remainingPool.length === 0) return;

    // 4. If reviewer shuffles questions, shuffle remaining pool
    if (meta.shuffleQuestions) {
      remainingPool = shuffleArray(remainingPool);
    }

    // 5. Slice to requested count
    const selectedQuestions = remainingPool.slice(0, count);

    // 6. Shuffle choices if reviewer has shuffleChoices enabled
    const freshQuestions = selectedQuestions.map((q) => {
      if (meta.shuffleChoices) {
        if (q.type === 'multiple-choice') {
          return {
            ...q,
            choices: shuffleArray(q.choices),
          };
        }
        if (q.type === 'multiple-answer') {
          return {
            ...q,
            choices: shuffleArray(q.choices),
          };
        }
      }
      return q;
    });

    const now = new Date().toISOString();
    const freshConfig: SessionConfig = {
      ...session.sessionConfig,
      questionCount: freshQuestions.length,
      isMistakeRetry: false,
      seenQuestionIds: updatedSeenIds,
    };

    const freshSession: QuizSession = {
      activeQuestions: freshQuestions,
      currentIndex: 0,
      answers: {},
      startedAt: now,
      isFinished: false,
      isResumed: false,
      sessionConfig: freshConfig,
      checkedQuestions: {},
    };

    setSession(freshSession);
    saveAttempt({
      version: 1,
      reviewerId: reviewer.id,
      startedAt: now,
      currentIndex: 0,
      answers: {},
      activeQuestions: freshQuestions,
      isFinished: false,
      sessionConfig: freshConfig,
      checkedQuestions: {},
    });

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const feedbackResults = React.useMemo(() => {
    if (feedbackTiming !== 'immediate') return undefined;
    const res: Record<string, { isChecked: boolean; isCorrect: boolean }> = {};
    for (const q of activeQuestions) {
      const isChecked = Boolean(checkedQuestions[q.id]);
      const isCorrect = isChecked ? scoreQuestion(q, answers[q.id] ?? null).isCorrect : false;
      res[q.id] = { isChecked, isCorrect };
    }
    return res;
  }, [feedbackTiming, activeQuestions, checkedQuestions, answers]);

  if (isFinished) {
    const summary = scoreQuiz(reviewer, answers, activeQuestions);

    // Calculate candidate pool and remaining unseen questions
    let candidatePool = [...reviewer.questions];
    if (
      session.sessionConfig?.selectedModules &&
      session.sessionConfig.selectedModules.length > 0
    ) {
      const selectedNormalized = session.sessionConfig.selectedModules.map((m) =>
        m.trim().toLowerCase()
      );
      candidatePool = candidatePool.filter((q) => {
        const qMod = q.source?.module?.trim().toLowerCase() || '';
        return selectedNormalized.some(
          (sel) => qMod === sel || qMod.startsWith(sel) || sel.startsWith(qMod)
        );
      });
    }

    const currentActiveIds = activeQuestions.map((q) => q.id);
    const allSeenIds = Array.from(
      new Set([...(session.sessionConfig?.seenQuestionIds || []), ...currentActiveIds])
    );
    const seenSet = new Set(allSeenIds);

    const remainingQuestions = candidatePool.filter((q) => !seenSet.has(q.id));
    const remainingUnseenCount = remainingQuestions.length;

    // Compute batch count options for continuation (e.g., 10, 20, 30, 50, or previous batch count)
    const currentBatchSize = session.sessionConfig?.questionCount || 10;
    const candidateCounts = [10, 20, 30, 50];
    if (!candidateCounts.includes(currentBatchSize) && currentBatchSize < remainingUnseenCount) {
      candidateCounts.push(currentBatchSize);
      candidateCounts.sort((a, b) => a - b);
    }
    const continueBatchOptions = candidateCounts.filter((n) => n <= remainingUnseenCount);

    return (
      <div className="py-10 sm:py-14">
        <Container className="max-w-4xl">
          <ScoreCard
            summary={summary}
            subjectCode={subject.code}
            reviewerTitle={meta.title}
            reviewerId={reviewer.id}
            onRetry={handleStartOver}
            onRetryMistakes={handleRetryMistakes}
            remainingUnseenCount={remainingUnseenCount}
            continueBatchOptions={continueBatchOptions}
            onContinueCustom={handleContinueCustom}
          />
          <AnswerReview
            results={summary.results}
            onRetryMistakes={handleRetryMistakes}
          />
        </Container>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="py-6 sm:py-10">
      <Container className="max-w-7xl">
        {/* Top Header / Navigation & Actions */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-3 text-xs">
            <div className="flex items-center gap-3">
              <Link
                href={`/reviewer/${reviewer.id}`}
                className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161224] border border-[#2A2440] text-slate-300 hover:text-white hover:border-[#8B5CF6]/40 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Exit Reviewer</span>
              </Link>
              <button
                type="button"
                onClick={handleStartOver}
                className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161224] border border-[#2A2440] text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors cursor-pointer"
                title="Reset attempt and restart quiz"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Start Over</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleFeedbackTiming}
                className={`btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  feedbackTiming === 'immediate'
                    ? 'border-[#34D399]/40 bg-[#34D399]/15 text-[#34D399] glow-green-sm'
                    : 'border-[#2A2440] bg-[#161224] text-[#C4B5FD]/70 hover:text-[#F3F0FA] hover:border-[#8B5CF6]/40'
                }`}
                title="Toggle showing answers immediately vs. at the end"
              >
                {feedbackTiming === 'immediate' ? (
                  <>
                    <Eye className="h-3.5 w-3.5 text-[#34D399]" />
                    <span>💡 Instant Answers: ON</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3.5 w-3.5 text-[#C4B5FD]/50" />
                    <span>⏱️ Exam Mode</span>
                  </>
                )}
              </button>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-[#161224] border border-[#2A2440]">
                <span className="font-extrabold text-[#A78BFA]">{subject.code}</span>
                <span className="text-[#2A2440]">•</span>
                <span className="text-[#C4B5FD]/80 font-medium truncate max-w-[180px]">
                  {meta.title}
                </span>
              </div>
            </div>
          </div>

          {/* Targeted Mistake Review Indicator Banner */}
          {session.sessionConfig?.isMistakeRetry ? (
            <div className="mb-3 flex items-center justify-between rounded-2xl bg-rose-500/15 border border-rose-500/40 px-4 py-2.5 text-xs text-rose-200">
              <div className="flex items-center gap-2">
                <span className="text-base">🎯</span>
                <span className="font-bold text-white">Targeted Mistake Review:</span>
                <span>Retrying {total} missed or incorrect question{total !== 1 ? 's' : ''}</span>
              </div>
              <button
                type="button"
                onClick={handleStartOver}
                className="text-xs text-rose-300 hover:text-white font-bold underline underline-offset-2 transition-colors cursor-pointer"
              >
                Exit to Full Reviewer
              </button>
            </div>
          ) : (
            session.sessionConfig &&
            (session.sessionConfig.questionCount !== undefined ||
              (session.sessionConfig.selectedModules &&
                session.sessionConfig.selectedModules.length > 0)) && (
              <div className="mb-3 flex items-center justify-between rounded-2xl bg-[#12101D] border border-[#2A2440] px-4 py-2.5 text-xs text-[#C4B5FD]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-[#34D399]" />
                  <span className="font-bold text-white">⚡ Practice Drill Session:</span>
                  <span>
                    {total} Questions
                    {session.sessionConfig.seenQuestionIds &&
                    session.sessionConfig.seenQuestionIds.length > 0
                      ? ` • Batch (${session.sessionConfig.seenQuestionIds.length} previously completed)`
                      : ''}
                    {session.sessionConfig.selectedModules
                      ? ` • ${session.sessionConfig.selectedModules.length} Module(s)`
                      : ''}
                  </span>
                </div>
                <Link
                  href={`/reviewer/${reviewer.id}`}
                  className="text-xs text-[#34D399] hover:text-[#6EE7B7] font-bold underline underline-offset-2 transition-colors"
                >
                  Change Drill Settings
                </Link>
              </div>
            )
          )}

          {/* Resumed Attempt Banner */}
          {isResumed && (
            <div className="mb-3 flex items-center justify-between rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/40 px-4 py-2.5 text-xs text-white glow-purple-sm">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-[#34D399] animate-pulse" />
                <span className="font-bold text-white">Resumed In-Progress Attempt:</span>
                <span className="text-[#C4B5FD]">Continuing from Question {currentIndex + 1} of {total}</span>
              </div>
              <button
                type="button"
                onClick={handleStartOver}
                className="font-bold text-[#34D399] hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
              >
                Start Over
              </button>
            </div>
          )}

          {/* Linear Progress Bar */}
          <div className="h-2.5 w-full rounded-full bg-[#181526] border border-[#2A2440] overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6D28D9] via-[#8B5CF6] to-[#34D399] transition-all duration-300 ease-out shadow-sm shadow-[#34D399]/30"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={currentIndex + 1}
              aria-valuemin={1}
              aria-valuemax={total}
              aria-label={`Progress: Question ${currentIndex + 1} of ${total}`}
            />
          </div>
        </div>

        {/* 2-Column Quiz Layout: Main Content (Left) + Question Navigator & Explanation Sidebar (Right) */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-7 items-start">
          {/* Main Column: Active Question + Action Bar + Mobile Navigator Accordion */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-4">
            {/* Active Question Card */}
            <div className="rounded-3xl border border-[#2A2440] bg-[#161224] p-5 sm:p-7 shadow-xl">
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 px-3 py-1 text-xs font-bold text-[#C4B5FD]">
                  <span>📂</span>
                  <span>{currentQuestion.topic}</span>
                </span>
                <div className="flex items-center gap-2">
                  {currentIndex === 0 && (
                    <span className="hidden sm:inline-flex items-center rounded-lg bg-[#34D399]/15 border border-[#34D399]/30 px-2 py-0.5 text-[11px] font-bold text-[#34D399]">
                      🌱 First Question
                    </span>
                  )}
                  {currentIndex > 0 && currentIndex === total - 1 && (
                    <span className="hidden sm:inline-flex items-center rounded-lg bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                      🏁 Final Question!
                    </span>
                  )}
                  {total > 4 && currentIndex + 1 === Math.ceil(total / 2) && (
                    <span className="hidden sm:inline-flex items-center rounded-lg bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-[11px] font-bold text-cyan-300">
                      🔥 Halfway there!
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs font-black text-[#A78BFA] bg-[#181526] px-2.5 py-1 rounded-xl border border-[#2A2440]">
                    <span>Question {currentIndex + 1}</span>
                    <span className="text-[#C4B5FD]/40">/</span>
                    <span className="text-[#C4B5FD]/70">{total}</span>
                  </span>
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-white mb-5 leading-snug">
                {currentQuestion.question}
              </h2>

              {/* Interactive Question Inputs */}
              <div className="mb-4">
                <QuestionRenderer
                  question={currentQuestion}
                  answer={answers[currentQuestion.id] ?? null}
                  onAnswerChange={handleAnswerChange}
                  disabled={feedbackTiming === 'immediate' && Boolean(checkedQuestions[currentQuestion.id])}
                  showFeedback={feedbackTiming === 'immediate' && Boolean(checkedQuestions[currentQuestion.id])}
                />
              </div>

              {/* Question Action Bar: Previous, Check Answer/Try Again, and Next/Finish buttons */}
              <QuestionActionBar
                currentIndex={currentIndex}
                total={total}
                onPrev={handlePrev}
                onNext={handleNext}
                onFinish={handleFinishClick}
                feedbackTiming={feedbackTiming}
                isChecked={Boolean(checkedQuestions[currentQuestion.id])}
                canCheck={isAnswerProvided(answers[currentQuestion.id])}
                onCheckAnswer={() => handleCheckAnswer(currentQuestion.id)}
                onTryAgain={() => handleTryAgain(currentQuestion.id)}
                jumpToUnanswered={jumpToUnanswered}
                onToggleUnanswered={handleToggleUnanswered}
                unansweredCount={unansweredCount}
                isAutoCheckType={
                  currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false'
                }
              />

              {/* Mobile-Only Explanation (Rendered BELOW the Action Bar so Next button is never pushed down) */}
              {feedbackTiming === 'immediate' && checkedQuestions[currentQuestion.id] && (
                <div className="lg:hidden mt-4 pt-4 border-t border-[#2A2440]">
                  <ImmediateFeedback
                    question={currentQuestion}
                    studentAnswer={answers[currentQuestion.id] ?? null}
                    isChecked={true}
                    onCheckAnswer={() => handleCheckAnswer(currentQuestion.id)}
                    onTryAgain={() => handleTryAgain(currentQuestion.id)}
                  />
                </div>
              )}
            </div>

            {/* Mobile-Only Collapsible Navigator Accordion (< lg screens) */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setShowMobileNav((prev) => !prev)}
                className="w-full flex items-center justify-between rounded-2xl bg-[#181526] border border-[#2A2440] p-3.5 text-sm font-semibold text-[#F3F0FA] hover:border-[#8B5CF6]/40 transition-all cursor-pointer shadow-sm"
                aria-expanded={showMobileNav}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutGrid className="h-4 w-4 text-[#34D399]" />
                  <span>Question Navigator</span>
                  <span className="text-xs font-normal text-[#C4B5FD]/70">
                    ({activeQuestions.filter((q) => isAnswerProvided(answers[q.id])).length} / {total} answered)
                  </span>
                </div>
                {showMobileNav ? (
                  <ChevronUp className="h-4 w-4 text-[#A78BFA]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#A78BFA]" />
                )}
              </button>

              {showMobileNav && (
                <div className="mt-3">
                  <QuestionSidebar
                    questions={activeQuestions}
                    currentIndex={currentIndex}
                    answers={answers}
                    feedbackResults={feedbackResults}
                    onSelectIndex={(idx) => {
                      handleSelectIndex(idx);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onFinish={handleFinishClick}
                    feedbackTiming={feedbackTiming}
                    currentQuestion={currentQuestion}
                    isCheckedCurrent={Boolean(checkedQuestions[currentQuestion.id])}
                    onCheckAnswer={() => handleCheckAnswer(currentQuestion.id)}
                    onTryAgain={() => handleTryAgain(currentQuestion.id)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Desktop Sidebar Question Navigator & Explanation (Sticky) */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-4 sticky top-6">
            <QuestionSidebar
              questions={activeQuestions}
              currentIndex={currentIndex}
              answers={answers}
              feedbackResults={feedbackResults}
              onSelectIndex={handleSelectIndex}
              onFinish={handleFinishClick}
              feedbackTiming={feedbackTiming}
              currentQuestion={currentQuestion}
              isCheckedCurrent={Boolean(checkedQuestions[currentQuestion.id])}
              onCheckAnswer={() => handleCheckAnswer(currentQuestion.id)}
              onTryAgain={() => handleTryAgain(currentQuestion.id)}
            />
          </div>
        </div>

        {/* Confirmation Modal for Unanswered Questions */}
        <SubmitConfirmModal
          isOpen={showConfirmModal}
          unansweredCount={unansweredCount}
          totalQuestions={total}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmSubmit}
        />
      </Container>
    </div>
  );
}
