import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { ArrowLeft, FolderOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <Container className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#A78BFA] mb-6 glow-purple-sm">
          <FolderOpen className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl mb-3">
          Page Not Found
        </h1>
        <p className="text-base text-[#C4B5FD]/75 max-w-md mx-auto mb-8">
          The subject, question bank, or curriculum page you are seeking does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#8B5CF6]/20 hover:from-[#7C3AED] hover:to-[#9333EA] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Return to Reviewer Home</span>
        </Link>
      </Container>
    </div>
  );
}
