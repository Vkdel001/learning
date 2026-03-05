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
  return `Create a lesson for: ${subtopicName}

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no extra text.

Required format:
{"explanation":"2-3 sentences","examples":["example 1","example 2","example 3"],"keyPoints":["point 1","point 2","point 3","point 4","point 5"],"practiceQuestions":[{"question":"Q1?","answer":"A1"},{"question":"Q2?","answer":"A2"},{"question":"Q3?","answer":"A3"}]}

IMPORTANT RULES:
- Keep explanation under 150 words
- Each example: 1-2 sentences max
- Each key point: 1 sentence max
- Each answer: 1-2 sentences max
- DO NOT use quotes (") inside strings - use single quotes (') instead
- DO NOT use backslashes
- Keep all text simple and avoid special characters
- Ensure valid JSON syntax`;
}

/**
 * Parse AI response and validate structure
 */
function parseAIResponse(response: string): Omit<LessonContent, 'subtopicId' | 'subtopicName' | 'breadcrumbs' | 'contentHash' | 'generatedAt'> {
  try {
    let cleanText = response.trim();
    
    // Remove markdown code blocks if present
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/g, '');
    }
    
    // Find the first { and last } to get the complete JSON
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      console.error('No valid JSON structure found in response');
      console.error('Full response:', cleanText);
      throw new Error('No JSON found in AI response');
    }
    
    let jsonString = cleanText.substring(firstBrace, lastBrace + 1);
    
    // Try to fix common JSON issues
    // Replace unescaped quotes inside strings (basic attempt)
    // This is a simple fix - for production, consider using a proper JSON repair library
    
    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (parseError: any) {
      console.log('First parse attempt failed, trying to repair JSON...');
      console.log('Parse error:', parseError.message);
      
      // Try to fix by escaping unescaped quotes
      // This is a simplified approach - may not work for all cases
      try {
        // Use JSON5 or a more lenient parser if available
        // For now, just try the original string
        throw parseError;
      } catch {
        console.error('Full JSON that failed to parse:');
        console.error(jsonString);
        throw new Error(`Bad JSON from AI: ${parseError.message}`);
      }
    }

    // Validate structure
    if (!parsed.explanation || typeof parsed.explanation !== 'string') {
      throw new Error('Invalid or missing explanation');
    }
    
    if (!Array.isArray(parsed.examples) || parsed.examples.length === 0) {
      throw new Error('Invalid or missing examples array');
    }
    
    if (!Array.isArray(parsed.keyPoints) || parsed.keyPoints.length === 0) {
      throw new Error('Invalid or missing keyPoints array');
    }
    
    if (!Array.isArray(parsed.practiceQuestions) || parsed.practiceQuestions.length === 0) {
      throw new Error('Invalid or missing practiceQuestions array');
    }
    
    // Validate practice questions structure
    for (const q of parsed.practiceQuestions) {
      if (!q.question || !q.answer) {
        throw new Error('Practice question missing question or answer field');
      }
    }

    return {
      explanation: parsed.explanation,
      examples: parsed.examples,
      keyPoints: parsed.keyPoints,
      practiceQuestions: parsed.practiceQuestions,
    };
  } catch (error: any) {
    console.error('Failed to parse AI response:', error.message);
    console.error('Response preview:', response.substring(0, 500));
    throw new Error(`Failed to parse lesson content from AI response: ${error.message}`);
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
  console.log(`📝 Context: ${context}`);
  console.log(`📝 Prompt length: ${prompt.length} characters`);

  // Generate with AI
  const aiProvider = getDefaultProvider();
  console.log(`🔌 AI Provider: ${aiProvider.getName()}, Model: ${aiProvider.getModel()}`);
  
  const startTime = Date.now();
  const aiResponse = await aiProvider.generateContent(prompt, {
    temperature: 0.7,
    maxTokens: 2048,
  });
  const elapsed = Date.now() - startTime;
  console.log(`✅ AI response received in ${elapsed}ms`);

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
