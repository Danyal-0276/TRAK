import { normalizeApiError } from './normalizeApiError';

const GENERIC = 'Something went wrong. Please try again.';
const NETWORK =
  "We couldn't reach the server. Check your internet connection and try again.";
const TIMEOUT_LOCAL =
  'The request took too long. Please try again in a moment.';
const TIMEOUT_RENDER =
  'The server is waking up and may take up to a minute. Wait a moment and try again.';
const TIMEOUT_PASSWORD_RESET =
  'The reset request timed out. Please try again in a moment.';
const TIMEOUT_TTS =
  'Speech generation is taking longer than usual. Please try again in a moment.';

function isRenderUrl(url) {
  return typeof url === 'string' && url.includes('onrender.com');
}

function isTtsRequest(url) {
  return typeof url === 'string' && url.includes('article-tts');
}

function isPasswordResetRequest(url) {
  return typeof url === 'string' && url.includes('password-reset');
}

function timeoutMessage(url) {
  if (isPasswordResetRequest(url)) return TIMEOUT_PASSWORD_RESET;
  if (isTtsRequest(url)) return TIMEOUT_TTS;
  if (isRenderUrl(url)) return TIMEOUT_RENDER;
  return TIMEOUT_LOCAL;
}

function isNetworkMessage(msg) {
  if (!msg || typeof msg !== 'string') return false;
  const lower = msg.toLowerCase();
  return (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network request failed') ||
    lower.includes('load failed') ||
    lower.includes('net::err')
  );
}

function isTechnicalMessage(msg) {
  if (!msg || typeof msg !== 'string') return false;
  const lower = msg.toLowerCase();
  return (
    lower.includes('request failed (') ||
    lower.includes('json parse error') ||
    lower.includes('unexpected token') ||
    lower.includes('vite_api_url') ||
    lower.includes('cors') ||
    lower.includes('<!doctype') ||
    lower.startsWith('{') ||
    lower.startsWith('[')
  );
}

/**
 * Convert any thrown error into plain language for end users.
 * @param {unknown} err
 * @param {{ url?: string, status?: number, payload?: object|null, fallback?: string }} [context]
 */
export function getUserFacingError(err, context = {}) {
  const fallback = context.fallback || GENERIC;
  const url = context.url || err?.url || '';

  if (err?.name === 'AbortError' || err?.code === 'TIMEOUT') {
    return timeoutMessage(url);
  }

  const msg = typeof err === 'string' ? err : err?.message;
  if (isNetworkMessage(msg)) return NETWORK;

  if (context.payload != null || context.status != null) {
    const { message } = normalizeApiError(context.payload ?? null, context.status ?? 0);
    if (message && message !== GENERIC) return message;
  }

  if (err?.fields && typeof err.fields === 'object') {
    const first = Object.values(err.fields)[0];
    if (first && typeof first === 'string' && !isTechnicalMessage(first)) return first;
  }

  if (err?.status != null && (!msg || isTechnicalMessage(msg))) {
    const { message } = normalizeApiError(null, err.status);
    if (message) return message;
  }

  if (msg && typeof msg === 'string' && !isTechnicalMessage(msg)) {
    return msg;
  }

  return fallback;
}

/**
 * Parse a fetch Response; throw Error with status/payload for getUserFacingError.
 */
export async function parseApiResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  let payload = null;

  if (contentType.includes('application/json')) {
    payload = await res.json().catch(() => null);
  } else {
    const text = await res.text().catch(() => '');
    if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = null;
      }
    }
  }

  if (!res.ok) {
    const { message, fields } = normalizeApiError(payload, res.status);
    const err = new Error(message);
    err.status = res.status;
    err.fields = fields;
    err.payload = payload;
    throw err;
  }

  return payload ?? {};
}
