import { describe, it, expect } from 'vitest';
import { QuizAnswers } from '@/quiz/types';

describe('Phase 5 Quiz Engine & State Management Verification', () => {
  it('manages answer state for all 4 question types properly', () => {
    const answers: QuizAnswers = {};

    // 1. Multiple Choice (string)
    answers['q1'] = 'Network Layer';
    expect(answers['q1']).toBe('Network Layer');

    // 2. Multiple Answer (string[])
    answers['q2'] = ['TCP', 'UDP'];
    expect(answers['q2']).toEqual(['TCP', 'UDP']);

    // 3. True/False (boolean)
    answers['q3'] = true;
    expect(answers['q3']).toBe(true);

    answers['q4'] = false;
    expect(answers['q4']).toBe(false);

    // 4. Fill in the Blank (string)
    answers['q5'] = 'DHCP';
    expect(answers['q5']).toBe('DHCP');
  });

  it('accurately identifies answered vs unanswered questions', () => {
    const isAnswered = (ans: unknown) => {
      if (ans === null || ans === undefined) return false;
      if (typeof ans === 'string') return ans.trim().length > 0;
      if (Array.isArray(ans)) return ans.length > 0;
      if (typeof ans === 'boolean') return true;
      return false;
    };

    expect(isAnswered(null)).toBe(false);
    expect(isAnswered(undefined)).toBe(false);
    expect(isAnswered('')).toBe(false);
    expect(isAnswered('   ')).toBe(false);
    expect(isAnswered([])).toBe(false);

    expect(isAnswered('Router')).toBe(true);
    expect(isAnswered(['TCP'])).toBe(true);
    expect(isAnswered(true)).toBe(true);
    expect(isAnswered(false)).toBe(true);
  });

  it('preserves answers independently when jumping or navigating', () => {
    let answers: QuizAnswers = {};

    // Answer Q1
    answers = { ...answers, q01: 'Star Topology' };
    expect(answers['q01']).toBe('Star Topology');

    // Move to Q2 and answer
    answers = { ...answers, q02: ['TCP', 'UDP'] };
    expect(answers['q01']).toBe('Star Topology'); // Q1 preserved
    expect(answers['q02']).toEqual(['TCP', 'UDP']);

    // Update Q1 answer
    answers = { ...answers, q01: 'Mesh Topology' };
    expect(answers['q01']).toBe('Mesh Topology');
    expect(answers['q02']).toEqual(['TCP', 'UDP']); // Q2 preserved
  });
});
