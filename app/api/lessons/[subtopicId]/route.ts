import { NextRequest, NextResponse } from 'next/server';
import { getLesson } from '@/lib/services/lesson-generator.service';
import { requireAuth } from '@/lib/middleware/auth.middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { subtopicId: string } }
) {
  return requireAuth(request, async (req) => {
    try {
      const { subtopicId } = params;

      // Get lesson from database/cache
      const lesson = await getLesson(subtopicId);

      if (!lesson) {
        return NextResponse.json(
          { error: 'Lesson not found. Generate it first.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: lesson,
      });
    } catch (error: any) {
      console.error('Get lesson error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch lesson' },
        { status: 500 }
      );
    }
  });
}
