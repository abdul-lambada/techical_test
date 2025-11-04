export async function fetchHealth() {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('API not reachable');
  return res.json();
}

export type LoginResponse = {
  accessToken: string;
  user: { id: string; email: string; name: string };
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function me(token: string) {
  const res = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export async function refresh(): Promise<{ accessToken: string }> {
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Refresh failed');
  return res.json();
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
}
