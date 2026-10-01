import { describe, it, expect } from 'vitest';
import { discoverReviewerFiles, loadReviewerFile } from '@/lib/content/reviewerLoader';
import { ReviewerCatalog } from '@/lib/content/catalog';
import { QuestionType } from '@/types/reviewer';

describe('Reviewer Template Content Verification', () => {
  const discoveredFiles = discoverReviewerFiles();

  it('finds the template reviewer file in the reviewers directory', () => {
    expect(discoveredFiles.length).toBeGreaterThanOrEqual(1);
  });

  it('validates that every reviewer file strictly conforms to schemaVersion 1', () => {
    for (const filePath of discoveredFiles) {
      const loaded = loadReviewerFile(filePath);
      expect(loaded.success, `Validation failed for ${filePath}: ${loaded.errorMessage}`).toBe(true);
      expect(loaded.data).toBeDefined();
      expect(loaded.data?.schemaVersion).toBe(1);
    }
  });

  it('verifies that the template reviewer includes all four supported question types', () => {
    ReviewerCatalog.clearCache();
    const summaries = ReviewerCatalog.getSummaries();
    const allTypes = new Set<QuestionType>();
    summaries.forEach((s) => s.questionTypes.forEach((t) => allTypes.add(t)));

    expect(allTypes.has('multiple-choice')).toBe(true);
    expect(allTypes.has('multiple-answer')).toBe(true);
    expect(allTypes.has('true-false')).toBe(true);
    expect(allTypes.has('fill-blank')).toBe(true);
  });

  it('verifies every single question has valid source metadata and an explanation', () => {
    for (const filePath of discoveredFiles) {
      const loaded = loadReviewerFile(filePath);
      expect(loaded.data).toBeDefined();

      for (const q of loaded.data!.questions) {
        expect(q.explanation.trim().length).toBeGreaterThan(0);
        expect(q.source.module.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('verifies seed reviewer descriptions explicitly identify content as demo/seed/template content', () => {
    const seedFiles = discoveredFiles.filter((f) => f.includes('year-1') || f.includes('seed') || f.includes('demo'));
    expect(seedFiles.length).toBeGreaterThanOrEqual(1);
    for (const filePath of seedFiles) {
      const loaded = loadReviewerFile(filePath);
      expect(
        loaded.data?.reviewer.description.includes('Demo') ||
          loaded.data?.reviewer.description.includes('Template')
      ).toBe(true);
    }
  });
});
