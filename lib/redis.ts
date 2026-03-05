import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError(err) {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        // Only reconnect when the error contains "READONLY"
        return true;
      }
      return false;
    },
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

// Redis key naming conventions
export const RedisKeys = {
  // OTP keys
  otp: (email: string) => `otp:${email}`,
  otpRateLimit: (email: string) => `otp:ratelimit:${email}`,

  // Session keys
  session: (token: string) => `session:${token}`,

  // Lesson cache keys
  lesson: (contentHash: string) => `lesson:${contentHash}`,

  // Quiz cache keys
  quiz: (contentHash: string) => `quiz:${contentHash}`,

  // Audio segment cache keys
  audio: (textHash: string) => `audio:${textHash}`,

  // Rate limit keys
  rateLimit: (userId: string, operation: string, date: string) =>
    `ratelimit:${userId}:${operation}:${date}`,

  // Cache hit rate tracking
  cacheHits: (type: string) => `cache:hits:${type}`,
  cacheMisses: (type: string) => `cache:misses:${type}`,
};

// Helper functions for common Redis operations
export const RedisHelpers = {
  // Set with TTL in seconds
  async setWithTTL(key: string, value: string, ttlSeconds: number): Promise<void> {
    await redis.setex(key, ttlSeconds, value);
  },

  // Set JSON with TTL
  async setJSON(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
  },

  // Get and parse JSON
  async getJSON<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  // Increment counter with TTL
  async incrementWithTTL(key: string, ttlSeconds: number): Promise<number> {
    const value = await redis.incr(key);
    if (value === 1) {
      // First increment, set TTL
      await redis.expire(key, ttlSeconds);
    }
    return value;
  },

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    const result = await redis.exists(key);
    return result === 1;
  },

  // Delete key
  async delete(key: string): Promise<void> {
    await redis.del(key);
  },

  // Get TTL of a key
  async getTTL(key: string): Promise<number> {
    return await redis.ttl(key);
  },

  // Track cache hit
  async trackCacheHit(type: string): Promise<void> {
    await redis.incr(RedisKeys.cacheHits(type));
  },

  // Track cache miss
  async trackCacheMiss(type: string): Promise<void> {
    await redis.incr(RedisKeys.cacheMisses(type));
  },

  // Get cache hit rate
  async getCacheHitRate(type: string): Promise<number> {
    const hits = parseInt((await redis.get(RedisKeys.cacheHits(type))) || '0');
    const misses = parseInt((await redis.get(RedisKeys.cacheMisses(type))) || '0');
    const total = hits + misses;
    return total === 0 ? 0 : (hits / total) * 100;
  },
};

// Test connection on startup
redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

export default redis;
