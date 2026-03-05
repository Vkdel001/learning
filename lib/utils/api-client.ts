import { getSessionToken } from './auth-client';

/**
 * Fetch wrapper that automatically includes auth token
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = getSessionToken();
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
