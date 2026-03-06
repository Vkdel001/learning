# Interactive AI Tutor Chat System - Specification

**Priority:** CRITICAL - Core Feature  
**Estimated Time:** 8-12 hours  
**Status:** Not Started

---

## Overview

Transform the AI Tutor from a static content delivery system into an interactive, conversational learning experience. Students should be able to ask questions, request clarifications, and engage with the AI tutor just like they would with a human tutor.

---

## Problem Statement

Currently, the platform delivers static lesson content without any way for students to:
- Ask follow-up questions about confusing concepts
- Request simpler explanations
- Get additional examples
- Understand why something is important
- Relate concepts to other topics they've learned

This makes it a content viewer, not a true AI tutor. Students need interactive, personalized support.

---

## Solution: Conversational AI Tutor

### Core Features

#### 1. Text-Based Chat Interface
- Chat panel/sidebar integrated into lesson viewer
- Message bubbles (user on right, AI on left)
- Text input with send button
- Typing indicator while AI responds
- Conversation history display
- Scroll to see previous messages

#### 2. Voice Input (Speech-to-Text)
- Microphone button next to text input
- Uses Web Speech API for voice recognition
- Converts speech to text automatically
- Visual feedback while listening
- Fallback to text input if not supported

#### 3. Voice Output (Text-to-Speech)
- Speaker button on each AI response
- Auto-play option (toggle on/off)
- Uses existing TTS service
- Sync with text highlighting
- Pause/resume controls

#### 4. Context-Aware Responses
- AI has access to current lesson content
- Maintains conversation history
- References specific lesson sections
- Provides relevant examples from lesson
- Suggests related topics from curriculum

#### 5. Quick Action Buttons
Pre-defined prompts for common requests:
- 🔄 "Explain this in simpler terms"
- 💡 "Give me an example"
- ❓ "Why is this important?"
- 🔗 "How does this relate to [previous topic]?"
- 📝 "Can you quiz me on this?"
- 🎯 "What should I focus on?"

---

## Technical Architecture

### Database Schema

```sql
-- Chat Conversations Table
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id),
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMP NOT NULL DEFAULT NOW(),
  message_count INT NOT NULL DEFAULT 0,
  
  INDEX idx_user_conversations (user_id, started_at DESC),
  INDEX idx_lesson_conversations (lesson_id)
);

-- Chat Messages Table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  tokens_used INT,
  
  INDEX idx_conversation_messages (conversation_id, created_at ASC)
);

-- Chat Analytics Table (for insights)
CREATE TABLE chat_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id),
  question_text TEXT NOT NULL,
  question_hash VARCHAR(64) NOT NULL, -- SHA-256 hash for deduplication
  ask_count INT NOT NULL DEFAULT 1,
  last_asked_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  UNIQUE (lesson_id, question_hash),
  INDEX idx_lesson_questions (lesson_id, ask_count DESC)
);
```

### Services

#### ChatService (`lib/services/chat.service.ts`)

```typescript
interface ChatConversation {
  id: string;
  userId: string;
  lessonId: string;
  startedAt: Date;
  lastMessageAt: Date;
  messageCount: number;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  tokensUsed?: number;
}

class ChatService {
  // Start a new conversation
  async startConversation(userId: string, lessonId: string): Promise<ChatConversation>
  
  // Add a message to conversation
  async addMessage(conversationId: string, role: string, content: string): Promise<ChatMessage>
  
  // Get conversation history
  async getConversationHistory(conversationId: string, limit?: number): Promise<ChatMessage[]>
  
  // Get or create conversation for lesson
  async getOrCreateConversation(userId: string, lessonId: string): Promise<ChatConversation>
  
  // Generate AI response
  async generateResponse(conversationId: string, userQuestion: string): Promise<string>
  
  // Track question analytics
  async trackQuestion(lessonId: string, question: string): Promise<void>
  
  // Get common questions for lesson
  async getCommonQuestions(lessonId: string, limit?: number): Promise<Array<{question: string, count: number}>>
}
```

#### AI Chat Prompt Template

```typescript
const CHAT_SYSTEM_PROMPT = `You are an AI tutor helping a student understand a lesson. 

LESSON CONTEXT:
Title: {lessonTitle}
Topic: {topicPath}
Content: {lessonContent}

YOUR ROLE:
- Answer questions about the lesson content
- Provide clear, simple explanations
- Give relevant examples
- Be encouraging and supportive
- Reference specific parts of the lesson when helpful
- Suggest related topics when appropriate

CONVERSATION HISTORY:
{conversationHistory}

GUIDELINES:
- Keep responses concise (2-3 paragraphs max)
- Use simple language appropriate for grade {grade}
- If the question is off-topic, gently redirect to the lesson
- If you don't know something, admit it honestly
- Encourage the student to think critically

Student's question: {userQuestion}`;
```

### API Routes

#### POST /api/chat/conversations
Start a new conversation or get existing one
```typescript
Request: {
  lessonId: string
}

Response: {
  success: boolean
  data: {
    conversationId: string
    messageCount: number
  }
}
```

#### POST /api/chat/conversations/:id/messages
Send a message and get AI response
```typescript
Request: {
  message: string
}

Response: {
  success: boolean
  data: {
    userMessage: ChatMessage
    aiResponse: ChatMessage
  }
}
```

#### GET /api/chat/conversations/:id
Get conversation history
```typescript
Response: {
  success: boolean
  data: {
    conversation: ChatConversation
    messages: ChatMessage[]
  }
}
```

#### GET /api/chat/lessons/:lessonId/common-questions
Get frequently asked questions for a lesson
```typescript
Response: {
  success: boolean
  data: Array<{
    question: string
    count: number
  }>
}
```

---

## Frontend Components

### ChatPanel Component (`components/ChatPanel.tsx`)

```typescript
interface ChatPanelProps {
  lessonId: string;
  lessonTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

// Features:
// - Slide-in panel from right side
// - Message list with auto-scroll
// - Text input with send button
// - Microphone button for voice input
// - Quick action buttons
// - Loading state while AI responds
// - Error handling
```

### ChatMessage Component (`components/ChatMessage.tsx`)

```typescript
interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  onSpeak?: () => void; // For TTS
}

// Features:
// - Different styling for user vs AI messages
// - Timestamp display
// - Speaker button for AI messages
// - Markdown rendering for formatted text
// - Code syntax highlighting if needed
```

### VoiceInput Component (`components/VoiceInput.tsx`)

```typescript
interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onError: (error: string) => void;
}

// Features:
// - Uses Web Speech API
// - Visual feedback while listening
// - Auto-stop after silence
// - Error handling for unsupported browsers
```

---

## User Experience Flow

### 1. Opening Chat
```
Student viewing lesson
  ↓
Clicks "Ask Tutor" button
  ↓
Chat panel slides in from right
  ↓
Shows welcome message: "Hi! I'm here to help you understand this lesson. What would you like to know?"
  ↓
Displays quick action buttons
```

### 2. Asking a Question (Text)
```
Student types question
  ↓
Clicks send or presses Enter
  ↓
Message appears in chat (right side)
  ↓
Typing indicator shows "Tutor is thinking..."
  ↓
AI response appears (left side)
  ↓
Speaker button available for TTS
```

### 3. Asking a Question (Voice)
```
Student clicks microphone button
  ↓
Browser asks for microphone permission
  ↓
Visual indicator shows "Listening..."
  ↓
Student speaks question
  ↓
Speech converted to text
  ↓
Text appears in input field
  ↓
Student reviews and sends
  ↓
(Same flow as text question)
```

### 4. Using Quick Actions
```
Student clicks "Explain simpler" button
  ↓
Pre-filled message sent: "Can you explain this in simpler terms?"
  ↓
AI provides simplified explanation
  ↓
Student can ask follow-up questions
```

---

## Rate Limiting

### Limits
- 50 messages per day per user
- 10 messages per hour per user
- 5 messages per minute per user

### Implementation
```typescript
// Redis keys
chat:rate:daily:{userId} -> count (TTL: until midnight)
chat:rate:hourly:{userId} -> count (TTL: 1 hour)
chat:rate:minute:{userId} -> count (TTL: 1 minute)

// Check before processing message
if (dailyCount >= 50) return "Daily limit reached"
if (hourlyCount >= 10) return "Please wait before asking more questions"
if (minuteCount >= 5) return "Slow down! Take time to read the responses"
```

### UI Feedback
- Show remaining messages: "You have 35 questions left today"
- Warning at 80%: "You've used 40 of 50 daily questions"
- Graceful error: "You've reached your daily limit. It resets at midnight."

---

## Analytics & Insights

### Track
1. Most asked questions per lesson
2. Topics students find confusing
3. Average conversation length
4. Response satisfaction (optional thumbs up/down)
5. Common follow-up questions

### Use Insights To
1. Improve lesson content
2. Add FAQ sections
3. Identify curriculum gaps
4. Optimize AI prompts
5. Generate better examples

---

## Implementation Checklist

### Backend (6-8 hours)
- [ ] Create database migrations for chat tables
- [ ] Implement ChatService class
- [ ] Create chat prompt template with lesson context
- [ ] Implement AI response generation
- [ ] Add conversation history management
- [ ] Implement rate limiting
- [ ] Create API routes (conversations, messages)
- [ ] Add analytics tracking
- [ ] Write unit tests

### Frontend (4-6 hours)
- [ ] Create ChatPanel component
- [ ] Create ChatMessage component
- [ ] Implement VoiceInput component
- [ ] Add "Ask Tutor" button to lesson page
- [ ] Integrate Web Speech API
- [ ] Add TTS for AI responses
- [ ] Implement quick action buttons
- [ ] Add loading states and error handling
- [ ] Style chat interface
- [ ] Test on mobile devices

### Testing (2 hours)
- [ ] Test conversation flow
- [ ] Test voice input/output
- [ ] Test rate limiting
- [ ] Test error scenarios
- [ ] Test on different browsers
- [ ] Test mobile responsiveness

---

## Success Metrics

### User Engagement
- % of students who use chat feature
- Average messages per conversation
- Average conversations per lesson
- Return usage rate

### Learning Effectiveness
- Correlation between chat usage and quiz scores
- Topics with most questions (need better explanations)
- Student satisfaction ratings

### Technical Performance
- Average response time < 3 seconds
- Voice recognition accuracy > 90%
- Error rate < 1%
- API cost per conversation

---

## Future Enhancements

### Phase 2
- Multi-turn conversations with better context
- Ability to reference previous lessons
- Personalized learning path suggestions
- Study buddy mode (AI asks questions to student)

### Phase 3
- Image/diagram explanations
- Interactive code examples
- Collaborative problem solving
- Peer chat (student to student with AI moderation)

---

## Security & Privacy

### Considerations
- Store conversations for analytics but anonymize after 30 days
- Don't store sensitive personal information
- Rate limit to prevent abuse
- Sanitize user input
- Monitor for inappropriate content
- Allow users to delete conversation history

---

## Cost Estimation

### Per Conversation (5 messages)
- AI API calls: ~2,000 tokens × $0.15/1M = $0.0003
- Database storage: negligible
- Redis cache: negligible

### Monthly (1000 active users, 10 conversations each)
- 10,000 conversations × $0.0003 = $3
- Very affordable with proper rate limiting

---

**This feature transforms the platform from a content viewer into a true AI tutor, providing the personalized, interactive learning experience that students need.**
