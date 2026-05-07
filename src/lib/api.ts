export const WORKER_URL = import.meta.env.PUBLIC_WORKER_URL as string;

export interface UserProfile {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  bio: string;
  marker_id: number;
}

export function avatarUrl(user: UserProfile, size = 256): string {
  if (user.avatar) {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=${size}`;
  }
  const index = parseInt(user.id) % 6;
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

export function displayName(user: UserProfile): string {
  return user.global_name || user.username;
}

export async function getMe(token: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${WORKER_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getUser(userId: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${WORKER_URL}/api/user/${userId}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getUserByMarker(markerId: number): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${WORKER_URL}/api/marker/${markerId}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function updateBio(token: string, bio: string): Promise<boolean> {
  try {
    const res = await fetch(`${WORKER_URL}/api/me/bio`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bio }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function logout(token: string): Promise<void> {
  try {
    await fetch(`${WORKER_URL}/auth/logout`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // ignore
  }
}

export function getToken(): string | null {
  return localStorage.getItem('discard_token');
}

export function setToken(token: string): void {
  localStorage.setItem('discard_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('discard_token');
}
