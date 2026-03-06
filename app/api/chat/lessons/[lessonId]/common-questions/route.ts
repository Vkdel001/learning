import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { getCommonQuestions } from '@/lib/services/chat.service';

/**
 * GET /api/chat/lessons/:lessonId/common-questions
 * Get frequently asked questions for a lesson
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  return requireAuth(request, async (req) => {
    try {
      const { lessonId } = params;

      // Get common questions
      const questions = await getCommonQuestions(lessonId, 5);

      return NextResponse.json({
        success: true,
        data: questions,
      });
    } catch (error: any) {
      console.error('Get common questions error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch common questions' },
        { status: 500 }
      );
    }
  });
}
