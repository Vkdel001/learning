import { NextRequest, NextResponse } from 'next/server';
import { verifyOTPAndCreateSession } from '@/lib/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    // Validation
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Verify OTP and create session
    const result = await verifyOTPAndCreateSession(email, otp);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      data: {
        token: result.session!.token,
        userId: result.session!.userId,
        expiresAt: result.session!.expiresAt,
      },
      message: result.message,
    });

    response.cookies.set('session_token', result.session!.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
