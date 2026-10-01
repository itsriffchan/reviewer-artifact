import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { ReviewerCatalog } from '@/lib/content/catalog';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Layers,
  Play,
} from 'lucide-react';
import { ReviewerSessionConfig } from '@/components/reviewer/ReviewerSessionConfig';

interface ReviewerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ReviewerPageProps) {
  const { id } = await params;
  const reviewer = ReviewerCatalog.getReviewerById(id);
  if (!reviewer) {
    return { title: 'Reviewer Not Found' };
  }
  return {
    title: `${reviewer.reviewer.title} | ${reviewer.subject.code}`,
    description: reviewer.reviewer.description,
  };
}

export default async function ReviewerOverviewPage({ params }: ReviewerPageProps) {
  const { id } = await params;
  const data = ReviewerCatalog.getReviewerById(id);

  if (!data) {
    notFound();
  }

  const { reviewer, subject, questions } = data;
  const questionTypes = Array.from(new Set(questions.map((q) => q.type)));

  const typeLabels: Record<string, string> = {
    'multiple-choice': 'Single-Answer Multiple Choice',
    'multiple-answer': 'Multi-Answer Selection',
    'true-false': 'True / False Statements',
    'fill-blank': 'Fill in the Blank (Exact Match)',
  };

  return (
    <div className="py-10 sm:py-14">
      <Container className="max-w-4xl">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#A78BFA]/70">
          <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <Link href={`/year/${subject.yearLevel}`} className="hover:text-white transition-colors">
            Year {subject.yearLevel}
          </Link>
          <span>/</span>
          <Link href={`/subject/${subject.code}`} className="hover:text-white transition-colors">
            {subject.code}
          </Link>
          <span>/</span>
          <span className="text-[#F3F0FA] font-medium truncate max-w-[200px]">{reviewer.title}</span>
        </nav>

        {/* Reviewer Main Overview Card */}
        <div className="rounded-3xl border border-[#2A2440] bg-[#161224] p-6 sm:p-10 shadow-xl mb-8">
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="inline-flex items-center rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/35 px-3 py-1 text-xs font-extrabold text-[#C4B5FD]">
              {subject.code}
            </span>
            <span className="text-xs text-[#C4B5FD]/75 font-semibold">
              {subject.name} • Year {subject.yearLevel}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            {reviewer.title}
          </h1>

          <p className="text-sm sm:text-base text-[#C4B5FD]/80 leading-relaxed mb-8">
            {reviewer.description}
          </p>

          {/* Key Overview Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl border border-[#2A2440] bg-[#12101D] p-4 text-center">
              <span className="block text-2xl font-extrabold text-white mb-1">
                {questions.length}
              </span>
              <span className="text-xs font-semibold text-[#C4B5FD]/70">Total Questions</span>
            </div>

            <div className="rounded-2xl border border-[#2A2440] bg-[#12101D] p-4 text-center">
              <span className="block text-2xl font-extrabold text-[#A78BFA] mb-1">
                {questionTypes.length}
              </span>
              <span className="text-xs font-semibold text-[#C4B5FD]/70">Question Formats</span>
            </div>

            <div className="rounded-2xl border border-[#2A2440] bg-[#12101D] p-4 text-center">
              <span className="block text-2xl font-extrabold text-[#34D399] mb-1">
                {reviewer.coverage.length}
              </span>
              <span className="text-xs font-semibold text-[#C4B5FD]/70">Modules Covered</span>
            </div>

            <div className="rounded-2xl border border-[#2A2440] bg-[#12101D] p-4 text-center">
              <span className="block text-2xl font-extrabold text-[#C4B5FD] mb-1">
                {reviewer.shuffleQuestions ? 'Yes' : 'No'}
              </span>
              <span className="text-xs font-semibold text-[#C4B5FD]/70">Randomized</span>
            </div>
          </div>

          {/* Module Coverage Breakdown */}
          <div className="mb-8 rounded-2xl border border-[#2A2440] bg-[#12101D] p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#A78BFA] mb-3 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-[#34D399]" />
              <span>Syllabus & Module Coverage</span>
            </h2>
            <ul className="space-y-2">
              {reviewer.coverage.map((cov, index) => (
                <li key={index} className="flex items-center gap-2.5 text-xs text-[#F3F0FA]">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6] shrink-0" />
                  <span>{cov}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Included Question Formats */}
          <div className="mb-10 rounded-2xl border border-[#2A2440] bg-[#12101D] p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#A78BFA] mb-3 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-[#8B5CF6]" />
              <span>Included Question Formats</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {questionTypes.map((type) => (
                <div
                  key={type}
                  className="flex items-center gap-2 rounded-xl bg-[#181526] border border-[#2A2440] px-3.5 py-2 text-xs text-[#F3F0FA]"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] shrink-0" />
                  <span>{typeLabels[type] || type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Session Configuration & Start Controls */}
          <div className="pt-6 border-t border-[#2A2440]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F3F0FA] mb-4 flex items-center gap-2">
              <Play className="h-4 w-4 text-[#34D399] fill-current" />
              <span>Configure & Start Practice Session</span>
            </h2>
            <ReviewerSessionConfig reviewer={data} />
          </div>
        </div>
      </Container>
    </div>
  );
}
