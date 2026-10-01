import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { ReviewerCatalog } from '@/lib/content/catalog';
import {
  ArrowLeft,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';

interface YearPageProps {
  params: Promise<{
    yearLevel: string;
  }>;
}

export async function generateMetadata({ params }: YearPageProps) {
  const { yearLevel } = await params;
  const parsedYear = parseInt(yearLevel, 10);
  if (isNaN(parsedYear) || parsedYear < 1 || parsedYear > 4) {
    return { title: 'Year Level Not Found' };
  }
  return {
    title: `Year ${parsedYear} Subjects & Reviewers | Midterm Reviewer`,
    description: `Browse all academic subjects and interactive reviewers for Year ${parsedYear} students.`,
  };
}

export default async function YearLevelPage({ params }: YearPageProps) {
  const { yearLevel } = await params;
  const parsedYear = parseInt(yearLevel, 10);

  if (isNaN(parsedYear) || parsedYear < 1 || parsedYear > 4) {
    notFound();
  }

  const subjects = ReviewerCatalog.getSubjectsByYear(parsedYear);
  const totalReviewers = subjects.reduce((acc, sub) => acc + sub.reviewers.length, 0);

  const yearTitles: Record<number, { title: string; subtitle: string; icon: string }> = {
    1: { title: '1st Year', subtitle: 'Freshman Foundations & Core Computing', icon: '🌱' },
    2: { title: '2nd Year', subtitle: 'Sophomore Systems, Algorithms & Databases', icon: '⚙️' },
    3: { title: '3rd Year', subtitle: 'Junior Specializations & Advanced Engineering', icon: '🚀' },
    4: { title: '4th Year', subtitle: 'Senior Mastery, Capstone & Industry Synthesis', icon: '🎓' },
  };

  const meta = yearTitles[parsedYear] || {
    title: `Year ${parsedYear}`,
    subtitle: 'Curriculum Subjects & Reviewers',
    icon: '📚',
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
          <span className="text-[#F3F0FA] font-medium">Year {parsedYear}</span>
        </nav>

        {/* Page Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#2A2440]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#161224] border border-[#2A2440] text-2xl shadow-inner">
                <span>{meta.icon}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {meta.title} Curriculum
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-[#C4B5FD]/75 mt-0.5">{meta.subtitle}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center rounded-none border-l-2 border-[#8B5CF6] bg-[#181526] px-3.5 py-2 font-semibold text-[#F3F0FA]">
              {subjects.length} Course Subject{subjects.length === 1 ? '' : 's'}
            </span>
            <span className="inline-flex items-center rounded-none border-l-2 border-[#34D399] bg-[#14382D] px-3.5 py-2 font-bold text-[#34D399]">
              {totalReviewers} Practice Reviewer{totalReviewers === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Subjects List */}
        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjects.map((subject) => (
              <div
                key={subject.code}
                className="interactive-card group rounded-2xl border border-[#2A2440] bg-[#161224] p-6 hover:border-[#8B5CF6]/50 hover:bg-[#1D1830] transition-all shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <span className="inline-flex items-center rounded-sm bg-[#241A45] border border-[#8B5CF6]/35 px-3 py-1 text-sm font-extrabold text-[#C4B5FD]">
                      {subject.code}
                    </span>
                    <span className="text-xs font-bold text-[#34D399] bg-[#14382D] px-2.5 py-1 rounded-sm border border-[#34D399]/20">
                      {subject.reviewers.length} Reviewer{subject.reviewers.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white group-hover:text-[#A78BFA] transition-colors mb-2">
                    {subject.name}
                  </h2>

                  {/* List reviewers under subject */}
                  <div className="space-y-2 mb-6">
                    {subject.reviewers.map((rev) => (
                      <div
                        key={rev.id}
                        className="rounded-sm bg-[#12101D] border border-[#2A2440] p-3 text-xs flex items-center justify-between gap-3 group/rev hover:border-[#8B5CF6]/30 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#F3F0FA] truncate">{rev.title}</p>
                          <p className="text-[11px] text-[#C4B5FD]/70 truncate">{rev.description}</p>
                        </div>
                        <span className="text-[11px] font-bold text-[#A78BFA] shrink-0 bg-[#211C32] px-2 py-0.5 rounded-sm border border-[#2A2440]">
                          {rev.questionCount} Qs
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#2A2440] mt-auto">
                  <Link
                    href={`/subject/${subject.code}`}
                    className="btn-tactile inline-flex items-center justify-between w-full rounded-xl bg-[#181526] border border-[#2A2440] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#8B5CF6] hover:border-[#8B5CF6] transition-all"
                  >
                    <span>View {subject.code} Reviewers</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#2A2440] bg-[#181526]/30 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#211C32] border border-[#2A2440] text-[#A78BFA] mb-4">
              <FolderOpen className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              No subjects or reviewers published for Year {parsedYear} yet
            </h3>
            <p className="text-xs text-[#C4B5FD]/70 max-w-md mx-auto mb-6">
              Reviewer JSON files placed in <code className="text-[#A78BFA]">reviewers/year-{parsedYear}/</code> will automatically appear here once added.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-[#211C32] border border-[#2A2440] px-4 py-2.5 text-xs font-semibold text-[#F3F0FA] hover:bg-[#8B5CF6]/20 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
}
