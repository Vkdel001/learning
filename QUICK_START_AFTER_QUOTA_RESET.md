# Quick Start Guide - After Quota Reset

## What Changed?

✅ **Default model switched to `gemini-2.0-flash-lite`**
- Faster response times
- Better rate limits
- Optimized for educational content
- More cost-effective

## When Your Quota Resets

Your Gemini API quota resets daily. Once it resets, you can test the lesson generation system.

### Step 1: Check if Quota Reset

Run this to test if you can make API calls:

```bash
npm run test:flashlite
```

If you see "✅ Success", your quota has reset!

### Step 2: Test Lesson Generation

Run the full lesson generation test:

```bash
npm run test:quota
```

This will:
- Generate a lesson for "Decimal and Binary"
- Show the full lesson content
- Test the caching system
- Verify everything works end-to-end

### Step 3: Use the Test UI

Start the dev server and use the browser UI:

```bash
npm run dev
```

Then visit: http://localhost:3000/test

You can:
- Browse the curriculum tree
- Click any subtopic to generate a lesson
- See the generated content
- Test the caching (second click is instant)

## Available Test Commands

```bash
# Test which models are available
npm run test:flashlite

# Test lesson generation (when quota is available)
npm run test:quota

# Test the full lesson generation flow
npm run test:lesson

# Test network connectivity
npm run test:network

# Test AI response format
npm run test:ai
```

## Rate Limits (Free Tier)

- **gemini-2.0-flash-lite**: Better limits than 2.5-flash
- **gemini-1.5-flash**: 15 RPM, 1500 per day
- Quota resets daily (usually midnight UTC)

## If You Need More Quota

### Option 1: Space Out Requests
The caching system (7-day TTL) means you only need to generate each lesson once.

### Option 2: Upgrade to Paid
- Visit: https://ai.google.dev/pricing
- Enable billing in Google Cloud Console
- Get 2000 RPM for gemini-2.0-flash-lite

## Caching Strategy

The system is designed to minimize API calls:

1. **First request**: Calls Gemini API, saves to database, caches in Redis (7 days)
2. **Second request**: Returns from Redis instantly (no API call)
3. **After 7 days**: Returns from database (no API call)
4. **Only regenerates**: If you explicitly request it or content changes

This means for 88 subtopics in the curriculum, you only need 88 API calls total (not per user, not per day - just once!).

## Production Deployment

For production with real students:

1. **Pre-generate all lessons**: Run a script to generate all 88 lessons once
2. **Cache forever**: Set TTL to 30 days or more
3. **Upgrade to paid tier**: Get 2000 RPM for smooth operation
4. **Monitor usage**: Track API calls in the `api_usage_logs` table

## Current Status

✅ Infrastructure complete
✅ Authentication system working
✅ Curriculum navigation working (136 nodes)
✅ Caching system working
✅ AI provider configured with gemini-2.0-flash-lite
✅ Lesson generation code ready
⏳ Waiting for API quota to test end-to-end

## Next Steps

Once quota resets:
1. Run `npm run test:quota` to verify
2. Generate lessons for all subtopics
3. Move on to Task 7.3 (property tests)
4. Continue with quiz generation (Task 8.x)

## Questions?

- Check `RATE_LIMIT_ISSUE.md` for detailed solutions
- Check `PROGRESS.md` for overall project status
- Check `TESTING.md` for testing documentation
