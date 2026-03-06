# Quick Start: Testing the Chat Feature

**Date:** March 6, 2026  
**Status:** ✅ Ready to Test

---

## 🚀 Quick Test (5 minutes)

### 1. Start the Development Server

```bash
# Make sure Docker is running (PostgreSQL + Redis)
docker-compose up -d

# Start Next.js dev server
npm run dev
```

### 2. Open the App
Navigate to: http://localhost:3000

### 3. Register/Login
- Click "Register" or "Login"
- Use OTP authentication
- Check your email for the OTP code

### 4. Generate a Lesson
- Go to "Lessons" page
- Browse curriculum: Grade 7 → Computer Science → Introduction to Computing → What is a Computer?
- Click "Generate Lesson"
- Wait for AI to generate content (~5-10 seconds)

### 5. Test the Chat!
- Click the "Ask Tutor" button (top-right of lesson)
- Chat interface appears below the lesson
- Try these questions:
  - "Can you explain this in simpler terms?"
  - "Can you give me an example?"
  - "Why is this important?"
  - "How does this relate to real life?"

### 6. Test Quick Actions
- Click the quick action buttons:
  - "Explain simpler"
  - "Give example"
  - "Why important?"

### 7. Check Common Questions
- If you see common questions, click one to ask it
- These are questions other students have asked

---

## 🧪 Backend Testing (Optional)

### Test the Chat Service Directly

```bash
npx ts-node scripts/test-chat-system.ts
```

This will:
1. Find or create a test user
2. Find an existing lesson
3. Create a conversation
4. Send a test message
5. Generate AI response
6. Track questions for analytics
7. Display common questions

Expected output:
```
🧪 Testing Chat System...

1️⃣ Finding test user...
   ✅ User: Test User (test@example.com)

2️⃣ Finding test lesson...
   ✅ Lesson: What is a Computer?

3️⃣ Creating conversation...
   ✅ Conversation ID: abc-123-def

4️⃣ Adding user message...
   ✅ User message: "Can you explain this topic in simple terms?"

5️⃣ Generating AI response...
   (This may take a few seconds...)
   ✅ AI response (450 tokens):
   "A computer is an electronic device that processes information..."

✅ All chat system tests passed!
```

---

## 📊 What to Check

### Frontend
- ✅ Chat button appears on lesson page
- ✅ Chat interface opens/closes smoothly
- ✅ Messages appear in correct order
- ✅ User messages on right (blue)
- ✅ AI messages on left (white)
- ✅ Timestamps display correctly
- ✅ Quick actions work
- ✅ Common questions clickable
- ✅ Input field accepts text
- ✅ Send button works
- ✅ Loading indicator shows while waiting
- ✅ Error messages display if something fails
- ✅ Rate limit warning shows at 50 messages

### Backend
- ✅ Conversations created in database
- ✅ Messages stored correctly
- ✅ AI responses generated
- ✅ Rate limiting enforced
- ✅ Analytics tracked
- ✅ Common questions aggregated

### Database
Check tables:
```sql
-- View conversations
SELECT * FROM chat_conversations ORDER BY started_at DESC LIMIT 5;

-- View messages
SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 10;

-- View analytics
SELECT * FROM chat_analytics ORDER BY ask_count DESC LIMIT 5;
```

---

## 🐛 Common Issues

### "Failed to initialize chat"
**Cause:** Database connection issue  
**Fix:** 
```bash
docker-compose restart
npm run dev
```

### "Daily message limit reached"
**Cause:** Sent 50 messages today  
**Fix:** 
```bash
# Clear rate limit in Redis
npx ts-node scripts/clear-chat-rate-limit.ts
```

Or wait until midnight for automatic reset.

### "Failed to send message"
**Cause:** AI API error or network issue  
**Fix:**
- Check internet connection
- Verify GEMINI_API_KEY in .env
- Check API quota: https://aistudio.google.com/app/apikey

### Chat button doesn't appear
**Cause:** No lesson generated yet  
**Fix:** Generate a lesson first

### AI response is slow
**Normal:** First response takes 3-5 seconds  
**If > 10 seconds:** Check API status or network

---

## 💡 Test Scenarios

### Scenario 1: Basic Q&A
1. Generate lesson on "Binary Numbers"
2. Ask: "What is binary?"
3. Verify AI explains binary numbers
4. Ask: "Can you give an example?"
5. Verify AI provides binary examples

### Scenario 2: Clarification
1. Generate lesson on "Algorithms"
2. Ask: "I don't understand algorithms"
3. Verify AI provides simpler explanation
4. Click "Explain simpler"
5. Verify even simpler explanation

### Scenario 3: Real-World Connection
1. Generate lesson on "Variables"
2. Click "Why important?"
3. Verify AI explains importance
4. Ask: "How is this used in real life?"
5. Verify AI provides real-world examples

### Scenario 4: Rate Limiting
1. Send 50 messages (use quick actions)
2. Try to send 51st message
3. Verify error: "Daily message limit reached"
4. Check UI shows limit warning

### Scenario 5: Conversation History
1. Send 5 messages
2. Refresh page
3. Open chat again
4. Verify all messages still visible
5. Continue conversation

---

## 📈 Success Criteria

### Must Work
- ✅ Chat opens and closes
- ✅ Messages send and receive
- ✅ AI responses are relevant
- ✅ Rate limiting enforced
- ✅ Conversation persists

### Should Work
- ✅ Quick actions functional
- ✅ Common questions display
- ✅ Timestamps accurate
- ✅ Error handling graceful
- ✅ Mobile responsive

### Nice to Have
- ✅ Smooth animations
- ✅ Auto-scroll to bottom
- ✅ Typing indicators
- ✅ Message timestamps
- ✅ Clean UI design

---

## 🎯 Next Steps After Testing

### If Everything Works
1. ✅ Mark Task 15.1-15.10 complete
2. ✅ Update PROGRESS.md
3. ✅ Commit changes to Git
4. ✅ Move to next Phase 1.5 feature

### If Issues Found
1. Document the issue
2. Check error logs
3. Review relevant code
4. Fix and retest
5. Update documentation

---

## 📝 Feedback Collection

After testing, note:
- What worked well?
- What was confusing?
- What could be improved?
- Any bugs or errors?
- Performance issues?
- UI/UX suggestions?

---

## 🎉 You're Ready!

The chat feature is fully implemented and ready to test. This is a major milestone that transforms your platform from a content library into an interactive AI tutor!

**Have fun testing! 🚀**

