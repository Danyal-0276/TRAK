import { getUserFacingError } from '../utils/getUserFacingError';

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
    const friendly = getUserFacingError(err, { url });
    const wrapped = new Error(friendly);
    wrapped.cause = err;
    wrapped.url = url;
    throw wrapped;
  } finally {
    clearTimeout(timer);
  }
}
