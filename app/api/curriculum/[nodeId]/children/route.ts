import { NextRequest, NextResponse } from 'next/server';
import { getChildren } from '@/lib/services/curriculum.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { nodeId: string } }
) {
  try {
    const { nodeId } = params;

    const children = await getChildren(nodeId);

    return NextResponse.json({
      success: true,
      data: children,
    });
  } catch (error) {
    console.error('Get children error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch children' },
      { status: 500 }
    );
  }
}
