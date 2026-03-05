import { redis, RedisHelpers, RedisKeys } from '../redis';

describe('Redis Connection', () => {
  afterAll(async () => {
    await redis.quit();
  });

  it('should connect to Redis', async () => {
    const result = await redis.ping();
    expect(result).toBe('PONG');
  });

  it('should set and get a value', async () => {
    await redis.set('test:key', 'test:value');
    const value = await redis.get('test:key');
    expect(value).toBe('test:value');
    await redis.del('test:key');
  });

  it('should set and get JSON', async () => {
    const testData = { name: 'Test User', grade: 9 };
    await RedisHelpers.setJSON('test:json', testData, 60);
    const retrieved = await RedisHelpers.getJSON<typeof testData>('test:json');
    expect(retrieved).toEqual(testData);
    await redis.del('test:json');
  });

  it('should handle TTL correctly', async () => {
    await RedisHelpers.setWithTTL('test:ttl', 'value', 2);
    const ttl = await RedisHelpers.getTTL('test:ttl');
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(2);
    await redis.del('test:ttl');
  });

  it('should increment counter with TTL', async () => {
    const count1 = await RedisHelpers.incrementWithTTL('test:counter', 60);
    const count2 = await RedisHelpers.incrementWithTTL('test:counter', 60);
    expect(count1).toBe(1);
    expect(count2).toBe(2);
    await redis.del('test:counter');
  });

  it('should generate correct Redis keys', () => {
    expect(RedisKeys.otp('test@example.com')).toBe('otp:test@example.com');
    expect(RedisKeys.session('abc123')).toBe('session:abc123');
    expect(RedisKeys.lesson('hash123')).toBe('lesson:hash123');
    expect(RedisKeys.rateLimit('user1', 'lesson', '2026-03-05')).toBe(
      'ratelimit:user1:lesson:2026-03-05'
    );
  });
});
