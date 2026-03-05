import { NextRequest, NextResponse } from 'next/server';
import { getProgressStats } from '@/lib/services/progress.service';
import { getUserIdFromRequest } from '@/lib/utils/auth-server';

/**
 * GET /api/progress/stats
 * Get progress statistics for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const stats = await getProgressStats(userId);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Failed to get progress stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get progress stats',
      },
      { status: 500 }
    );
  }
}
