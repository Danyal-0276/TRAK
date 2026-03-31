import { AUTH_PREFIX } from '../config/api';

export async function requestPasswordReset(email) {
  const res = await fetch(`${AUTH_PREFIX}/password-reset/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || data.email?.[0] || 'Could not start reset');
  }
  return data;
}

export async function confirmPasswordReset(body) {
  const res = await fetch(`${AUTH_PREFIX}/password-reset/confirm/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || 'Reset failed');
  }
  return data;
}
