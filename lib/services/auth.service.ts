import { prisma } from '../prisma';
import { redis } from '../redis';
import { generateAndSendOTP, verifyOTP } from './otp.service';
import crypto from 'crypto';

/**
 * Authentication Service
 * Handles user registration, login, session management
 */

const SESSION_TTL = 86400; // 24 hours in seconds

export interface UserRegistrationData {
  name: string;
  email: string;
  grade: number;
}

export interface SessionData {
  sessionId: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  grade: number;
  isAdmin: boolean;
}

/**
 * Generate a secure session token
 */
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Register a new user (without password)
 */
export async function registerUser(
  data: UserRegistrationData
): Promise<{ success: boolean; userId?: string; message?: string }> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'User with this email already exists',
      };
    }

    // Determine if user is under 18 based on grade
    const isUnder18 = data.grade <= 13;

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        grade: data.grade,
        isUnder18,
        authProvider: 'otp',
      },
    });

    return {
      success: true,
      userId: user.id,
      message: 'User registered successfully',
    };
  } catch (error) {
    console.error('User registration error:', error);
    return {
      success: false,
      message: 'Failed to register user',
    };
  }
}

/**
 * Send OTP for login
 */
export async function sendLoginOTP(email: string): Promise<{
  success: boolean;
  expiresAt?: Date;
  message?: string;
}> {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      success: false,
      message: 'User not found. Please register first.',
    };
  }

  // Generate and send OTP
  const result = await generateAndSendOTP(email, user.name);
  
  return result;
}

/**
 * Verify OTP and create session
 */
export async function verifyOTPAndCreateSession(
  email: string,
  otp: string
): Promise<{ success: boolean; session?: SessionData; message?: string }> {
  // Verify OTP
  const isValid = await verifyOTP(email, otp);
  
  if (!isValid) {
    return {
      success: false,
      message: 'Invalid or expired OTP',
    };
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      success: false,
      message: 'User not found',
    };
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Generate session token
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL * 1000);

  // Create session in database
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  // Store session in Redis for fast lookup
  const sessionKey = `session:${token}`;
  await redis.setex(
    sessionKey,
    SESSION_TTL,
    JSON.stringify({
      sessionId: session.id,
      userId: user.id,
      expiresAt: expiresAt.toISOString(),
    })
  );

  return {
    success: true,
    session: {
      sessionId: session.id,
      userId: user.id,
      token,
      expiresAt,
    },
    message: 'Login successful',
  };
}

/**
 * Validate session token and get user data
 */
export async function validateSession(
  token: string
): Promise<{ valid: boolean; user?: UserData; message?: string }> {
  // Check Redis first (fast lookup)
  const sessionKey = `session:${token}`;
  const cachedSession = await redis.get(sessionKey);

  if (cachedSession) {
    const sessionData = JSON.parse(cachedSession);
    
    // Check if session expired
    if (new Date(sessionData.expiresAt) < new Date()) {
      await redis.del(sessionKey);
      return {
        valid: false,
        message: 'Session expired',
      };
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: sessionData.userId },
      select: {
        id: true,
        name: true,
        email: true,
        grade: true,
        isAdmin: true,
      },
    });

    if (!user) {
      return {
        valid: false,
        message: 'User not found',
      };
    }

    return {
      valid: true,
      user,
    };
  }

  // Fallback to database if not in Redis
  const session = await prisma.session.findUnique({
    where: { token },
  });

  if (!session) {
    return {
      valid: false,
      message: 'Invalid session',
    };
  }

  // Check if session expired
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return {
      valid: false,
      message: 'Session expired',
    };
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      grade: true,
      isAdmin: true,
    },
  });

  if (!user) {
    return {
      valid: false,
      message: 'User not found',
    };
  }

  // Restore to Redis
  await redis.setex(
    sessionKey,
    Math.floor((session.expiresAt.getTime() - Date.now()) / 1000),
    JSON.stringify({
      sessionId: session.id,
      userId: user.id,
      expiresAt: session.expiresAt.toISOString(),
    })
  );

  return {
    valid: true,
    user,
  };
}

/**
 * Logout user by deleting session
 */
export async function logout(token: string): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    // Delete from Redis
    const sessionKey = `session:${token}`;
    await redis.del(sessionKey);

    // Delete from database
    await prisma.session.delete({
      where: { token },
    });

    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: 'Failed to logout',
    };
  }
}
