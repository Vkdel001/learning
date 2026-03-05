import { redis, RedisHelpers, RedisKeys } from '../lib/redis';

async function testRedisConnection() {
  console.log('🔍 Testing Redis connection...\n');

  try {
    // Test 1: Ping
    console.log('Test 1: Ping Redis');
    const pingResult = await redis.ping();
    console.log(`✅ Ping result: ${pingResult}\n`);

    // Test 2: Set and Get
    console.log('Test 2: Set and Get string value');
    await redis.set('test:hello', 'world');
    const value = await redis.get('test:hello');
    console.log(`✅ Retrieved value: ${value}\n`);

    // Test 3: JSON operations
    console.log('Test 3: JSON operations');
    const testUser = { name: 'John Doe', email: 'john@example.com', grade: 9 };
    await RedisHelpers.setJSON('test:user', testUser, 60);
    const retrievedUser = await RedisHelpers.getJSON('test:user');
    console.log(`✅ Retrieved user:`, retrievedUser, '\n');

    // Test 4: TTL
    console.log('Test 4: TTL (Time To Live)');
    await RedisHelpers.setWithTTL('test:expiring', 'will expire', 10);
    const ttl = await RedisHelpers.getTTL('test:expiring');
    console.log(`✅ TTL: ${ttl} seconds\n`);

    // Test 5: Counter
    console.log('Test 5: Counter with TTL');
    const count1 = await RedisHelpers.incrementWithTTL('test:counter', 60);
    const count2 = await RedisHelpers.incrementWithTTL('test:counter', 60);
    console.log(`✅ Counter: ${count1}, ${count2}\n`);

    // Test 6: Key naming conventions
    console.log('Test 6: Key naming conventions');
    console.log(`OTP key: ${RedisKeys.otp('user@example.com')}`);
    console.log(`Session key: ${RedisKeys.session('abc123')}`);
    console.log(`Lesson key: ${RedisKeys.lesson('hash123')}`);
    console.log(`Rate limit key: ${RedisKeys.rateLimit('user1', 'lesson', '2026-03-05')}\n`);

    // Cleanup
    console.log('🧹 Cleaning up test keys...');
    await redis.del('test:hello');
    await redis.del('test:user');
    await redis.del('test:expiring');
    await redis.del('test:counter');
    console.log('✅ Cleanup complete\n');

    console.log('✅ All Redis tests passed!');
    console.log('🎉 Redis is ready to use!\n');
  } catch (error) {
    console.error('❌ Redis test failed:', error);
    process.exit(1);
  } finally {
    await redis.quit();
  }
}

testRedisConnection();
