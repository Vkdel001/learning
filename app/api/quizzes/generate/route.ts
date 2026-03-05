import { NextRequest, NextResponse } from 'next/server';
import { generateQuiz } from '@/lib/services/quiz-generator.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topicId, difficulty = 'medium' } = body;

    if (!topicId) {
      return NextResponse.json(
        { success: false, error: 'Topic ID is required' },
        { status: 400 }
      );
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return NextResponse.json(
        { success: false, error: 'Difficulty must be easy, medium, or hard' },
        { status: 400 }
      );
    }

    // Generate quiz
    const quiz = await generateQuiz(topicId, difficulty);

    return NextResponse.json({
      success: true,
      data: quiz,
    });
  } catch (error: any) {
    console.error('Generate quiz error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}
