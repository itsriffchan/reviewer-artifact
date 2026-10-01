'use client';

import React from 'react';
import { MultipleChoiceQuestion } from '@/types/reviewer';
import { Check, X } from 'lucide-react';

interface MultipleChoiceProps {
  question: MultipleChoiceQuestion;
  value: string | null;
  onChange: (value: string | null) => void;
  choices?: string[]; // allows custom order if shuffled
  disabled?: boolean;
  showFeedback?: boolean;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export function MultipleChoice({
  question,
  value,
  onChange,
  choices,
  disabled = false,
  showFeedback = false,
}: MultipleChoiceProps) {
  const displayChoices = choices || question.choices;

  const handleSelect = (choice: string) => {
    if (disabled) return;
    if (value === choice) {
      onChange(null);
    } else {
      onChange(choice);
    }
  };

  return (
    <fieldset className="space-y-2.5" aria-label={`Choices for question: ${question.question}`}>
      <div className="flex items-center justify-between text-xs mb-1 px-0.5">
        <legend className="sr-only">Select one option</legend>
        <span className="font-bold uppercase tracking-wider text-[#A78BFA] text-[11px]">
          Select one option:
        </span>
        {Boolean(value) && !disabled && !showFeedback && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[11px] font-semibold text-[#C4B5FD]/75 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
          >
            Clear selection
          </button>
        )}
      </div>
      {displayChoices.map((choice, index) => {
        const isSelected = value === choice;
        const isCorrectChoice = choice === question.correctAnswer;
        const choiceId = `q-${question.id}-opt-${index}`;
        const letter = OPTION_LETTERS[index] || String(index + 1);

        // Determine visual styling based on feedback state
        let containerStyle = '';
        let badgeStyle = '';

        if (showFeedback) {
          if (isCorrectChoice) {
            // Correct choice -> Highlight Green
            containerStyle =
              'border-[#34D399] bg-[#0F261F] text-[#34D399] ring-1 ring-[#34D399] cursor-default shadow-sm';
            badgeStyle = 'border-[#34D399] bg-[#059669] text-white';
          } else if (isSelected && !isCorrectChoice) {
            // Student selected wrong choice -> Highlight Red
            containerStyle =
              'border-rose-500 bg-[#260F16] text-rose-200 ring-1 ring-rose-500 cursor-default shadow-sm';
            badgeStyle = 'border-rose-500 bg-rose-600 text-white';
          } else {
            // Unselected other choices -> Dimmed
            containerStyle =
              'border-[#2A2440]/50 bg-[#12101D]/40 text-[#C4B5FD]/40 opacity-40 cursor-not-allowed';
            badgeStyle = 'border-[#2A2440] bg-[#181526]/50 text-[#C4B5FD]/40';
          }
        } else {
          // Normal selection state
          if (isSelected) {
            containerStyle =
              'border-[#8B5CF6] bg-[#221738] text-white shadow-md ring-1 ring-[#8B5CF6] cursor-default glow-purple-sm';
            badgeStyle = 'border-[#8B5CF6] bg-[#8B5CF6] text-white';
          } else if (disabled) {
            containerStyle =
              'border-[#2A2440]/50 bg-[#12101D]/40 text-[#C4B5FD]/40 opacity-40 cursor-not-allowed';
            badgeStyle = 'border-[#2A2440] bg-[#181526]/40 text-[#C4B5FD]/40';
          } else {
            containerStyle =
              'border-[#2A2440] bg-[#12101D] text-[#F3F0FA] hover:border-[#8B5CF6]/50 hover:bg-[#181526] cursor-pointer active:scale-[0.99]';
            badgeStyle = 'border-[#2A2440] bg-[#181526] text-[#A78BFA] group-hover:border-[#8B5CF6]';
          }
        }

        return (
          <label
            key={index}
            htmlFor={choiceId}
            title={disabled && !showFeedback ? 'Answer checked. Click "Retry" to change your selection.' : undefined}
            className={`group flex items-center justify-between gap-3 py-3 px-4 rounded-xl border transition-all select-none focus-within:ring-2 focus-within:ring-[#8B5CF6] focus-within:ring-offset-2 focus-within:ring-offset-[#0B0914] ${containerStyle}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <input
                type="radio"
                id={choiceId}
                name={`question-${question.id}`}
                value={choice}
                checked={isSelected}
                disabled={disabled}
                onChange={() => handleSelect(choice)}
                className="sr-only"
              />
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold border transition-all ${badgeStyle}`}
                aria-hidden="true"
              >
                {showFeedback && isCorrectChoice ? (
                  <Check className="h-3.5 w-3.5 stroke-[3] text-white" />
                ) : showFeedback && isSelected && !isCorrectChoice ? (
                  <X className="h-3.5 w-3.5 stroke-[3] text-white" />
                ) : (
                  letter
                )}
              </span>
              <span className="text-sm font-medium leading-snug break-words">{choice}</span>
            </div>

            {/* Accessibility textual & symbolic badges */}
            {showFeedback && isCorrectChoice && (
              <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-[#34D399]/20 border border-[#34D399]/40 px-2 py-0.5 text-xs font-bold text-[#34D399]">
                <Check className="h-3 w-3 stroke-[3]" />
                <span>Correct</span>
              </span>
            )}
            {showFeedback && isSelected && !isCorrectChoice && (
              <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-xs font-bold text-rose-300">
                <X className="h-3 w-3 stroke-[3]" />
                <span>Incorrect</span>
              </span>
            )}
          </label>
        );
      })}
    </fieldset>
  );
}
