/**
 * Client-side authentication utilities
 */

export function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sessionToken');
}

export function setSessionToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sessionToken', token);
}

export function clearSessionToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('sessionToken');
}

export async function getCurrentUser() {
  const token = getSessionToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (data.success) {
      return data.data;
    }
    return null;
  } catch (err) {
    console.error('Failed to get current user:', err);
    return null;
  }
}

export async function logout() {
  const token = getSessionToken();
  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
  }
  clearSessionToken();
  window.location.href = '/';
}
