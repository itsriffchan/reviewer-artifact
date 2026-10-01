'use client';

import React from 'react';
import { FillBlankQuestion } from '@/types/reviewer';
import { normalizeAnswer } from '@/lib/scoring/normalizer';
import { Edit3, CheckCircle2, XCircle } from 'lucide-react';

interface FillBlankProps {
  question: FillBlankQuestion;
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  showFeedback?: boolean;
}

export function FillBlank({
  question,
  value,
  onChange,
  disabled = false,
  showFeedback = false,
}: FillBlankProps) {
  const currentText = typeof value === 'string' ? value : '';
  const isCorrect =
    typeof value === 'string' &&
    question.acceptedAnswers.some(
      (acc) => normalizeAnswer(acc) === normalizeAnswer(value)
    );

  let inputStyle = '';
  if (showFeedback) {
    if (isCorrect) {
      inputStyle =
        'border-[#34D399] bg-[#34D399]/15 text-[#34D399] ring-1 ring-[#34D399] shadow-sm glow-green-sm cursor-default';
    } else {
      inputStyle =
        'border-rose-500 bg-rose-500/15 text-rose-100 ring-1 ring-rose-500 shadow-sm shadow-rose-500/10 cursor-default';
    }
  } else if (disabled) {
    inputStyle = 'border-[#2A2440]/60 bg-[#12101D]/40 text-[#C4B5FD]/50 opacity-60 cursor-not-allowed';
  } else {
    inputStyle =
      'border-[#2A2440] bg-[#12101D] text-[#F3F0FA] placeholder-[#A78BFA]/50 shadow-inner focus:border-[#8B5CF6] focus:bg-[#181526] focus:ring-[#8B5CF6]/30';
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs px-0.5">
        <label htmlFor={`q-${question.id}-input`} className="font-bold text-[#C4B5FD] flex items-center gap-1.5">
          <span>✍️ Type your answer:</span>
        </label>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          {showFeedback && isCorrect ? (
            <CheckCircle2 className="h-5 w-5 text-[#34D399]" aria-hidden="true" />
          ) : showFeedback && !isCorrect ? (
            <XCircle className="h-5 w-5 text-rose-400" aria-hidden="true" />
          ) : (
            <Edit3 className="h-5 w-5 text-[#A78BFA]" aria-hidden="true" />
          )}
        </div>
        <input
          type="text"
          id={`q-${question.id}-input`}
          value={currentText}
          disabled={disabled}
          readOnly={disabled}
          onChange={(e) => {
            if (disabled) return;
            onChange(e.target.value);
          }}
          placeholder={disabled ? 'Answer locked for review' : 'Type your answer here... (case-insensitive)'}
          aria-label={`Fill in the blank for: ${question.question}`}
          autoComplete="off"
          spellCheck="false"
          className={`w-full rounded-2xl border py-3.5 pl-12 pr-4 text-base font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:ring-offset-2 focus:ring-offset-[#0B0914] ${inputStyle}`}
        />
      </div>

      {showFeedback ? (
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs pt-1">
          {isCorrect ? (
            <span className="font-bold text-[#34D399] flex items-center gap-1.5 bg-[#34D399]/15 border border-[#34D399]/40 px-3 py-1 rounded-xl">
              <CheckCircle2 className="h-4 w-4" />
              <span>✓ Correct answer!</span>
            </span>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-rose-300 flex items-center gap-1.5 bg-rose-500/15 border border-rose-500/40 px-3 py-1 rounded-xl">
                <XCircle className="h-4 w-4" />
                <span>✗ Incorrect</span>
              </span>
              <span className="text-[#C4B5FD] text-xs">
                Accepted:{' '}
                <strong className="text-[#34D399] bg-[#12101D] px-2 py-1 rounded-lg border border-[#2A2440] font-mono">
                  {question.acceptedAnswers.join(' / ')}
                </strong>
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs text-[#C4B5FD]/60 px-1">
          <span>💡 Case-insensitive. Leading and trailing spaces are automatically trimmed.</span>
        </div>
      )}
    </div>
  );
}
