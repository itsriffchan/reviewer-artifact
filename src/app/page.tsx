import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { SearchBar } from '@/components/search/SearchBar';
import { ReviewerCatalog } from '@/lib/content/catalog';

export default function Home() {
  const summaries = ReviewerCatalog.getSummaries();
  const yearGroups = ReviewerCatalog.getYearLevelGroups();

  const standardYears = [
    { level: 1, title: '1st Year', subtitle: 'Foundations & Intro to Computing', emoji: '🌱', accent: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    { level: 2, title: '2nd Year', subtitle: 'Intermediate Systems & Algorithms', emoji: '⚙️', accent: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10' },
    { level: 3, title: '3rd Year', subtitle: 'Advanced Engineering & Security', emoji: '🚀', accent: 'text-purple-300 border-purple-500/30 bg-purple-500/10' },
    { level: 4, title: '4th Year', subtitle: 'Capstone, Electives & Mastery', emoji: '🎓', accent: 'text-amber-300 border-amber-500/30 bg-amber-500/10' },
  ];

  return (
    <div className="py-8 sm:py-12">
      <Container>
        <section id="year-levels" aria-label="Year Level Navigation">
          <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Choose your year level
          </h1>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {standardYears.map((year) => {
              const matchedGroup = yearGroups.find((group) => group.yearLevel === year.level);
              const reviewerCount = matchedGroup?.totalReviewers ?? 0;
              const hasContent = reviewerCount > 0;
              const availableSubjects = Array.from(
                new Set(
                  summaries
                    .filter((summary) => summary.yearLevel === year.level)
                    .map((summary) => summary.subjectCode)
                )
              );

              return (
                <Link
                  key={year.level}
                  href={hasContent ? `/year/${year.level}` : '/#year-levels'}
                  aria-disabled={!hasContent}
                  className={`interactive-card group rounded-2xl border border-[#2A2440] bg-[#161224] p-5 shadow-md transition-all ${
                    hasContent
                      ? 'hover:border-[#8B5CF6]/60'
                      : 'cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-xl ${year.accent}`}>
                      <span aria-hidden="true">{year.emoji}</span>
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-white group-hover:text-[#C4B5FD]">
                        {year.title}
                      </h2>
                      <p className="text-sm text-[#C4B5FD]/70">{year.subtitle}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[#2A2440] pt-4">
                    <span className="text-xs text-[#C4B5FD]/65">
                      {hasContent ? `${reviewerCount} reviewer${reviewerCount === 1 ? '' : 's'}` : 'No reviewers yet'}
                    </span>
                    <span className="rounded-lg border border-[#8B5CF6]/50 bg-[#8B5CF6]/10 px-3 py-2 text-xs font-bold text-[#C4B5FD]">
                      {hasContent ? 'Open year' : 'Coming soon'}
                    </span>
                  </div>

                  {hasContent && (
                    <div className="mt-4 border-t border-[#2A2440] pt-3">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#A78BFA]">
                        Available courses
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableSubjects.map((subjectCode) => (
                          <span
                            key={subjectCode}
                            className="rounded-sm border border-[#34D399]/40 bg-[#14382D] px-2.5 py-1 text-xs font-bold text-[#34D399]"
                          >
                            {subjectCode}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        <section aria-label="Search Reviewers" className="mt-10 max-w-2xl">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#A78BFA]">Search reviewers</h2>
          <SearchBar reviewers={summaries} />
        </section>
      </Container>
    </div>
  );
}
