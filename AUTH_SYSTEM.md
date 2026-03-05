# Authentication System

## Overview
OTP-based authentication system using email verification (no passwords).

## User Flow

### Registration
1. User visits `/auth/register`
2. Fills in: name, email, grade, age confirmation
3. System sends 6-digit OTP to email via Brevo
4. User enters OTP
5. System creates session and redirects to `/lessons`

### Login
1. User visits `/auth/login`
2. Enters email
3. System sends OTP to email
4. User enters OTP
5. System verifies and creates session
6. Redirects to `/lessons`

## Session Management
- Session token stored in localStorage
- Token sent in Authorization header: `Bearer <token>`
- Sessions expire after 24 hours
- Logout clears token and redirects to home

## Protected Routes
- `/progress` - Requires authentication
- Progress tracking APIs require authentication
- Lessons and quizzes work without auth but don't save progress

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user and send OTP
- `POST /api/auth/send-otp` - Send OTP to existing user
- `POST /api/auth/verify-otp` - Verify OTP and create session
- `POST /api/auth/logout` - End session
- `GET /api/auth/me` - Get current user info

### Progress (Authenticated)
- `GET /api/progress/stats` - Get user statistics
- `POST /api/progress/lessons` - Mark lesson complete
- `POST /api/progress/quizzes` - Record quiz attempt

## Testing
1. Register a new account at `/auth/register`
2. Check email for OTP (or check server logs in development)
3. Complete lessons and quizzes
4. View progress at `/progress`

## Development Notes
- OTP emails sent via Brevo API
- OTPs valid for 10 minutes
- Rate limit: 3 OTPs per hour per email
- Test user created: test-user-id (for backend testing)
