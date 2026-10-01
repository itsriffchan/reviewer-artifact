'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <Container className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-400 mb-6">
          <AlertTriangle className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl mb-3">
          Something Went Wrong
        </h1>
        <p className="text-sm text-[#C4B5FD]/75 max-w-md mx-auto mb-8">
          An unexpected error occurred while loading this page or quiz session. You can try refreshing the view or return to the reviewer home.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#161224] border border-[#2A2440] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D1830] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] px-5 py-2.5 text-sm font-bold text-white hover:opacity-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span>Return to Home</span>
          </Link>
        </div>
      </Container>
    </div>
  );
}
