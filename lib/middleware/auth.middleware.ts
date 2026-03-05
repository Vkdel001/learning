import { NextRequest, NextResponse } from 'next/server';
import { validateSession, UserData } from '../services/auth.service';

/**
 * Authentication middleware for API routes
 * Validates session and attaches user to request
 */

export interface AuthenticatedRequest extends NextRequest {
  user?: UserData;
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  // Get token from cookie or header
  const token =
    request.cookies.get('session_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Validate session
  const result = await validateSession(token);

  if (!result.valid) {
    return NextResponse.json(
      { error: result.message || 'Invalid session' },
      { status: 401 }
    );
  }

  // Attach user to request
  const authenticatedRequest = request as AuthenticatedRequest;
  authenticatedRequest.user = result.user;

  // Call the handler
  return handler(authenticatedRequest);
}

/**
 * Middleware to require admin role
 */
export async function requireAdmin(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return requireAuth(request, async (req) => {
    if (!req.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    return handler(req);
  });
}
