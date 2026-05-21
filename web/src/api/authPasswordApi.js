import { AUTH_PREFIX } from '../config/api';
import { fetchWithTimeout } from './fetchWithTimeout';

export async function requestPasswordReset(email) {
  const res = await fetchWithTimeout(`${AUTH_PREFIX}/password-reset/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data.detail ||
      data.email?.[0] ||
      (res.status === 500
        ? 'Password reset is temporarily unavailable on the server. Try again after the backend is redeployed, or use a local backend.'
        : 'Could not start reset');
    throw new Error(msg);
  }
  return data;
}

export async function confirmPasswordReset(body) {
  const res = await fetchWithTimeout(`${AUTH_PREFIX}/password-reset/confirm/`, {
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

export async function confirmPasswordResetWithOtp({ email, code, password, password_confirm }) {
  const res = await fetchWithTimeout(`${AUTH_PREFIX}/password-reset/otp-confirm/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      code: String(code || '').trim(),
      password,
      password_confirm,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || 'Reset failed');
  }
  return data;
}
