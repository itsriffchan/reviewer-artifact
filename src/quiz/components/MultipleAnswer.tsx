'use client';

import React from 'react';
import { MultipleAnswerQuestion } from '@/types/reviewer';
import { Check, X } from 'lucide-react';

interface MultipleAnswerProps {
  question: MultipleAnswerQuestion;
  value: string[] | null;
  onChange: (value: string[]) => void;
  choices?: string[]; // allows custom order if shuffled
  disabled?: boolean;
  showFeedback?: boolean;
}

/**
 * Extracts the maximum allowed choices from question metadata or question prompt.
 * Recognizes "(Choose X)", "(Select X)", "Choose X", and number words.
 */
export function getMaxChoices(question: MultipleAnswerQuestion): number | null {
  if (typeof question.maxChoices === 'number' && question.maxChoices > 0) {
    return question.maxChoices;
  }

  // Extract from prompt like "(Choose 3)", "Choose 3", "(Select 4)"
  const match = question.question.match(/\(?(?:choose|select)\s+(\d+)\)?/i);
  if (match) {
    const val = parseInt(match[1], 10);
    if (!isNaN(val) && val > 0) {
      return val;
    }
  }

  // Word numbers (e.g. "(Choose three)")
  const wordMap: Record<string, number> = {
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
  };
  const wordMatch = question.question.match(
    /\(?(?:choose|select)\s+(two|three|four|five|six|seven|eight)\)?/i
  );
  if (wordMatch) {
    return wordMap[wordMatch[1].toLowerCase()] ?? null;
  }

  return null;
}

export function MultipleAnswer({
  question,
  value,
  onChange,
  choices,
  disabled = false,
  showFeedback = false,
}: MultipleAnswerProps) {
  const maxChoices = getMaxChoices(question);
  const selectedValues = Array.isArray(value) ? value : [];
  const displayChoices = choices || question.choices;
  const isMaxReached = maxChoices !== null && selectedValues.length >= maxChoices;
  const correctSet = new Set(question.correctAnswers);

  const toggleChoice = (choice: string) => {
    if (disabled) return;
    if (selectedValues.includes(choice)) {
      onChange(selectedValues.filter((c) => c !== choice));
    } else {
      // Restrict choices to only X when max is reached
      if (maxChoices !== null && selectedValues.length >= maxChoices) {
        return;
      }
      onChange([...selectedValues, choice]);
    }
  };

  return (
    <fieldset className="space-y-2" aria-label={`Choices for question: ${question.question}`}>
      <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
        <legend className="font-bold uppercase tracking-wider text-[#A78BFA] text-[11px]">
          {maxChoices !== null ? `Select ${maxChoices} options:` : 'Select all that apply:'}
        </legend>
        <div className="flex items-center gap-2">
          {selectedValues.length > 0 && !disabled && !showFeedback && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[11px] font-semibold text-[#C4B5FD]/75 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
            >
              Clear selection
            </button>
          )}
          {maxChoices !== null && (
            <span
              className={`font-semibold px-2 py-0.5 rounded-lg border text-[11px] transition-all ${
                selectedValues.length === maxChoices
                  ? 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/40 glow-green-sm'
                  : selectedValues.length > 0
                  ? 'bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/30'
                  : 'bg-[#181526] border-[#2A2440] text-[#C4B5FD]/60'
              }`}
            >
              {selectedValues.length} / {maxChoices} selected
              {selectedValues.length === maxChoices ? ' (Limit reached)' : ''}
            </span>
          )}
        </div>
      </div>

      {displayChoices.map((choice, index) => {
        const isSelected = selectedValues.includes(choice);
        const isCorrectChoice = correctSet.has(choice);
        const isDisabled = disabled || (!isSelected && isMaxReached);
        const choiceId = `q-${question.id}-chk-${index}`;

        let containerStyle = '';
        let badgeStyle = '';
        const letter = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][index] || String(index + 1);

        if (showFeedback) {
          if (isSelected && isCorrectChoice) {
            // Correctly selected option -> Green
            containerStyle =
              'border-[#34D399] bg-[#0F261F] text-[#34D399] ring-1 ring-[#34D399] cursor-default shadow-sm';
            badgeStyle = 'border-[#34D399] bg-[#059669] text-white';
          } else if (isSelected && !isCorrectChoice) {
            // Incorrectly selected option -> Red
            containerStyle =
              'border-rose-500 bg-[#260F16] text-rose-200 ring-1 ring-rose-500 cursor-default shadow-sm';
            badgeStyle = 'border-rose-500 bg-rose-600 text-white';
          } else if (!isSelected && isCorrectChoice) {
            // Missed correct option -> Subtle green dashed border
            containerStyle =
              'border-[#34D399]/60 bg-[#0F261F]/60 text-[#34D399] border-dashed cursor-default';
            badgeStyle = 'border-[#34D399]/60 bg-[#059669]/40 text-[#34D399]';
          } else {
            // Unselected wrong option -> Dimmed
            containerStyle =
              'border-[#2A2440]/50 bg-[#12101D]/40 text-[#C4B5FD]/40 opacity-40 cursor-not-allowed';
            badgeStyle = 'border-[#2A2440] bg-[#181526]/40 text-[#C4B5FD]/40';
          }
        } else {
          // Normal state
          if (isSelected) {
            containerStyle =
              'border-[#8B5CF6] bg-[#221738] text-white shadow-md ring-1 ring-[#8B5CF6] glow-purple-sm' +
              (disabled ? ' cursor-default' : ' cursor-pointer');
            badgeStyle = 'border-[#8B5CF6] bg-[#8B5CF6] text-white';
          } else if (isDisabled) {
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
            title={
              disabled && !showFeedback
                ? 'Answer checked. Click "Retry" to change your selection.'
                : isDisabled && !showFeedback
                ? `Maximum of ${maxChoices} options selected. Uncheck an option to select another.`
                : undefined
            }
            className={`group flex items-center justify-between gap-3 py-3 px-4 rounded-xl border transition-all select-none focus-within:ring-2 focus-within:ring-[#8B5CF6] focus-within:ring-offset-2 focus-within:ring-offset-[#0B0914] ${containerStyle}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <input
                type="checkbox"
                id={choiceId}
                name={`question-${question.id}`}
                value={choice}
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => toggleChoice(choice)}
                className="sr-only"
              />
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold border transition-all ${badgeStyle}`}
                aria-hidden="true"
              >
                {showFeedback && isSelected && !isCorrectChoice ? (
                  <X className="h-3.5 w-3.5 stroke-[3] text-white" />
                ) : isSelected || (showFeedback && isCorrectChoice) ? (
                  <Check className="h-3.5 w-3.5 stroke-[3] text-white" />
                ) : (
                  letter
                )}
              </span>
              <span className="text-sm font-medium leading-snug break-words">{choice}</span>
            </div>

            {/* Feedback Badges */}
            {showFeedback && isSelected && isCorrectChoice && (
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
            {showFeedback && !isSelected && isCorrectChoice && (
              <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-[#34D399]/15 border border-[#34D399]/30 px-2 py-0.5 text-xs font-bold text-[#34D399]">
                <Check className="h-3 w-3 stroke-[2.5]" />
                <span>Missed</span>
              </span>
            )}
          </label>
        );
      })}
    </fieldset>
  );
}
