import { NextRequest, NextResponse } from 'next/server';
import { searchNodes } from '@/lib/services/curriculum.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const nodeType = searchParams.get('type');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const results = await searchNodes(query, nodeType || undefined);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search curriculum' },
      { status: 500 }
    );
  }
}
