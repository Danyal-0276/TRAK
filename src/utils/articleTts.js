import { API_BASE, USER_PREFIX } from '../config/api';
import { apiFetch, getAccessToken } from '../api/client';
import { TTS_CHUNK_TIMEOUT_MS } from '../api/fetchWithTimeout';
import { planSegmentsProgressive } from './ttsChunking';
import {
  playBase64AudioAndWait,
  stopNativePlayback,
  pauseNativePlayback,
  resumeNativePlayback,
  getNativePlaybackPosition,
  normalizeAudioBase64,
} from './ttsNativePlayback';

export {
  normalizeAudioBase64,
  stopNativePlayback,
  pauseNativePlayback,
  resumeNativePlayback,
  getNativePlaybackPosition,
};

export const TTS_LANGUAGES = [
  { id: 'english', label: 'English' },
  { id: 'urdu', label: 'Urdu (اردو)' },
];

const TTS_BATCH_SIZE = 4;
const MAX_ARTICLE_CHARS = 40_000;

export function createTtsSessionId(articleHint = '') {
  const base = String(articleHint || 'listen').slice(0, 24);
  return `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function parseApiResponse(res) {
  const text = await res.text();
  const trimmed = text.trimStart();
  if (trimmed.startsWith('<')) {
    if (res.status === 404) {
      throw new Error(
        'TTS API not found (404). Restart Django or redeploy the backend with the latest code.'
      );
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error('Session expired. Sign in again to use listen.');
    }
    throw new Error(
      `Server returned HTML instead of JSON (HTTP ${res.status}). Check API_BASE in src/config/api.local.js — use your PC LAN IP on a physical device (not 10.0.2.2).`
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
      typeof detail === 'string' ? detail : `Request failed (${res.status})`
    );
  }
  return payload;
}

export function planSegmentsLocally(text, maxTotal = MAX_ARTICLE_CHARS) {
  return planSegmentsProgressive(text, undefined, undefined, maxTotal);
}

async function ttsFetch(path, body, timeoutMs = TTS_CHUNK_TIMEOUT_MS) {
  const token = await getAccessToken();
  if (!token) throw new Error('Sign in to listen to articles.');

  const res = await apiFetch(
    `${USER_PREFIX}${path}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    API_BASE,
    timeoutMs
  );
  return parseApiResponse(res);
}

export async function requestArticleTtsPlan(fullText) {
  const segments = planSegmentsLocally(fullText);
  if (!segments.length) throw new Error('Nothing to read aloud.');
  return segments;
}

export async function requestArticleTtsChunks(segmentTexts, language = 'english', opts = {}) {
  const { ttsSessionId, voice } = opts;
  try {
    const payload = await ttsFetch('/article-tts/chunks/', {
      segments: segmentTexts,
      language,
      tts_session_id: ttsSessionId,
      voice,
    });
    const chunks = payload.chunks || [];
    if (!chunks.length) throw new Error('No audio returned for batch.');
    return chunks;
  } catch (batchErr) {
    try {
      return await Promise.all(
        segmentTexts.map((text) => requestArticleTtsChunk(text, language, opts))
      );
    } catch {
      throw batchErr;
    }
  }
}

export async function requestArticleTtsChunk(segmentText, language = 'english', opts = {}) {
  const { ttsSessionId, voice } = opts;
  try {
    const payload = await ttsFetch('/article-tts/chunk/', {
      text: segmentText,
      language,
      tts_session_id: ttsSessionId,
      voice,
    });
    if (!payload?.audio) throw new Error('No audio returned for this section.');
    return payload;
  } catch (e) {
    const msg = e?.message || '';
    if (msg.includes('404') || msg.includes('HTML instead of JSON')) {
      const payload = await ttsFetch('/article-tts/', { text: segmentText, language });
      if (!payload?.audio) throw new Error('No audio returned for this section.');
      return payload;
    }
    throw e;
  }
}

export async function requestArticleTts(text, language = 'english') {
  const payload = await ttsFetch('/article-tts/', { text, language });
  if (!payload?.audio) throw new Error('No audio returned from server.');
  return payload;
}

export async function playBase64Wav(base64Audio, format = 'mp3') {
  await playBase64AudioAndWait(base64Audio, format);
}

function estimateSegmentDurationMs(base64Audio) {
  const len = String(base64Audio || '').length;
  const bytes = (len * 3) / 4;
  const sec = Math.max(2, Math.min(180, bytes / 12000));
  return Math.round((sec + 0.5) * 1000);
}

function cacheKey(index, language, voice) {
  return `${language}:${voice || 'default'}:${index}`;
}

export function playArticleTtsStreaming(
  segments,
  language,
  {
    onProgress,
    onUrduPart,
    onFirstReady,
    onSegmentStart,
    isCancelled,
    startSegmentIndex = 0,
    ttsSessionId,
    voice: initialVoice,
  } = {}
) {
  let halted = false;
  let paused = false;
  let pinnedVoice = initialVoice || null;
  const sessionId = ttsSessionId || createTtsSessionId();
  const checkpoint = { segmentIndex: startSegmentIndex, offsetSec: 0 };

  const halt = () => {
    halted = true;
    paused = false;
    stopNativePlayback();
  };

  const pause = () => {
    if (halted) return;
    paused = true;
    pauseNativePlayback();
    getNativePlaybackPosition().then((sec) => {
      checkpoint.offsetSec = sec;
    });
  };

  const resume = () => {
    if (halted) return;
    paused = false;
    resumeNativePlayback();
  };

  const getCheckpoint = () => ({ ...checkpoint, voice: pinnedVoice, ttsSessionId: sessionId });

  const promise = (async () => {
    const cache = new Map();
    const inflight = new Map();

    const loadSegment = async (index) => {
      if (halted || isCancelled?.()) return null;
      if (index < 0 || index >= segments.length) return null;
      const key = cacheKey(index, language, pinnedVoice);
      if (cache.has(key)) return cache.get(key);
      if (inflight.has(key)) {
        try {
          const shared = await inflight.get(key);
          if (shared) return shared;
        } catch (err) {
          throw err;
        }
        if (cache.has(key)) return cache.get(key);
        throw new Error('Could not load audio for this section.');
      }

      const p = (async () => {
        try {
          const payload = await requestArticleTtsChunk(segments[index], language, {
            ttsSessionId: sessionId,
            voice: pinnedVoice,
          });
          if (payload?.voice_id) pinnedVoice = payload.voice_id;
          cache.set(cacheKey(index, language, pinnedVoice), payload);
          return payload;
        } catch (err) {
          const msg = err?.message || 'TTS request failed';
          if (language === 'urdu' && !msg.toLowerCase().includes('urdu')) {
            throw new Error(`Urdu audio failed: ${msg}`);
          }
          throw err;
        }
      })();

      inflight.set(key, p);
      try {
        return await p;
      } finally {
        inflight.delete(key);
      }
    };

    const prefetchAhead = (fromIndex) => {
      const maxAhead = language === 'urdu' ? 1 : TTS_BATCH_SIZE;
      for (let k = 1; k <= maxAhead; k++) {
        const idx = fromIndex + k;
        if (idx >= segments.length) break;
        const key = cacheKey(idx, language, pinnedVoice);
        if (!cache.has(key) && !inflight.has(key)) {
          loadSegment(idx).catch(() => {});
        }
      }
    };

    for (let i = Math.max(0, startSegmentIndex); i < segments.length; i++) {
      if (halted || isCancelled?.()) break;
      checkpoint.segmentIndex = i;

      const payload = await loadSegment(i);
      if (halted || isCancelled?.()) break;
      if (!payload?.audio) {
        throw new Error(
          'Could not load audio. Check Django is running, pip install -r requirements.txt, and api.local.js points to your server.'
        );
      }

      prefetchAhead(i);

      if (i === startSegmentIndex) onFirstReady?.();
      if (payload?.urdu_text && onUrduPart) onUrduPart(payload.urdu_text, i);

      const durationMs = estimateSegmentDurationMs(payload.audio);
      onSegmentStart?.(i, { durationMs, segmentText: segments[i], offsetSec: i === startSegmentIndex ? checkpoint.offsetSec : 0 });

      if (!halted && !isCancelled?.()) {
        const playPromise = playBase64AudioAndWait(payload.audio, payload.format || 'mp3', {
          isAborted: () => halted || isCancelled?.(),
          isPaused: () => paused,
        });

        let wasPaused = false;
        const pausePoller = setInterval(() => {
          if (halted || isCancelled?.()) return;
          if (paused && !wasPaused) {
            pauseNativePlayback();
            wasPaused = true;
          } else if (!paused && wasPaused) {
            resumeNativePlayback();
            wasPaused = false;
          }
        }, 200);

        try {
          await playPromise;
        } finally {
          clearInterval(pausePoller);
        }

        if (halted || isCancelled?.()) {
          stopNativePlayback();
          break;
        }
      }
      checkpoint.offsetSec = 0;
      onProgress?.(i + 1, segments.length);
    }
  })();

  return { stop: halt, pause, resume, promise, getCheckpoint };
}
