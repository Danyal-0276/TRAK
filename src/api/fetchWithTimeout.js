const API_TIMEOUT_MS = 90000;
/** Shorter timeout for mobile feed/auth so unreachable VPS fails fast instead of freezing the app. */
export const MOBILE_API_TIMEOUT_MS = 25000;
/** Admin pipeline batch (HF Spaces per article) can take several minutes. */
export const PIPELINE_RUN_TIMEOUT_MS = 600000;
export const TTS_PLAN_TIMEOUT_MS = 120000;
export const TTS_CHUNK_TIMEOUT_MS = 360000;

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
      const isTts = typeof url === 'string' && url.includes('article-tts');
      throw new Error(
        isTts
          ? 'Speech generation timed out. First listen can take several minutes while models load on the server — try again.'
          : 'Request timed out. Ensure Django is running and reachable from this device.'
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
