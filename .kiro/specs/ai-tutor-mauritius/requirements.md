# Requirements Document

## Introduction

The AI Tutor Mauritius system is a web-based educational platform designed to provide free, high-quality tutoring to secondary school students in Mauritius who cannot afford private tuition. The system generates personalized lessons dynamically using AI, supports multiple subjects starting with Computer Science, and includes voice narration, practice questions, and progress tracking. The platform prioritizes cost efficiency through aggressive caching while maintaining educational quality.

## Glossary

- **System**: The complete AI Tutor Mauritius web application
- **User**: A student, parent, or educator using the platform
- **Student**: A registered user in grades 7 through Form 5
- **Curriculum_Tree**: The hierarchical structure of Grade → Subject → Section → Topic → Subtopic
- **Lesson**: AI-generated educational content including explanations, examples, key points, and questions
- **Content_Generator**: The AI service that creates lesson content
- **Voice_Synthesizer**: The text-to-speech service that creates audio narration
- **Cache_Layer**: The multi-tier caching system (Redis + CDN) that stores generated content
- **Quiz**: A set of multiple-choice questions for a specific topic
- **Progress_Tracker**: The component that records and analyzes student learning progress
- **Authentication_Service**: The component that manages user registration and login
- **Curriculum_Navigator**: The interface for browsing the curriculum hierarchy
- **Audio_Segment**: A reusable piece of narrated content stored in object storage
- **Session**: A period of authenticated user activity
- **Content_Hash**: A unique identifier for generated content used for deduplication
- **Rate_Limiter**: The component that controls API usage per user
- **Analytics_Engine**: The component that processes and displays learning metrics

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a student or parent, I want to create an account and log in easily without remembering passwords, so that I can access personalized learning content and track progress.

#### Acceptance Criteria

1. WHEN a new user provides valid registration information (name, email, grade), THE Authentication_Service SHALL create a user account
2. WHEN a user requests to log in with their email, THE Authentication_Service SHALL send a 6-digit OTP to their email via Brevo API
3. THE OTP SHALL be valid for 10 minutes and expire after that time
4. WHEN a user enters a valid OTP, THE Authentication_Service SHALL authenticate the user and create a session
5. THE Authentication_Service SHALL rate-limit OTP requests to maximum 3 per email per hour to prevent abuse
6. WHEN a user is under 18 years old, THE System SHALL collect only essential information (name, grade, email) for privacy compliance
7. THE Authentication_Service SHALL support session expiration after 24 hours of inactivity
8. WHEN a user logs out, THE Authentication_Service SHALL invalidate the session immediately
9. THE System SHALL support Google OAuth authentication as an alternative login method (Phase 2)
10. WHEN authentication fails, THE Authentication_Service SHALL return a descriptive error message without revealing whether the email exists

### Requirement 2: Curriculum Navigation

**User Story:** As a student, I want to browse through grades, subjects, sections, topics, and subtopics, so that I can find the specific content I need to learn.

#### Acceptance Criteria

1. THE Curriculum_Navigator SHALL display the curriculum hierarchy using a materialized path tree structure
2. WHEN a student selects a grade level, THE Curriculum_Navigator SHALL display all available subjects for that grade
3. WHEN a student selects a subject, THE Curriculum_Navigator SHALL display all sections within that subject
4. WHEN a student selects a section, THE Curriculum_Navigator SHALL display all topics within that section
5. WHEN a student selects a topic, THE Curriculum_Navigator SHALL display all subtopics within that topic
6. THE Curriculum_Navigator SHALL support adding new subjects without code changes
7. THE Curriculum_Navigator SHALL retrieve curriculum structure from the PostgreSQL database within 100ms

### Requirement 3: AI Lesson Generation

**User Story:** As a student, I want to receive clear, comprehensive lessons on any topic, so that I can understand new concepts effectively.

#### Acceptance Criteria

1. WHEN a student requests a lesson for a subtopic, THE Content_Generator SHALL create a lesson containing explanations, real-life examples, key points, and practice questions
2. THE Content_Generator SHALL use Google Gemini API for content generation
3. WHEN generating a lesson, THE Content_Generator SHALL use versioned prompts to ensure consistent quality
4. THE Content_Generator SHALL tailor content difficulty to the student's grade level
5. WHEN a lesson is generated, THE System SHALL store it in the Cache_Layer with the Content_Hash as the key
6. WHEN a previously generated lesson exists in the Cache_Layer, THE System SHALL retrieve it instead of generating new content
7. THE Content_Generator SHALL complete lesson generation within 5 seconds for cache misses

### Requirement 4: Practice Questions and Quizzes

**User Story:** As a student, I want to answer practice questions and take quizzes, so that I can test my understanding and reinforce learning.

#### Acceptance Criteria

1. WHEN a lesson is generated, THE Content_Generator SHALL include at least 3 practice questions with detailed solutions
2. WHEN a student requests a quiz for a topic, THE Content_Generator SHALL create a quiz with 5 to 10 multiple-choice questions
3. WHEN a student submits quiz answers, THE System SHALL evaluate the answers and return a score within 500ms
4. THE System SHALL provide immediate feedback explaining why each answer is correct or incorrect
5. WHEN a quiz is completed, THE Progress_Tracker SHALL record the score and timestamp
6. THE System SHALL store quiz questions in the Cache_Layer to avoid regeneration

### Requirement 5: Voice Narration

**User Story:** As a student, I want to hear lessons narrated aloud, so that I can learn through listening in addition to reading.

#### Acceptance Criteria

1. WHEN a lesson is displayed, THE System SHALL provide an option to play voice narration
2. THE Voice_Synthesizer SHALL use ElevenLabs API to generate audio narration
3. WHEN generating narration, THE System SHALL segment text into reusable Audio_Segments based on content structure
4. THE System SHALL store Audio_Segments in Backblaze B2 object storage
5. THE System SHALL serve Audio_Segments through Cloudflare CDN for fast delivery
6. WHEN an Audio_Segment already exists for specific text, THE System SHALL reuse it instead of generating new audio
7. THE System SHALL support playback controls including play, pause, and speed adjustment

### Requirement 6: Progress Tracking and Analytics

**User Story:** As a student or parent, I want to see learning progress and performance metrics, so that I can identify strengths and areas needing improvement.

#### Acceptance Criteria

1. WHEN a student completes a lesson, THE Progress_Tracker SHALL record the completion timestamp
2. WHEN a student completes a quiz, THE Progress_Tracker SHALL record the score, timestamp, and time spent
3. THE Analytics_Engine SHALL calculate and display completion percentage for each subject, section, and topic
4. THE Analytics_Engine SHALL calculate and display average quiz scores per topic and subject
5. THE Analytics_Engine SHALL display a learning streak showing consecutive days of activity
6. THE System SHALL provide a dashboard showing progress visualizations within 1 second of request
7. THE Progress_Tracker SHALL store all progress data in PostgreSQL with proper indexing for fast queries

### Requirement 7: Cost Control and Caching

**User Story:** As a system administrator, I want to minimize API costs while maintaining performance, so that the platform remains financially sustainable for the non-profit mission.

#### Acceptance Criteria

1. THE Cache_Layer SHALL use Redis for frequently accessed content with a TTL of 7 days
2. THE System SHALL use Cloudflare CDN for caching static assets and audio files
3. WHEN generating content, THE System SHALL compute a Content_Hash and check for existing cached content before calling external APIs
4. THE System SHALL pre-generate lessons for the top 20 most popular topics during off-peak hours
5. THE Rate_Limiter SHALL restrict each user to a maximum of 50 AI-generated lessons per day
6. THE Rate_Limiter SHALL restrict each user to a maximum of 20 quizzes per day
7. WHEN rate limits are exceeded, THE System SHALL return cached content or display a friendly message explaining the limit

### Requirement 8: Content Versioning and Quality

**User Story:** As a system administrator, I want to version prompts and lessons, so that I can improve content quality over time while maintaining consistency.

#### Acceptance Criteria

1. THE System SHALL store a version number with each generated lesson
2. THE System SHALL store a version number with each prompt template used for generation
3. WHEN a prompt template is updated, THE System SHALL increment its version number
4. THE System SHALL allow administrators to regenerate lessons using updated prompt versions
5. THE System SHALL maintain a history of prompt versions in the database
6. WHEN displaying a lesson, THE System SHALL indicate the prompt version used to generate it

### Requirement 9: Multi-Subject Expandability

**User Story:** As a system administrator, I want to add new subjects and curriculum content without code changes, so that the platform can grow to serve more educational needs.

#### Acceptance Criteria

1. THE System SHALL store all curriculum structure in the PostgreSQL database using materialized paths
2. THE System SHALL provide an administrative interface for adding new grades, subjects, sections, topics, and subtopics
3. WHEN a new subject is added, THE System SHALL make it immediately available to students without deployment
4. THE System SHALL support subject-specific prompt templates stored in the database
5. THE Curriculum_Tree SHALL support unlimited depth of hierarchy beyond the initial 5 levels

### Requirement 10: AI Provider Abstraction

**User Story:** As a system administrator, I want to switch AI providers without changing application code, so that I can optimize costs and capabilities over time.

#### Acceptance Criteria

1. THE Content_Generator SHALL use an abstraction layer that supports multiple AI providers
2. THE System SHALL store AI provider configuration in environment variables
3. WHEN switching AI providers, THE System SHALL require only configuration changes, not code changes
4. THE System SHALL support Google Gemini as the initial AI provider
5. THE abstraction layer SHALL normalize responses from different providers into a consistent format

### Requirement 11: Privacy and Data Protection

**User Story:** As a parent, I want my child's data to be protected and minimally collected, so that their privacy is respected.

#### Acceptance Criteria

1. THE System SHALL collect only essential user information: name, grade level, and email address
2. THE System SHALL not collect or store personally identifiable information beyond what is necessary for the service
3. THE System SHALL not store passwords (using OTP-based authentication instead)
4. THE System SHALL store session tokens securely with httpOnly and secure flags
5. THE System SHALL not share user data with third parties except for essential service providers (AI, TTS, storage, email)
6. WHEN a user requests account deletion, THE System SHALL remove all personal data within 30 days while retaining anonymized analytics
7. THE System SHALL store OTPs in Redis with automatic expiration after 10 minutes
8. THE System SHALL hash email addresses when logging for privacy protection

### Requirement 12: Error Handling and Resilience

**User Story:** As a student, I want the system to handle errors gracefully, so that I can continue learning even when problems occur.

#### Acceptance Criteria

1. WHEN an external API fails, THE System SHALL return cached content if available
2. WHEN an external API fails and no cache exists, THE System SHALL display a user-friendly error message
3. THE System SHALL log all errors with sufficient context for debugging
4. WHEN the Content_Generator fails, THE System SHALL retry up to 3 times with exponential backoff
5. WHEN the Voice_Synthesizer fails, THE System SHALL allow students to continue with text-only content
6. THE System SHALL monitor API response times and switch to cached content when responses exceed 10 seconds
7. THE System SHALL maintain 99% uptime for core learning features (lesson viewing, quiz taking)

### Requirement 13: Performance and Scalability

**User Story:** As a student, I want the platform to load quickly and respond immediately, so that I can focus on learning without frustration.

#### Acceptance Criteria

1. THE System SHALL load the curriculum navigation interface within 2 seconds on a 3G connection
2. THE System SHALL display cached lessons within 500ms of request
3. THE System SHALL support at least 1000 concurrent users without performance degradation
4. THE System SHALL use database connection pooling with a minimum pool size of 10 connections
5. THE System SHALL use lazy loading for audio content to minimize initial page load time
6. THE System SHALL compress all API responses using gzip compression
7. THE System SHALL implement pagination for progress history, displaying 20 items per page

### Requirement 14: Lesson Content Parser and Formatter

**User Story:** As a developer, I want to parse and format AI-generated lesson content reliably, so that content displays correctly and consistently.

#### Acceptance Criteria

1. WHEN the Content_Generator returns lesson content, THE Parser SHALL parse it into structured components (explanation, examples, key points, questions)
2. THE Parser SHALL handle markdown formatting in AI-generated content
3. THE Pretty_Printer SHALL format lesson components into valid HTML for display
4. FOR ALL valid lesson objects, parsing the AI response then formatting for display then parsing again SHALL produce an equivalent lesson structure (round-trip property)
5. WHEN the Parser encounters malformed content, THE System SHALL log the error and request regeneration
6. THE Parser SHALL validate that all required lesson components are present before caching

### Requirement 15: Audio Segment Management

**User Story:** As a system administrator, I want to manage audio segments efficiently, so that storage costs remain low and audio loads quickly.

#### Acceptance Criteria

1. WHEN generating audio, THE System SHALL split lesson text into logical Audio_Segments of 100 to 300 words
2. THE System SHALL compute a hash for each text segment before generating audio
3. WHEN an Audio_Segment hash matches existing audio, THE System SHALL reuse the existing audio file
4. THE System SHALL store Audio_Segments in Backblaze B2 with a naming convention based on Content_Hash
5. THE System SHALL set appropriate cache headers for Audio_Segments to enable CDN caching for 30 days
6. THE System SHALL track Audio_Segment usage statistics to identify frequently reused segments
7. THE System SHALL support batch deletion of unused Audio_Segments older than 90 days

### Requirement 16: Quiz Evaluation and Feedback

**User Story:** As a student, I want detailed feedback on my quiz answers, so that I can learn from my mistakes and understand concepts better.

#### Acceptance Criteria

1. WHEN a student submits a quiz, THE System SHALL evaluate all answers and calculate a percentage score
2. THE System SHALL provide explanation text for each correct answer
3. THE System SHALL provide explanation text for each incorrect answer, including why it is wrong and what the correct answer is
4. THE System SHALL highlight which questions were answered correctly and incorrectly
5. THE System SHALL display the time taken to complete the quiz
6. THE System SHALL allow students to review quiz results at any time through their progress history
7. THE System SHALL recommend related topics for review when quiz scores are below 60%

### Requirement 17: Curriculum Data Seeding

**User Story:** As a system administrator, I want to initialize the database with the Mauritius Computer Science curriculum, so that students can immediately start learning.

#### Acceptance Criteria

1. THE System SHALL provide a database seeding script for the initial curriculum structure
2. THE seeding script SHALL populate grades 7 through Form 5 for Computer Science
3. THE seeding script SHALL use materialized paths for efficient tree queries
4. THE seeding script SHALL be idempotent, allowing safe re-execution without duplicating data
5. THE System SHALL validate curriculum data integrity after seeding
6. THE seeding script SHALL complete within 30 seconds for the initial Computer Science curriculum

### Requirement 18: Rate Limiting and Fair Usage

**User Story:** As a system administrator, I want to enforce fair usage limits, so that no single user can exhaust API quotas and affect other students.

#### Acceptance Criteria

1. THE Rate_Limiter SHALL track API usage per user per day using Redis counters
2. THE Rate_Limiter SHALL reset daily limits at midnight Mauritius time (UTC+4)
3. WHEN a user reaches 80% of their daily limit, THE System SHALL display a warning message
4. WHEN a user exceeds their daily limit, THE Rate_Limiter SHALL block new AI generation requests
5. THE Rate_Limiter SHALL allow unlimited access to cached content regardless of limits
6. THE System SHALL provide administrators with a dashboard showing per-user API usage statistics
7. THE Rate_Limiter SHALL exempt administrator accounts from rate limiting for testing purposes

### Requirement 19: Responsive Design and Accessibility

**User Story:** As a student using a mobile device, I want the platform to work well on my phone or tablet, so that I can learn anywhere.

#### Acceptance Criteria

1. THE System SHALL provide a responsive interface that adapts to screen sizes from 320px to 2560px width
2. THE System SHALL support touch gestures for navigation on mobile devices
3. THE System SHALL use readable font sizes of at least 16px on mobile devices
4. THE System SHALL provide sufficient touch target sizes of at least 44x44 pixels for interactive elements
5. THE System SHALL support keyboard navigation for all interactive features
6. THE System SHALL provide text alternatives for all non-text content
7. THE System SHALL maintain color contrast ratios of at least 4.5:1 for normal text

### Requirement 20: Monitoring and Observability

**User Story:** As a system administrator, I want to monitor system health and usage patterns, so that I can proactively address issues and optimize performance.

#### Acceptance Criteria

1. THE System SHALL log all API calls with timestamps, user IDs, and response times
2. THE System SHALL track cache hit rates for lessons, quizzes, and audio segments
3. THE System SHALL monitor external API response times and error rates
4. THE System SHALL track daily active users and lesson completion rates
5. THE System SHALL alert administrators when error rates exceed 5% over a 5-minute window
6. THE System SHALL provide a dashboard displaying key metrics: active users, cache hit rate, API costs, and error rate
7. THE System SHALL retain logs for 30 days for analysis and debugging

## Future Requirements (Phase 4+)

### Requirement 21: Multi-Language Support (English, French, Mauritian Creole)

**User Story:** As a student, I want to learn in my preferred language (English, French, or Mauritian Creole), so that I can understand concepts better in the language I'm most comfortable with.

#### Acceptance Criteria

1. THE System SHALL support content generation in three languages: English, French, and Mauritian Creole
2. WHEN a user selects a language preference, THE System SHALL generate all lesson content in that language
3. THE System SHALL cache lessons separately for each language using language code in content hash
4. THE Voice_Synthesizer SHALL support voice narration in all three languages
5. THE System SHALL use language-specific voices that sound natural for each language
6. WHEN switching languages, THE System SHALL preserve user progress across all languages
7. THE System SHALL allow users to change their language preference at any time
8. THE System SHALL support mixing languages within a session (e.g., view lesson in French, take quiz in English)

**Technical Feasibility:** ✅ Highly Feasible
- Google Gemini supports multilingual content generation
- ElevenLabs supports English and French voices natively
- Mauritian Creole can be handled by:
  - Using French voices with Creole text (phonetically similar)
  - Training custom voice models if budget allows
  - Using multilingual models that can adapt to Creole
- Cache keys would include language code: `lesson:{subtopicId}:{grade}:{promptVersion}:{lang}`
- Estimated cost increase: 3x storage (one cache per language), but generation only happens once per language

### Requirement 22: Interactive Q&A with Text and Voice Input

**User Story:** As a student, I want to ask questions about the lesson using text or voice in my preferred language, so that I can get immediate clarification on concepts I don't understand.

#### Acceptance Criteria

1. THE System SHALL provide a question input interface on every lesson page
2. WHEN a student types a question, THE System SHALL use AI to generate a contextual answer based on the lesson content
3. WHEN a student clicks the voice input button, THE System SHALL record audio and transcribe it to text
4. THE System SHALL support voice input in English, French, and Mauritian Creole
5. THE System SHALL use speech-to-text API to transcribe voice questions accurately
6. THE System SHALL maintain conversation context for follow-up questions within a lesson session
7. THE System SHALL generate answers that reference specific parts of the lesson
8. THE System SHALL cache common questions and answers to reduce API costs
9. THE System SHALL limit students to 20 questions per day to control costs
10. THE System SHALL provide voice output for answers if the question was asked via voice

**Technical Feasibility:** ✅ Feasible with Considerations
- Text Q&A: Straightforward with Gemini using lesson context in prompt
- Voice Input: 
  - Google Cloud Speech-to-Text supports English and French
  - Mauritian Creole transcription is challenging (limited training data)
  - Workaround: Use French STT model, which may work reasonably well for Creole
  - Alternative: OpenAI Whisper has better multilingual support including low-resource languages
- Conversation Context: Maintain session history in Redis (last 5 Q&A pairs)
- Cost Control: Critical - each question = 1 AI call + potential STT call + potential TTS call
- Estimated cost per question: $0.01-0.03 depending on length
- With 1000 students × 20 questions/day = 20,000 questions/day = $200-600/day (needs aggressive caching)

### Requirement 23: AI Avatar with Lip-Sync

**User Story:** As a student, I want to see an AI tutor avatar that speaks with synchronized lip movements, so that the learning experience feels more engaging and human-like.

#### Acceptance Criteria

1. THE System SHALL display an AI avatar on the lesson page
2. WHEN audio narration plays, THE Avatar SHALL display lip-sync animation matching the speech
3. THE Avatar SHALL display appropriate facial expressions (neutral, encouraging, thinking)
4. THE System SHALL support avatar customization (gender, appearance) based on user preference
5. THE Avatar SHALL be optimized for low-bandwidth connections (< 2MB video file)
6. THE System SHALL cache avatar videos with the same deduplication strategy as audio
7. THE Avatar SHALL work on mobile devices without performance issues

**Technical Feasibility:** ✅ Feasible but Expensive
- Technology Options:
  1. **D-ID** (Recommended for MVP)
     - API-based avatar generation with lip-sync
     - Input: Audio file → Output: Video with talking avatar
     - Cost: ~$0.10-0.30 per minute of video
     - Pros: Easy integration, good quality, multiple avatars
     - Cons: Expensive at scale, requires video streaming
  
  2. **HeyGen**
     - Similar to D-ID, slightly different pricing
     - Good quality, multiple avatar options
  
  3. **Synthesia**
     - Enterprise-focused, higher quality
     - More expensive, better for professional content
  
  4. **Open Source: SadTalker / Wav2Lip**
     - Free but requires GPU infrastructure
     - Self-hosted = more control but more complexity
     - Quality varies, needs fine-tuning

- Implementation Strategy:
  - Generate avatar video for each audio segment
  - Store videos in B2 storage alongside audio
  - Serve via CDN for fast delivery
  - Cache aggressively (same segment = same video)
  - Estimated cost: 3-5x audio generation cost
  - For 1000 lessons × 3 segments × 2 min each = 6000 minutes = $600-1800 one-time generation

### Requirement 24: Animated Concept Explanations

**User Story:** As a student, I want to see animated diagrams and visualizations while learning concepts, so that I can understand abstract ideas more easily through visual representation.

#### Acceptance Criteria

1. THE System SHALL generate or display animated diagrams for visual concepts
2. WHEN explaining algorithms, THE System SHALL show step-by-step animated execution
3. WHEN explaining data structures, THE System SHALL show animated insertions, deletions, and traversals
4. WHEN explaining mathematical concepts, THE System SHALL show animated graphs and transformations
5. THE System SHALL synchronize animations with voice narration timing
6. THE System SHALL allow students to pause, replay, and control animation speed
7. THE System SHALL work on mobile devices without requiring high-end hardware

**Technical Feasibility:** ⚠️ Feasible but Complex
- Technology Options:
  1. **Manim (Mathematical Animation Engine)** - Used by 3Blue1Brown
     - Python library for programmatic animations
     - Excellent for math and CS concepts
     - Requires rendering infrastructure
     - Can generate MP4 videos
  
  2. **D3.js / React + Framer Motion**
     - Client-side animations in browser
     - Interactive and responsive
     - Requires manual animation design per concept
     - No AI generation (yet)
  
  3. **AI-Generated Animations** (Emerging)
     - Tools like Runway ML, Pika Labs
     - Still experimental for educational content
     - Not reliable enough for production
  
  4. **Hybrid Approach** (Recommended)
     - Pre-built animation templates for common concepts
     - AI generates parameters for animations
     - Example: AI says "show binary search on array [1,3,5,7,9] searching for 5"
     - Template renders animation with those parameters

- Implementation Strategy:
  - Phase 1: Static diagrams generated by AI (using DALL-E or similar)
  - Phase 2: Pre-built animation library for common CS concepts
  - Phase 3: AI-driven parameter generation for animations
  - Phase 4: Full AI-generated animations (when technology matures)

- Cost Considerations:
  - Static diagrams: ~$0.02-0.04 per image (DALL-E)
  - Pre-built animations: Development time only, no per-use cost
  - AI-generated animations: Not yet cost-effective

## Future Requirements Summary

| Feature | Feasibility | Estimated Cost Impact | Recommended Phase |
|---------|-------------|----------------------|-------------------|
| Multi-language (Text) | ✅ High | 3x storage, minimal generation cost | Phase 4 |
| Multi-language (Voice) | ✅ High | 3x audio storage + generation | Phase 4 |
| Text Q&A | ✅ High | Moderate (with caching) | Phase 4 |
| Voice Input Q&A | ⚠️ Medium | High (STT + AI + TTS per question) | Phase 5 |
| AI Avatar | ✅ Medium | High (video generation + storage) | Phase 5 |
| Animated Concepts | ⚠️ Medium | Low-Medium (hybrid approach) | Phase 5-6 |

## Cost Estimation for Future Features

**Assumptions:** 1000 active students, 500 lessons

### Multi-Language Support
- Storage: 3x current (English, French, Creole)
- Generation: One-time per language = 3x initial generation cost
- Estimated: $300-500 one-time, minimal ongoing

### Interactive Q&A
- With aggressive caching (80% hit rate):
  - 1000 students × 20 questions/day × 20% miss rate = 4000 AI calls/day
  - Cost: $40-120/day = $1200-3600/month
- Mitigation: Cache common questions, limit to 10 questions/day initially

### AI Avatar
- One-time generation: 500 lessons × 3 segments × 2 min = 3000 minutes
- Cost: $300-900 one-time
- Storage: ~50GB video (B2: $0.25/month)
- CDN bandwidth: Depends on usage, but cached at edge

### Animated Concepts
- Hybrid approach: Development time + minimal per-use cost
- Static diagrams: 500 lessons × 3 diagrams = 1500 images = $30-60 one-time

**Total Estimated Additional Cost:**
- One-time: $630-1460
- Monthly: $1200-3600 (mostly Q&A if not well-cached)

## Technical Recommendations

1. **Start with Multi-Language Text** (Phase 4)
   - Lowest cost, highest impact for Mauritius
   - Easy to implement with existing architecture
   - Just add language parameter to prompts

2. **Add Multi-Language Voice** (Phase 4)
   - Natural extension of text support
   - ElevenLabs supports French, can approximate Creole
   - 3x storage but manageable with B2

3. **Implement Text Q&A** (Phase 4)
   - High value for learning outcomes
   - Manageable cost with good caching strategy
   - Start with 10 questions/day limit

4. **Add Voice Input** (Phase 5)
   - After text Q&A is proven valuable
   - Use OpenAI Whisper for better Creole support
   - More expensive, so validate demand first

5. **Integrate AI Avatar** (Phase 5)
   - After core features are stable
   - Use D-ID for quick implementation
   - Consider open-source if budget is tight

6. **Develop Animated Concepts** (Phase 5-6)
   - Start with static diagrams (Phase 5)
   - Build animation template library (Phase 6)
   - Wait for AI animation tech to mature before full automation

## Mauritian Creole Specific Considerations

**Challenge:** Mauritian Creole is a low-resource language with limited AI training data.

**Solutions:**
1. **Text Generation:** 
   - Gemini can generate Creole with proper prompting
   - May need examples in prompts for better quality
   - Consider having native speakers review initial outputs

2. **Voice Synthesis:**
   - Use French voice models (Creole is French-based)
   - Pronunciation will be ~80% accurate
   - Consider custom voice training if budget allows (ElevenLabs supports this)

3. **Speech Recognition:**
   - Use OpenAI Whisper (better for low-resource languages)
   - Alternatively, use French STT and accept some errors
   - Consider fine-tuning Whisper on Creole data if available

4. **Quality Assurance:**
   - Partner with local educators to review Creole content
   - Build feedback mechanism for students to report language issues
   - Iterate based on real usage data
