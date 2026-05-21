import { AUTH_PREFIX } from '../config/api';

/**
 * Request password reset email (no auth).
 * @param {string} email
 */
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

/**
 * Complete reset using uid + token from the email link query string.
 * @param {{ uid: string, token: string, password: string, password_confirm: string }} body
 */
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

export async function verifyPasswordResetOtp({ email, code }) {
  const res = await fetch(`${AUTH_PREFIX}/password-reset/otp-verify/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      code: String(code || '').trim(),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || data.code?.[0] || 'Invalid or expired code.');
  }
  return data;
}

export async function confirmPasswordResetWithOtp({
  email,
  reset_token,
  code,
  password,
  password_confirm,
}) {
  const res = await fetch(`${AUTH_PREFIX}/password-reset/otp-confirm/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      ...(reset_token ? { reset_token } : { code: String(code || '').trim() }),
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
