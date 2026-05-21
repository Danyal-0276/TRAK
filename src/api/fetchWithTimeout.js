import { API_BASE } from '../config/api';
import { formatNetworkError } from '../utils/networkError';

/** Render free tier can take time to wake; password-reset should return in ~1–2s after backend fix. */
export const API_TIMEOUT_MS = 90000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * fetch() with AbortController timeout (React Native).
 * @param {string} url
 * @param {RequestInit} [options]
 * @param {number} [ms]
 */
export async function fetchWithTimeout(url, options = {}, ms = API_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err?.name === 'AbortError') {
      const isRender =
        typeof url === 'string' && url.includes('onrender.com');
      const isPasswordReset =
        typeof url === 'string' && url.includes('password-reset');
      throw new Error(
        isPasswordReset
          ? 'Reset request timed out. Try again in a moment, or use a local backend.'
          : isRender
            ? 'The server is waking up (Render can take up to a minute). Wait and try again.'
            : 'Request timed out. Start Django: python manage.py runserver 0.0.0.0:8000'
      );
    }
    throw new Error(formatNetworkError(err));
  } finally {
    clearTimeout(timer);
  }
}

export { sleep, API_BASE };
