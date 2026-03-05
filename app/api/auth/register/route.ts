import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, grade } = body;

    // Validation
    if (!name || !email || !grade) {
      return NextResponse.json(
        { error: 'Name, email, and grade are required' },
        { status: 400 }
      );
    }

    if (grade < 7 || grade > 13) {
      return NextResponse.json(
        { error: 'Grade must be between 7 and 13' },
        { status: 400 }
      );
    }

    // Register user
    const result = await registerUser({ name, email, grade });

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: result.userId,
      message: result.message,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
