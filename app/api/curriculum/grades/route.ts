import { NextResponse } from 'next/server';
import { getGrades } from '@/lib/services/curriculum.service';

export async function GET() {
  try {
    const grades = await getGrades();

    return NextResponse.json({
      success: true,
      data: grades,
    });
  } catch (error) {
    console.error('Get grades error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grades' },
      { status: 500 }
    );
  }
}
