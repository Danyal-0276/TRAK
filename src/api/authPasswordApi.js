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
