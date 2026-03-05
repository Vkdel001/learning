import { redis } from '../lib/redis';

async function clearRateLimit() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('Usage: npm run clear-rate-limit <email>');
    process.exit(1);
  }

  try {
    const key = `otp:ratelimit:${email}`;
    await redis.del(key);
    console.log(`✅ Rate limit cleared for ${email}`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await redis.quit();
  }
}

clearRateLimit();
