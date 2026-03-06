# Implementation Plan: AI Tutor Mauritius

## Overview

This implementation plan breaks down the AI Tutor Mauritius system into three phases: MVP (Minimum Viable Product), Enhancement, and Advanced Features. The MVP focuses on core functionality needed for students to access lessons and track basic progress. Enhancement adds voice narration, quizzes, and analytics. Advanced Features include multi-subject support, provider abstraction, and comprehensive monitoring.

The system uses TypeScript with Next.js for the full-stack application, PostgreSQL for persistent storage, Redis for caching, and integrates with Google Gemini (AI) and ElevenLabs (TTS) APIs.

## Phase 1: MVP - Core Learning Platform

### 1. Project Setup and Infrastructure

- [x] 1.1 Initialize Next.js project with TypeScript and configure build tools
  - Set up Next.js 14 with App Router
  - Configure TypeScript with strict mode
  - Set up ESLint and Prettier
  - Configure Tailwind CSS for styling
  - Set up environment variable management
  - _Requirements: 13.1, 19.1_

- [x] 1.2 Set up PostgreSQL database with Prisma ORM
  - Install Prisma and initialize project
  - Configure Prisma schema with PostgreSQL datasource
  - Set up connection pooling in Prisma
  - Configure Prisma Client generation
  - Install Prisma Studio for database GUI
  - _Requirements: 13.4, 12.1_

- [x] 1.3 Set up Redis for caching and session management
  - Install and configure ioredis library
  - Create Redis client with connection pooling
  - Configure Redis connection retry logic
  - Set up Redis key naming conventions
  - _Requirements: 7.1, 1.6_

- [x]* 1.4 Set up property-based testing with fast-check
  - Install fast-check and Jest
  - Configure Jest for TypeScript
  - Create test utilities and generators
  - Set up test database for integration tests
  - _Requirements: Testing Strategy_

### 2. Database Schema and Models

- [x] 2.1 Create Prisma schema for users and sessions
  - Define User model without password field
  - Add auth_provider and google_id fields
  - Define Session model
  - Add indexes for email and google_id
  - Generate Prisma Client
  - _Requirements: 1.1, 1.2, 1.6_

- [x]* 2.2 Write property test for user registration
  - **Property 1: User Registration Creates Account**
  - **Validates: Requirements 1.1**

- [x] 2.3 Create Prisma schema for curriculum_nodes with materialized paths
  - Define CurriculumNode model with path field
  - Add self-referential parent-child relationship
  - Add indexes for path, parent_id, and level
  - Add check constraints for level and node_type
  - Run migration
  - _Requirements: 2.1, 9.1_

- [x]* 2.4 Write property test for tree navigation
  - **Property 8: Tree Navigation Returns Correct Children**
  - **Validates: Requirements 2.2, 2.3, 2.4, 2.5**

- [x] 2.5 Create Prisma schema for lessons and prompt_templates
  - Define PromptTemplate model with versioning
  - Define Lesson model with content_hash
  - Add indexes for content_hash and subtopic_id
  - Run migration
  - _Requirements: 3.1, 3.3, 8.1, 8.2_

- [ ]* 2.6 Write property test for content hash consistency
  - **Property 24: Content Hash Consistency**
  - **Validates: Requirements 7.3**


### 3. Authentication Service with OTP

- [x] 3.1 Set up Brevo API integration for email sending
  - Install Brevo SDK (@getbrevo/brevo or @sendinblue/client)
  - Configure Brevo API key from environment
  - Create email template for OTP
  - Implement sendEmail function
  - _Requirements: 1.2_

- [x] 3.2 Implement user registration without password
  - Create UserRegistration interface and validation
  - Create user record in database using Prisma
  - Set auth_provider to 'otp'
  - Handle duplicate email errors
  - _Requirements: 1.1_

- [x]* 3.3 Write property test for user registration
  - **Property 1: User Registration Creates Account**
  - **Validates: Requirements 1.1**

- [x] 3.4 Implement OTP generation and sending
  - Generate 6-digit random OTP
  - Store OTP in Redis with 10-minute TTL
  - Send OTP via Brevo email
  - Implement rate limiting (3 OTPs per hour per email)
  - Return OTPResponse with expiry time
  - _Requirements: 1.2, 1.5_

- [x]* 3.5 Write property test for OTP rate limiting
  - Test that 4th OTP request within 1 hour is blocked
  - **Validates: Requirements 1.5**

- [x] 3.6 Implement OTP verification and session creation
  - Retrieve OTP from Redis by email
  - Compare submitted OTP with stored OTP
  - Check if OTP has expired
  - On success, create session token
  - Store session in Redis with 24-hour TTL
  - Delete OTP from Redis after successful verification
  - Return session object
  - _Requirements: 1.2, 1.3, 1.6_

- [x]* 3.7 Write property test for OTP expiration
  - Test that OTP older than 10 minutes is rejected
  - **Validates: Requirements 1.3**

- [x] 3.8 Implement session validation middleware
  - Extract session token from request headers or cookies
  - Validate token against Redis
  - Check session expiration
  - Fetch user from database using Prisma
  - Attach user object to request
  - _Requirements: 1.6_

- [x]* 3.9 Write property test for session expiration
  - **Property 6: Session Expiration**
  - **Validates: Requirements 1.6**

- [x] 3.10 Implement logout functionality
  - Delete session from Redis
  - Return success response
  - _Requirements: 1.7_

- [x]* 3.11 Write property test for logout invalidation
  - **Property 7: Logout Invalidates Session**
  - **Validates: Requirements 1.7**

- [x]* 3.12 Write property test for minimal data collection
  - **Property 4: Minimal Data Collection for Minors**
  - **Validates: Requirements 1.4, 11.1**

### 4. Curriculum Navigator

- [x] 4.1 Implement CurriculumNavigator with Prisma
  - Create CurriculumNode interface
  - Implement getGrades() using Prisma with path filtering
  - Implement getSubjects(gradeId) with path filtering
  - Implement getSections(subjectId) with path filtering
  - Implement getTopics(sectionId) with path filtering
  - Implement getSubtopics(topicId) with path filtering
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4.2 Implement getNodeByPath for direct node retrieval
  - Parse materialized path
  - Query database using Prisma findUnique
  - Return node or null
  - _Requirements: 2.1_

- [x]* 4.3 Write unit tests for curriculum navigation edge cases
  - Test empty curriculum tree
  - Test single-node tree
  - Test deep nesting beyond 5 levels
  - _Requirements: 2.1, 9.5_

- [x] 4.4 Create curriculum seeding script for Computer Science using Prisma
  - Define Grade 7-13 structure
  - Define Computer Science subject hierarchy
  - Implement idempotent seeding logic using upsert
  - Add validation after seeding
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [x]* 4.5 Write property test for seeding idempotency
  - **Property 55: Seeding Script Idempotency**
  - **Validates: Requirements 17.4**


### 5. Cache Manager

- [x] 5.1 Implement CacheManager interface with Redis operations
  - Implement get<T>(key: string) with JSON deserialization
  - Implement set<T>(key, value, ttl) with JSON serialization
  - Implement delete(key) for cache invalidation
  - Implement exists(key) for cache checking
  - Implement computeHash(data) using SHA-256
  - _Requirements: 7.1, 7.3_

- [x] 5.2 Implement cache key naming conventions
  - Define key patterns for lessons, quizzes, sessions
  - Implement key generation functions
  - Document key structure
  - _Requirements: 7.1_

- [x]* 5.3 Write property test for cache operations
  - Test set then get returns same value
  - Test TTL expiration
  - Test delete removes key
  - _Requirements: 7.1_

### 6. AI Provider Abstraction

- [x] 6.1 Create AIProvider interface and configuration
  - Define AIProvider interface with generateContent method
  - Define GenerationConfig interface
  - Define ProviderCapabilities interface
  - Create provider factory based on environment config
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 6.2 Implement GeminiProvider class
  - Install @google/generative-ai package
  - Implement generateContent using Gemini API
  - Implement getName() and getCapabilities()
  - Handle API errors and retries
  - _Requirements: 3.2, 10.4_

- [ ]* 6.3 Write property test for provider response normalization
  - **Property 32: AI Provider Response Normalization**
  - **Validates: Requirements 10.5**


### 7. Content Generator

- [x] 7.1 Create prompt templates for lesson generation
  - Design lesson generation prompt structure
  - Include grade-level adaptation instructions
  - Include output format specifications
  - Store initial prompt template in database (version 1)
  - _Requirements: 3.1, 3.3, 8.2_

- [x] 7.2 Implement ContentGenerator.generateLesson()
  - Create LessonRequest and Lesson interfaces
  - Compute content hash from request parameters
  - Check cache for existing lesson
  - If cache miss, check database
  - If database miss, call AI provider with prompt
  - Parse AI response into Lesson structure
  - Store in database and cache
  - _Requirements: 3.1, 3.5, 3.6, 7.3_

- [ ]* 7.3 Write property test for lesson structure completeness
  - **Property 9: Lesson Structure Completeness**
  - **Validates: Requirements 3.1**

- [ ]* 7.4 Write property test for cache hit avoids regeneration
  - **Property 12: Cache Hit Avoids Regeneration**
  - **Validates: Requirements 3.6**

- [x] 7.5 Implement lesson content parser
  - Parse AI response into structured components
  - Extract explanation, examples, key_points, practice_questions
  - Handle markdown formatting
  - Validate all required components present
  - _Requirements: 14.1, 14.2, 14.6_

- [ ]* 7.6 Write property test for lesson validation
  - **Property 46: Lesson Validation Before Caching**
  - **Validates: Requirements 14.6**

- [ ]* 7.7 Write property test for minimum practice questions
  - **Property 13: Minimum Practice Questions**
  - **Validates: Requirements 4.1**


### 8. Progress Tracker (Basic)

- [x] 8.1 Create database migration for progress table
  - Write migration for progress table
  - Add unique constraint on (user_id, lesson_id)
  - Add indexes for user_id and completed_at
  - _Requirements: 6.1_

- [x] 8.2 Implement ProgressTracker.recordLessonCompletion()
  - Create progress record with user_id, lesson_id, timestamp
  - Handle duplicate completion attempts (idempotent)
  - _Requirements: 6.1_

- [ ]* 8.3 Write property test for lesson completion recording
  - **Property 20: Lesson Completion Recording**
  - **Validates: Requirements 6.1**

- [x] 8.4 Implement ProgressTracker.getProgress() for basic metrics
  - Calculate completion percentage for a curriculum node
  - Count lessons completed vs total lessons
  - _Requirements: 6.3_

- [ ]* 8.5 Write property test for completion percentage
  - **Property 21: Completion Percentage Calculation**
  - **Validates: Requirements 6.3**

### 9. API Routes - Authentication

- [x] 9.1 Create POST /api/auth/register endpoint
  - Validate request body (name, email, grade)
  - Call AuthenticationService.register()
  - Return user object
  - Handle validation errors
  - _Requirements: 1.1_

- [x] 9.2 Create POST /api/auth/send-otp endpoint
  - Validate email format
  - Check rate limiting (3 per hour)
  - Call AuthenticationService.sendOTP()
  - Return success response with expiry time
  - Handle rate limit errors
  - _Requirements: 1.2, 1.5_

- [x] 9.3 Create POST /api/auth/verify-otp endpoint
  - Validate email and OTP format
  - Call AuthenticationService.verifyOTP()
  - Set session cookie (httpOnly, secure, sameSite)
  - Return session token
  - Handle invalid OTP errors
  - _Requirements: 1.2, 1.3, 1.4_

- [x] 9.4 Create POST /api/auth/logout endpoint
  - Extract session token from cookies
  - Call AuthenticationService.logout()
  - Clear session cookie
  - Return success response
  - _Requirements: 1.7_


### 10. API Routes - Curriculum and Lessons

- [x] 10.1 Create GET /api/curriculum/grades endpoint
  - Call CurriculumNavigator.getGrades()
  - Return grades array
  - _Requirements: 2.2_

- [x] 10.2 Create GET /api/curriculum/:nodeId/children endpoint
  - Extract nodeId from params
  - Determine node type and call appropriate navigator method
  - Return children array
  - _Requirements: 2.3, 2.4, 2.5_

- [x] 10.3 Create GET /api/lessons/:subtopicId endpoint with authentication
  - Apply session validation middleware
  - Extract subtopicId and grade from request
  - Call ContentGenerator.generateLesson()
  - Return lesson object
  - Handle errors with fallback to cache
  - _Requirements: 3.1, 3.5, 3.6, 12.1_

- [x] 10.4 Create POST /api/progress/lessons/:lessonId/complete endpoint
  - Apply session validation middleware
  - Extract lessonId and userId from request
  - Call ProgressTracker.recordLessonCompletion()
  - Return success response
  - _Requirements: 6.1_

- [x] 10.5 Create GET /api/progress endpoint
  - Apply session validation middleware
  - Extract userId from session
  - Call ProgressTracker.getProgress() for user's subjects
  - Return progress summary
  - _Requirements: 6.3_

### 11. Frontend - Authentication Pages

- [x] 11.1 Create registration page with form validation
  - Build registration form with name, email, grade fields (no password)
  - Implement client-side validation
  - Call POST /api/auth/register
  - Handle success and error states
  - Redirect to OTP verification on success
  - _Requirements: 1.1_

- [x] 11.2 Create OTP request page
  - Build form with email input
  - Call POST /api/auth/send-otp
  - Display success message with expiry time
  - Show rate limit warnings if applicable
  - Redirect to OTP verification page
  - _Requirements: 1.2, 1.5_

- [x] 11.3 Create OTP verification page
  - Build form with 6-digit OTP input
  - Add auto-focus and auto-submit on 6 digits
  - Call POST /api/auth/verify-otp
  - Store session token in httpOnly cookie
  - Redirect to dashboard on success
  - Display error messages for invalid/expired OTP
  - Add "Resend OTP" button with countdown timer
  - _Requirements: 1.2, 1.3, 1.4_

- [x] 11.4 Implement logout functionality in navigation
  - Add logout button to navigation bar
  - Call POST /api/auth/logout
  - Clear session cookie
  - Redirect to login page
  - _Requirements: 1.7_

### 12. Frontend - Curriculum Navigation

- [x] 12.1 Create curriculum browser component with tree navigation
  - Fetch grades from GET /api/curriculum/grades
  - Display grade selection interface
  - Implement expandable tree for subjects, sections, topics, subtopics
  - Fetch children on node expansion
  - Handle loading and error states
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 12.2 Create lesson viewer component
  - Fetch lesson from GET /api/lessons/:subtopicId
  - Display explanation with formatting
  - Display examples in structured format
  - Display key points as bullet list
  - Display practice questions with solutions
  - Add "Mark as Complete" button
  - _Requirements: 3.1, 4.1_

- [x] 12.3 Implement lesson completion tracking in UI
  - Call POST /api/progress/lessons/:lessonId/complete on button click
  - Update UI to show completion status
  - Display success message
  - _Requirements: 6.1_


### 13. Frontend - Progress Dashboard

- [x] 13.1 Create progress dashboard page
  - Fetch progress from GET /api/progress
  - Display completion percentage per subject
  - Display list of completed lessons
  - Show total lessons completed count
  - _Requirements: 6.3_

- [x] 13.2 Implement responsive design for mobile devices
  - Apply Tailwind responsive classes
  - Test on mobile viewport (320px-768px)
  - Ensure touch targets are at least 44x44px
  - Use minimum 16px font size
  - _Requirements: 19.1, 19.2, 19.3, 19.4_

### 14. Error Handling and Resilience

- [x] 14.1 Implement retry logic with exponential backoff for AI provider
  - Add retry wrapper around AI provider calls
  - Implement exponential backoff (1s, 2s, 4s)
  - Maximum 3 retry attempts
  - Log all retry attempts
  - _Requirements: 12.4_

- [x] 14.2 Implement cache fallback for API failures
  - Wrap AI provider calls in try-catch
  - On error, check cache for existing content
  - Return cached content if available
  - Return user-friendly error if no cache
  - _Requirements: 12.1, 12.2_

- [ ]* 14.3 Write property test for API failure fallback
  - **Property 35: API Failure Falls Back to Cache**
  - **Validates: Requirements 12.1**

- [x] 14.4 Implement error logging service
  - Create error logger with context capture
  - Log timestamp, error message, stack trace, user context
  - Store logs in database or external service
  - _Requirements: 12.3_


### 15. Interactive AI Tutor Chat System

- [ ] 15.1 Create database migration for chat_conversations and chat_messages tables
  - Write migration for chat_conversations table (user_id, lesson_id, started_at)
  - Write migration for chat_messages table (conversation_id, role, content, timestamp)
  - Add indexes for user_id, lesson_id, conversation_id
  - _Requirements: Interactive Learning_

- [ ] 15.2 Implement ChatService for conversation management
  - Create startConversation(userId, lessonId) method
  - Create addMessage(conversationId, role, content) method
  - Create getConversationHistory(conversationId) method
  - Store conversation context in Redis for quick access
  - _Requirements: Interactive Learning_

- [ ] 15.3 Implement AI chat response generation
  - Create chat prompt template with lesson context
  - Include lesson content in system prompt
  - Implement generateChatResponse(conversationId, userQuestion) method
  - Maintain conversation history for context
  - Handle follow-up questions intelligently
  - _Requirements: Interactive Learning_

- [ ] 15.4 Implement voice input for questions
  - Integrate Web Speech API for voice recognition
  - Add microphone button to chat interface
  - Convert speech to text
  - Send text to chat service
  - Handle voice input errors gracefully
  - _Requirements: Interactive Learning, Accessibility_

- [ ] 15.5 Implement voice output for AI responses
  - Use existing TTS service for AI responses
  - Add auto-play option for responses
  - Add manual play button for each response
  - Sync with text display
  - _Requirements: Interactive Learning, Accessibility_

- [ ] 15.6 Create API routes for chat functionality
  - POST /api/chat/conversations - Start new conversation
  - POST /api/chat/conversations/:id/messages - Send message
  - GET /api/chat/conversations/:id - Get conversation history
  - Apply rate limiting (50 messages per day per user)
  - _Requirements: Interactive Learning_

- [ ] 15.7 Create chat interface component
  - Build chat UI with message bubbles
  - Display user messages on right, AI on left
  - Add text input with send button
  - Add microphone button for voice input
  - Add speaker button for voice output
  - Show typing indicator while AI responds
  - Display conversation history
  - _Requirements: Interactive Learning_

- [ ] 15.8 Integrate chat into lesson viewer
  - Add "Ask Tutor" button/panel in lesson page
  - Open chat sidebar or modal
  - Pass lesson context to chat service
  - Allow asking questions about specific sections
  - Highlight relevant lesson sections based on questions
  - _Requirements: Interactive Learning_

- [ ] 15.9 Implement chat features for deeper understanding
  - "Explain this in simpler terms" quick action
  - "Give me an example" quick action
  - "Why is this important?" quick action
  - "How does this relate to [topic]?" quick action
  - Save helpful Q&A pairs for future reference
  - _Requirements: Interactive Learning_

- [ ] 15.10 Implement conversation analytics
  - Track most asked questions per lesson
  - Identify confusing topics based on questions
  - Use insights to improve lesson content
  - Display common questions to other students
  - _Requirements: Interactive Learning, Analytics_

### 16. Checkpoint - MVP Core Functionality

- [ ] 16.1 Run all tests and verify MVP features
  - Ensure all property tests pass
  - Ensure all unit tests pass
  - Test user registration and login flow
  - Test curriculum navigation
  - Test lesson generation and viewing
  - Test interactive chat functionality
  - Test voice input and output
  - Test progress tracking
  - Verify error handling works correctly
  - Ask the user if questions arise

## Phase 1.5: Critical User-Centric Features (MUST HAVE BEFORE LAUNCH)

### 17. Personalized Learning Paths

- [ ] 17.1 Create database migration for user learning profiles
  - Write migration for learning_profiles table (user_id, subject_id, skill_level, learning_style)
  - Write migration for topic_mastery table (user_id, topic_id, mastery_level, last_practiced)
  - Write migration for learning_goals table (user_id, goal_type, target_date, progress)
  - Add indexes for user_id, subject_id, topic_id
  - _Requirements: Personalization_

- [ ] 17.2 Implement diagnostic assessment system
  - Create diagnostic quiz generator (5-10 questions per subject)
  - Cover key topics across grade level
  - Adaptive difficulty based on answers
  - Calculate initial skill level (beginner/intermediate/advanced)
  - Store results in learning_profiles
  - _Requirements: Personalization_

- [ ] 17.3 Implement skill level tracking
  - Track mastery level per topic (0-100%)
  - Update based on lesson completion
  - Update based on quiz scores
  - Decay over time if not practiced
  - Calculate overall subject proficiency
  - _Requirements: Personalization_

- [ ] 17.4 Implement personalized recommendations engine
  - Analyze user's mastery levels
  - Identify knowledge gaps
  - Check prerequisites for topics
  - Recommend "what to learn next"
  - Suggest review topics
  - Prioritize based on curriculum sequence
  - _Requirements: Personalization_

- [ ] 17.5 Implement adaptive content difficulty
  - Adjust lesson complexity based on skill level
  - Generate easier/harder versions of content
  - Modify quiz difficulty dynamically
  - Provide scaffolding for struggling students
  - Offer challenges for advanced students
  - _Requirements: Personalization_

- [ ] 17.6 Create API routes for personalization
  - POST /api/learning/diagnostic - Start diagnostic assessment
  - GET /api/learning/recommendations - Get personalized recommendations
  - GET /api/learning/profile - Get user learning profile
  - PUT /api/learning/goals - Set learning goals
  - _Requirements: Personalization_

- [ ] 17.7 Create personalized dashboard UI
  - Display "Recommended for You" section
  - Show skill levels per topic (visual progress bars)
  - Display learning goals and progress
  - Show "Continue Learning" suggestions
  - Highlight weak areas needing review
  - _Requirements: Personalization_

### 18. Offline Mode & Progressive Web App

- [ ] 18.1 Configure Next.js as Progressive Web App
  - Add service worker configuration
  - Create manifest.json with app metadata
  - Configure caching strategies
  - Add offline fallback page
  - Test PWA installation
  - _Requirements: Accessibility, Offline_

- [ ] 18.2 Implement offline content storage
  - Use IndexedDB for lesson storage
  - Store downloaded lessons locally
  - Store quiz data for offline taking
  - Implement storage quota management
  - Add "Download for Offline" button
  - _Requirements: Offline_

- [ ] 18.3 Implement offline sync mechanism
  - Queue actions when offline (quiz submissions, progress updates)
  - Detect when connection restored
  - Sync queued actions to server
  - Handle sync conflicts
  - Show sync status to user
  - _Requirements: Offline_

- [ ] 18.4 Implement low-bandwidth mode
  - Compress images and assets
  - Lazy load non-critical content
  - Reduce API payload sizes
  - Show data usage estimates
  - Allow user to toggle low-bandwidth mode
  - _Requirements: Accessibility_

- [ ] 18.5 Create offline UI indicators
  - Show offline status banner
  - Indicate which content is available offline
  - Show download progress
  - Display storage usage
  - Warn before running out of storage
  - _Requirements: Offline_

### 19. Content Quality Assurance System

- [ ] 19.1 Create database migration for content review
  - Write migration for content_reviews table (content_id, reviewer_id, status, feedback)
  - Write migration for content_errors table (content_id, user_id, error_type, description)
  - Add indexes for content_id, status
  - _Requirements: Quality, Trust_

- [ ] 19.2 Implement content review workflow
  - Flag new AI-generated content for review
  - Create review queue for admins/experts
  - Implement approval/rejection workflow
  - Track review history
  - Version content with reviews
  - _Requirements: Quality_

- [ ] 19.3 Implement error reporting system
  - Add "Report Error" button on lessons
  - Categorize error types (factual, grammar, unclear, etc.)
  - Allow users to suggest corrections
  - Track error reports per content
  - Notify admins of high-error content
  - _Requirements: Quality_

- [ ] 19.4 Implement automated content validation
  - Check for required sections
  - Validate JSON structure
  - Check content length limits
  - Detect potentially harmful content
  - Flag for human review if suspicious
  - _Requirements: Quality_

- [ ] 19.5 Create content quality dashboard
  - Show pending reviews
  - Display error reports
  - Track content quality metrics
  - Identify problematic topics
  - Monitor AI accuracy over time
  - _Requirements: Quality_

- [ ] 19.6 Create API routes for content QA
  - POST /api/content/report-error - Report content error
  - GET /api/content/reviews/pending - Get pending reviews (admin)
  - PUT /api/content/reviews/:id/approve - Approve content (admin)
  - PUT /api/content/reviews/:id/reject - Reject content (admin)
  - _Requirements: Quality_

### 20. Parent Dashboard & Monitoring

- [ ] 20.1 Create database migration for parent accounts
  - Write migration for parent_accounts table (parent_id, email, name)
  - Write migration for parent_student_links table (parent_id, student_id, relationship)
  - Add indexes for parent_id, student_id
  - _Requirements: Parental Involvement_

- [ ] 20.2 Implement parent account creation
  - Allow students to invite parents
  - Send invitation email with secure link
  - Parent creates account (separate from student)
  - Link parent to student account
  - Support multiple children per parent
  - _Requirements: Parental Involvement_

- [ ] 20.3 Implement parent progress reports
  - Generate weekly progress summary
  - Include lessons completed, quiz scores, time spent
  - Highlight achievements and improvements
  - Identify struggling areas
  - Send via email automatically
  - _Requirements: Parental Involvement_

- [ ] 20.4 Create parent portal UI
  - Read-only view of student progress
  - View recent activity timeline
  - See quiz scores and trends
  - View time spent learning
  - See topics mastered vs struggling
  - Access progress reports
  - _Requirements: Parental Involvement_

- [ ] 20.5 Implement parent alerts
  - Alert when student inactive for 3+ days
  - Alert when quiz scores drop
  - Alert when student struggling with topic
  - Celebrate achievements (streak milestones, perfect scores)
  - Configurable alert preferences
  - _Requirements: Parental Involvement_

- [ ] 20.6 Create API routes for parent features
  - POST /api/parents/invite - Invite parent
  - GET /api/parents/students/:id/progress - Get student progress
  - GET /api/parents/students/:id/activity - Get recent activity
  - PUT /api/parents/alerts/preferences - Update alert settings
  - _Requirements: Parental Involvement_

### 21. Homework Helper System

- [ ] 21.1 Implement image upload for homework questions
  - Add image upload component
  - Support camera capture on mobile
  - Compress images before upload
  - Store in cloud storage (Backblaze B2)
  - Generate thumbnails
  - _Requirements: Homework Help_

- [ ] 21.2 Integrate OCR for text extraction
  - Use Tesseract.js or cloud OCR service
  - Extract text from homework images
  - Handle handwritten text (if possible)
  - Extract mathematical equations
  - Allow user to edit extracted text
  - _Requirements: Homework Help_

- [ ] 21.3 Implement step-by-step solution generation
  - Analyze homework question
  - Generate step-by-step solution
  - Explain reasoning for each step
  - Show worked examples
  - Provide similar practice problems
  - _Requirements: Homework Help_

- [ ] 21.4 Create homework history tracking
  - Store homework questions and solutions
  - Track homework completion
  - Allow reviewing past homework
  - Identify common homework topics
  - _Requirements: Homework Help_

- [ ] 21.5 Implement homework rate limiting
  - Limit to 10 homework questions per day
  - Show remaining questions
  - Reset at midnight
  - Premium users get more (future)
  - _Requirements: Homework Help_

- [ ] 21.6 Create API routes for homework help
  - POST /api/homework/upload - Upload homework image
  - POST /api/homework/solve - Get solution
  - GET /api/homework/history - Get past homework
  - _Requirements: Homework Help_

- [ ] 21.7 Create homework helper UI
  - "Homework Help" section in navigation
  - Upload/camera interface
  - OCR preview and editing
  - Solution display with steps
  - Similar problems section
  - Homework history view
  - _Requirements: Homework Help_

### 22. Exam Preparation Mode

- [ ] 22.1 Create database migration for exam data
  - Write migration for exams table (name, date, subject_id, exam_board)
  - Write migration for exam_topics table (exam_id, topic_id, weight)
  - Write migration for mock_exams table (user_id, exam_id, score, time_taken)
  - Add indexes for exam_id, user_id
  - _Requirements: Exam Prep_

- [ ] 22.2 Implement exam schedule management
  - Allow students to add upcoming exams
  - Set exam date and subject
  - Calculate days until exam
  - Show countdown on dashboard
  - Send reminders as exam approaches
  - _Requirements: Exam Prep_

- [ ] 22.3 Implement exam-focused content generation
  - Generate exam-style questions
  - Focus on high-weight topics
  - Include past exam patterns
  - Provide marking schemes
  - Generate exam tips
  - _Requirements: Exam Prep_

- [ ] 22.4 Implement timed mock exams
  - Create full-length practice exams
  - Enforce time limits
  - Simulate exam conditions
  - Auto-submit when time expires
  - Provide detailed results
  - _Requirements: Exam Prep_

- [ ] 22.5 Implement exam revision planner
  - Generate revision schedule
  - Prioritize weak topics
  - Allocate time based on topic weight
  - Track revision progress
  - Adjust plan based on performance
  - _Requirements: Exam Prep_

- [ ] 22.6 Create exam prep dashboard
  - Show upcoming exams
  - Display revision progress
  - Show mock exam scores
  - Highlight weak areas
  - Provide exam strategies
  - _Requirements: Exam Prep_

- [ ] 22.7 Create API routes for exam prep
  - POST /api/exams - Add upcoming exam
  - GET /api/exams/:id/revision-plan - Get revision plan
  - POST /api/exams/:id/mock - Start mock exam
  - GET /api/exams/:id/analytics - Get exam analytics
  - _Requirements: Exam Prep_

### 23. Checkpoint - Phase 1.5 Complete

- [ ] 23.1 Verify all Phase 1.5 features
  - Test personalized recommendations
  - Test offline mode and PWA
  - Test content quality reporting
  - Test parent dashboard
  - Test homework helper
  - Test exam prep mode
  - Verify all features work together
  - Ask the user if questions arise

## Phase 2: Enhancement - Quizzes, Voice, and Analytics

### 16. Quiz Generation and Evaluation

- [x] 16.1 Create database migration for quizzes and quiz_attempts tables
  - Write migration for quizzes table with content_hash
  - Write migration for quiz_attempts table
  - Add indexes for topic_id, user_id, quiz_id
  - _Requirements: 4.2, 4.5_

- [x] 16.2 Create prompt templates for quiz generation
  - Design quiz generation prompt structure
  - Include multiple-choice format specifications
  - Include difficulty level instructions
  - Store initial quiz prompt template (version 1)
  - _Requirements: 4.2_

- [x] 16.3 Implement ContentGenerator.generateQuiz()
  - Create QuizRequest and Quiz interfaces
  - Compute content hash from request parameters
  - Check cache for existing quiz
  - If cache miss, check database
  - If database miss, call AI provider with prompt
  - Parse AI response into Quiz structure
  - Store in database and cache
  - _Requirements: 4.2, 4.6_

- [ ]* 16.4 Write property test for quiz question count
  - **Property 14: Quiz Question Count Range**
  - **Validates: Requirements 4.2**


- [x] 16.5 Implement quiz evaluation logic
  - Create QuizAttempt and Answer interfaces
  - Compare submitted answers with correct answers
  - Calculate score as percentage
  - Generate feedback for each answer
  - Track time spent
  - _Requirements: 4.3, 4.4, 16.1, 16.2, 16.3, 16.4, 16.5_

- [ ]* 16.6 Write property test for quiz score calculation
  - **Property 50: Quiz Score Calculation**
  - **Validates: Requirements 16.1**

- [ ]* 16.7 Write property test for answer feedback completeness
  - **Property 16: Answer Feedback Completeness**
  - **Validates: Requirements 4.4, 16.2, 16.3**

- [x] 16.6 Implement ProgressTracker.recordQuizAttempt()
  - Store quiz attempt in database
  - Record score, answers, time_spent, timestamp
  - _Requirements: 4.5, 6.2_

- [ ]* 16.7 Write property test for quiz attempt persistence
  - **Property 17: Quiz Attempt Persistence**
  - **Validates: Requirements 4.5, 6.2**

- [ ] 16.8 Implement low score recommendations
  - Analyze incorrect answers
  - Identify related topics for review
  - Return recommendations when score < 60%
  - _Requirements: 16.7_

- [ ]* 16.9 Write property test for low score recommendations
  - **Property 54: Low Score Recommendations**
  - **Validates: Requirements 16.7**

### 17. Voice Narration System

- [x] 17.1 Create database migration for audio_segments table
  - Write migration with text_hash, audio_url, duration fields
  - Add index for text_hash
  - Add usage_count tracking field
  - _Requirements: 5.3, 5.6_


- [x] 17.2 Implement text segmentation for audio generation
  - Split lesson text into logical segments (100-300 words)
  - Segment by paragraphs and natural breaks
  - Compute hash for each segment
  - _Requirements: 5.3, 15.1_

- [ ]* 17.3 Write property test for audio segmentation size
  - **Property 18: Audio Segmentation Size**
  - **Validates: Requirements 5.3, 15.1**

- [ ] 17.4 Set up Backblaze B2 storage client
  - Install B2 SDK
  - Configure B2 credentials from environment
  - Implement upload function with proper naming
  - Set cache headers for 30-day CDN caching
  - _Requirements: 5.4, 15.4, 15.5_

- [x] 17.5 Implement VoiceSynthesizer with ElevenLabs integration
  - Install ElevenLabs SDK
  - Create VoiceSynthesizer interface
  - Implement synthesizeText() method
  - Check for existing audio by hash before generation
  - Upload generated audio to B2
  - Store metadata in database
  - Return audio URL
  - _Requirements: 5.2, 5.6, 15.2, 15.3_
  - NOTE: Currently using browser Speech Synthesis API as fallback

- [ ]* 17.6 Write property test for audio deduplication
  - **Property 19: Audio Deduplication**
  - **Validates: Requirements 5.6, 15.3**

- [ ]* 17.7 Write property test for audio hash consistency
  - **Property 47: Audio Hash Consistency**
  - **Validates: Requirements 15.2**

- [x] 17.8 Implement VoiceSynthesizer.synthesizeLesson()
  - Segment lesson text
  - Generate audio for each segment
  - Track usage count for reused segments
  - Return array of AudioSegment objects
  - _Requirements: 5.1, 5.3, 15.6_
  - NOTE: Currently using browser Speech Synthesis API


- [ ]* 17.9 Write property test for audio segment usage tracking
  - **Property 48: Audio Segment Usage Tracking**
  - **Validates: Requirements 15.6**

- [x] 17.10 Implement TTS failure graceful degradation
  - Wrap TTS calls in try-catch
  - Log errors but don't block lesson display
  - Return lesson without audio on TTS failure
  - _Requirements: 12.5_

- [ ]* 17.11 Write property test for TTS failure degradation
  - **Property 39: TTS Failure Graceful Degradation**
  - **Validates: Requirements 12.5**

### 18. Rate Limiting System

- [ ] 18.1 Implement RateLimiter with Redis counters
  - Create RateLimiter interface
  - Implement checkLimit() using Redis GET
  - Implement incrementUsage() using Redis INCR
  - Set TTL to expire at midnight Mauritius time (UTC+4)
  - Return LimitStatus with remaining count
  - _Requirements: 7.5, 7.6, 18.1, 18.2_

- [ ]* 18.2 Write property test for rate limiting enforcement
  - **Property 25: Rate Limiting Enforcement**
  - **Validates: Requirements 7.5, 7.6, 18.4**

- [ ] 18.3 Implement rate limit warning at 80% threshold
  - Check usage percentage in checkLimit()
  - Set warningThreshold flag when >= 80%
  - _Requirements: 18.3_

- [ ]* 18.4 Write property test for rate limit warning
  - **Property 58: Rate Limit Warning Threshold**
  - **Validates: Requirements 18.3**

- [ ] 18.5 Implement admin exemption from rate limits
  - Check user.is_admin flag in checkLimit()
  - Always return allowed=true for admins
  - _Requirements: 18.7_


- [ ]* 18.6 Write property test for admin rate limit exemption
  - **Property 60: Admin Rate Limit Exemption**
  - **Validates: Requirements 18.7**

- [ ] 18.7 Integrate rate limiter into content generation endpoints
  - Add rate limit check before AI provider calls
  - Increment counter after successful generation
  - Don't increment for cache hits
  - Return 429 error when limit exceeded
  - _Requirements: 7.5, 7.6, 7.7, 18.5_

- [ ]* 18.8 Write property test for cache bypass rate limits
  - **Property 59: Cache Access Bypasses Rate Limits**
  - **Validates: Requirements 18.5**

### 19. Enhanced Progress Tracking and Analytics

- [x] 19.1 Implement ProgressTracker.getAnalytics() for comprehensive metrics
  - Calculate total lessons completed
  - Calculate total quizzes taken
  - Calculate overall average score
  - Calculate learning streak
  - Aggregate progress by subject
  - Fetch recent activity
  - _Requirements: 6.3, 6.4, 6.5_

- [ ]* 19.2 Write property test for average score calculation
  - **Property 22: Average Score Calculation**
  - **Validates: Requirements 6.4**

- [ ]* 19.3 Write property test for learning streak calculation
  - **Property 23: Learning Streak Calculation**
  - **Validates: Requirements 6.5**

- [ ] 19.4 Implement ProgressTracker.getLearningStreak()
  - Query progress and quiz_attempts ordered by date
  - Count consecutive days with activity
  - Return streak count
  - _Requirements: 6.5_


### 20. API Routes - Quizzes and Audio

- [x] 20.1 Create GET /api/quizzes/:topicId endpoint
  - Apply session validation middleware
  - Apply rate limiting middleware
  - Extract topicId and grade from request
  - Call ContentGenerator.generateQuiz()
  - Return quiz object
  - _Requirements: 4.2_

- [x] 20.2 Create POST /api/quizzes/:quizId/submit endpoint
  - Apply session validation middleware
  - Extract quizId, answers, timeSpent from request
  - Evaluate quiz and calculate score
  - Generate feedback for each answer
  - Call ProgressTracker.recordQuizAttempt()
  - Return evaluation results
  - _Requirements: 4.3, 4.4, 4.5_

- [x] 20.3 Create GET /api/lessons/:lessonId/audio endpoint
  - Apply session validation middleware
  - Fetch lesson from database
  - Call VoiceSynthesizer.synthesizeLesson()
  - Return array of audio segment URLs
  - Handle TTS failures gracefully
  - _Requirements: 5.1, 5.7_
  - NOTE: Currently using browser Speech Synthesis API

- [x] 20.4 Create GET /api/progress/analytics endpoint
  - Apply session validation middleware
  - Extract userId from session
  - Call ProgressTracker.getAnalytics()
  - Return comprehensive analytics object
  - _Requirements: 6.3, 6.4, 6.5_

### 21. Frontend - Quiz Interface

- [x] 21.1 Create quiz component with question display
  - Fetch quiz from GET /api/quizzes/:topicId
  - Display questions one at a time or all at once
  - Implement multiple-choice selection
  - Track time spent
  - Add submit button
  - _Requirements: 4.2_


- [x] 21.2 Create quiz results component with feedback
  - Call POST /api/quizzes/:quizId/submit
  - Display score prominently
  - Show correct/incorrect indicators for each question
  - Display explanation for each answer
  - Show time taken
  - Display recommendations if score < 60%
  - Add "Review Topic" and "Try Again" buttons
  - _Requirements: 4.3, 4.4, 16.1, 16.2, 16.3, 16.4, 16.5, 16.7_

- [x] 21.3 Implement quiz history view
  - Fetch past quiz attempts from progress API
  - Display list of completed quizzes with scores
  - Allow viewing full results for any past quiz
  - _Requirements: 16.6_

- [ ]* 21.4 Write property test for quiz result persistence
  - **Property 53: Quiz Result Persistence and Retrieval**
  - **Validates: Requirements 16.6**

### 22. Frontend - Audio Player

- [x] 22.1 Create audio player component with controls
  - Fetch audio segments from GET /api/lessons/:lessonId/audio
  - Implement play/pause controls
  - Implement speed adjustment (0.75x, 1x, 1.25x, 1.5x)
  - Display loading state while generating audio
  - Handle audio generation failures gracefully
  - Implement lazy loading (don't fetch until user clicks play)
  - _Requirements: 5.1, 5.7, 13.5_
  - NOTE: Currently using browser Speech Synthesis API

- [x] 22.2 Integrate audio player into lesson viewer
  - Add audio player above lesson content
  - Sync audio playback with text highlighting (optional enhancement)
  - Show audio generation progress
  - _Requirements: 5.1_

### 23. Frontend - Enhanced Analytics Dashboard

- [x] 23.1 Enhance progress dashboard with comprehensive analytics
  - Fetch analytics from GET /api/progress/analytics
  - Display learning streak prominently
  - Display average quiz scores per subject
  - Show recent activity timeline
  - Add progress visualizations (charts/graphs)
  - Display completion percentages for all subjects
  - _Requirements: 6.3, 6.4, 6.5, 6.6_


- [ ] 23.2 Implement pagination for progress history
  - Display 20 items per page
  - Add pagination controls
  - Fetch paginated data from API
  - _Requirements: 13.7_

### 24. Rate Limiting UI Feedback

- [ ] 24.1 Display rate limit warnings in UI
  - Check rate limit status in API responses
  - Show warning banner when at 80% of limit
  - Display remaining generations count
  - Show reset time (midnight Mauritius time)
  - _Requirements: 7.7, 18.3_

- [ ] 24.2 Handle rate limit exceeded errors
  - Display friendly message explaining limits
  - Show cached content if available
  - Suggest trying again after reset time
  - _Requirements: 7.7_

### 25. Checkpoint - Enhancement Features Complete

- [ ] 25.1 Run all tests and verify enhancement features
  - Ensure all property tests pass
  - Test quiz generation and evaluation
  - Test voice narration generation and playback
  - Test rate limiting enforcement
  - Test enhanced analytics dashboard
  - Verify error handling for TTS failures
  - Ask the user if questions arise

## Phase 3: Advanced Features - Multi-Subject, Monitoring, and Optimization

### 26. Multi-Subject Support and Dynamic Curriculum

- [ ] 26.1 Create admin interface for curriculum management
  - Create admin authentication check
  - Build form for adding curriculum nodes
  - Implement addNode() in CurriculumNavigator
  - Validate parent paths before insertion
  - _Requirements: 9.2, 9.3_


- [ ]* 26.2 Write property test for dynamic curriculum availability
  - **Property 29: Dynamic Curriculum Availability**
  - **Validates: Requirements 9.3**

- [ ]* 26.3 Write property test for arbitrary tree depth
  - **Property 31: Arbitrary Tree Depth Support**
  - **Validates: Requirements 9.5**

- [ ] 26.4 Implement subject-specific prompt templates
  - Add subject_id field to prompt_templates
  - Modify getPromptVersion() to filter by subject
  - Update prompt selection logic in ContentGenerator
  - _Requirements: 9.4_

- [ ]* 26.5 Write property test for subject-specific prompts
  - **Property 30: Subject-Specific Prompt Association**
  - **Validates: Requirements 9.4**

- [ ] 26.6 Create seeding scripts for additional subjects
  - Create Mathematics curriculum structure
  - Create Science curriculum structure
  - Create English curriculum structure
  - Ensure idempotent seeding
  - _Requirements: 9.1, 9.3_

### 27. Prompt Versioning and Management

- [ ] 27.1 Create admin interface for prompt template management
  - Display list of prompt templates
  - Show version history for each template
  - Build form for creating new prompt versions
  - Implement version incrementing logic
  - _Requirements: 8.2, 8.3, 8.4_

- [ ]* 27.2 Write property test for prompt version incrementing
  - **Property 27: Prompt Version Incrementing**
  - **Validates: Requirements 8.3**

- [ ]* 27.3 Write property test for prompt version history
  - **Property 28: Prompt Version History Retention**
  - **Validates: Requirements 8.5**


- [ ] 27.4 Implement lesson regeneration with new prompt versions
  - Add regenerate endpoint for admins
  - Invalidate old cached content
  - Generate new lesson with updated prompt
  - Track which lessons use which prompt versions
  - _Requirements: 8.4_

- [ ]* 27.5 Write property test for content versioning
  - **Property 10: Content Versioning**
  - **Validates: Requirements 3.3, 8.1**

### 28. Monitoring and Observability

- [ ] 28.1 Create database migration for api_usage_logs table
  - Write migration with fields for operation, provider, tokens, response_time
  - Add indexes for user_id, created_at, operation
  - _Requirements: 20.1_

- [ ] 28.2 Implement API call logging service
  - Log all AI provider calls with metadata
  - Log all TTS provider calls with metadata
  - Record response times
  - Record success/failure status
  - _Requirements: 20.1, 20.3_

- [ ]* 28.3 Write property test for API call logging
  - **Property 61: API Call Logging**
  - **Validates: Requirements 20.1**

- [ ] 28.4 Implement cache hit rate tracking
  - Track cache hits and misses in Redis
  - Calculate hit rate percentage
  - Store metrics for dashboard display
  - _Requirements: 20.2_

- [ ]* 28.5 Write property test for cache hit rate tracking
  - **Property 62: Cache Hit Rate Tracking**
  - **Validates: Requirements 20.2**

- [ ] 28.6 Implement daily active user tracking
  - Track users who complete lessons or quizzes
  - Store daily counts in database
  - Calculate DAU metrics
  - _Requirements: 20.4_


- [ ]* 28.7 Write property test for daily active user tracking
  - **Property 63: Daily Active User Tracking**
  - **Validates: Requirements 20.4**

- [ ] 28.8 Implement error rate monitoring and alerting
  - Track error rates in 5-minute windows
  - Generate alerts when error rate > 5%
  - Send notifications to administrators
  - _Requirements: 20.5_

- [ ]* 28.9 Write property test for error rate alerting
  - **Property 64: Error Rate Alerting**
  - **Validates: Requirements 20.5**

- [ ] 28.10 Implement log retention policy
  - Create cleanup job for logs older than 30 days
  - Archive or delete old logs
  - Schedule job to run daily
  - _Requirements: 20.7_

- [ ]* 28.11 Write property test for log retention
  - **Property 65: Log Retention Period**
  - **Validates: Requirements 20.7**

### 29. Admin Dashboard

- [ ] 29.1 Create admin dashboard page with key metrics
  - Display active users count
  - Display cache hit rates
  - Display API usage statistics
  - Display error rates
  - Show cost estimates based on API usage
  - _Requirements: 20.6_

- [ ] 29.2 Create per-user API usage statistics view
  - Display usage by user
  - Show users approaching rate limits
  - Allow filtering and sorting
  - _Requirements: 18.6_

- [ ] 29.3 Implement admin tools for content management
  - View all generated lessons
  - Regenerate lessons with new prompts
  - View and manage prompt templates
  - Add/edit curriculum nodes
  - _Requirements: 8.4, 9.2_


### 30. Privacy and Data Protection

- [ ] 30.1 Implement account deletion functionality
  - Create DELETE /api/users/me endpoint
  - Remove personal data (name, email)
  - Anonymize progress records
  - Retain anonymized analytics
  - _Requirements: 11.6_

- [ ]* 30.2 Write property test for account deletion
  - **Property 34: Account Deletion Removes Personal Data**
  - **Validates: Requirements 11.6**

- [ ] 30.3 Implement secure session token handling
  - Set httpOnly flag on session cookies
  - Set secure flag for HTTPS
  - Set SameSite attribute
  - _Requirements: 11.4_

- [ ]* 30.4 Write property test for password hashing
  - **Property 33: Password Hashing with Bcrypt**
  - **Validates: Requirements 11.3**

### 31. Performance Optimization

- [ ] 31.1 Implement database query optimization
  - Add missing indexes based on query patterns
  - Optimize materialized path queries
  - Optimize progress aggregation queries
  - Use EXPLAIN ANALYZE to verify performance
  - _Requirements: 2.7, 13.2_

- [ ] 31.2 Implement response compression
  - Enable gzip compression for API responses
  - Configure compression middleware
  - Test compression on large responses
  - _Requirements: 13.6_

- [ ] 31.3 Implement CDN integration for static assets
  - Configure Cloudflare CDN
  - Set appropriate cache headers
  - Test CDN caching behavior
  - _Requirements: 7.2_

- [ ] 31.4 Implement pre-generation for popular topics
  - Identify top 20 most accessed topics
  - Create background job to pre-generate lessons
  - Schedule job during off-peak hours
  - _Requirements: 7.4_


### 32. Audio Segment Cleanup

- [ ] 32.1 Implement unused audio segment cleanup job
  - Query audio segments with usage_count = 0 and age > 90 days
  - Delete from B2 storage
  - Delete from database
  - Schedule job to run weekly
  - _Requirements: 15.7_

- [ ]* 32.2 Write property test for unused audio cleanup
  - **Property 49: Unused Audio Cleanup**
  - **Validates: Requirements 15.7**

### 33. Additional AI Provider Support

- [ ] 33.1 Implement OpenAIProvider class
  - Install OpenAI SDK
  - Implement AIProvider interface
  - Normalize responses to common format
  - Handle provider-specific errors
  - _Requirements: 10.1, 10.5_

- [ ] 33.2 Implement ClaudeProvider class
  - Install Anthropic SDK
  - Implement AIProvider interface
  - Normalize responses to common format
  - Handle provider-specific errors
  - _Requirements: 10.1, 10.5_

- [ ] 33.3 Add provider selection to admin configuration
  - Allow switching providers via environment config
  - Test provider switching without code changes
  - _Requirements: 10.2, 10.3_

### 34. Accessibility Enhancements

- [ ] 34.1 Implement keyboard navigation for all features
  - Ensure all interactive elements are keyboard accessible
  - Add focus indicators
  - Test tab order
  - _Requirements: 19.5_

- [ ] 34.2 Add text alternatives for non-text content
  - Add alt text for images
  - Add ARIA labels for icons
  - Add screen reader announcements for dynamic content
  - _Requirements: 19.6_


- [ ] 34.3 Verify color contrast ratios
  - Test all text against backgrounds
  - Ensure minimum 4.5:1 contrast ratio
  - Fix any contrast issues
  - _Requirements: 19.7_

### 35. Timeout Handling

- [ ] 35.1 Implement request timeout handling
  - Set 10-second timeout for AI provider requests
  - Set 5-second timeout for TTS requests
  - Fall back to cached content on timeout
  - Log slow requests
  - _Requirements: 12.6_

- [ ]* 35.2 Write property test for timeout fallback
  - **Property 40: Timeout Falls Back to Cache**
  - **Validates: Requirements 12.6**

### 36. Content Parsing and Validation

- [ ] 36.1 Implement lesson content parser with validation
  - Parse AI response into structured components
  - Validate all required fields present
  - Handle markdown formatting
  - _Requirements: 14.1, 14.2, 14.6_

- [ ]* 36.2 Write property test for lesson parsing round trip
  - **Property 44: Lesson Serialization Round Trip**
  - **Validates: Requirements 14.4**

- [ ] 36.3 Implement malformed content error handling
  - Detect parsing failures
  - Log malformed content
  - Request regeneration
  - _Requirements: 14.5_

- [ ]* 36.4 Write property test for malformed content handling
  - **Property 45: Malformed Content Error Handling**
  - **Validates: Requirements 14.5**

- [ ] 36.5 Implement lesson formatting for display
  - Convert lesson structure to HTML
  - Apply proper formatting and styling
  - Ensure valid HTML output
  - _Requirements: 14.3_


- [ ]* 36.6 Write property test for HTML formatting validity
  - **Property 43: HTML Formatting Validity**
  - **Validates: Requirements 14.3**

### 37. Curriculum Validation

- [ ] 37.1 Implement curriculum tree validation
  - Verify all paths are valid
  - Verify all parent_ids reference existing nodes
  - Detect cycles in tree structure
  - Run validation after seeding
  - _Requirements: 17.5_

- [ ]* 37.2 Write property test for curriculum validation
  - **Property 56: Curriculum Data Validation**
  - **Validates: Requirements 17.5**

### 38. Quiz Result Features

- [ ] 38.1 Implement quiz result correctness flags
  - Add boolean correctness flag to each answer
  - Display correct/incorrect indicators in UI
  - _Requirements: 16.4_

- [ ]* 38.2 Write property test for quiz result flags
  - **Property 51: Quiz Result Correctness Flags**
  - **Validates: Requirements 16.4**

- [ ] 38.3 Implement quiz time tracking
  - Track time from quiz start to submission
  - Store time_spent in quiz_attempts
  - Display time taken in results
  - _Requirements: 16.5_

- [ ]* 38.4 Write property test for quiz time tracking
  - **Property 52: Quiz Time Tracking**
  - **Validates: Requirements 16.5**

### 39. Rate Limit Reset Timing

- [ ] 39.1 Implement midnight reset for rate limits
  - Calculate seconds until midnight Mauritius time (UTC+4)
  - Set Redis TTL to expire at midnight
  - Test reset timing
  - _Requirements: 18.2_


- [ ]* 39.2 Write property test for rate limit reset timing
  - **Property 57: Rate Limit Reset Timing**
  - **Validates: Requirements 18.2**

### 40. Performance Testing and Optimization

- [ ] 40.1 Conduct load testing with 1000 concurrent users
  - Set up load testing tool (k6 or Artillery)
  - Test curriculum navigation under load
  - Test lesson generation under load
  - Verify no performance degradation
  - _Requirements: 13.3_

- [ ] 40.2 Verify response time requirements
  - Test cached lesson retrieval < 500ms
  - Test curriculum navigation < 100ms
  - Test quiz evaluation < 500ms
  - Test lesson generation < 5 seconds
  - _Requirements: 2.7, 3.7, 4.3, 13.2_

- [ ] 40.3 Test mobile performance on 3G connection
  - Simulate 3G connection speeds
  - Verify curriculum loads within 2 seconds
  - Test lazy loading for audio
  - _Requirements: 13.1, 13.5_

### 41. Final Integration and Testing

- [ ] 41.1 Run complete test suite
  - Run all property-based tests (65 properties)
  - Run all unit tests
  - Run all integration tests
  - Verify 80% line coverage
  - Verify 75% branch coverage
  - _Requirements: All_

- [ ] 41.2 Conduct end-to-end user flow testing
  - Test complete registration → login → browse → learn → quiz → progress flow
  - Test error scenarios and recovery
  - Test rate limiting behavior
  - Test audio generation and playback
  - _Requirements: All_

- [ ] 41.3 Security audit and penetration testing
  - Test authentication security
  - Test session management
  - Test input validation and sanitization
  - Test for SQL injection vulnerabilities
  - Test for XSS vulnerabilities
  - _Requirements: 11.3, 11.4_


### 42. Deployment Preparation

- [ ] 42.1 Set up production environment configuration
  - Configure environment variables for production
  - Set up PostgreSQL production database
  - Set up Redis production instance
  - Configure Cloudflare CDN
  - Configure Backblaze B2 storage
  - _Requirements: All_

- [ ] 42.2 Set up monitoring and alerting in production
  - Configure error tracking (Sentry or similar)
  - Set up uptime monitoring
  - Configure alert notifications
  - Set up log aggregation
  - _Requirements: 20.5, 20.6_

- [ ] 42.3 Create deployment documentation
  - Document environment setup
  - Document database migration process
  - Document backup and recovery procedures
  - Document monitoring and alerting setup
  - _Requirements: All_

- [ ] 42.4 Perform production deployment
  - Deploy application to hosting platform
  - Run database migrations
  - Seed initial curriculum data
  - Verify all services are running
  - Test production environment
  - _Requirements: All_

### 43. Final Checkpoint - Production Ready

- [ ] 43.1 Verify all features are working in production
  - Test user registration and authentication
  - Test curriculum navigation
  - Test lesson generation and caching
  - Test quiz generation and evaluation
  - Test voice narration
  - Test progress tracking and analytics
  - Test rate limiting
  - Test admin dashboard
  - Verify monitoring and alerting
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at the end of each phase
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript with Next.js, PostgreSQL, Redis, Google Gemini, and ElevenLabs
- All external API calls include retry logic, timeout handling, and cache fallback
- The system prioritizes cost efficiency through aggressive caching at multiple layers
