import { describe, it, expect } from 'vitest';
import { reviewerSchema } from '@/schemas/reviewerSchema';
import { validateReviewerJson } from '@/lib/content/reviewerLoader';

describe('Reviewer Contract & Schema Validation (Phase 2)', () => {
  const validSampleReviewer = {
    schemaVersion: 1,
    id: 'it0123-midterm',
    subject: {
      code: 'IT0123',
      name: 'Networking Fundamentals',
      yearLevel: 1,
    },
    reviewer: {
      title: 'Midterm Reviewer',
      description: 'Reviewer covering Modules 1 to 4.',
      coverage: ['Module 1', 'Module 2', 'Module 3', 'Module 4'],
      shuffleQuestions: true,
      shuffleChoices: true,
    },
    questions: [
      {
        id: 'q001',
        type: 'multiple-choice',
        topic: 'OSI Model',
        question: 'Which OSI layer is responsible for packet routing?',
        choices: ['Physical', 'Data Link', 'Network', 'Transport'],
        correctAnswer: 'Network',
        explanation: 'The Network layer handles routing and logical addressing.',
        source: { module: 'Module 2', page: 14 },
      },
      {
        id: 'q002',
        type: 'multiple-answer',
        topic: 'Transport Layer',
        question: 'Which protocols operate at the transport layer?',
        choices: ['TCP', 'UDP', 'IP', 'Ethernet'],
        correctAnswers: ['TCP', 'UDP'],
        explanation: 'TCP and UDP are transport-layer protocols.',
        source: { module: 'Module 2', page: 20 },
      },
      {
        id: 'q003',
        type: 'true-false',
        topic: 'TCP',
        question: 'TCP is connection-oriented.',
        correctAnswer: true,
        explanation: 'TCP establishes a 3-way handshake prior to data transmission.',
        source: { module: 'Module 3', page: 8 },
      },
      {
        id: 'q004',
        type: 'fill-blank',
        topic: 'DHCP',
        question: 'The protocol used to automatically assign IP addresses is _____.',
        acceptedAnswers: ['DHCP', 'Dynamic Host Configuration Protocol'],
        explanation: 'DHCP automatically allocates IP addresses.',
        source: { module: 'Module 3', page: 16 },
      },
    ],
  };

  it('successfully validates a complete valid reviewer JSON with all 4 question types', () => {
    const result = reviewerSchema.safeParse(validSampleReviewer);
    expect(result.success).toBe(true);
  });

  it('rejects unsupported schema versions (e.g. schemaVersion: 2 or 0)', () => {
    const invalid = { ...validSampleReviewer, schemaVersion: 2 };
    const result = reviewerSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Unsupported schema version');
    }
  });

  it('rejects duplicate question IDs within the same reviewer', () => {
    const invalid = {
      ...validSampleReviewer,
      questions: [
        validSampleReviewer.questions[0],
        { ...validSampleReviewer.questions[1], id: 'q001' }, // duplicate id
      ],
    };
    const result = reviewerSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues.map((i) => i.message).join(' ');
      expect(msg).toContain('Duplicate question ID detected: "q001"');
    }
  });

  it('rejects empty question banks (0 questions)', () => {
    const invalid = { ...validSampleReviewer, questions: [] };
    const result = reviewerSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Reviewer question bank cannot be empty');
    }
  });

  it('rejects multiple-choice questions when correctAnswer is not among choices', () => {
    const invalid = {
      ...validSampleReviewer,
      questions: [
        {
          id: 'q001',
          type: 'multiple-choice',
          topic: 'Routing',
          question: 'What routes packets?',
          choices: ['Switch', 'Hub'],
          correctAnswer: 'Router', // not in choices!
          explanation: 'Routers route.',
          source: { module: 'Module 1' },
        },
      ],
    };
    const result = reviewerSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('correctAnswer'));
      expect(issue?.message).toContain('does not exist in choices');
    }
  });

  it('rejects multiple-answer questions when any correct answer is not among choices', () => {
    const invalid = {
      ...validSampleReviewer,
      questions: [
        {
          id: 'q002',
          type: 'multiple-answer',
          topic: 'Protocols',
          question: 'Pick protocols:',
          choices: ['TCP', 'UDP'],
          correctAnswers: ['TCP', 'BGP'], // BGP not in choices!
          explanation: 'Explanation',
          source: { module: 'Module 1' },
        },
      ],
    };
    const result = reviewerSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('correctAnswers'));
      expect(issue?.message).toContain('does not exist in choices');
    }
  });

  it('rejects true-false questions with non-boolean correctAnswer', () => {
    const invalid = {
      ...validSampleReviewer,
      questions: [
        {
          id: 'q003',
          type: 'true-false',
          topic: 'Topic',
          question: 'Question?',
          correctAnswer: 'true', // string instead of boolean
          explanation: 'Explanation',
          source: { module: 'Module 1' },
        },
      ],
    };
    const result = reviewerSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects fill-in-the-blank questions with empty or whitespace-only accepted answers', () => {
    const invalid = {
      ...validSampleReviewer,
      questions: [
        {
          id: 'q004',
          type: 'fill-blank',
          topic: 'Topic',
          question: 'Blank: _____',
          acceptedAnswers: ['   '], // whitespace only
          explanation: 'Explanation',
          source: { module: 'Module 1' },
        },
      ],
    };
    const result = reviewerSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('produces formatted human-readable diagnostic error messages with question ID and file path', () => {
    const invalid = {
      schemaVersion: 1,
      id: 'bad-rev',
      subject: { code: 'IT0123', name: 'Networking', yearLevel: 1 },
      reviewer: { title: 'Title', description: 'Desc', coverage: ['Mod 1'] },
      questions: [
        {
          id: 'q017',
          type: 'multiple-choice',
          topic: 'OSI',
          question: 'Question?',
          choices: ['Switch', 'Hub'],
          correctAnswer: 'Router',
          explanation: 'Exp',
          source: { module: 'Mod 1' },
        },
      ],
    };

    const validated = validateReviewerJson(invalid, 'reviewers/year-1/IT0123/midterm.json');
    expect(validated.success).toBe(false);
    if (!validated.success) {
      expect(validated.errorMessage).toContain('reviewers/year-1/IT0123/midterm.json');
      expect(validated.errorMessage).toContain('Question [q017]');
      expect(validated.errorMessage).toContain('correctAnswer "Router" does not exist in choices');
    }
  });

  it('rejects multiple-answer questions with fewer than 2 correct answers', () => {
    const invalid = {
      ...validSampleReviewer,
      questions: [
        {
          id: 'q002',
          type: 'multiple-answer',
          topic: 'Protocols',
          question: 'Pick protocols:',
          choices: ['TCP', 'UDP', 'IP'],
          correctAnswers: ['TCP'], // Only 1 correct answer!
          explanation: 'Requires >= 2.',
          source: { module: 'Module 1' },
        },
      ],
    };
    const result = reviewerSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('correctAnswers'));
      expect(issue?.message).toContain('Multiple-answer questions must specify at least 2 correct answers');
    }
  });

  it('rejects multiple-choice questions containing duplicate choices', () => {
    const invalid = {
      ...validSampleReviewer,
      questions: [
        {
          id: 'q001',
          type: 'multiple-choice',
          topic: 'Choices',
          question: 'Question with duplicates?',
          choices: ['Option A', 'Option B', 'Option A'], // Duplicate Option A
          correctAnswer: 'Option B',
          explanation: 'Exp',
          source: { module: 'Module 1' },
        },
      ],
    };
    const result = reviewerSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.message.includes('Duplicate choice detected'));
      expect(issue).toBeDefined();
      expect(issue?.message).toContain('Duplicate choice detected: "Option A"');
    }
  });

  it('rejects multiple-answer questions containing duplicate choices', () => {
    const invalid = {
      ...validSampleReviewer,
      questions: [
        {
          id: 'q002',
          type: 'multiple-answer',
          topic: 'Choices',
          question: 'Question with duplicates?',
          choices: ['Alpha', 'Beta', 'Beta', 'Gamma'], // Duplicate Beta
          correctAnswers: ['Alpha', 'Beta'],
          explanation: 'Exp',
          source: { module: 'Module 1' },
        },
      ],
    };
    const result = reviewerSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.message.includes('Duplicate choice detected'));
      expect(issue).toBeDefined();
      expect(issue?.message).toContain('Duplicate choice detected: "Beta"');
    }
  });

  it('rejects multiple-answer questions containing duplicate correctAnswers', () => {
    const invalid = {
      ...validSampleReviewer,
      questions: [
        {
          id: 'q002',
          type: 'multiple-answer',
          topic: 'Answers',
          question: 'Question with duplicate correct answers?',
          choices: ['Alpha', 'Beta', 'Gamma'],
          correctAnswers: ['Alpha', 'Alpha'], // Duplicate Alpha
          explanation: 'Exp',
          source: { module: 'Module 1' },
        },
      ],
    };
    const result = reviewerSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.message.includes('Duplicate correct answer detected'));
      expect(issue).toBeDefined();
      expect(issue?.message).toContain('Duplicate correct answer detected: "Alpha"');
    }
  });
});
