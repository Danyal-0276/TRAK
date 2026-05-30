/** Render free tier can take 30–90s to wake; local Django is usually fast. */
export const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 90000;

/** Admin pipeline batch (HF Spaces per article) can take several minutes. */
export const PIPELINE_RUN_TIMEOUT_MS =
  Number(import.meta.env.VITE_PIPELINE_RUN_TIMEOUT_MS) || 600000;

/** TTS loads ML models on first chunk — needs a much longer client timeout. */
export const TTS_PLAN_TIMEOUT_MS =
  Number(import.meta.env.VITE_TTS_PLAN_TIMEOUT_MS) || 120000;
export const TTS_CHUNK_TIMEOUT_MS =
  Number(import.meta.env.VITE_TTS_CHUNK_TIMEOUT_MS) || 360000;

function isTtsRequest(url) {
  return typeof url === 'string' && url.includes('article-tts');
}

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
      const isTts = isTtsRequest(url);
      throw new Error(
        isPasswordReset
          ? 'Reset request timed out. Redeploy the latest backend (email is sent in the background) or try again in a moment.'
          : isTts
            ? 'Speech generation timed out. The first listen after starting Django can take several minutes while models load — try again or set TTS_PREFER_LOCAL=true on the backend.'
            : isRender
              ? 'The server is waking up (Render can take up to a minute). Wait a moment and try again.'
              : 'Request timed out. Check that Django is running and VITE_API_URL in web/.env points at it.'
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
