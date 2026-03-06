/**
 * Chat Service
 * Manages AI tutor conversations with students
 */

import { prisma } from '../prisma';
import { getDefaultProvider } from './ai-provider.service';
import { computeHash } from './cache.service';
import { getNodeById } from './curriculum.service';

export interface ChatConversation {
  id: string;
  userId: string;
  lessonId: string;
  startedAt: Date;
  lastMessageAt: Date;
  messageCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  tokensUsed?: number;
}

/**
 * Get or create a conversation for a lesson
 */
export async function getOrCreateConversation(
  userId: string,
  lessonId: string
): Promise<ChatConversation> {
  // Try to find existing conversation from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let conversation = await prisma.chatConversation.findFirst({
    where: {
      userId,
      lessonId,
      startedAt: {
        gte: today,
      },
    },
    orderBy: {
      lastMessageAt: 'desc',
    },
  });

  // Create new conversation if none exists
  if (!conversation) {
    conversation = await prisma.chatConversation.create({
      data: {
        userId,
        lessonId,
      },
    });
  }

  return conversation;
}

/**
 * Add a message to conversation
 */
export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  tokensUsed?: number
): Promise<ChatMessage> {
  const message = await prisma.chatMessage.create({
    data: {
      conversationId,
      role,
      content,
      tokensUsed,
    },
  });

  // Update conversation metadata
  await prisma.chatConversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
      messageCount: {
        increment: 1,
      },
    },
  });

  return {
    id: message.id,
    conversationId: message.conversationId,
    role: message.role as 'user' | 'assistant',
    content: message.content,
    createdAt: message.createdAt,
    tokensUsed: message.tokensUsed || undefined,
  };
}

/**
 * Get conversation history
 */
export async function getConversationHistory(
  conversationId: string,
  limit: number = 20
): Promise<ChatMessage[]> {
  const messages = await prisma.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });

  return messages.map((msg) => ({
    id: msg.id,
    conversationId: msg.conversationId,
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
    createdAt: msg.createdAt,
    tokensUsed: msg.tokensUsed || undefined,
  }));
}

/**
 * Build chat prompt with lesson context
 */
async function buildChatPrompt(
  lessonId: string,
  conversationHistory: ChatMessage[],
  userQuestion: string,
  userGrade: number
): Promise<string> {
  // Get lesson details
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      subtopic: true,
    },
  });

  if (!lesson) {
    throw new Error('Lesson not found');
  }

  // Get curriculum path for context
  const breadcrumbs = [];
  let currentNode = lesson.subtopic;
  while (currentNode) {
    breadcrumbs.unshift(currentNode.name);
    if (currentNode.parentId) {
      const parentNode = await getNodeById(currentNode.parentId);
      if (parentNode) {
        currentNode = parentNode;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  const topicPath = breadcrumbs.join(' > ');

  // Format lesson content
  const lessonContent = `
Explanation: ${lesson.explanation}

Examples:
${(lesson.examples as string[]).map((ex, i) => `${i + 1}. ${ex}`).join('\n')}

Key Points:
${(lesson.keyPoints as string[]).map((kp, i) => `${i + 1}. ${kp}`).join('\n')}
  `.trim();

  // Format conversation history
  const historyText = conversationHistory
    .map((msg) => `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`)
    .join('\n');

  // Build system prompt
  const systemPrompt = `You are an AI tutor helping a Grade ${userGrade} student understand a lesson.

LESSON CONTEXT:
Topic: ${topicPath}
Subtopic: ${lesson.subtopic.name}

LESSON CONTENT:
${lessonContent}

YOUR ROLE:
- Answer questions about the lesson content clearly and simply
- Provide relevant examples from the lesson or create new ones
- Be encouraging and supportive
- Reference specific parts of the lesson when helpful
- If the question is off-topic, gently redirect to the lesson
- Keep responses concise (2-3 paragraphs maximum)
- Use language appropriate for Grade ${userGrade}

CONVERSATION HISTORY:
${historyText || 'This is the start of the conversation.'}

GUIDELINES:
- Be patient and understanding
- Break down complex concepts
- Use analogies when helpful
- Encourage critical thinking
- If you don't know something, admit it honestly
- Never provide direct answers to practice questions - guide the student to think

Student's question: ${userQuestion}

Provide a helpful, clear response:`;

  return systemPrompt;
}

/**
 * Generate AI response to user question
 */
export async function generateResponse(
  conversationId: string,
  userQuestion: string,
  userId: string
): Promise<{ response: string; tokensUsed: number }> {
  // Get conversation details
  const conversation = await prisma.chatConversation.findUnique({
    where: { id: conversationId },
    include: {
      user: true,
    },
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Get conversation history
  const history = await getConversationHistory(conversationId, 10);

  // Build prompt with lesson context
  const prompt = await buildChatPrompt(
    conversation.lessonId,
    history,
    userQuestion,
    conversation.user.grade
  );

  // Generate response with AI
  const aiProvider = getDefaultProvider();
  const aiResponse = await aiProvider.generateContent(prompt, {
    temperature: 0.7, // Slightly higher for more natural conversation
    maxTokens: 500, // Limit response length
  });

  // Log API usage
  await prisma.apiUsageLog.create({
    data: {
      userId,
      operation: 'chat_response',
      provider: aiProvider.getName(),
      tokensUsed: aiResponse.tokensUsed || 0,
      success: true,
    },
  });

  return {
    response: aiResponse.content,
    tokensUsed: aiResponse.tokensUsed || 0,
  };
}

/**
 * Track question for analytics
 */
export async function trackQuestion(
  lessonId: string,
  question: string
): Promise<void> {
  const questionHash = computeHash(question.toLowerCase().trim());

  await prisma.chatAnalytics.upsert({
    where: {
      lessonId_questionHash: {
        lessonId,
        questionHash,
      },
    },
    create: {
      lessonId,
      questionText: question,
      questionHash,
      askCount: 1,
    },
    update: {
      askCount: {
        increment: 1,
      },
      lastAskedAt: new Date(),
    },
  });
}

/**
 * Get common questions for a lesson
 */
export async function getCommonQuestions(
  lessonId: string,
  limit: number = 5
): Promise<Array<{ question: string; count: number }>> {
  const analytics = await prisma.chatAnalytics.findMany({
    where: { lessonId },
    orderBy: { askCount: 'desc' },
    take: limit,
  });

  return analytics.map((a: any) => ({
    question: a.questionText,
    count: a.askCount,
  }));
}
