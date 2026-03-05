import { NextRequest } from 'next/server';
import { validateSession } from '../services/auth.service';

/**
 * Server-side authentication utilities
 */

export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const result = await validateSession(token);
  
  return result.valid && result.user ? result.user.id : null;
}

export async function requireAuth(req: NextRequest): Promise<string> {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}
