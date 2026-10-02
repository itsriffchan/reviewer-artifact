import { describe, it, expect, beforeEach } from 'vitest';
import { ReviewerCatalog } from '@/lib/content/catalog';

describe('Content Discovery & Catalog Engine (Phase 2)', () => {
  beforeEach(() => {
    ReviewerCatalog.clearCache();
  });

  it('automatically discovers and catalogs all valid reviewer JSON without component code changes', () => {
    const summaries = ReviewerCatalog.getSummaries();
    expect(summaries.length).toBeGreaterThanOrEqual(1);

    const itMidterm = summaries.find((s) => s.id === 'it0123-midterm');
    expect(itMidterm).toBeDefined();
    expect(itMidterm?.title).toBe('Midterm Exam Reviewer');
    expect(itMidterm?.subjectCode).toBe('IT0123');
    expect(itMidterm?.yearLevel).toBe(1);
    expect(itMidterm?.questionCount).toBe(10);
    expect(itMidterm?.questionTypes).toContain('multiple-choice');
    expect(itMidterm?.questionTypes).toContain('multiple-answer');
    expect(itMidterm?.questionTypes).toContain('true-false');
    expect(itMidterm?.questionTypes).toContain('fill-blank');
    expect(itMidterm?.questionTypeCounts).toEqual([
      { type: 'multiple-choice', count: 3 },
      { type: 'multiple-answer', count: 2 },
      { type: 'true-false', count: 3 },
      { type: 'fill-blank', count: 2 },
    ]);
  });

  it('groups discovered reviewers accurately by year level', () => {
    const yearGroups = ReviewerCatalog.getYearLevelGroups();
    const year1 = yearGroups.find((g) => g.yearLevel === 1);

    expect(year1).toBeDefined();

    const itSubject = year1?.subjects.find((s) => s.code === 'IT0123');
    expect(itSubject).toBeDefined();
    expect(itSubject?.name).toBe('Networking Fundamentals');
    expect(itSubject?.reviewers.length).toBeGreaterThanOrEqual(1);
  });

  it('retrieves subjects and reviewers by specific year', () => {
    const year1Subjects = ReviewerCatalog.getSubjectsByYear(1);
    const codes = year1Subjects.map((s) => s.code);
    expect(codes).toContain('IT0123');
  });

  it('retrieves specific subject metadata and reviewers by subject code', () => {
    const subject = ReviewerCatalog.getSubjectByCode('IT0123');
    expect(subject).toBeDefined();
    expect(subject?.name).toBe('Networking Fundamentals');
    expect(subject?.reviewers[0].id).toBe('it0123-midterm');
  });

  it('loads full reviewer data by ID', () => {
    const fullData = ReviewerCatalog.getReviewerById('it0123-midterm');
    expect(fullData).toBeDefined();
    expect(fullData?.questions.length).toBe(10);
    expect(fullData?.questions[0].id).toBe('it0123-q01');
  });

  it('searches across subject code, title, and coverage terms', () => {
    const byCode = ReviewerCatalog.searchCatalog('IT0123');
    expect(byCode.length).toBeGreaterThanOrEqual(1);
    expect(byCode[0].id).toBe('it0123-midterm');

    const byCoverage = ReviewerCatalog.searchCatalog('OSI');
    expect(byCoverage.length).toBeGreaterThanOrEqual(1);

    const byTitle = ReviewerCatalog.searchCatalog('Midterm');
    expect(byTitle.length).toBeGreaterThanOrEqual(1);
    expect(byTitle[0].id).toBe('it0123-midterm');

    const empty = ReviewerCatalog.searchCatalog('NonExistentTermXYZ');
    expect(empty.length).toBe(0);
  });
});
