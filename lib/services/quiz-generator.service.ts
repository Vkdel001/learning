import { prisma } from '../prisma';
import { getDefaultProvider } from './ai-provider.service';
import { computeHash, CacheKeys, get, set } from './cache.service';
import { getNodeById, getBreadcrumbs } from './curriculum.service';

/**
 * Quiz Generator Service
 * Generates AI-powered quizzes for curriculum topics
 */

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option (0-3)
  explanation: string;
}

export interface QuizContent {
  quizId?: string; // Database ID
  topicId: string;
  topicName: string;
  breadcrumbs: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  contentHash: string;
  generatedAt: Date;
}

/**
 * Build context from curriculum breadcrumbs
 */
async function buildContext(topicId: string): Promise<string> {
  const breadcrumbs = await getBreadcrumbs(topicId);
  
  if (breadcrumbs.length === 0) {
    return '';
  }

  const context = breadcrumbs.map((node) => node.name).join(' > ');
  return context;
}

/**
 * Create prompt for quiz generation
 */
function createQuizPrompt(topicName: string, difficulty: string): string {
  return `Create a ${difficulty} quiz for: ${topicName}

CRITICAL JSON RULES - FOLLOW EXACTLY:
1. Return ONLY valid JSON - no markdown, no code blocks, no extra text
2. NO apostrophes or quotes inside any text - rewrite to avoid them
3. NO special characters like parentheses in strings
4. Keep all text SHORT and SIMPLE
5. Use only basic punctuation: periods, commas, question marks

Required format:
{"questions":[{"question":"What is X","options":["Option A","Option B","Option C","Option D"],"correctAnswer":0,"explanation":"Short reason"},{"question":"What is Y","options":["Option A","Option B","Option C","Option D"],"correctAnswer":1,"explanation":"Short reason"}]}

Requirements:
- Exactly 5 multiple choice questions
- Each question has exactly 4 options
- correctAnswer is index 0, 1, 2, or 3
- Keep questions under 100 characters
- Keep options under 50 characters each
- Keep explanations under 100 characters
- Use simple words only`;
}

/**
 * Parse AI response and validate structure
 */
function parseAIResponse(response: string): { questions: QuizQuestion[] } {
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
    
    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (parseError: any) {
      console.log('❌ Parse error:', parseError.message);
      
      // Show context around error position
      if (parseError.message.includes('position')) {
        const match = parseError.message.match(/position (\d+)/);
        if (match) {
          const pos = parseInt(match[1]);
          const start = Math.max(0, pos - 100);
          const end = Math.min(jsonString.length, pos + 100);
          console.log('Context around error:');
          console.log(jsonString.substring(start, end));
          console.log(' '.repeat(Math.min(100, pos - start)) + '^');
        }
      }
      
      console.error('Full JSON that failed to parse:');
      console.error(jsonString);
      throw new Error(`Bad JSON from AI: ${parseError.message}`);
    }

    // Validate structure
    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('Invalid or missing questions array');
    }
    
    // Validate each question
    for (const q of parsed.questions) {
      if (!q.question || typeof q.question !== 'string') {
        throw new Error('Question missing or invalid');
      }
      
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error('Each question must have exactly 4 options');
      }
      
      if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
        throw new Error('correctAnswer must be 0, 1, 2, or 3');
      }
      
      if (!q.explanation || typeof q.explanation !== 'string') {
        throw new Error('Explanation missing or invalid');
      }
    }

    return {
      questions: parsed.questions,
    };
  } catch (error: any) {
    console.error('Failed to parse AI response:', error.message);
    throw new Error(`Failed to parse quiz content from AI response: ${error.message}`);
  }
}

/**
 * Generate quiz for a topic
 */
export async function generateQuiz(
  topicId: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<QuizContent> {
  // Get topic details
  const topic = await getNodeById(topicId);
  if (!topic) {
    throw new Error('Topic not found');
  }

  if (topic.nodeType !== 'topic') {
    throw new Error('Can only generate quizzes for topics');
  }

  // Build context from curriculum hierarchy
  const context = await buildContext(topicId);
  const breadcrumbs = await getBreadcrumbs(topicId);
  const breadcrumbNames = breadcrumbs.map((node) => node.name);

  // Create prompt
  const prompt = createQuizPrompt(topic.name, difficulty);
  const promptHash = computeHash(prompt + difficulty);

  // Check cache first
  const cacheKey = CacheKeys.quiz(topicId, promptHash);
  const cached = await get<QuizContent>(cacheKey);
  if (cached) {
    console.log(`✅ Quiz cache hit for ${topic.name}`);
    return cached;
  }

  console.log(`🤖 Generating ${difficulty} quiz for ${topic.name}...`);

  // Generate with AI
  const aiProvider = getDefaultProvider();
  const aiResponse = await aiProvider.generateContent(prompt, {
    temperature: 0.8, // Slightly higher for variety
    maxTokens: 2048,
  });

  // Parse response
  const quizData = parseAIResponse(aiResponse.content);

  // Save to database first to get the ID
  const dbQuiz = await prisma.quiz.create({
    data: {
      topicId,
      contentHash: promptHash,
      difficulty,
      questions: quizData.questions as any,
      promptVersion: 1,
      aiProvider: aiProvider.getName(),
    },
  });

  // Create quiz object with database ID
  const quiz: QuizContent = {
    quizId: dbQuiz.id,
    topicId,
    topicName: topic.name,
    breadcrumbs: breadcrumbNames,
    difficulty,
    questions: quizData.questions,
    contentHash: promptHash,
    generatedAt: new Date(),
  };

  // Cache for 7 days
  await set(cacheKey, quiz, 7 * 24 * 60 * 60);

  // Log API usage
  await prisma.apiUsageLog.create({
    data: {
      provider: aiProvider.getName(),
      operation: 'quiz_generation',
      tokensUsed: aiResponse.tokensUsed || 0,
      success: true,
    },
  });

  console.log(`✅ Quiz generated and cached for ${topic.name}`);

  return quiz;
}

/**
 * Get quiz from cache or database
 */
export async function getQuiz(topicId: string, difficulty: string = 'medium'): Promise<QuizContent | null> {
  // Try to get from database (most recent)
  const dbQuiz = await prisma.quiz.findFirst({
    where: { 
      topicId,
      difficulty,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!dbQuiz) {
    return null;
  }

  // Get topic details
  const topic = await getNodeById(topicId);
  if (!topic) {
    return null;
  }

  const breadcrumbs = await getBreadcrumbs(topicId);
  const breadcrumbNames = breadcrumbs.map((node) => node.name);

  return {
    quizId: dbQuiz.id,
    topicId: dbQuiz.topicId,
    topicName: topic.name,
    breadcrumbs: breadcrumbNames,
    difficulty: dbQuiz.difficulty as 'easy' | 'medium' | 'hard',
    questions: dbQuiz.questions as QuizQuestion[],
    contentHash: dbQuiz.contentHash,
    generatedAt: dbQuiz.createdAt,
  };
}
