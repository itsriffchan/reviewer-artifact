import { z } from 'zod';

/**
 * Question Source Schema
 */
export const questionSourceSchema = z.object({
  module: z.string().min(1, 'Source module name cannot be empty'),
  page: z.union([z.number(), z.string()]).optional(),
});

/**
 * Base Question fields shared across all question types
 */
const baseQuestionFields = {
  id: z.string().min(1, 'Question ID cannot be empty'),
  topic: z.string().min(1, 'Question topic cannot be empty'),
  question: z.string().min(1, 'Question prompt cannot be empty'),
  explanation: z.string().min(1, 'Question explanation cannot be empty'),
  source: questionSourceSchema,
};

/**
 * Multiple Choice Question Schema (Single Answer)
 */
export const multipleChoiceQuestionSchema = z
  .object({
    ...baseQuestionFields,
    type: z.literal('multiple-choice'),
    choices: z
      .array(z.string().min(1, 'Choice text cannot be empty'))
      .min(2, 'Multiple-choice questions must have at least 2 choices'),
    correctAnswer: z.string().min(1, 'Correct answer cannot be empty'),
  })
  .superRefine((data, ctx) => {
    // Check for duplicate choices
    const choiceSet = new Set<string>();
    for (let i = 0; i < data.choices.length; i++) {
      const choice = data.choices[i];
      if (choiceSet.has(choice)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['choices', i],
          message: `Duplicate choice detected: "${choice}". Choices must be unique.`,
        });
      }
      choiceSet.add(choice);
    }

    if (!data.choices.includes(data.correctAnswer)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['correctAnswer'],
        message: `correctAnswer "${data.correctAnswer}" does not exist in choices: [${data.choices.join(', ')}]`,
      });
    }
  });

/**
 * Multiple Answer Question Schema (Multiple Answers)
 */
export const multipleAnswerQuestionSchema = z
  .object({
    ...baseQuestionFields,
    type: z.literal('multiple-answer'),
    choices: z
      .array(z.string().min(1, 'Choice text cannot be empty'))
      .min(2, 'Multiple-answer questions must have at least 2 choices'),
    correctAnswers: z
      .array(z.string().min(1, 'Correct answer text cannot be empty'))
      .min(2, 'Multiple-answer questions must specify at least 2 correct answers'),
    maxChoices: z.number().int().positive('maxChoices must be a positive integer').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.maxChoices !== undefined) {
      if (data.maxChoices < data.correctAnswers.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['maxChoices'],
          message: `maxChoices (${data.maxChoices}) cannot be less than the number of correctAnswers (${data.correctAnswers.length})`,
        });
      }
      if (data.maxChoices > data.choices.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['maxChoices'],
          message: `maxChoices (${data.maxChoices}) cannot exceed total choices count (${data.choices.length})`,
        });
      }
    }
    // Check for duplicate choices
    const choiceSet = new Set<string>();
    for (let i = 0; i < data.choices.length; i++) {
      const choice = data.choices[i];
      if (choiceSet.has(choice)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['choices', i],
          message: `Duplicate choice detected: "${choice}". Choices must be unique.`,
        });
      }
      choiceSet.add(choice);
    }

    // Check for duplicate correct answers
    const correctSet = new Set<string>();
    for (let i = 0; i < data.correctAnswers.length; i++) {
      const ans = data.correctAnswers[i];
      if (correctSet.has(ans)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['correctAnswers', i],
          message: `Duplicate correct answer detected: "${ans}". Correct answers must be unique.`,
        });
      }
      correctSet.add(ans);
    }

    for (const ans of data.correctAnswers) {
      if (!data.choices.includes(ans)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['correctAnswers'],
          message: `correct answer "${ans}" does not exist in choices: [${data.choices.join(', ')}]`,
        });
      }
    }
  });

/**
 * True/False Question Schema
 */
export const trueFalseQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal('true-false'),
  correctAnswer: z.boolean({
    error: 'True/False question correctAnswer must be a boolean (true or false)',
  }),
});

/**
 * Fill in the Blank Question Schema
 */
export const fillBlankQuestionSchema = z
  .object({
    ...baseQuestionFields,
    type: z.literal('fill-blank'),
    acceptedAnswers: z
      .array(z.string().min(1, 'Accepted answer cannot be empty'))
      .min(1, 'Fill-in-the-blank questions must specify at least 1 accepted answer'),
  })
  .superRefine((data, ctx) => {
    for (let i = 0; i < data.acceptedAnswers.length; i++) {
      if (data.acceptedAnswers[i].trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['acceptedAnswers', i],
          message: 'Accepted answer cannot consist solely of whitespace',
        });
      }
    }
  });

/**
 * Discriminated Question Union
 */
export const questionSchema = z.discriminatedUnion('type', [
  multipleChoiceQuestionSchema,
  multipleAnswerQuestionSchema,
  trueFalseQuestionSchema,
  fillBlankQuestionSchema,
]);

/**
 * Subject Metadata Schema
 */
export const subjectMetadataSchema = z.object({
  code: z.string().min(1, 'Subject code is required (e.g. "IT0123")'),
  name: z.string().min(1, 'Subject name is required (e.g. "Networking Fundamentals")'),
  yearLevel: z
    .number()
    .int('Year level must be an integer')
    .min(1, 'Year level must be at least 1')
    .max(4, 'Year level cannot exceed 4'),
});

/**
 * Reviewer Metadata Schema
 */
export const reviewerMetadataSchema = z.object({
  title: z.string().min(1, 'Reviewer title is required'),
  description: z.string().min(1, 'Reviewer description is required'),
  coverage: z
    .array(z.string().min(1, 'Coverage item cannot be empty'))
    .min(1, 'Coverage must specify at least one module or topic'),
  shuffleQuestions: z.boolean().default(true),
  shuffleChoices: z.boolean().default(true),
});

/**
 * Complete Reviewer JSON Schema (Version 1)
 */
export const reviewerSchema = z
  .object({
    schemaVersion: z.literal(1, {
      error: 'Unsupported schema version. Only schemaVersion: 1 is supported.',
    }),
    id: z.string().min(1, 'Reviewer unique ID is required'),
    subject: subjectMetadataSchema,
    reviewer: reviewerMetadataSchema,
    questions: z
      .array(questionSchema)
      .min(1, 'Reviewer question bank cannot be empty (must contain at least 1 question)'),
  })
  .superRefine((data, ctx) => {
    // Check for duplicate question IDs
    const seenIds = new Set<string>();
    data.questions.forEach((q, index) => {
      if (seenIds.has(q.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['questions', index, 'id'],
          message: `Duplicate question ID detected: "${q.id}". Question IDs within a reviewer must be unique.`,
        });
      }
      seenIds.add(q.id);
    });
  });

export type ReviewerSchemaType = z.infer<typeof reviewerSchema>;

/**
 * Human-readable validation error reporting
 */
export interface ReviewerValidationError {
  filePath?: string;
  field: string;
  questionId?: string;
  message: string;
}

export function formatReviewerValidationErrors(
  error: z.ZodError,
  filePath?: string,
  rawQuestions?: Array<{ id?: string }>
): ReviewerValidationError[] {
  return error.issues.map((issue) => {
    const fieldPath = issue.path.join('.');
    let questionId: string | undefined;

    // Check if error path references questions[index]
    if (issue.path[0] === 'questions' && typeof issue.path[1] === 'number') {
      const qIndex = issue.path[1];
      if (rawQuestions && rawQuestions[qIndex]?.id) {
        questionId = rawQuestions[qIndex].id;
      }
    }

    return {
      filePath,
      field: fieldPath,
      questionId,
      message: issue.message,
    };
  });
}

export function formatValidationErrorMessage(
  errors: ReviewerValidationError[],
  filePath?: string
): string {
  const fileHeader = filePath ? `Reviewer validation failed for: ${filePath}\n` : 'Reviewer validation failed:\n';
  const issueLines = errors.map((err) => {
    const qPrefix = err.questionId ? `Question [${err.questionId}]: ` : '';
    const fieldPrefix = err.field ? `(${err.field}) ` : '';
    return `  - ${qPrefix}${fieldPrefix}${err.message}`;
  });
  return `${fileHeader}${issueLines.join('\n')}`;
}
