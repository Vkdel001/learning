# AI Tutor Mauritius - Implementation Guide

## Quick Start

Your complete project specification is ready! Here's what you have:

### 📋 Specification Files

1. **requirements.md** - 24 requirements (20 core + 4 future)
2. **design.md** - Complete architecture, database schema, 65 correctness properties
3. **tasks.md** - 143 implementation tasks across 3 phases

### 🔑 Key Technology Decisions

#### Authentication: OTP via Brevo (No Passwords!)
- **Why:** Simpler for students, no password to forget
- **How:** 6-digit OTP sent via email, valid for 10 minutes
- **Rate Limiting:** 3 OTP requests per hour per email
- **Future:** Google OAuth in Phase 2

#### Database: PostgreSQL with Prisma ORM
- **Why Prisma:**
  - ✅ Type-safe queries with TypeScript
  - ✅ Auto-generated types from schema
  - ✅ Built-in migrations
  - ✅ Excellent developer experience
  - ✅ Perfect for Next.js projects

- **Prisma Commands:**
  ```bash
  # Initialize Prisma
  npx prisma init
  
  # Create migration
  npx prisma migrate dev --name init
  
  # Generate TypeScript client
  npx prisma generate
  
  # Open database GUI
  npx prisma studio
  
  # Deploy to production
  npx prisma migrate deploy
  ```

#### Email: Brevo API (formerly Sendinblue)
- **Free Tier:** 300 emails/day (sufficient for MVP)
- **Cost:** Very affordable for non-profit
- **Setup:** Get API key from brevo.com
- **SDK:** `@getbrevo/brevo` or `@sendinblue/client`

### 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Student Browser                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Cloudflare CDN (Static + Audio)            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js Application Server                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  API Routes (Auth, Curriculum, Lessons, Quizzes) │  │
│  └──────────────────────────────────────────────────┘  │
└──┬────────────┬────────────┬────────────┬──────────────┘
   │            │            │            │
   ▼            ▼            ▼            ▼
┌──────┐   ┌────────┐   ┌────────┐   ┌──────────┐
│Redis │   │Postgres│   │ Gemini │   │ElevenLabs│
│Cache │   │+Prisma │   │   AI   │   │   TTS    │
└──────┘   └────────┘   └────────┘   └──────────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │ Backblaze B2 │
                                    │ Audio Storage│
                                    └──────────────┘
```

### 📊 Database Schema Highlights

**Users Table** (No passwords!)
```prisma
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  grade        Int
  authProvider String   @default("otp")  // 'otp' or 'google'
  googleId     String?  @unique
  isAdmin      Boolean  @default(false)
  
  progress     Progress[]
  quizAttempts QuizAttempt[]
}
```

**Curriculum Tree** (Materialized Path)
```prisma
model CurriculumNode {
  id       String  @id @default(uuid())
  name     String
  path     String  @unique  // e.g., "grade7.cs.programming.variables"
  level    Int
  parentId String?
  nodeType String  // 'grade', 'subject', 'section', 'topic', 'subtopic'
  
  parent   CurriculumNode?  @relation("NodeHierarchy", fields: [parentId])
  children CurriculumNode[] @relation("NodeHierarchy")
  lessons  Lesson[]
}
```

### 🚀 Implementation Phases

#### Phase 1: MVP (43 tasks)
Core learning platform with:
- ✅ OTP authentication (no passwords)
- ✅ Curriculum navigation
- ✅ AI lesson generation with caching
- ✅ Basic progress tracking
- ✅ Responsive frontend

**Estimated Time:** 4-6 weeks

#### Phase 2: Enhancement (40 tasks)
- ✅ Quiz generation and evaluation
- ✅ Voice narration (ElevenLabs + B2)
- ✅ Rate limiting
- ✅ Enhanced analytics
- ✅ Learning streaks

**Estimated Time:** 3-4 weeks

#### Phase 3: Advanced (60 tasks)
- ✅ Multi-subject support
- ✅ Admin dashboard
- ✅ Monitoring and observability
- ✅ Performance optimization
- ✅ Production deployment

**Estimated Time:** 4-5 weeks

### 🌍 Future Features (Phase 4+)

#### Multi-Language Support
- English, French, Mauritian Creole
- Text and voice in all languages
- Estimated cost: 3x storage, minimal generation cost

#### Interactive Q&A
- Text and voice input
- AI answers based on lesson context
- 10-20 questions per day limit
- Estimated cost: $1,200-3,600/month (with caching)

#### AI Avatar
- Lip-sync with voice narration
- D-ID or open-source options
- Estimated cost: $300-900 one-time generation

#### Animated Concepts
- Static diagrams (Phase 5)
- Pre-built animation templates (Phase 6)
- AI-generated animations (future)

### 💰 Cost Estimates

#### MVP (Phase 1-3)
- **Infrastructure:** $20-50/month
  - PostgreSQL: $10-20/month (managed)
  - Redis: $5-15/month (managed)
  - Hosting: $5-15/month (Vercel/Railway)
- **APIs:** $50-150/month (1000 students)
  - Google Gemini: $30-80/month
  - ElevenLabs: $20-70/month
- **Storage:** $5-10/month
  - Backblaze B2: $0.25/month + bandwidth
  - Cloudflare CDN: Free tier

**Total MVP:** $75-210/month

#### With Future Features
- Add $1,200-3,600/month for Q&A (if not well-cached)
- Add $300-900 one-time for avatar generation
- Add minimal cost for multi-language (3x storage)

### 🔐 Security & Privacy

- ✅ No password storage (OTP-based auth)
- ✅ Minimal data collection (name, email, grade only)
- ✅ httpOnly, secure, sameSite cookies
- ✅ Rate limiting on all expensive operations
- ✅ Email hashing in logs
- ✅ GDPR-compliant data deletion

### 📝 Getting Started

1. **Set up development environment:**
   ```bash
   # Clone or create project
   npx create-next-app@latest ai-tutor-mauritius --typescript
   cd ai-tutor-mauritius
   
   # Install Prisma
   npm install prisma @prisma/client
   npx prisma init
   
   # Install other dependencies
   npm install ioredis @getbrevo/brevo
   npm install -D @types/node
   ```

2. **Configure environment variables:**
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/ai_tutor"
   REDIS_URL="redis://localhost:6379"
   BREVO_API_KEY="your-brevo-api-key"
   GEMINI_API_KEY="your-gemini-api-key"
   ELEVENLABS_API_KEY="your-elevenlabs-api-key"
   B2_KEY_ID="your-b2-key-id"
   B2_APPLICATION_KEY="your-b2-app-key"
   B2_BUCKET_NAME="ai-tutor-audio"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. **Start implementing tasks:**
   - Open `.kiro/specs/ai-tutor-mauritius/tasks.md`
   - Start with Phase 1, Task 1.1
   - Mark tasks complete as you go
   - Run tests frequently

4. **Development workflow:**
   ```bash
   # Start development server
   npm run dev
   
   # Run Prisma Studio (database GUI)
   npx prisma studio
   
   # Run tests
   npm test
   
   # Create migration
   npx prisma migrate dev --name your_migration_name
   ```

### 🧪 Testing Strategy

- **Property-Based Tests:** 65 properties using fast-check
- **Unit Tests:** Specific examples and edge cases
- **Integration Tests:** End-to-end user flows
- **Coverage Goals:** 80% line, 75% branch

### 📚 Key Resources

- **Prisma Docs:** https://www.prisma.io/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Brevo API:** https://developers.brevo.com
- **Google Gemini:** https://ai.google.dev/docs
- **ElevenLabs:** https://elevenlabs.io/docs
- **Backblaze B2:** https://www.backblaze.com/b2/docs

### 🎯 Success Metrics

- Students complete 5+ topics per month
- Quiz scores improve over time
- API costs stay within budget
- 99% uptime for core features
- Positive feedback from students and parents

### 🤝 Next Steps

1. Review all three spec files (requirements, design, tasks)
2. Set up development environment
3. Get API keys (Brevo, Gemini, ElevenLabs, B2)
4. Start with Task 1.1 in tasks.md
5. Build incrementally, test frequently
6. Deploy MVP to pilot group (20-30 students)
7. Gather feedback and iterate

---

**Remember:** This is a social impact project. Focus on:
- ✅ Cost efficiency (aggressive caching)
- ✅ Simplicity (easy for students to use)
- ✅ Privacy (minimal data collection)
- ✅ Quality (accurate educational content)

Good luck building something meaningful for Mauritius students! 🇲🇺📚
