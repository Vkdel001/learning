import { redis } from '../redis';
import { sendOTPEmail } from './email.service';

/**
 * OTP Service
 * Handles OTP generation, storage, verification, and rate limiting
 */

const OTP_TTL = 600; // 10 minutes in seconds
const OTP_RATE_LIMIT = 3; // Max OTPs per hour
const RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds

export interface OTPResponse {
  success: boolean;
  expiresAt: Date;
  message?: string;
}

/**
 * Generate a 6-digit OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Check rate limit for OTP requests
 */
async function checkRateLimit(email: string): Promise<boolean> {
  const key = `otp:ratelimit:${email}`;
  const count = await redis.get(key);
  
  if (count && parseInt(count) >= OTP_RATE_LIMIT) {
    return false; // Rate limit exceeded
  }
  
  return true;
}

/**
 * Increment rate limit counter
 */
async function incrementRateLimit(email: string): Promise<void> {
  const key = `otp:ratelimit:${email}`;
  const current = await redis.get(key);
  
  if (current) {
    await redis.incr(key);
  } else {
    await redis.setex(key, RATE_LIMIT_WINDOW, '1');
  }
}

/**
 * Generate and send OTP to user's email
 */
export async function generateAndSendOTP(
  email: string,
  name: string
): Promise<OTPResponse> {
  // Check rate limit
  const canSend = await checkRateLimit(email);
  if (!canSend) {
    return {
      success: false,
      expiresAt: new Date(),
      message: 'Too many OTP requests. Please try again later.',
    };
  }

  // Generate OTP
  const otp = generateOTP();
  
  // Store OTP in Redis
  const key = `otp:${email}`;
  await redis.setex(key, OTP_TTL, otp);
  
  // Increment rate limit counter
  await incrementRateLimit(email);
  
  // Send OTP via email
  try {
    await sendOTPEmail({ to: email, name, otp });
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return {
      success: false,
      expiresAt: new Date(),
      message: 'Failed to send OTP email',
    };
  }

  const expiresAt = new Date(Date.now() + OTP_TTL * 1000);
  
  return {
    success: true,
    expiresAt,
    message: 'OTP sent successfully',
  };
}

/**
 * Verify OTP for a given email
 */
export async function verifyOTP(
  email: string,
  submittedOTP: string
): Promise<boolean> {
  const key = `otp:${email}`;
  const storedOTP = await redis.get(key);
  
  if (!storedOTP) {
    return false; // OTP not found or expired
  }
  
  if (storedOTP !== submittedOTP) {
    return false; // OTP doesn't match
  }
  
  // Delete OTP after successful verification
  await redis.del(key);
  
  return true;
}

/**
 * Delete OTP from Redis (for cleanup)
 */
export async function deleteOTP(email: string): Promise<void> {
  const key = `otp:${email}`;
  await redis.del(key);
}
