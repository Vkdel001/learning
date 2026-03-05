import { NextRequest, NextResponse } from 'next/server';
import { getQuiz } from '@/lib/services/quiz-generator.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    const { topicId } = params;
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty') || 'medium';

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return NextResponse.json(
        { success: false, error: 'Difficulty must be easy, medium, or hard' },
        { status: 400 }
      );
    }

    // Get quiz from database/cache
    const quiz = await getQuiz(topicId, difficulty);

    if (!quiz) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: quiz,
    });
  } catch (error: any) {
    console.error('Get quiz error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get quiz' },
      { status: 500 }
    );
  }
}
