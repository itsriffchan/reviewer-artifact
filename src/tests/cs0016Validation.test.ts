import { describe, it, expect } from 'vitest';
import { loadReviewerFile } from '@/lib/content/reviewerLoader';
import path from 'path';

describe('CS0016 Reviewer File Analysis', () => {
  const filePath = path.resolve('reviewers/year-3/CS0016/CS0016-midterm.json');

  it('validates the entire CS0016 reviewer file against reviewerSchema', () => {
    const res = loadReviewerFile(filePath);
    if (!res.success) {
      console.error('Validation Error:', res.errorMessage);
      console.error('Validation Issues:', JSON.stringify(res.errors, null, 2));
    }
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data?.questions.length).toBe(200);

    const questions = res.data!.questions;
    const types = questions.reduce((acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('CS0016 Questions Count:', questions.length);
    console.log('CS0016 Type Breakdown:', types);
  });
});
