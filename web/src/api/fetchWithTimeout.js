/** Default timeout for API calls (backend unreachable = no more infinite skeleton). */
export const API_TIMEOUT_MS = 15000;

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
      throw new Error(
        'Request timed out. Start the backend: cd TRAK-BACKEND && .venv\\Scripts\\python.exe manage.py runserver 0.0.0.0:8000'
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
