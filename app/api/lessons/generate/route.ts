import { NextRequest, NextResponse } from 'next/server';
import { generateLesson } from '@/lib/services/lesson-generator.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subtopicId } = body;

    if (!subtopicId) {
      return NextResponse.json(
        { success: false, error: 'Subtopic ID is required' },
        { status: 400 }
      );
    }

    // Generate lesson
    const lesson = await generateLesson(subtopicId);

    return NextResponse.json({
      success: true,
      data: lesson,
    });
  } catch (error: any) {
    console.error('Generate lesson error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate lesson' },
      { status: 500 }
    );
  }
}
