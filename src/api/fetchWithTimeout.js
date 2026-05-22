const API_TIMEOUT_MS = 30000;

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
        'Request timed out. Ensure Django is running and reachable from this device.'
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
