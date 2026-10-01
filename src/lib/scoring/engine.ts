import { Question, ReviewerData } from '@/types/reviewer';
import { AnswerValue, QuizAnswers } from '@/quiz/types';
import { normalizeAnswer } from './normalizer';
import { QuestionResult, QuizScoreSummary } from './types';

/**
 * Determines whether a student provided a non-empty answer for a question
 */
export function isAnswerProvided(answer: AnswerValue): boolean {
  if (answer === null || answer === undefined) {
    return false;
  }
  if (typeof answer === 'string') {
    return answer.trim().length > 0;
  }
  if (Array.isArray(answer)) {
    return answer.length > 0;
  }
  if (typeof answer === 'boolean') {
    return true;
  }
  return false;
}

/**
 * Pure deterministic evaluation of a single question
 */
export function scoreQuestion(question: Question, studentAnswer: AnswerValue): QuestionResult {
  const answered = isAnswerProvided(studentAnswer);

  if (!answered) {
    let expectedAnswer: string | string[] | boolean;
    switch (question.type) {
      case 'multiple-choice':
        expectedAnswer = question.correctAnswer;
        break;
      case 'multiple-answer':
        expectedAnswer = question.correctAnswers;
        break;
      case 'true-false':
        expectedAnswer = question.correctAnswer;
        break;
      case 'fill-blank':
        expectedAnswer = question.acceptedAnswers[0];
        break;
    }

    return {
      questionId: question.id,
      questionType: question.type,
      topic: question.topic,
      questionPrompt: question.question,
      studentAnswer: null,
      correctAnswer: expectedAnswer,
      isCorrect: false,
      isUnanswered: true,
      explanation: question.explanation,
    };
  }

  let isCorrect = false;
  let expectedAnswer: string | string[] | boolean;

  switch (question.type) {
    case 'multiple-choice': {
      expectedAnswer = question.correctAnswer;
      isCorrect = typeof studentAnswer === 'string' && studentAnswer === question.correctAnswer;
      break;
    }

    case 'multiple-answer': {
      expectedAnswer = question.correctAnswers;
      if (Array.isArray(studentAnswer)) {
        const studentSet = new Set(studentAnswer);
        const correctSet = new Set(question.correctAnswers);

        // Exact set equality: same size and every student element exists in correct set
        isCorrect =
          studentSet.size === correctSet.size &&
          [...studentSet].every((item) => correctSet.has(item));
      } else {
        isCorrect = false;
      }
      break;
    }

    case 'true-false': {
      expectedAnswer = question.correctAnswer;
      isCorrect = typeof studentAnswer === 'boolean' && studentAnswer === question.correctAnswer;
      break;
    }

    case 'fill-blank': {
      expectedAnswer = question.acceptedAnswers.join(' / ');
      if (typeof studentAnswer === 'string') {
        const normalizedStudent = normalizeAnswer(studentAnswer);
        isCorrect = question.acceptedAnswers.some(
          (acc) => normalizeAnswer(acc) === normalizedStudent
        );
      } else {
        isCorrect = false;
      }
      break;
    }
  }

  return {
    questionId: question.id,
    questionType: question.type,
    topic: question.topic,
    questionPrompt: question.question,
    studentAnswer,
    correctAnswer: expectedAnswer,
    isCorrect,
    isUnanswered: false,
    explanation: question.explanation,
  };
}

/**
 * Deterministically evaluates an entire reviewer session.
 * Supports taking a custom ordered/shuffled questions array to preserve attempt order.
 */
export function scoreQuiz(
  reviewer: ReviewerData,
  answers: QuizAnswers,
  questionsToScore: Question[] = reviewer.questions
): QuizScoreSummary {
  const results: QuestionResult[] = questionsToScore.map((q) => {
    const studentAnswer = answers[q.id] ?? null;
    return scoreQuestion(q, studentAnswer);
  });

  const totalQuestions = results.length;
  const correctCount = results.filter((r) => r.isCorrect).length;
  const unansweredCount = results.filter((r) => r.isUnanswered).length;
  const incorrectCount = totalQuestions - correctCount - unansweredCount;

  const scorePercentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return {
    reviewerId: reviewer.id,
    totalQuestions,
    correctCount,
    incorrectCount,
    unansweredCount,
    scorePercentage,
    results,
  };
}

/**
 * Finds the index of the next unanswered question.
 * Searches forward from (currentIndex + 1) to the end, then wraps around from 0 to (currentIndex - 1).
 * Returns null if all questions are answered or no other unanswered questions exist.
 */
export function getNextUnansweredIndex(
  questions: Question[],
  answers: QuizAnswers,
  currentIndex: number
): number | null {
  const total = questions.length;
  if (total <= 1) return null;

  // Search forward from currentIndex + 1
  for (let i = currentIndex + 1; i < total; i++) {
    if (!isAnswerProvided(answers[questions[i].id])) {
      return i;
    }
  }

  // Wrap around from 0 to currentIndex - 1
  for (let i = 0; i < currentIndex; i++) {
    if (!isAnswerProvided(answers[questions[i].id])) {
      return i;
    }
  }

  return null;
}

