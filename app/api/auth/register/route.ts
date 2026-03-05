import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/services/auth.service';
import { generateAndSendOTP } from '@/lib/services/otp.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, grade, isUnder18 } = body;

    // Validation
    if (!name || !email || !grade) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and grade are required' },
        { status: 400 }
      );
    }

    if (grade < 7 || grade > 13) {
      return NextResponse.json(
        { success: false, error: 'Grade must be between 7 and 13' },
        { status: 400 }
      );
    }

    // Register user
    const result = await registerUser({ 
      name, 
      email, 
      grade,
      isUnder18: isUnder18 !== false, // Default to true
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    // Send OTP for email verification
    const otpResult = await generateAndSendOTP(email);
    
    if (!otpResult.success) {
      return NextResponse.json(
        { success: false, error: 'User created but failed to send OTP. Please use login.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: result.userId,
      message: 'Registration successful! Check your email for OTP.',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
