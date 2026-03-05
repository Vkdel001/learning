import { redis } from '../redis';
import crypto from 'crypto';

/**
 * Cache Manager Service
 * Handles caching operations with Redis
 */

/**
 * Cache key naming conventions
 */
export const CacheKeys = {
  lesson: (subtopicId: string, contentHash: string) =>
    `lesson:${subtopicId}:${contentHash}`,
  quiz: (topicId: string, contentHash: string) =>
    `quiz:${topicId}:${contentHash}`,
  audio: (textHash: string) => `audio:${textHash}`,
  promptTemplate: (templateId: string, version: number) =>
    `prompt:${templateId}:v${version}`,
  userProgress: (userId: string, nodeId: string) =>
    `progress:${userId}:${nodeId}`,
};

/**
 * Compute SHA-256 hash of data
 */
export function computeHash(data: any): string {
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(jsonString).digest('hex');
}

/**
 * Get value from cache with JSON deserialization
 */
export async function get<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    if (!value) {
      return null;
    }
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error);
    return null;
  }
}

/**
 * Set value in cache with JSON serialization and TTL
 */
export async function set<T>(
  key: string,
  value: T,
  ttl?: number
): Promise<boolean> {
  try {
    const jsonString = JSON.stringify(value);
    if (ttl) {
      await redis.setex(key, ttl, jsonString);
    } else {
      await redis.set(key, jsonString);
    }
    return true;
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error);
    return false;
  }
}

/**
 * Delete key from cache
 */
export async function del(key: string): Promise<boolean> {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`Cache delete error for key ${key}:`, error);
    return false;
  }
}

/**
 * Check if key exists in cache
 */
export async function exists(key: string): Promise<boolean> {
  try {
    const result = await redis.exists(key);
    return result === 1;
  } catch (error) {
    console.error(`Cache exists error for key ${key}:`, error);
    return false;
  }
}

/**
 * Delete multiple keys matching a pattern
 */
export async function deletePattern(pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) {
      return 0;
    }
    await redis.del(...keys);
    return keys.length;
  } catch (error) {
    console.error(`Cache delete pattern error for ${pattern}:`, error);
    return 0;
  }
}

/**
 * Get TTL (time to live) for a key in seconds
 */
export async function getTTL(key: string): Promise<number> {
  try {
    return await redis.ttl(key);
  } catch (error) {
    console.error(`Cache TTL error for key ${key}:`, error);
    return -1;
  }
}

/**
 * Set expiration time for a key
 */
export async function expire(key: string, seconds: number): Promise<boolean> {
  try {
    const result = await redis.expire(key, seconds);
    return result === 1;
  } catch (error) {
    console.error(`Cache expire error for key ${key}:`, error);
    return false;
  }
}

/**
 * Increment a counter in cache
 */
export async function increment(key: string): Promise<number> {
  try {
    return await redis.incr(key);
  } catch (error) {
    console.error(`Cache increment error for key ${key}:`, error);
    return 0;
  }
}

/**
 * Get or set pattern - fetch from cache or compute and cache
 */
export async function getOrSet<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache
  const cached = await get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch and cache
  const value = await fetchFn();
  await set(key, value, ttl);
  return value;
}
