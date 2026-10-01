import {
  ReviewerData,
  ReviewerSummary,
  SubjectWithReviewers,
  YearLevelGroup,
} from '@/types/reviewer';
import { loadAllReviewers, loadReviewerFile, discoverReviewerFiles } from './reviewerLoader';

/**
 * In-memory / build-time catalog accessor
 */
export class ReviewerCatalog {
  private static cachedSummaries: ReviewerSummary[] | null = null;
  private static cachedReviewers: Map<string, ReviewerData> = new Map();

  /**
   * Resets internal cache (useful during development or testing)
   */
  public static clearCache(): void {
    this.cachedSummaries = null;
    this.cachedReviewers.clear();
  }

  /**
   * Loads and caches all reviewer summaries.
   * In development, always re-scans the reviewers directory so added files are instantly discovered.
   */
  public static getSummaries(): ReviewerSummary[] {
    if (process.env.NODE_ENV !== 'production' || this.cachedSummaries === null) {
      const { validReviewers, summaries } = loadAllReviewers();
      this.cachedSummaries = summaries;
      this.cachedReviewers.clear();
      validReviewers.forEach((rev) => {
        this.cachedReviewers.set(rev.id, rev);
      });
    }
    return this.cachedSummaries;
  }

  /**
   * Returns a single reviewer by unique ID
   */
  public static getReviewerById(reviewerId: string): ReviewerData | null {
    if (process.env.NODE_ENV !== 'production') {
      this.getSummaries();
    }

    if (this.cachedReviewers.has(reviewerId)) {
      return this.cachedReviewers.get(reviewerId)!;
    }

    // Attempt lookup across discovered files if not cached
    const filePaths = discoverReviewerFiles();
    for (const filePath of filePaths) {
      const loaded = loadReviewerFile(filePath);
      if (loaded.success && loaded.data) {
        this.cachedReviewers.set(loaded.data.id, loaded.data);
        if (loaded.data.id === reviewerId) {
          return loaded.data;
        }
      }
    }

    return null;
  }

  /**
   * Groups all available reviewers by year level (1, 2, 3, 4)
   */
  public static getYearLevelGroups(): YearLevelGroup[] {
    const summaries = this.getSummaries();
    const yearMap = new Map<number, Map<string, ReviewerSummary[]>>();

    for (const summary of summaries) {
      const year = summary.yearLevel;
      if (!yearMap.has(year)) {
        yearMap.set(year, new Map());
      }
      const subjectsInYear = yearMap.get(year)!;
      if (!subjectsInYear.has(summary.subjectCode)) {
        subjectsInYear.set(summary.subjectCode, []);
      }
      subjectsInYear.get(summary.subjectCode)!.push(summary);
    }

    const groups: YearLevelGroup[] = [];
    const sortedYears = Array.from(yearMap.keys()).sort((a, b) => a - b);

    for (const year of sortedYears) {
      const subjectsInYear = yearMap.get(year)!;
      const subjectList: SubjectWithReviewers[] = [];
      let totalYearReviewers = 0;

      for (const [code, revs] of subjectsInYear.entries()) {
        const first = revs[0];
        subjectList.push({
          code,
          name: first.subjectName,
          yearLevel: year,
          reviewers: revs,
        });
        totalYearReviewers += revs.length;
      }

      // Sort subjects by code
      subjectList.sort((a, b) => a.code.localeCompare(b.code));

      groups.push({
        yearLevel: year,
        subjects: subjectList,
        totalReviewers: totalYearReviewers,
      });
    }

    return groups;
  }

  /**
   * Returns subjects and their reviewers for a specific academic year level
   */
  public static getSubjectsByYear(yearLevel: number): SubjectWithReviewers[] {
    const groups = this.getYearLevelGroups();
    const found = groups.find((g) => g.yearLevel === yearLevel);
    return found ? found.subjects : [];
  }

  /**
   * Returns a specific subject with all its reviewers
   */
  public static getSubjectByCode(subjectCode: string): SubjectWithReviewers | null {
    const summaries = this.getSummaries().filter(
      (s) => s.subjectCode.toLowerCase() === subjectCode.toLowerCase()
    );

    if (summaries.length === 0) {
      return null;
    }

    const first = summaries[0];
    return {
      code: first.subjectCode,
      name: first.subjectName,
      yearLevel: first.yearLevel,
      reviewers: summaries,
    };
  }

  /**
   * Performs in-memory search across subjects, reviewers, coverage, and topics
   */
  public static searchCatalog(query: string): ReviewerSummary[] {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return [];
    }

    const summaries = this.getSummaries();
    return summaries.filter((item) => {
      const matchCode = item.subjectCode.toLowerCase().includes(trimmed);
      const matchSubjectName = item.subjectName.toLowerCase().includes(trimmed);
      const matchTitle = item.title.toLowerCase().includes(trimmed);
      const matchDescription = item.description.toLowerCase().includes(trimmed);
      const matchCoverage = item.coverage.some((c) => c.toLowerCase().includes(trimmed));
      const matchTopic = item.topics.some((t) => t.toLowerCase().includes(trimmed));

      return matchCode || matchSubjectName || matchTitle || matchDescription || matchCoverage || matchTopic;
    });
  }
}
