import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/lib/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie or header
    const token =
      request.cookies.get('session_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No session token provided' },
        { status: 401 }
      );
    }

    // Logout
    const result = await logout(token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Clear session cookie
    const response = NextResponse.json({
      success: true,
      message: result.message,
    });

    response.cookies.delete('session_token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
