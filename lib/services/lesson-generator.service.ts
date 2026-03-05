import { prisma } from '../prisma';
import { getDefaultProvider } from './ai-provider.service';
import { computeHash, CacheKeys, get, set } from './cache.service';
import { getNodeById, getBreadcrumbs } from './curriculum.service';

/**
 * Lesson Generator Service
 * Generates AI-powered lessons for curriculum subtopics
 */

export interface LessonContent {
  subtopicId: string;
  subtopicName: string;
  breadcrumbs: string[];
  explanation: string;
  examples: string[];
  keyPoints: string[];
  practiceQuestions: Array<{
    question: string;
    answer: string;
  }>;
  contentHash: string;
  generatedAt: Date;
}

/**
 * Build context from curriculum breadcrumbs
 */
async function buildContext(subtopicId: string): Promise<string> {
  const breadcrumbs = await getBreadcrumbs(subtopicId);
  
  if (breadcrumbs.length === 0) {
    return '';
  }

  const context = breadcrumbs.map((node) => node.name).join(' > ');
  return context;
}

/**
 * Create prompt for lesson generation
 */
function createLessonPrompt(subtopicName: string, context: string): string {
  return `You are an expert Computer Science teacher for secondary school students in Mauritius (Grades 7-13).

Context: ${context}

Create a comprehensive lesson for the topic: "${subtopicName}"

Your lesson should include:

1. EXPLANATION (2-3 paragraphs):
   - Clear, simple explanation suitable for secondary school students
   - Use analogies and real-world examples
   - Break down complex concepts into digestible parts

2. EXAMPLES (3-4 concrete examples):
   - Practical, relatable examples
   - Show step-by-step working where applicable
   - Include code snippets if relevant (use Python)

3. KEY POINTS (5-7 bullet points):
   - Essential takeaways students must remember
   - Concise and memorable
   - Focus on core concepts

4. PRACTICE QUESTIONS (3-5 questions with answers):
   - Range from basic to intermediate difficulty
   - Include both conceptual and practical questions
   - Provide detailed answers with explanations

Format your response as JSON with this exact structure:
{
  "explanation": "...",
  "examples": ["example1", "example2", "example3"],
  "keyPoints": ["point1", "point2", ...],
  "practiceQuestions": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ]
}

Important:
- Use simple, clear language appropriate for teenagers
- Avoid overly technical jargon
- Make it engaging and practical
- Ensure accuracy of all technical content
- Return ONLY valid JSON, no additional text`;
}

/**
 * Parse AI response and validate structure
 */
function parseAIResponse(response: string): Omit<LessonContent, 'subtopicId' | 'subtopicName' | 'breadcrumbs' | 'contentHash' | 'generatedAt'> {
  try {
    // Try to extract JSON from response (in case AI adds extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : response;
    
    const parsed = JSON.parse(jsonString);

    // Validate structure
    if (!parsed.explanation || !Array.isArray(parsed.examples) || 
        !Array.isArray(parsed.keyPoints) || !Array.isArray(parsed.practiceQuestions)) {
      throw new Error('Invalid lesson structure');
    }

    return {
      explanation: parsed.explanation,
      examples: parsed.examples,
      keyPoints: parsed.keyPoints,
      practiceQuestions: parsed.practiceQuestions,
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    throw new Error('Failed to parse lesson content from AI response');
  }
}

/**
 * Generate lesson for a subtopic
 */
export async function generateLesson(subtopicId: string): Promise<LessonContent> {
  // Get subtopic details
  const subtopic = await getNodeById(subtopicId);
  if (!subtopic) {
    throw new Error('Subtopic not found');
  }

  if (subtopic.nodeType !== 'subtopic') {
    throw new Error('Can only generate lessons for subtopics');
  }

  // Build context from curriculum hierarchy
  const context = await buildContext(subtopicId);
  const breadcrumbs = await getBreadcrumbs(subtopicId);
  const breadcrumbNames = breadcrumbs.map((node) => node.name);

  // Create prompt
  const prompt = createLessonPrompt(subtopic.name, context);
  const promptHash = computeHash(prompt);

  // Check cache first
  const cacheKey = CacheKeys.lesson(subtopicId, promptHash);
  const cached = await get<LessonContent>(cacheKey);
  if (cached) {
    console.log(`✅ Lesson cache hit for ${subtopic.name}`);
    return cached;
  }

  console.log(`🤖 Generating lesson for ${subtopic.name}...`);

  // Generate with AI
  const aiProvider = getDefaultProvider();
  const aiResponse = await aiProvider.generateContent(prompt, {
    temperature: 0.7,
    maxTokens: 2048,
  });

  // Parse response
  const lessonData = parseAIResponse(aiResponse.content);

  // Create lesson object
  const lesson: LessonContent = {
    subtopicId,
    subtopicName: subtopic.name,
    breadcrumbs: breadcrumbNames,
    ...lessonData,
    contentHash: promptHash,
    generatedAt: new Date(),
  };

  // Save to database
  await prisma.lesson.create({
    data: {
      subtopicId,
      contentHash: promptHash,
      explanation: lesson.explanation,
      examples: lesson.examples,
      keyPoints: lesson.keyPoints,
      practiceQuestions: lesson.practiceQuestions,
      promptVersion: 1,
      aiProvider: aiProvider.getName(),
    },
  });

  // Cache for 7 days
  await set(cacheKey, lesson, 7 * 24 * 60 * 60);

  // Log API usage
  await prisma.apiUsageLog.create({
    data: {
      provider: aiProvider.getName(),
      operation: 'lesson_generation',
      tokensUsed: aiResponse.tokensUsed || 0,
      success: true,
    },
  });

  console.log(`✅ Lesson generated and cached for ${subtopic.name}`);

  return lesson;
}

/**
 * Get lesson from cache or database
 */
export async function getLesson(subtopicId: string): Promise<LessonContent | null> {
  // Try to get from database (most recent)
  const dbLesson = await prisma.lesson.findFirst({
    where: { subtopicId },
    orderBy: { createdAt: 'desc' },
  });

  if (!dbLesson) {
    return null;
  }

  // Get subtopic details
  const subtopic = await getNodeById(subtopicId);
  if (!subtopic) {
    return null;
  }

  const breadcrumbs = await getBreadcrumbs(subtopicId);
  const breadcrumbNames = breadcrumbs.map((node) => node.name);

  return {
    subtopicId: dbLesson.subtopicId,
    subtopicName: subtopic.name,
    breadcrumbs: breadcrumbNames,
    explanation: dbLesson.explanation,
    examples: dbLesson.examples as string[],
    keyPoints: dbLesson.keyPoints as string[],
    practiceQuestions: dbLesson.practiceQuestions as Array<{
      question: string;
      answer: string;
    }>,
    contentHash: dbLesson.contentHash,
    generatedAt: dbLesson.createdAt,
  };
}

/**
 * Calculate API cost (approximate)
 */
function calculateCost(provider: string, tokens: number): number {
  // Gemini 1.5 Flash pricing (approximate)
  // $0.075 per 1M input tokens, $0.30 per 1M output tokens
  // Simplified: average $0.15 per 1M tokens
  if (provider === 'gemini') {
    return (tokens / 1000000) * 0.15;
  }
  return 0;
}
