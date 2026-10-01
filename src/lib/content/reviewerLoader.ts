import fs from 'fs';
import path from 'path';
import {
  reviewerSchema,
  formatReviewerValidationErrors,
  formatValidationErrorMessage,
  ReviewerValidationError,
} from '@/schemas/reviewerSchema';
import { ReviewerData, ReviewerSummary } from '@/types/reviewer';

export interface LoadedReviewerResult {
  success: boolean;
  filePath: string;
  data?: ReviewerData;
  summary?: ReviewerSummary;
  errors?: ReviewerValidationError[];
  errorMessage?: string;
}

/**
 * Returns absolute path to root reviewers directory
 */
export function getReviewersDirectory(): string {
  return path.join(process.cwd(), 'reviewers');
}

/**
 * Recursively scans directory for all .json files
 */
export function discoverReviewerFiles(dirPath: string = getReviewersDirectory()): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const results: string[] = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...discoverReviewerFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Validates raw JSON object against reviewer schema
 */
export function validateReviewerJson(
  rawJson: unknown,
  filePath?: string
): { success: true; data: ReviewerData } | { success: false; errors: ReviewerValidationError[]; errorMessage: string } {
  const result = reviewerSchema.safeParse(rawJson);

  if (!result.success) {
    const rawQuestions =
      typeof rawJson === 'object' && rawJson !== null && 'questions' in rawJson && Array.isArray((rawJson as { questions: unknown }).questions)
        ? (rawJson as { questions: Array<{ id?: string }> }).questions
        : undefined;

    const errors = formatReviewerValidationErrors(result.error, filePath, rawQuestions);
    const errorMessage = formatValidationErrorMessage(errors, filePath);
    return { success: false, errors, errorMessage };
  }

  return { success: true, data: result.data as ReviewerData };
}

/**
 * Reads, parses, and validates a single reviewer JSON file
 */
export function loadReviewerFile(filePath: string): LoadedReviewerResult {
  try {
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        filePath,
        errorMessage: `Reviewer file not found at: ${filePath}`,
        errors: [{ filePath, field: 'file', message: 'File does not exist' }],
      };
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    let rawJson: unknown;

    try {
      rawJson = JSON.parse(fileContent);
    } catch (parseError) {
      const syntaxMsg = parseError instanceof Error ? parseError.message : 'Invalid JSON syntax';
      return {
        success: false,
        filePath,
        errorMessage: `Failed to parse JSON file at ${filePath}: ${syntaxMsg}`,
        errors: [{ filePath, field: 'json', message: syntaxMsg }],
      };
    }

    const validation = validateReviewerJson(rawJson, filePath);

    if (!validation.success) {
      return {
        success: false,
        filePath,
        errors: validation.errors,
        errorMessage: validation.errorMessage,
      };
    }

    const data = validation.data;
    const questionTypes = Array.from(new Set(data.questions.map((q) => q.type)));

    const summary: ReviewerSummary = {
      id: data.id,
      title: data.reviewer.title,
      description: data.reviewer.description,
      coverage: data.reviewer.coverage,
      subjectCode: data.subject.code,
      subjectName: data.subject.name,
      yearLevel: data.subject.yearLevel,
      questionCount: data.questions.length,
      questionTypes,
      topics: Array.from(new Set(data.questions.map((q) => q.topic))),
      shuffleQuestions: data.reviewer.shuffleQuestions,
      shuffleChoices: data.reviewer.shuffleChoices,
      filePath,
    };

    return {
      success: true,
      filePath,
      data,
      summary,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown file loading error';
    return {
      success: false,
      filePath,
      errorMessage: `Error loading reviewer at ${filePath}: ${message}`,
      errors: [{ filePath, field: 'fs', message }],
    };
  }
}

/**
 * Scans and loads all reviewer files from /reviewers directory
 */
export function loadAllReviewers(): {
  validReviewers: ReviewerData[];
  summaries: ReviewerSummary[];
  failedFiles: Array<{ filePath: string; errorMessage: string; errors: ReviewerValidationError[] }>;
} {
  const filePaths = discoverReviewerFiles();
  const validReviewers: ReviewerData[] = [];
  const summaries: ReviewerSummary[] = [];
  const failedFiles: Array<{ filePath: string; errorMessage: string; errors: ReviewerValidationError[] }> = [];

  for (const filePath of filePaths) {
    const loaded = loadReviewerFile(filePath);
    if (loaded.success && loaded.data && loaded.summary) {
      validReviewers.push(loaded.data);
      summaries.push(loaded.summary);
    } else {
      failedFiles.push({
        filePath,
        errorMessage: loaded.errorMessage || 'Unknown validation failure',
        errors: loaded.errors || [],
      });
    }
  }

  return { validReviewers, summaries, failedFiles };
}
