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

export async function requestArticleTtsPlan(fullText) {
  const segments = planSegmentsLocally(fullText);
  if (!segments.length) throw new Error('Nothing to read aloud.');
  return segments;
}

export async function requestArticleTtsChunks(segmentTexts, language = 'english', opts = {}) {
  const { ttsSessionId, voice } = opts;
  try {
    const payload = await postTts(
      '/article-tts/chunks/',
      { segments: segmentTexts, language, tts_session_id: ttsSessionId, voice },
      TTS_CHUNK_TIMEOUT_MS
    );
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
    const payload = await postTts(
      '/article-tts/chunk/',
      { text: segmentText, language, tts_session_id: ttsSessionId, voice },
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

function base64ToBlob(base64Audio, format = 'mp3') {
  const clean = normalizeAudioBase64(base64Audio);
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const mime = String(format || 'mp3').toLowerCase() === 'wav' ? 'audio/wav' : 'audio/mpeg';
  return new Blob([bytes], { type: mime });
}

function cacheKey(index, language, voice) {
  return `${language}:${voice || 'default'}:${index}`;
}

let activeAudio = null;
let activeBlobUrl = null;

function cleanupActiveAudio() {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.src = '';
    } catch {
      /* ignore */
    }
    activeAudio = null;
  }
  if (activeBlobUrl) {
    try {
      URL.revokeObjectURL(activeBlobUrl);
    } catch {
      /* ignore */
    }
    activeBlobUrl = null;
  }
}

export function stopNativePlayback() {
  cleanupActiveAudio();
}

export function pauseNativePlayback() {
  activeAudio?.pause?.();
}

export function resumeNativePlayback() {
  activeAudio?.play?.().catch(() => {});
}

export async function getNativePlaybackPosition() {
  return activeAudio?.currentTime || 0;
}

function playBlobAndWait(blob, { startAt = 0, isAborted } = {}) {
  cleanupActiveAudio();
  const url = URL.createObjectURL(blob);
  activeBlobUrl = url;
  const audio = new Audio(url);
  activeAudio = audio;

  return new Promise((resolve, reject) => {
    const finish = (err) => {
      cleanupActiveAudio();
      if (err) reject(err);
      else resolve();
    };

    audio.addEventListener('ended', () => finish());
    audio.addEventListener('error', () => finish(new Error('Audio playback failed')));

    const poll = setInterval(() => {
      if (isAborted?.()) {
        clearInterval(poll);
        finish();
      }
    }, 150);

    audio.addEventListener('loadedmetadata', () => {
      if (startAt > 0) audio.currentTime = startAt;
      audio.play().catch((e) => {
        clearInterval(poll);
        finish(e);
      });
    });

    audio.load();
  });
}

function estimateSegmentDurationMs(base64Audio) {
  const len = String(base64Audio || '').length;
  const bytes = (len * 3) / 4;
  const sec = Math.max(2, Math.min(180, bytes / 12000));
  return Math.round((sec + 0.5) * 1000);
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
    checkpoint.offsetSec = activeAudio?.currentTime || 0;
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
          return await inflight.get(key);
        } catch (err) {
          throw err;
        }
      }

      const p = (async () => {
        const payload = await requestArticleTtsChunk(segments[index], language, {
          ttsSessionId: sessionId,
          voice: pinnedVoice,
        });
        if (payload?.voice_id && !pinnedVoice) pinnedVoice = payload.voice_id;
        const blob = base64ToBlob(payload.audio, payload.format || 'mp3');
        const entry = { blob, urdu: payload.urdu_text, payload };
        cache.set(cacheKey(index, language, pinnedVoice), entry);
        return entry;
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
        if (!cache.has(key) && !inflight.has(key)) loadSegment(idx).catch(() => {});
      }
    };

    for (let i = Math.max(0, startSegmentIndex); i < segments.length; i++) {
      if (halted || isCancelled?.()) break;
      checkpoint.segmentIndex = i;

      const entry = await loadSegment(i);
      if (halted || isCancelled?.()) break;
      if (!entry) {
        throw new Error('Could not load audio. Check that Django is running and TTS dependencies are installed.');
      }

      prefetchAhead(i);

      if (i === startSegmentIndex) onFirstReady?.();
      if (entry?.urdu && onUrduPart) onUrduPart(entry.urdu, i);

      const durationMs = estimateSegmentDurationMs(entry.payload?.audio);
      const startAt = i === startSegmentIndex ? checkpoint.offsetSec : 0;
      onSegmentStart?.(i, { durationMs, segmentText: segments[i], offsetSec: startAt });

      if (!halted && !isCancelled?.()) {
        const playPromise = playBlobAndWait(entry.blob, {
          startAt,
          isAborted: () => halted || isCancelled?.(),
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
      }

      checkpoint.offsetSec = 0;
      onProgress?.(i + 1, segments.length);
    }
  })();

  return { stop: halt, pause, resume, promise, getCheckpoint };
}
