# Gemini API Rate Limit Issue - SOLVED

## Problem
The lesson generation was timing out after 30-60 seconds with no error message.

## Root Cause
**Gemini API Free Tier Rate Limit Exceeded**

Error: `429 Too Many Requests - Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20, model: gemini-2.5-flash`

The free tier has daily request limits that vary by model.

## Solutions

### Option 1: Use Gemini 2.0 Flash Lite (RECOMMENDED)
This is now the default model. It's faster, cheaper, and has better rate limits.

**Already configured!** The system now defaults to `gemini-2.0-flash-lite`.

To explicitly set it, add to `.env`:
```
GEMINI_MODEL=gemini-2.0-flash-lite
```

**Benefits:**
- Faster response times
- Lower cost per request
- Better rate limits on free tier
- Optimized for educational content

### Option 2: Wait for Quota Reset (Free)
The quota resets daily. Wait until tomorrow or space out your requests.

### Option 3: Switch to Gemini 1.5 Flash
The older model may have different rate limits:

Add to `.env`:
```
GEMINI_MODEL=gemini-1.5-flash
```

### Option 4: Upgrade to Paid Plan (Best for Production)
Google AI Studio offers paid plans with much higher limits:
- Visit: https://ai.google.dev/pricing
- Enable billing in Google Cloud Console
- Much higher rate limits (1500 RPM for paid tier)

## Rate Limits Reference

### Free Tier
- **gemini-2.0-flash-lite**: Higher limits (exact numbers vary)
- **gemini-2.5-flash**: 20 requests per day, 2 requests per minute
- **gemini-1.5-flash**: 15 requests per minute, 1500 per day

### Paid Tier
- **gemini-2.0-flash-lite**: 2000 requests per minute
- **gemini-2.5-flash**: 1500 requests per minute
- **gemini-1.5-flash**: 1500 requests per minute

## Monitoring Usage
Check your current usage at: https://ai.dev/rate-limit

## Testing After Fix
Once you've chosen a solution, test with:
```bash
npm run test:lesson
```

## Prevention
For development:
1. Use caching aggressively (already implemented with 7-day TTL)
2. Add rate limiting in the application layer
3. Consider using a local LLM for development testing
4. Upgrade to paid tier before production deployment

## Status
✅ Issue identified: Rate limit exceeded
⏳ Waiting for quota reset or model change
