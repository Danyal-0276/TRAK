import { USER_PREFIX } from '../config/api';
import { apiFetch } from '../api/client';
import { TTS_CHUNK_TIMEOUT_MS } from '../api/fetchWithTimeout';
import { planSegmentsProgressive } from './ttsChunking';

export const TTS_LANGUAGES = [
  { id: 'english', label: 'English' },
  { id: 'urdu', label: 'Urdu (اردو)' },
];

const TTS_BATCH_SIZE = 4;
const MAX_ARTICLE_CHARS = 40_000;

/** Parse API body; avoid "Unexpected token '<'" when server returns HTML 404 pages. */
export async function parseApiResponse(res) {
  const text = await res.text();
  const trimmed = text.trimStart();
  if (trimmed.startsWith('<')) {
    if (res.status === 404) {
      throw new Error(
        'TTS API not found (404). Restart Django locally or redeploy the backend with the latest code.'
      );
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error('Session expired. Sign in again to use listen.');
    }
    throw new Error(
      `Server returned HTML instead of JSON (HTTP ${res.status}). Check VITE_API_URL points at your Django API.`
    );
  }
  let payload = {};
  if (trimmed) {
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON from server (HTTP ${res.status}).`);
    }
  }
  if (!res.ok) {
    const detail = payload?.detail;
    throw new Error(
      typeof detail === 'string' ? detail : Array.isArray(detail) ? JSON.stringify(detail) : `Request failed (${res.status})`
    );
  }
  return payload;
}

/** Client-side split when /article-tts/plan/ is missing on older backends. */
export function planSegmentsLocally(text, maxTotal = MAX_ARTICLE_CHARS) {
  return planSegmentsProgressive(text, undefined, undefined, maxTotal);
}

async function postTts(path, body, timeoutMs) {
  const res = await apiFetch(
    `${USER_PREFIX}${path}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    timeoutMs
  );
  return parseApiResponse(res);
}

/** Split article locally (instant — no network wait before first chunk). */
export async function requestArticleTtsPlan(fullText) {
  const segments = planSegmentsLocally(fullText);
  if (!segments.length) throw new Error('Nothing to read aloud.');
  return segments;
}

/** Up to 4 segments synthesized in parallel on the server. */
export async function requestArticleTtsChunks(segmentTexts, language = 'english') {
  try {
    const payload = await postTts(
      '/article-tts/chunks/',
      { segments: segmentTexts, language },
      TTS_CHUNK_TIMEOUT_MS
    );
    const chunks = payload.chunks || [];
    if (!chunks.length) throw new Error('No audio returned for batch.');
    return chunks;
  } catch (batchErr) {
    try {
      return await Promise.all(
        segmentTexts.map((text) => requestArticleTtsChunk(text, language))
      );
    } catch {
      throw batchErr;
    }
  }
}

/** One segment of audio. Falls back to legacy /article-tts/ for that segment only. */
export async function requestArticleTtsChunk(segmentText, language = 'english') {
  try {
    const payload = await postTts(
      '/article-tts/chunk/',
      { text: segmentText, language },
      TTS_CHUNK_TIMEOUT_MS
    );
    if (!payload?.audio) throw new Error('No audio returned for this section.');
    return payload;
  } catch (e) {
    const msg = e?.message || '';
    if (msg.includes('404') || msg.includes('HTML instead of JSON')) {
      const payload = await postTts(
        '/article-tts/',
        { text: segmentText, language },
        TTS_CHUNK_TIMEOUT_MS
      );
      if (!payload?.audio) throw new Error('No audio returned for this section.');
      return payload;
    }
    throw e;
  }
}

export async function requestArticleTts(text, language = 'english') {
  const payload = await postTts('/article-tts/', { text, language }, TTS_CHUNK_TIMEOUT_MS);
  if (!payload?.audio) throw new Error('No audio returned from server.');
  return payload;
}

export function normalizeAudioBase64(raw) {
  let s = String(raw || '').trim();
  const prefix = s.indexOf('base64,');
  if (prefix !== -1) s = s.slice(prefix + 7);
  return s.replace(/\s/g, '');
}

export function base64ToBytes(base64Audio) {
  const clean = normalizeAudioBase64(base64Audio);
  if (!clean) throw new Error('No audio data received.');
  try {
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    if (bytes.length < 12) throw new Error('Audio file too small.');
    return bytes;
  } catch {
    throw new Error('Invalid audio data from server.');
  }
}

function decodeToAudioBuffer(ctx, base64Audio) {
  const bytes = base64ToBytes(base64Audio);
  const copy = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return ctx.decodeAudioData(copy);
}

/**
 * Start progressive TTS playback. Returns { stop, promise } immediately so Stop works mid-play.
 */
export function playArticleTtsStreaming(
  segments,
  language,
  { onProgress, onUrduPart, onFirstReady, isCancelled } = {}
) {
  const session = { stopped: false, activeSource: null, ctx: null, gain: null };

  const halt = () => {
    if (session.stopped) return;
    session.stopped = true;
    if (session.activeSource) {
      try {
        session.activeSource.stop(0);
      } catch {
        /* already stopped */
      }
      try {
        session.activeSource.disconnect();
      } catch {
        /* ignore */
      }
      session.activeSource = null;
    }
    const ctx = session.ctx;
    if (ctx && ctx.state !== 'closed') {
      ctx.suspend().catch(() => {});
      ctx.close().catch(() => {});
    }
  };

  const playAudioBuffer = (buffer) =>
    new Promise((resolve, reject) => {
      if (session.stopped || isCancelled?.()) return resolve();
      const ctx = session.ctx;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(reject);
      }
      const source = ctx.createBufferSource();
      session.activeSource = source;
      source.buffer = buffer;
      source.connect(session.gain);
      source.onended = () => {
        if (session.activeSource === source) session.activeSource = null;
        resolve();
      };
      try {
        source.start(0);
      } catch {
        resolve();
      }
    });

  const promise = (async () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) throw new Error('Web Audio is not supported in this browser.');

    session.ctx = new AudioCtx();
    session.gain = session.ctx.createGain();
    session.gain.connect(session.ctx.destination);
    if (session.ctx.state === 'suspended') {
      await session.ctx.resume();
    }

    const cache = new Map();
    const inflight = new Map();

    const payloadToEntry = async (payload) => {
      const buffer = await decodeToAudioBuffer(session.ctx, payload.audio);
      return { buffer, urdu: payload.urdu_text };
    };

    const loadSegment = async (index) => {
      if (session.stopped || isCancelled?.()) return null;
      if (index < 0 || index >= segments.length) return null;
      if (cache.has(index)) return cache.get(index);
      if (inflight.has(index)) {
        try {
          const shared = await inflight.get(index);
          if (shared) return shared;
        } catch (err) {
          throw err;
        }
        if (cache.has(index)) return cache.get(index);
        throw new Error('Could not load audio for this section.');
      }

      const p = (async () => {
        try {
          const payload = await requestArticleTtsChunk(segments[index], language);
          if (session.stopped || isCancelled?.()) return null;
          const entry = await payloadToEntry(payload);
          cache.set(index, entry);
          return entry;
        } catch (err) {
          const msg = err?.message || 'TTS request failed';
          if (language === 'urdu' && !msg.toLowerCase().includes('urdu')) {
            throw new Error(
              `Urdu audio failed: ${msg}. Ensure pip install edge-tts deep-translator and restart Django.`
            );
          }
          throw err;
        }
      })();

      inflight.set(index, p);
      try {
        return await p;
      } finally {
        inflight.delete(index);
      }
    };

    const prefetchAhead = (fromIndex) => {
      const maxAhead = language === 'urdu' ? 1 : TTS_BATCH_SIZE;
      for (let k = 1; k <= maxAhead; k++) {
        const idx = fromIndex + k;
        if (idx >= segments.length) break;
        if (!cache.has(idx) && !inflight.has(idx)) {
          loadSegment(idx).catch(() => {});
        }
      }
    };

    try {
      for (let i = 0; i < segments.length; i++) {
        if (session.stopped || isCancelled?.()) break;

        const entry = await loadSegment(i);
        if (session.stopped || isCancelled?.()) break;
        if (!entry) {
          throw new Error('Could not load audio. Check that Django is running and TTS dependencies are installed.');
        }

        prefetchAhead(i);

        if (i === 0) onFirstReady?.();
        if (entry?.urdu && onUrduPart) onUrduPart(entry.urdu, i);

        if (!session.stopped && !isCancelled?.()) {
          await playAudioBuffer(entry.buffer);
        }
        if (session.stopped || isCancelled?.()) break;
        onProgress?.(i + 1, segments.length);
      }
    } finally {
      if (session.ctx?.state !== 'closed') {
        await session.ctx.close().catch(() => {});
      }
    }
  })();

  return { stop: halt, promise };
}

export async function playWavBase64(base64Audio, { onEnded } = {}) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) throw new Error('Web Audio is not supported.');

  const ctx = new AudioCtx();
  const buffer = await decodeToAudioBuffer(ctx, base64Audio);
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  await new Promise((resolve) => {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gain);
    source.onended = resolve;
    source.start(0);
  });
  await ctx.close().catch(() => {});
  onEnded?.();

  return { stop: () => ctx.close().catch(() => {}) };
}
