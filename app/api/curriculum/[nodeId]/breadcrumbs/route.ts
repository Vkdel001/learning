import { NextRequest, NextResponse } from 'next/server';
import { getBreadcrumbs } from '@/lib/services/curriculum.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { nodeId: string } }
) {
  try {
    const { nodeId } = params;

    const breadcrumbs = await getBreadcrumbs(nodeId);

    return NextResponse.json({
      success: true,
      data: breadcrumbs,
    });
  } catch (error) {
    console.error('Get breadcrumbs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch breadcrumbs' },
      { status: 500 }
    );
  }
}
