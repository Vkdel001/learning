import { NextRequest, NextResponse } from 'next/server';
import { recordQuizAttempt, getQuizAttempts } from '@/lib/services/progress.service';
import { getUserIdFromRequest } from '@/lib/utils/auth-server';

/**
 * GET /api/progress/quizzes
 * Get quiz attempts for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const attempts = await getQuizAttempts(userId, 20);

    return NextResponse.json({
      success: true,
      data: attempts,
    });
  } catch (error: any) {
    console.error('Failed to get quiz attempts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get quiz attempts',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/progress/quizzes
 * Record a quiz attempt
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { quizId, answers, correctAnswers, timeSpent } = body;

    if (!quizId || !answers || !correctAnswers) {
      return NextResponse.json(
        {
          success: false,
          error: 'quizId, answers, and correctAnswers are required',
        },
        { status: 400 }
      );
    }

    const attempt = await recordQuizAttempt(
      userId,
      quizId,
      answers,
      correctAnswers,
      timeSpent || 0
    );

    return NextResponse.json({
      success: true,
      data: attempt,
    });
  } catch (error: any) {
    console.error('Failed to record quiz attempt:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to record quiz attempt',
      },
      { status: 500 }
    );
  }
}
