import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import {
  getConversationHistory,
  addMessage,
  generateResponse,
  trackQuestion,
} from '@/lib/services/chat.service';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';

/**
 * Rate limiting: 50 messages per day per user
 */
async function checkRateLimit(userId: string): Promise<boolean> {
  const key = `chat:ratelimit:${userId}`;
  const count = await redis.get(key);
  
  if (count && parseInt(count) >= 50) {
    return false;
  }
  
  // Increment counter
  const newCount = await redis.incr(key);
  
  // Set expiry on first increment (24 hours)
  if (newCount === 1) {
    await redis.expire(key, 86400);
  }
  
  return true;
}

/**
 * GET /api/chat/conversations/:id/messages
 * Get conversation history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(request, async (req) => {
    try {
      const { id: conversationId } = params;

      // Get conversation history
      const messages = await getConversationHistory(conversationId);

      return NextResponse.json({
        success: true,
        data: messages,
      });
    } catch (error: any) {
      console.error('Get conversation history error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch conversation history' },
        { status: 500 }
      );
    }
  });
}

/**
 * POST /api/chat/conversations/:id/messages
 * Send a message and get AI response
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(request, async (req) => {
    try {
      const { id: conversationId } = params;
      const body = await req.json();
      const { message } = body;

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return NextResponse.json(
          { error: 'message is required' },
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

      // Check rate limit
      const allowed = await checkRateLimit(userId);
      if (!allowed) {
        return NextResponse.json(
          { error: 'Daily message limit reached (50 messages/day)' },
          { status: 429 }
        );
      }

      // Add user message
      const userMessage = await addMessage(conversationId, 'user', message.trim());

      // Generate AI response
      const { response, tokensUsed } = await generateResponse(
        conversationId,
        message.trim(),
        userId
      );

      // Add assistant message
      const assistantMessage = await addMessage(
        conversationId,
        'assistant',
        response,
        tokensUsed
      );

      // Track question for analytics (async, don't wait)
      const conversation = await prisma.chatConversation.findUnique({
        where: { id: conversationId },
      });
      if (conversation) {
        trackQuestion(conversation.lessonId, message.trim()).catch((err) =>
          console.error('Track question error:', err)
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          userMessage,
          assistantMessage,
        },
      });
    } catch (error: any) {
      console.error('Send message error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to send message' },
        { status: 500 }
      );
    }
  });
}
