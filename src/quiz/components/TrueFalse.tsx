'use client';

import React from 'react';
import { TrueFalseQuestion } from '@/types/reviewer';
import { CheckCircle2, XCircle, Check, X } from 'lucide-react';

interface TrueFalseProps {
  question: TrueFalseQuestion;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
  disabled?: boolean;
  showFeedback?: boolean;
}

export function TrueFalse({
  question,
  value,
  onChange,
  disabled = false,
  showFeedback = false,
}: TrueFalseProps) {
  const options = [
    { label: 'True', val: true, icon: CheckCircle2 },
    { label: 'False', val: false, icon: XCircle },
  ];

  const handleSelect = (val: boolean) => {
    if (disabled) return;
    if (value === val) {
      onChange(null);
    } else {
      onChange(val);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs px-0.5">
        <span className="font-bold uppercase tracking-wider text-[#A78BFA] text-[11px]">
          Select True or False:
        </span>
        {value !== null && !disabled && !showFeedback && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[11px] font-semibold text-[#C4B5FD]/75 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
          >
            Clear selection
          </button>
        )}
      </div>
      <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-label={`True or False for: ${question.question}`}>
        <legend className="sr-only">Select True or False</legend>
      {options.map(({ label, val, icon: Icon }) => {
        const isSelected = value === val;
        const isCorrectOption = question.correctAnswer === val;
        const optId = `q-${question.id}-${label.toLowerCase()}`;
        const letter = label[0]; // 'T' or 'F'

        let containerStyle = '';
        let badgeStyle = '';

        if (showFeedback) {
          if (isCorrectOption) {
            // Correct answer -> Highlight Green
            containerStyle =
              'border-[#34D399] bg-[#34D399]/15 text-[#34D399] ring-1 ring-[#34D399] shadow-sm glow-green-sm cursor-default';
            badgeStyle = 'bg-[#34D399]/25 text-[#34D399] border-[#34D399]/40';
          } else if (isSelected && !isCorrectOption) {
            // Student selected wrong answer -> Highlight Red
            containerStyle =
              'border-rose-500 bg-rose-500/15 text-rose-200 ring-1 ring-rose-500 shadow-sm cursor-default';
            badgeStyle = 'bg-rose-500/25 text-rose-300 border-rose-500/40';
          } else {
            // Other option -> Dimmed
            containerStyle =
              'border-[#2A2440]/50 bg-[#12101D]/40 text-[#C4B5FD]/40 opacity-40 cursor-not-allowed';
            badgeStyle = 'bg-[#181526] text-[#C4B5FD]/30 border-[#2A2440]/40';
          }
        } else {
          // Normal selection state
          if (isSelected) {
            containerStyle =
              'border-[#8B5CF6] bg-[#8B5CF6]/15 text-white ring-2 ring-[#8B5CF6]/50 shadow-md glow-purple-sm cursor-default';
            badgeStyle = 'bg-[#8B5CF6] text-white border-[#8B5CF6] font-black shadow-sm';
          } else if (disabled) {
            containerStyle =
              'border-[#2A2440]/50 bg-[#12101D]/40 text-[#C4B5FD]/40 opacity-40 cursor-not-allowed';
            badgeStyle = 'bg-[#181526] text-[#C4B5FD]/40 border-[#2A2440]/40';
          } else {
            containerStyle =
              'border-[#2A2440] bg-[#12101D] text-[#F3F0FA] hover:border-[#8B5CF6]/60 hover:bg-[#181526] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer shadow-sm';
            badgeStyle = 'bg-[#181526] text-[#A78BFA] border-[#2A2440] group-hover:border-[#8B5CF6]/50 group-hover:bg-[#8B5CF6]/20 group-hover:text-white';
          }
        }

        return (
          <label
            key={label}
            htmlFor={optId}
            title={disabled && !showFeedback ? 'Answer checked. Click "Retry" to change your selection.' : undefined}
            className={`group flex items-center justify-between gap-3 py-3.5 px-4 rounded-2xl border transition-all duration-150 select-none font-bold text-sm focus-within:ring-2 focus-within:ring-[#8B5CF6] focus-within:ring-offset-2 focus-within:ring-offset-[#0B0914] ${containerStyle}`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id={optId}
                name={`question-${question.id}`}
                checked={isSelected}
                disabled={disabled}
                onChange={() => handleSelect(val)}
                className="sr-only"
              />
              <span
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-bold transition-all duration-150 ${badgeStyle}`}
              >
                {letter}
              </span>
              <div className="flex items-center gap-2">
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    showFeedback && isCorrectOption
                      ? 'text-[#34D399]'
                      : showFeedback && isSelected && !isCorrectOption
                      ? 'text-rose-400'
                      : isSelected
                      ? 'text-[#A78BFA]'
                      : 'text-[#C4B5FD]/60'
                  }`}
                  aria-hidden="true"
                />
                <span className="text-base tracking-wide">{label}</span>
              </div>
            </div>

            {/* Badges when feedback is active */}
            {showFeedback && isCorrectOption && (
              <span className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-[#34D399]/20 border border-[#34D399]/40 px-2.5 py-1 text-xs font-bold text-[#34D399]">
                <Check className="h-3 w-3 stroke-[3]" />
                <span>✓ Correct</span>
              </span>
            )}
            {showFeedback && isSelected && !isCorrectOption && (
              <span className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 text-xs font-bold text-rose-300">
                <X className="h-3 w-3 stroke-[3]" />
                <span>✗ Incorrect</span>
              </span>
            )}
          </label>
        );
      })}
      </fieldset>
    </div>
  );
}
