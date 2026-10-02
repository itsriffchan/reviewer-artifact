import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { ReviewerCatalog } from '@/lib/content/catalog';
import {
  ArrowLeft,
  ArrowRight,
  Layers,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface SubjectPageProps {
  params: Promise<{
    code: string;
  }>;
}

export async function generateMetadata({ params }: SubjectPageProps) {
  const { code } = await params;
  const subject = ReviewerCatalog.getSubjectByCode(code);
  if (!subject) {
    return { title: 'Subject Not Found' };
  }
  return {
    title: `${subject.code}: ${subject.name} | Question Banks`,
    description: `Browse interactive reviewers, question banks, and exams for ${subject.code} (${subject.name}).`,
  };
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { code } = await params;
  const subject = ReviewerCatalog.getSubjectByCode(code);

  if (!subject) {
    notFound();
  }

  const totalQuestions = subject.reviewers.reduce((acc, r) => acc + r.questionCount, 0);
  const formatLabels: Record<string, string> = {
    'multiple-choice': 'MCQ',
    'multiple-answer': 'Multiple answer',
    'true-false': 'True / false',
    'fill-blank': 'Fill in the blank',
  };

  return (
    <div className="py-10 sm:py-14">
      <Container>
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
          <span className="text-[#F3F0FA] font-medium">{subject.code}</span>
        </nav>

        {/* Subject Header */}
        <div className="mb-10 pb-8 border-b border-[#2A2440]">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <span className="inline-flex items-center rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/35 px-3 py-1 text-sm font-extrabold text-[#C4B5FD]">
                  {subject.code}
                </span>
                <span className="inline-flex items-center rounded-lg bg-[#211C32] border border-[#2A2440] px-3 py-1 text-xs font-semibold text-[#A78BFA]">
                  Year {subject.yearLevel} Curriculum
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
                {subject.name}
              </h1>

              <p className="text-sm text-[#C4B5FD]/75 max-w-2xl leading-relaxed">
                Choose an interactive reviewer below to practice exam-style questions, test module mastery with instant or end-of-quiz scoring, and study verified rationales.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start text-xs">
              <div className="rounded-2xl border border-[#2A2440] bg-[#161224] p-4 text-center min-w-[120px] shadow-md">
                <span className="block font-extrabold text-2xl text-white mb-0.5">{subject.reviewers.length}</span>
                <span className="text-[#C4B5FD]/70 font-medium">Reviewers</span>
              </div>
              <div className="rounded-2xl border border-[#2A2440] bg-[#161224] p-4 text-center min-w-[120px] shadow-md">
                <span className="block font-extrabold text-2xl text-[#34D399] mb-0.5">{totalQuestions}</span>
                <span className="text-[#C4B5FD]/70 font-medium">Questions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviewers List */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#34D399]" />
            <h2 className="text-lg font-bold tracking-tight text-white">
              Available Question Banks ({subject.reviewers.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {subject.reviewers.map((reviewer) => (
              <div
                key={reviewer.id}
                className="interactive-card group rounded-3xl border border-[#2A2440] bg-[#161224] p-6 sm:p-7 hover:border-[#8B5CF6]/50 hover:bg-[#1D1830] transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#A78BFA] transition-colors">
                      {reviewer.title}
                    </h3>
                    <span className="inline-flex items-center rounded-lg bg-[#34D399]/15 border border-[#34D399]/30 px-2.5 py-0.5 text-xs font-bold text-[#34D399]">
                      💡 {reviewer.questionCount} Questions
                    </span>
                  </div>

                  <p className="text-sm text-[#C4B5FD]/75 mb-4 leading-relaxed max-w-3xl">
                    {reviewer.description}
                  </p>

                  {/* Coverage tags */}
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-[#A78BFA]/80 block mb-1.5 uppercase tracking-wider">
                      Module Coverage:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {reviewer.coverage.map((cov, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#211C32] border border-[#2A2440] px-2.5 py-1 text-xs text-[#F3F0FA]"
                        >
                          <Layers className="h-3 w-3 text-[#34D399]" />
                          <span>{cov}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Included Question Types */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#C4B5FD]/70">
                    <span className="font-semibold text-[#A78BFA]/80">Formats:</span>
                    {reviewer.questionTypeCounts.map(({ type, count }) => (
                      <span
                        key={type}
                        className="inline-flex items-center rounded-md bg-[#12101D] px-2 py-0.5 text-[11px] text-[#C4B5FD] border border-[#2A2440]"
                      >
                        {count} {formatLabels[type] || type}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 flex sm:flex-col items-center justify-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-[#2A2440]">
                  <Link
                    href={`/reviewer/${reviewer.id}`}
                    className="btn-tactile inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#8B5CF6]/25 hover:from-[#7C3AED] hover:to-[#9333EA] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] w-full sm:w-auto cursor-pointer glow-purple-sm"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Configure & Start 🚀</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
