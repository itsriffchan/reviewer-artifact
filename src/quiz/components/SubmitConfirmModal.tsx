'use client';

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle } from 'lucide-react';

interface SubmitConfirmModalProps {
  isOpen: boolean;
  unansweredCount: number;
  totalQuestions: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function SubmitConfirmModal({
  isOpen,
  unansweredCount,
  totalQuestions,
  onClose,
  onConfirm,
}: SubmitConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const returnButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management and Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    // Trap focus onto the safe 'Return' action by default
    returnButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const answeredCount = totalQuestions - unansweredCount;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-3xl border border-amber-500/30 bg-[#12101D] p-6 sm:p-8 shadow-2xl shadow-black/80"
      >
        <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto mb-5">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <h3
          id="confirm-modal-title"
          className="text-xl font-bold text-center text-white mb-2"
        >
          Unanswered Questions Remaining
        </h3>

        <p
          id="confirm-modal-description"
          className="text-sm text-[#C4B5FD]/80 text-center mb-6 leading-relaxed"
        >
          You have answered <span className="font-semibold text-white">{answeredCount}</span> of{' '}
          <span className="font-semibold text-white">{totalQuestions}</span> questions. There{' '}
          {unansweredCount === 1 ? 'is' : 'are'}{' '}
          <span className="font-bold text-amber-400">{unansweredCount}</span> unanswered question
          {unansweredCount === 1 ? '' : 's'}.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            ref={returnButtonRef}
            type="button"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#181526] border border-[#2A2440] px-5 py-3 text-sm font-semibold text-[#F3F0FA] hover:bg-[#211C32] hover:border-[#8B5CF6]/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Quiz</span>
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-amber-600/30 hover:bg-amber-500 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Submit Anyway</span>
          </button>
        </div>
      </div>
    </div>
  );
}
