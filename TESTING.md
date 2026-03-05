# Testing the AI Tutor System

## Prerequisites

1. **Docker containers running:**
   ```bash
   docker-compose up -d
   ```

2. **Database seeded:**
   ```bash
   npm run db:seed
   ```

3. **Valid API keys in .env:**
   - GEMINI_API_KEY (Get from https://makersuite.google.com/app/apikey)
   - BREVO_API_KEY (for email/OTP)
   - ELEVENLABS_API_KEY (for TTS)

## Testing Lesson Generation

### Option 1: Command Line Test

```bash
npm run test:lesson
```

This will:
1. Load the curriculum
2. Navigate to first subtopic ("Decimal and Binary")
3. Generate a lesson using AI
4. Display the full lesson content
5. Test cache hit on second call

### Option 2: Web UI Test Page

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open browser to: `http://localhost:3000/test`

3. Navigate through the curriculum:
   - Click on a Grade
   - Click on Computer Science
   - Click on a Section
   - Click on a Topic
   - Click on a Subtopic

4. Click "🤖 Generate Lesson" button

5. View the AI-generated lesson with:
   - Explanation
   - Examples
   - Key Points
   - Practice Questions

### Option 3: API Testing with curl/Postman

1. **Register a user:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","grade":9}'
   ```

2. **Request OTP:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/send-otp \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

3. **Verify OTP (check email):**
   ```bash
   curl -X POST http://localhost:3000/api/auth/verify-otp \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","otp":"123456"}'
   ```
   Save the session token from response.

4. **Get curriculum:**
   ```bash
   curl http://localhost:3000/api/curriculum/grades
   ```

5. **Generate lesson (requires auth):**
   ```bash
   curl -X POST http://localhost:3000/api/lessons/generate \
     -H "Content-Type: application/json" \
     -H "Cookie: session_token=YOUR_TOKEN_HERE" \
     -d '{"subtopicId":"SUBTOPIC_ID_FROM_CURRICULUM"}'
   ```

## Troubleshooting

### Gemini API Error (404 Not Found)

If you get a 404 error with Gemini, try these model names in `lib/services/ai-provider.service.ts`:

- `gemini-1.5-pro` (recommended)
- `gemini-1.5-flash`
- `gemini-pro`

Or check available models at: https://ai.google.dev/models/gemini

### Redis Connection Error

```bash
docker-compose restart redis
```

### Database Connection Error

```bash
docker-compose restart postgres
npx prisma generate
```

### OTP Not Received

Check Brevo API key is valid and email is verified in Brevo dashboard.

## What Gets Generated

Each lesson includes:

1. **Explanation** (2-3 paragraphs)
   - Clear, age-appropriate explanation
   - Real-world analogies
   - Step-by-step breakdown

2. **Examples** (3-4 examples)
   - Practical demonstrations
   - Code snippets (Python)
   - Worked solutions

3. **Key Points** (5-7 bullet points)
   - Essential takeaways
   - Memorable facts
   - Core concepts

4. **Practice Questions** (3-5 questions)
   - Range of difficulty
   - Detailed answers
   - Conceptual and practical

## Caching

- Lessons are cached for 7 days in Redis
- Same subtopic + same prompt = cache hit
- Check cache with: `redis-cli KEYS "lesson:*"`

## Database

- Lessons are stored in `lessons` table
- API usage logged in `api_usage_logs` table
- Check with: `npx prisma studio`

## Performance

- First generation: ~5-10 seconds (AI call)
- Cached retrieval: <100ms
- Cost: ~$0.0001 per lesson (Gemini Flash)
