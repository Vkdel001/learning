import * as fc from 'fast-check';
import {
  get,
  set,
  del,
  exists,
  computeHash,
  getOrSet,
  increment,
} from '../services/cache.service';
import { redis } from '../redis';

/**
 * Property-based tests for Cache Manager
 * Task 5.3: Write property test for cache operations
 */

describe('Cache Manager - Property Tests', () => {
  afterEach(async () => {
    // Clean up test keys
    const keys = await redis.keys('test:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  });

  afterAll(async () => {
    redis.disconnect();
  });

  /**
   * Property: Set then get returns same value
   */
  describe('Property: Set then Get returns same value', () => {
    it('should return the same value that was set', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.oneof(
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.record({
              name: fc.string(),
              value: fc.integer(),
            })
          ),
          async (key, value) => {
            const testKey = `test:${key}`;

            // Set value
            await set(testKey, value);

            // Get value
            const retrieved = await get(testKey);

            // Should match
            expect(retrieved).toEqual(value);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property: Delete removes key
   */
  describe('Property: Delete removes key', () => {
    it('should remove key from cache', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.string(),
          async (key, value) => {
            const testKey = `test:${key}`;

            // Set value
            await set(testKey, value);

            // Verify exists
            const existsBefore = await exists(testKey);
            expect(existsBefore).toBe(true);

            // Delete
            await del(testKey);

            // Verify doesn't exist
            const existsAfter = await exists(testKey);
            expect(existsAfter).toBe(false);

            // Get should return null
            const retrieved = await get(testKey);
            expect(retrieved).toBeNull();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property: TTL expiration
   */
  describe('Property: TTL expiration', () => {
    it('should expire key after TTL', async () => {
      const testKey = 'test:ttl-expiry';
      const value = 'test-value';

      // Set with 1 second TTL
      await set(testKey, value, 1);

      // Should exist immediately
      const existsBefore = await exists(testKey);
      expect(existsBefore).toBe(true);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Should not exist after TTL
      const existsAfter = await exists(testKey);
      expect(existsAfter).toBe(false);

      const retrieved = await get(testKey);
      expect(retrieved).toBeNull();
    }, 5000); // 5 second timeout
  });

  /**
   * Property: Hash consistency
   */
  describe('Property: Hash consistency', () => {
    it('should produce same hash for same input', async () => {
      await fc.assert(
        fc.property(
          fc.oneof(
            fc.string(),
            fc.record({
              name: fc.string(),
              age: fc.integer(),
            })
          ),
          (data) => {
            const hash1 = computeHash(data);
            const hash2 = computeHash(data);

            expect(hash1).toBe(hash2);
            expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex chars
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should produce different hashes for different inputs', async () => {
      await fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          (str1, str2) => {
            fc.pre(str1 !== str2); // Only test when strings are different

            const hash1 = computeHash(str1);
            const hash2 = computeHash(str2);

            expect(hash1).not.toBe(hash2);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property: getOrSet pattern
   */
  describe('Property: getOrSet pattern', () => {
    it('should fetch and cache on first call, return cached on second', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.string(),
          async (key, value) => {
            const testKey = `test:${key}`;
            let fetchCount = 0;

            const fetchFn = async () => {
              fetchCount++;
              return value;
            };

            // First call should fetch
            const result1 = await getOrSet(testKey, fetchFn);
            expect(result1).toBe(value);
            expect(fetchCount).toBe(1);

            // Second call should use cache
            const result2 = await getOrSet(testKey, fetchFn);
            expect(result2).toBe(value);
            expect(fetchCount).toBe(1); // Should not fetch again
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property: Increment counter
   */
  describe('Property: Increment counter', () => {
    it('should increment counter correctly', async () => {
      const testKey = 'test:counter';

      // Increment multiple times
      const count1 = await increment(testKey);
      expect(count1).toBe(1);

      const count2 = await increment(testKey);
      expect(count2).toBe(2);

      const count3 = await increment(testKey);
      expect(count3).toBe(3);
    });
  });
});
