import React from 'react';
import { notFound } from 'next/navigation';
import { ReviewerCatalog } from '@/lib/content/catalog';
import { QuizEngine } from '@/quiz/components/QuizEngine';
import { FeedbackTiming } from '@/quiz/types';

interface QuizPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    count?: string;
    modules?: string;
    feedback?: string;
  }>;
}

export async function generateMetadata({ params }: QuizPageProps) {
  const { id } = await params;
  const reviewer = ReviewerCatalog.getReviewerById(id);
  if (!reviewer) {
    return { title: 'Reviewer Not Found' };
  }
  return {
    title: `Quiz: ${reviewer.reviewer.title} | ${reviewer.subject.code}`,
    description: `Interactive practice quiz for ${reviewer.subject.code} (${reviewer.subject.name}).`,
  };
}

export default async function QuizPage({ params, searchParams }: QuizPageProps) {
  const { id } = await params;
  const { count, modules, feedback } = await searchParams;
  const reviewer = ReviewerCatalog.getReviewerById(id);

  if (!reviewer) {
    notFound();
  }

  const parsedCount = count ? parseInt(count, 10) : undefined;
  const parsedModules = modules
    ? modules
        .split(',')
        .map((m) => decodeURIComponent(m.trim()))
        .filter((m) => m.length > 0)
    : undefined;

  const feedbackTiming: FeedbackTiming = feedback === 'immediate' ? 'immediate' : 'end';

  const initialConfig = {
    questionCount: parsedCount && !isNaN(parsedCount) ? parsedCount : undefined,
    selectedModules: parsedModules,
    feedbackTiming,
  };

  return <QuizEngine reviewer={reviewer} initialConfig={initialConfig} />;
}
