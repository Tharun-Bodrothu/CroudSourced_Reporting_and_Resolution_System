// Minimal JWT helper (no external deps)
// Provides: parseToken, getUserFromToken, isTokenValid

export function parseToken(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch (e) {
    console.error('Failed to parse token', e);
    return null;
  }
}

export function getUserFromToken() {
  try {
    const raw = localStorage.getItem('token');
    if (!raw) return null;
    const token = raw.startsWith('Bearer ') ? raw.split(' ')[1] : raw;
    return parseToken(token);
  } catch (e) {
    return null;
  }
}

export function isTokenValid() {
  const user = getUserFromToken();
  if (!user) return false;
  if (!user.exp) return true; // no exp claim - assume valid
  const now = Math.floor(Date.now() / 1000);
  return user.exp > now;
}
