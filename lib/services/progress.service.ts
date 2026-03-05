import { prisma } from '../prisma';

/**
 * Progress Service
 * Tracks user progress through lessons and quizzes
 */

export interface LessonProgress {
  lessonId: string;
  subtopicName: string;
  completedAt: Date;
}

export interface QuizAttemptData {
  quizId: string;
  topicName: string;
  answers: number[];
  score: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: Date;
}

export interface ProgressStats {
  totalLessonsCompleted: number;
  totalQuizzesAttempted: number;
  averageQuizScore: number;
  recentActivity: Array<{
    type: 'lesson' | 'quiz';
    name: string;
    completedAt: Date;
    score?: number;
  }>;
}

/**
 * Mark a lesson as completed
 */
export async function markLessonComplete(
  userId: string,
  lessonId: string
): Promise<void> {
  await prisma.progress.upsert({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
    update: {
      completedAt: new Date(),
    },
    create: {
      userId,
      lessonId,
      completedAt: new Date(),
    },
  });
}

/**
 * Check if a lesson is completed
 */
export async function isLessonCompleted(
  userId: string,
  lessonId: string
): Promise<boolean> {
  const progress = await prisma.progress.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
  });

  return !!progress;
}

/**
 * Get all completed lessons for a user
 */
export async function getCompletedLessons(
  userId: string
): Promise<LessonProgress[]> {
  const progress = await prisma.progress.findMany({
    where: { userId },
    include: {
      lesson: {
        include: {
          subtopic: true,
        },
      },
    },
    orderBy: { completedAt: 'desc' },
  });

  return progress.map((p) => ({
    lessonId: p.lessonId,
    subtopicName: p.lesson.subtopic.name,
    completedAt: p.completedAt,
  }));
}

/**
 * Record a quiz attempt
 */
export async function recordQuizAttempt(
  userId: string,
  quizId: string,
  answers: number[],
  correctAnswers: number[],
  timeSpent: number
): Promise<QuizAttemptData> {
  // Calculate score
  let correct = 0;
  answers.forEach((answer, idx) => {
    if (answer === correctAnswers[idx]) {
      correct++;
    }
  });

  const score = (correct / correctAnswers.length) * 100;

  // Save attempt
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      answers: answers,
      score,
      timeSpent,
    },
    include: {
      quiz: {
        include: {
          topic: true,
        },
      },
    },
  });

  return {
    quizId: attempt.quizId,
    topicName: attempt.quiz.topic.name,
    answers,
    score,
    totalQuestions: correctAnswers.length,
    timeSpent,
    completedAt: attempt.completedAt,
  };
}

/**
 * Get quiz attempts for a user
 */
export async function getQuizAttempts(
  userId: string,
  limit: number = 10
): Promise<QuizAttemptData[]> {
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId },
    include: {
      quiz: {
        include: {
          topic: true,
        },
      },
    },
    orderBy: { completedAt: 'desc' },
    take: limit,
  });

  return attempts.map((a) => ({
    quizId: a.quizId,
    topicName: a.quiz.topic.name,
    answers: a.answers as number[],
    score: parseFloat(a.score.toString()),
    totalQuestions: (a.answers as number[]).length,
    timeSpent: a.timeSpent,
    completedAt: a.completedAt,
  }));
}

/**
 * Get best quiz attempt for a specific quiz
 */
export async function getBestQuizAttempt(
  userId: string,
  quizId: string
): Promise<QuizAttemptData | null> {
  const attempt = await prisma.quizAttempt.findFirst({
    where: {
      userId,
      quizId,
    },
    include: {
      quiz: {
        include: {
          topic: true,
        },
      },
    },
    orderBy: { score: 'desc' },
  });

  if (!attempt) {
    return null;
  }

  return {
    quizId: attempt.quizId,
    topicName: attempt.quiz.topic.name,
    answers: attempt.answers as number[],
    score: parseFloat(attempt.score.toString()),
    totalQuestions: (attempt.answers as number[]).length,
    timeSpent: attempt.timeSpent,
    completedAt: attempt.completedAt,
  };
}

/**
 * Get progress statistics for a user
 */
export async function getProgressStats(userId: string): Promise<ProgressStats> {
  // Get lesson count
  const lessonCount = await prisma.progress.count({
    where: { userId },
  });

  // Get quiz attempts
  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { userId },
    include: {
      quiz: {
        include: {
          topic: true,
        },
      },
    },
    orderBy: { completedAt: 'desc' },
  });

  // Calculate average score
  const avgScore =
    quizAttempts.length > 0
      ? quizAttempts.reduce((sum, a) => sum + parseFloat(a.score.toString()), 0) /
        quizAttempts.length
      : 0;

  // Get recent lessons
  const recentLessons = await prisma.progress.findMany({
    where: { userId },
    include: {
      lesson: {
        include: {
          subtopic: true,
        },
      },
    },
    orderBy: { completedAt: 'desc' },
    take: 5,
  });

  // Combine recent activity
  const recentActivity = [
    ...recentLessons.map((p) => ({
      type: 'lesson' as const,
      name: p.lesson.subtopic.name,
      completedAt: p.completedAt,
    })),
    ...quizAttempts.slice(0, 5).map((a) => ({
      type: 'quiz' as const,
      name: a.quiz.topic.name,
      completedAt: a.completedAt,
      score: parseFloat(a.score.toString()),
    })),
  ]
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
    .slice(0, 10);

  return {
    totalLessonsCompleted: lessonCount,
    totalQuizzesAttempted: quizAttempts.length,
    averageQuizScore: avgScore,
    recentActivity,
  };
}
