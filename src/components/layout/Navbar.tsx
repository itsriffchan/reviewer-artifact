'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, BookOpen } from 'lucide-react';
import { Container } from '../ui/Container';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#2A2440] bg-[#0E0C1A] shadow-md">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo / Brand */}
          <Link
            href="/"
            className="group flex items-center gap-3 text-white transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] rounded-xl p-1"
          >
            <div className="btn-tactile flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white shadow-sm glow-purple-sm group-hover:scale-105 transition-transform">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base leading-tight tracking-tight text-[#F3F0FA] group-hover:text-[#A78BFA] transition-colors">
                  Midterm Reviewer
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2" aria-label="Main Navigation">
            <Link
              href="/"
              className="text-xs font-semibold text-[#C4B5FD]/75 hover:text-white hover:bg-[#8B5CF6]/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] rounded-lg px-3 py-1.5"
            >
              Overview
            </Link>
            <Link
              href="/#year-levels"
              className="text-xs font-semibold text-[#C4B5FD]/75 hover:text-white hover:bg-[#8B5CF6]/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] rounded-lg px-3 py-1.5"
            >
              Year Levels
            </Link>
            <Link
              href="/#search"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#34D399] bg-[#34D399]/10 border border-[#34D399]/25 hover:bg-[#34D399]/20 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34D399] rounded-lg px-3 py-1.5 ml-2 glow-green-sm"
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Search Bank</span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-[#C4B5FD]/80 hover:text-white hover:bg-[#181526] border border-[#2A2440] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#2A2440] py-4 px-2 space-y-1 bg-[#12101D]/95 rounded-b-2xl mt-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-[#F3F0FA] hover:bg-[#8B5CF6]/15 hover:text-white transition-colors"
            >
              Overview
            </Link>
            <Link
              href="/#year-levels"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-[#F3F0FA] hover:bg-[#8B5CF6]/15 hover:text-white transition-colors"
            >
              Year Levels
            </Link>
            <Link
              href="/#search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#34D399] bg-[#34D399]/10 border border-[#34D399]/20 hover:bg-[#34D399]/20 transition-colors"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>Search Reviewers</span>
            </Link>
          </div>
        )}
      </Container>
    </header>
  );
}
