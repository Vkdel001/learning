import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { getOrCreateConversation } from '@/lib/services/chat.service';

/**
 * POST /api/chat/conversations
 * Get or create a conversation for a lesson
 */
export async function POST(request: NextRequest) {
  return requireAuth(request, async (req) => {
    try {
      const body = await req.json();
      const { lessonId } = body;

      if (!lessonId) {
        return NextResponse.json(
          { error: 'lessonId is required' },
          { status: 400 }
        );
      }

      // Get userId from authenticated request
      const userId = req.user?.id;
      if (!userId) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 401 }
        );
      }

      // Get or create conversation
      const conversation = await getOrCreateConversation(userId, lessonId);

      return NextResponse.json({
        success: true,
        data: conversation,
      });
    } catch (error: any) {
      console.error('Create conversation error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create conversation' },
        { status: 500 }
      );
    }
  });
}
