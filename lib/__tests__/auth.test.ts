import * as fc from 'fast-check';
import { registerUser, sendLoginOTP, verifyOTPAndCreateSession, validateSession, logout } from '../services/auth.service';
import { generateAndSendOTP, verifyOTP } from '../services/otp.service';
import { prisma } from '../prisma';
import { redis } from '../redis';
import { userRegistrationArbitrary, otpArbitrary } from './generators';

/**
 * Property-based tests for authentication system
 */

describe('Authentication Service - Property Tests', () => {
  // Clean up test data after each test
  afterEach(async () => {
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    // Clear Redis test keys
    const keys = await redis.keys('otp:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    const sessionKeys = await redis.keys('session:*');
    if (sessionKeys.length > 0) {
      await redis.del(...sessionKeys);
    }
    const rateLimitKeys = await redis.keys('otp:ratelimit:*');
    if (rateLimitKeys.length > 0) {
      await redis.del(...rateLimitKeys);
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
    redis.disconnect();
  });

  /**
   * Task 3.3: Property Test for User Registration
   * Property 1: User Registration Creates Account
   * Validates: Requirements 1.1
   */
  describe('Property 1: User Registration Creates Account', () => {
    it('should create a user account with valid data', async () => {
      await fc.assert(
        fc.asyncProperty(userRegistrationArbitrary, async (userData) => {
          // Register user
          const result = await registerUser(userData);

          // Should succeed
          expect(result.success).toBe(true);
          expect(result.userId).toBeDefined();

          // Verify user exists in database
          const user = await prisma.user.findUnique({
            where: { email: userData.email },
          });

          expect(user).toBeDefined();
          expect(user?.name).toBe(userData.name);
          expect(user?.email).toBe(userData.email);
          expect(user?.grade).toBe(userData.grade);
          expect(user?.authProvider).toBe('otp');

          // Verify isUnder18 is set correctly
          if (userData.grade <= 13) {
            expect(user?.isUnder18).toBe(true);
          }
        }),
        { numRuns: 10 } // Reduced runs for database operations
      );
    });

    it('should reject duplicate email registration', async () => {
      await fc.assert(
        fc.asyncProperty(userRegistrationArbitrary, async (userData) => {
          // Register user first time
          const result1 = await registerUser(userData);
          expect(result1.success).toBe(true);

          // Try to register again with same email
          const result2 = await registerUser(userData);
          expect(result2.success).toBe(false);
          expect(result2.message).toContain('already exists');
        }),
        { numRuns: 10 }
      );
    });

    it('should set isUnder18 correctly based on grade', async () => {
      await fc.assert(
        fc.asyncProperty(userRegistrationArbitrary, async (userData) => {
          const result = await registerUser(userData);
          expect(result.success).toBe(true);

          const user = await prisma.user.findUnique({
            where: { email: userData.email },
          });

          // Grade 7-13 should be under 18
          expect(user?.isUnder18).toBe(userData.grade <= 13);
        }),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Task 3.5: Property Test for OTP Rate Limiting
   * Validates: Requirements 1.5
   */
  describe('Property 5: OTP Rate Limiting', () => {
    it('should block 4th OTP request within rate limit window', async () => {
      await fc.assert(
        fc.asyncProperty(userRegistrationArbitrary, async (userData) => {
          // Register user first
          await registerUser(userData);

          // Send 3 OTPs (should succeed)
          for (let i = 0; i < 3; i++) {
            const result = await generateAndSendOTP(userData.email, userData.name);
            expect(result.success).toBe(true);
          }

          // 4th OTP should be blocked
          const result4 = await generateAndSendOTP(userData.email, userData.name);
          expect(result4.success).toBe(false);
          expect(result4.message).toContain('Too many');
        }),
        { numRuns: 5 } // Fewer runs due to rate limiting
      );
    });
  });

  /**
   * Task 3.7: Property Test for OTP Expiration
   * Validates: Requirements 1.3
   */
  describe('Property 3: OTP Expiration', () => {
    it('should reject expired OTP', async () => {
      await fc.assert(
        fc.asyncProperty(
          userRegistrationArbitrary,
          otpArbitrary,
          async (userData, otp) => {
            // Store OTP with 1 second TTL
            const key = `otp:${userData.email}`;
            await redis.setex(key, 1, otp);

            // Wait for expiration
            await new Promise((resolve) => setTimeout(resolve, 1100));

            // Try to verify expired OTP
            const isValid = await verifyOTP(userData.email, otp);
            expect(isValid).toBe(false);
          }
        ),
        { numRuns: 2 } // Minimal runs due to timing
      );
    }, 15000); // 15 second timeout

    it('should accept valid OTP before expiration', async () => {
      await fc.assert(
        fc.asyncProperty(
          userRegistrationArbitrary,
          otpArbitrary,
          async (userData, otp) => {
            // Store OTP with 10 second TTL
            const key = `otp:${userData.email}`;
            await redis.setex(key, 10, otp);

            // Verify immediately
            const isValid = await verifyOTP(userData.email, otp);
            expect(isValid).toBe(true);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Task 3.9: Property Test for Session Expiration
   * Property 6: Session Expiration
   * Validates: Requirements 1.6
   */
  describe('Property 6: Session Expiration', () => {
    it('should reject expired session', async () => {
      await fc.assert(
        fc.asyncProperty(userRegistrationArbitrary, async (userData) => {
          // Register user
          const regResult = await registerUser(userData);
          expect(regResult.success).toBe(true);

          // Create session with 1 second expiry
          const token = 'test-token-' + Date.now();
          const expiresAt = new Date(Date.now() + 1000);

          await prisma.session.create({
            data: {
              userId: regResult.userId!,
              token,
              expiresAt,
            },
          });

          // Wait for expiration
          await new Promise((resolve) => setTimeout(resolve, 1100));

          // Try to validate expired session
          const result = await validateSession(token);
          expect(result.valid).toBe(false);
          expect(result.message).toContain('expired');
        }),
        { numRuns: 2 } // Minimal runs due to timing
      );
    }, 15000); // 15 second timeout

    it('should accept valid session before expiration', async () => {
      await fc.assert(
        fc.asyncProperty(userRegistrationArbitrary, async (userData) => {
          // Register user
          const regResult = await registerUser(userData);
          expect(regResult.success).toBe(true);

          // Create session with 10 second expiry
          const token = 'test-token-' + Date.now();
          const expiresAt = new Date(Date.now() + 10000);

          await prisma.session.create({
            data: {
              userId: regResult.userId!,
              token,
              expiresAt,
            },
          });

          // Store in Redis
          const sessionKey = `session:${token}`;
          await redis.setex(
            sessionKey,
            10,
            JSON.stringify({
              sessionId: 'test-id',
              userId: regResult.userId,
              expiresAt: expiresAt.toISOString(),
            })
          );

          // Validate immediately
          const result = await validateSession(token);
          expect(result.valid).toBe(true);
          expect(result.user).toBeDefined();
          expect(result.user?.email).toBe(userData.email);
        }),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Task 3.11: Property Test for Logout Invalidation
   * Property 7: Logout Invalidates Session
   * Validates: Requirements 1.7
   */
  describe('Property 7: Logout Invalidates Session', () => {
    it('should invalidate session after logout', async () => {
      await fc.assert(
        fc.asyncProperty(userRegistrationArbitrary, async (userData) => {
          // Register user
          const regResult = await registerUser(userData);
          expect(regResult.success).toBe(true);

          // Create session
          const token = 'test-token-' + Date.now();
          const expiresAt = new Date(Date.now() + 86400000);

          await prisma.session.create({
            data: {
              userId: regResult.userId!,
              token,
              expiresAt,
            },
          });

          // Store in Redis
          const sessionKey = `session:${token}`;
          await redis.setex(
            sessionKey,
            86400,
            JSON.stringify({
              sessionId: 'test-id',
              userId: regResult.userId,
              expiresAt: expiresAt.toISOString(),
            })
          );

          // Verify session is valid
          const validResult = await validateSession(token);
          expect(validResult.valid).toBe(true);

          // Logout
          const logoutResult = await logout(token);
          expect(logoutResult.success).toBe(true);

          // Verify session is now invalid
          const invalidResult = await validateSession(token);
          expect(invalidResult.valid).toBe(false);
        }),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Task 3.12: Property Test for Minimal Data Collection
   * Property 4: Minimal Data Collection for Minors
   * Validates: Requirements 1.4, 11.1
   */
  describe('Property 4: Minimal Data Collection for Minors', () => {
    it('should only collect required fields for user registration', async () => {
      await fc.assert(
        fc.asyncProperty(userRegistrationArbitrary, async (userData) => {
          const result = await registerUser(userData);
          expect(result.success).toBe(true);

          const user = await prisma.user.findUnique({
            where: { email: userData.email },
          });

          // Verify only required fields are set
          expect(user?.name).toBeDefined();
          expect(user?.email).toBeDefined();
          expect(user?.grade).toBeDefined();
          expect(user?.isUnder18).toBeDefined();
          expect(user?.authProvider).toBe('otp');

          // Verify no password field exists
          expect((user as any).password).toBeUndefined();

          // Verify optional fields are null/default
          expect(user?.googleId).toBeNull();
          expect(user?.isAdmin).toBe(false);
        }),
        { numRuns: 10 }
      );
    });
  });
});
