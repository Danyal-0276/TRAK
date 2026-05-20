/**
 * Email validation & verification OTP — /api/auth/email*
 */
import { AUTH_PREFIX } from '../config/api';
import { apiFetch } from './client';

async function parseJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data.detail ||
      (Array.isArray(data.email) ? data.email[0] : null) ||
      (Array.isArray(data.code) ? data.code[0] : null) ||
      `Request failed (${res.status})`;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}

export async function validateEmail(email) {
  const res = await apiFetch(`${AUTH_PREFIX}/email/validate/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return parseJson(res);
}

export async function sendEmailVerification() {
  const res = await apiFetch(`${AUTH_PREFIX}/email-verification/send/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return parseJson(res);
}

export async function verifyEmailCode(code) {
  const res = await apiFetch(`${AUTH_PREFIX}/email-verification/verify/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  return parseJson(res);
}

export async function resendEmailVerification() {
  const res = await apiFetch(`${AUTH_PREFIX}/email-verification/resend/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return parseJson(res);
}
