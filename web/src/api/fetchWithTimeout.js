/** Render free tier can take 30–90s to wake; local Django is usually fast. */
export const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 90000;

/**
 * fetch() with AbortController timeout.
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
          ? 'Reset request timed out. Redeploy the latest backend (email is sent in the background) or try again in a moment.'
          : isRender
            ? 'The server is waking up (Render can take up to a minute). Wait a moment and try again.'
            : 'Request timed out. Start Django: cd Backend/TRAK_Backend && py manage.py runserver 0.0.0.0:8000'
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
