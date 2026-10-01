import { describe, it, expect } from 'vitest';
import { loadReviewerFile } from '@/lib/content/reviewerLoader';
import path from 'path';

describe('CS0016 Comprehensive Quality & Readability Audit', () => {
  const filePath = path.resolve('reviewers/year-3/CS0016/CS0016-midterm.json');
  const res = loadReviewerFile(filePath);

  it('successfully loads and parses the file', () => {
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
  });

  const reviewer = res.data!;

  it('validates metadata alignment with the website catalog', () => {
    expect(reviewer.schemaVersion).toBe(1);
    expect(reviewer.id).toBe('CS0016-all-modules-200');
    expect(reviewer.subject.code).toBe('CS0016');
    expect(reviewer.subject.name).toBe('Network and Communications 2A');
    expect(reviewer.subject.yearLevel).toBe(3);
    expect(reviewer.reviewer.title).toBeTruthy();
    expect(reviewer.reviewer.description).toBeTruthy();
    expect(reviewer.reviewer.coverage.length).toBe(4);
    expect(reviewer.reviewer.shuffleQuestions).toBe(true);
    expect(reviewer.reviewer.shuffleChoices).toBe(true);
  });

  it('verifies question ID uniqueness and formatting', () => {
    const ids = reviewer.questions.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(reviewer.questions.length);
    expect(ids.length).toBe(200);

    for (const q of reviewer.questions) {
      expect(q.id.trim().length).toBeGreaterThan(0);
    }
  });

  it('checks for unescaped broken unicode or replacement characters', () => {
    for (const q of reviewer.questions) {
      expect(q.question).not.toContain('\uFFFD');
      expect(q.explanation).not.toContain('\uFFFD');
      expect(q.topic).not.toContain('\uFFFD');

      if ('choices' in q) {
        for (const choice of q.choices) {
          expect(choice).not.toContain('\uFFFD');
        }
      }
    }
  });

  it('verifies all 120 multiple-choice questions have valid choices and correct answers', () => {
    const mcQuestions = reviewer.questions.filter((q) => q.type === 'multiple-choice');
    expect(mcQuestions.length).toBe(120);

    for (const q of mcQuestions) {
      if (q.type !== 'multiple-choice') continue;
      expect(q.choices.length).toBeGreaterThanOrEqual(2);
      expect(new Set(q.choices).size).toBe(q.choices.length); // No duplicate choices
      expect(q.choices).toContain(q.correctAnswer); // Correct answer must be among choices
      expect(q.correctAnswer.trim().length).toBeGreaterThan(0);
      expect(q.explanation.trim().length).toBeGreaterThan(0);
      expect(q.source.module.trim().length).toBeGreaterThan(0);
    }
  });

  it('verifies all 43 multiple-answer questions have valid choice sets and >= 2 correct answers', () => {
    const maQuestions = reviewer.questions.filter((q) => q.type === 'multiple-answer');
    expect(maQuestions.length).toBe(43);

    for (const q of maQuestions) {
      if (q.type !== 'multiple-answer') continue;
      expect(q.choices.length).toBeGreaterThanOrEqual(2);
      expect(new Set(q.choices).size).toBe(q.choices.length);
      expect(q.correctAnswers.length).toBeGreaterThanOrEqual(2);
      expect(new Set(q.correctAnswers).size).toBe(q.correctAnswers.length);

      for (const ans of q.correctAnswers) {
        expect(q.choices).toContain(ans);
      }
    }
  });

  it('verifies all 24 true-false questions have boolean correct answers', () => {
    const tfQuestions = reviewer.questions.filter((q) => q.type === 'true-false');
    expect(tfQuestions.length).toBe(24);

    for (const q of tfQuestions) {
      if (q.type !== 'true-false') continue;
      expect(typeof q.correctAnswer).toBe('boolean');
    }
  });

  it('verifies all 13 fill-blank questions have non-empty accepted answers', () => {
    const fbQuestions = reviewer.questions.filter((q) => q.type === 'fill-blank');
    expect(fbQuestions.length).toBe(13);

    for (const q of fbQuestions) {
      if (q.type !== 'fill-blank') continue;
      expect(q.acceptedAnswers.length).toBeGreaterThanOrEqual(1);
      for (const ans of q.acceptedAnswers) {
        expect(ans.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
