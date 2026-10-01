import { describe, it, expect } from 'vitest';
import { ReviewerCatalog } from '@/lib/content/catalog';

describe('Phase 4 Content Browsing & Discovery Verification', () => {
  it('derives year level groups entirely from reviewer content', () => {
    ReviewerCatalog.clearCache();
    const yearGroups = ReviewerCatalog.getYearLevelGroups();

    // Verify derived content dynamically mirrors available reviewer content
    expect(yearGroups.length).toBeGreaterThanOrEqual(1);
    const year1 = yearGroups.find((g) => g.yearLevel === 1);
    expect(year1).toBeDefined();
    expect(year1?.subjects.some((s) => s.code === 'IT0123')).toBe(true);
  });

  it('retrieves subjects for selected year with reviewer counts derived from data', () => {
    const year1Subjects = ReviewerCatalog.getSubjectsByYear(1);
    expect(year1Subjects.length).toBeGreaterThanOrEqual(1);

    const itSubject = year1Subjects.find((s) => s.code === 'IT0123');
    expect(itSubject).toBeDefined();
    expect(itSubject?.name).toBe('Networking Fundamentals');
    expect(itSubject?.reviewers.length).toBe(1);
    expect(itSubject?.reviewers[0].questionCount).toBe(10);
  });

  it('retrieves subject metadata and reviewers by subject code', () => {
    const itSubject = ReviewerCatalog.getSubjectByCode('IT0123');
    expect(itSubject).toBeDefined();
    expect(itSubject?.code).toBe('IT0123');
    expect(itSubject?.name).toBe('Networking Fundamentals');
    expect(itSubject?.yearLevel).toBe(1);
    expect(itSubject?.reviewers.length).toBe(1);
    expect(itSubject?.reviewers[0].id).toBe('it0123-midterm');
  });

  it('retrieves complete reviewer information by ID', () => {
    const reviewer = ReviewerCatalog.getReviewerById('it0123-midterm');
    expect(reviewer).toBeDefined();
    expect(reviewer?.reviewer.title).toBe('Midterm Exam Reviewer');
    expect(reviewer?.reviewer.coverage.length).toBe(4);
    expect(reviewer?.questions.length).toBe(10);
    expect(reviewer?.subject.code).toBe('IT0123');
  });

  it('returns null for nonexistent subject or reviewer (handled by notFound)', () => {
    const nonExistentSubject = ReviewerCatalog.getSubjectByCode('DOES_NOT_EXIST');
    expect(nonExistentSubject).toBeNull();

    const nonExistentReviewer = ReviewerCatalog.getReviewerById('non-existent-id');
    expect(nonExistentReviewer).toBeNull();
  });

  it('supports multi-attribute search across code, title, coverage, and topics', () => {
    // 1. By subject code
    const resByCode = ReviewerCatalog.searchCatalog('IT0123');
    expect(resByCode.some((r) => r.subjectCode === 'IT0123')).toBe(true);

    // 2. By subject name
    const resByName = ReviewerCatalog.searchCatalog('Networking');
    expect(resByName.some((r) => r.id === 'it0123-midterm')).toBe(true);

    // 3. By reviewer title
    const resByTitle = ReviewerCatalog.searchCatalog('Midterm');
    expect(resByTitle.some((r) => r.id === 'it0123-midterm')).toBe(true);

    // 4. By coverage
    const resByCoverage = ReviewerCatalog.searchCatalog('DHCP');
    expect(resByCoverage.some((r) => r.id === 'it0123-midterm')).toBe(true);

    // 5. By question topic
    const resByTopic = ReviewerCatalog.searchCatalog('OSI');
    expect(resByTopic.some((r) => r.id === 'it0123-midterm')).toBe(true);

    // Empty query
    expect(ReviewerCatalog.searchCatalog('   ')).toEqual([]);

    // No match
    expect(ReviewerCatalog.searchCatalog('nonexistentquery12345')).toEqual([]);
  });
});
