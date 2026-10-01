'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, Layers, ArrowRight, HelpCircle } from 'lucide-react';
import { ReviewerSummary } from '@/types/reviewer';

interface SearchBarProps {
  reviewers: ReviewerSummary[];
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  reviewers,
  placeholder = 'Search by subject code, title, topic, or coverage (e.g., IT0123, OSI, Trees)...',
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    return reviewers.filter((item) => {
      const matchCode = item.subjectCode.toLowerCase().includes(trimmed);
      const matchSubjectName = item.subjectName.toLowerCase().includes(trimmed);
      const matchTitle = item.title.toLowerCase().includes(trimmed);
      const matchDescription = item.description.toLowerCase().includes(trimmed);
      const matchCoverage = item.coverage.some((c) => c.toLowerCase().includes(trimmed));
      const matchTopic = item.topics.some((t) => t.toLowerCase().includes(trimmed));

      return matchCode || matchSubjectName || matchTitle || matchDescription || matchCoverage || matchTopic;
    });
  }, [query, reviewers]);

  return (
    <div ref={containerRef} className={`relative w-full max-w-2xl mx-auto ${className}`} id="search">
      <div className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-[#A78BFA]">
          <Search className="h-5 w-5" aria-hidden="true" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          aria-label="Search reviewers, subjects, and topics"
          className="w-full rounded-2xl border border-[#2A2440] bg-[#161224] py-3.5 pl-12 pr-10 text-sm text-[#F3F0FA] placeholder-[#A78BFA]/50 shadow-md transition-all focus:border-[#8B5CF6] focus:bg-[#1A152C] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/30 glow-purple-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3.5 p-1 rounded-lg text-[#A78BFA]/70 hover:text-white hover:bg-[#211C32] transition-colors"
            aria-label="Clear search input"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-[#2A2440] bg-[#161224] p-2 shadow-2xl shadow-black/80">
          {results.length > 0 ? (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#A78BFA]/80">
                Found {results.length} reviewer{results.length === 1 ? '' : 's'}
              </div>
              {results.map((item) => (
                <Link
                  key={item.id}
                  href={`/reviewer/${item.id}`}
                  onClick={() => setIsOpen(false)}
                  className="group flex flex-col gap-1 rounded-xl p-3 hover:bg-[#181526] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 px-2.5 py-0.5 text-xs font-bold text-[#C4B5FD]">
                        {item.subjectCode}
                      </span>
                      <span className="text-xs text-[#C4B5FD]/70 font-medium">
                        Year {item.yearLevel} • {item.subjectName}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-[#34D399] group-hover:text-[#6EE7B7] flex items-center gap-1">
                      <span>{item.questionCount} Questions</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-[#F3F0FA] group-hover:text-[#A78BFA] transition-colors">
                    {item.title}
                  </h4>

                  <p className="text-xs text-[#C4B5FD]/70 line-clamp-1">{item.description}</p>

                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {item.coverage.slice(0, 2).map((cov, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-md bg-[#211C32] border border-[#2A2440] px-2 py-0.5 text-[10px] text-[#A78BFA]"
                      >
                        <Layers className="h-2.5 w-2.5 text-[#34D399]" />
                        <span className="truncate max-w-[150px]">{cov}</span>
                      </span>
                    ))}
                    {item.coverage.length > 2 && (
                      <span className="text-[10px] text-[#C4B5FD]/50 self-center">
                        +{item.coverage.length - 2} more
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 px-4 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#211C32] border border-[#2A2440] text-[#A78BFA] mb-3">
                <HelpCircle className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-[#F3F0FA] mb-1">
                No reviewers found matching &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-[#C4B5FD]/70 max-w-sm mx-auto">
                Try searching by subject code (e.g. IT0123, CS0016), course title, topic (e.g. OSI, Stacks), or module coverage.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
