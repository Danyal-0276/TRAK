import { AUTH_PREFIX } from '../config/api';
import { fetchWithTimeout, sleep } from './fetchWithTimeout';

/**
 * Request password reset email (no auth).
 * @param {string} email
 */
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
        err?.message?.includes('Network request failed') ||
        err?.message?.includes('Network Error') ||
        err?.message?.includes('waking up') ||
        err?.message?.includes('timed out');
      if (attempt === 0 && retryable) {
        await sleep(2500);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

/**
 * Complete reset using uid + token from the email link query string.
 * @param {{ uid: string, token: string, password: string, password_confirm: string }} body
 */
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

/** Step 2: verify 6-digit OTP only; returns reset_token for step 3. */
export async function verifyPasswordResetOtp({ email, code }) {
  const res = await fetchWithTimeout(`${AUTH_PREFIX}/password-reset/otp-verify/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      code: String(code || '').trim(),
    }),
  }, 25000);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || data.code?.[0] || 'Invalid or expired code.');
  }
  return data;
}

/** Step 3: set new password using reset_token from otp-verify. */
export async function confirmPasswordResetWithOtp({
  email,
  reset_token,
  code,
  password,
  password_confirm,
}) {
  const res = await fetchWithTimeout(`${AUTH_PREFIX}/password-reset/otp-confirm/`, {
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
