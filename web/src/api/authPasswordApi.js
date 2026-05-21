import { AUTH_PREFIX } from '../config/api';
import { fetchWithTimeout } from './fetchWithTimeout';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Password reset should return in ~1s; retry once on cold start / network blips. */
export async function requestPasswordReset(email) {
  const url = `${AUTH_PREFIX}/password-reset/`;
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  };
  const timeoutMs = 25000;
  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const res = await fetchWithTimeout(url, options, timeoutMs);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          data.detail ||
          data.email?.[0] ||
          (res.status === 500
            ? 'Password reset is temporarily unavailable. Redeploy the backend and try again.'
            : 'Could not start reset');
        throw new Error(msg);
      }
      return data;
    } catch (err) {
      lastError = err;
      const retryable =
        err?.name === 'AbortError' ||
        err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('NetworkError');
      if (attempt === 0 && retryable) {
        await sleep(2500);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
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
