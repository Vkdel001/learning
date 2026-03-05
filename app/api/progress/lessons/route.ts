import { NextRequest, NextResponse } from 'next/server';
import { markLessonComplete, getCompletedLessons } from '@/lib/services/progress.service';
import { getUserIdFromRequest } from '@/lib/utils/auth-server';

/**
 * GET /api/progress/lessons
 * Get all completed lessons for the current user
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

    const lessons = await getCompletedLessons(userId);

    return NextResponse.json({
      success: true,
      data: lessons,
    });
  } catch (error: any) {
    console.error('Failed to get completed lessons:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get completed lessons',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/progress/lessons
 * Mark a lesson as completed
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
    const { lessonId } = body;

    if (!lessonId) {
      return NextResponse.json(
        {
          success: false,
          error: 'lessonId is required',
        },
        { status: 400 }
      );
    }

    await markLessonComplete(userId, lessonId);

    return NextResponse.json({
      success: true,
      message: 'Lesson marked as completed',
    });
  } catch (error: any) {
    console.error('Failed to mark lesson complete:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to mark lesson complete',
      },
      { status: 500 }
    );
  }
}
