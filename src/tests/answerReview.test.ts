import { describe, it, expect } from 'vitest';
import { scoreQuiz } from '@/lib/scoring/engine';
import { ReviewerData } from '@/types/reviewer';

describe('Phase 7 Results and Answer Review Verification', () => {
  const sampleReviewer: ReviewerData = {
    schemaVersion: 1,
    id: 'test-phase7-rev',
    subject: { code: 'IT101', name: 'Intro', yearLevel: 1 },
    reviewer: {
      title: 'Reviewer Results Test',
      description: 'Test',
      coverage: ['Mod 1'],
      shuffleQuestions: false,
      shuffleChoices: false,
    },
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        topic: 'Topic 1',
        question: 'Question 1',
        choices: ['Opt A', 'Opt B'],
        correctAnswer: 'Opt A',
        explanation: 'Explanation 1',
        source: { module: 'Module 1', page: 10 },
      },
      {
        id: 'q2',
        type: 'multiple-answer',
        topic: 'Topic 2',
        question: 'Question 2',
        choices: ['Opt A', 'Opt B', 'Opt C'],
        correctAnswers: ['Opt A', 'Opt B'],
        explanation: 'Explanation 2',
        source: { module: 'Module 1', page: 12 },
      },
      {
        id: 'q3',
        type: 'true-false',
        topic: 'Topic 3',
        question: 'Question 3',
        correctAnswer: true,
        explanation: 'Explanation 3',
        source: { module: 'Module 1', page: 14 },
      },
      {
        id: 'q4',
        type: 'fill-blank',
        topic: 'Topic 4',
        question: 'Question 4',
        acceptedAnswers: ['Ans'],
        explanation: 'Explanation 4',
        source: { module: 'Module 1', page: 16 },
      },
    ],
  };

  it('generates complete scoring results matching the scoring engine summary', () => {
    const answers = {
      q1: 'Opt A', // Correct
      q2: ['Opt A', 'Opt C'], // Incorrect
      q3: true, // Correct
      // q4 unanswered
    };

    const summary = scoreQuiz(sampleReviewer, answers);

    expect(summary.totalQuestions).toBe(4);
    expect(summary.correctCount).toBe(2);
    expect(summary.incorrectCount).toBe(1);
    expect(summary.unansweredCount).toBe(1);
    expect(summary.scorePercentage).toBe(50);
    expect(summary.results.length).toBe(4);
  });

  it('correctly filters outcomes across All, Correct, Incorrect, and Unanswered categories', () => {
    const answers = {
      q1: 'Opt A', // Correct
      q2: ['Opt C'], // Incorrect
      q3: false, // Incorrect
      // q4 unanswered
    };

    const summary = scoreQuiz(sampleReviewer, answers);
    const results = summary.results;

    // Filter 'all'
    const allFiltered = results;
    expect(allFiltered.length).toBe(4);

    // Filter 'correct'
    const correctFiltered = results.filter((r) => r.isCorrect);
    expect(correctFiltered.length).toBe(1);
    expect(correctFiltered[0].questionId).toBe('q1');

    // Filter 'incorrect' (must exclude unanswered)
    const incorrectFiltered = results.filter((r) => !r.isCorrect && !r.isUnanswered);
    expect(incorrectFiltered.length).toBe(2);
    expect(incorrectFiltered.map((r) => r.questionId)).toEqual(['q2', 'q3']);

    // Filter 'unanswered'
    const unansweredFiltered = results.filter((r) => r.isUnanswered);
    expect(unansweredFiltered.length).toBe(1);
    expect(unansweredFiltered[0].questionId).toBe('q4');
  });

  it('provides all necessary student-facing details and explanations', () => {
    const answers = {
      q1: 'Opt A',
    };

    const summary = scoreQuiz(sampleReviewer, answers);
    const q1Result = summary.results[0];

    expect(q1Result.questionPrompt).toBe('Question 1');
    expect(q1Result.studentAnswer).toBe('Opt A');
    expect(q1Result.correctAnswer).toBe('Opt A');
    expect(q1Result.explanation).toBe('Explanation 1');
    expect(q1Result.topic).toBe('Topic 1');
  });

  it('does not expose internal source metadata in the question results', () => {
    const summary = scoreQuiz(sampleReviewer, {});
    const firstResult = summary.results[0];

    // Verify source metadata is not present on QuestionResult
    expect('source' in firstResult).toBe(false);
  });
});
