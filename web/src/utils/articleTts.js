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

/** Call on user tap before any await so later segment play() is allowed. */
export function unlockWebAudioPlayback() {
  if (typeof window === 'undefined') return Promise.resolve();
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) {
      const ctx = new Ctx();
      return ctx.resume().then(() => ctx.close()).catch(() => {});
    }
  } catch {
    /* ignore */
  }
  return Promise.resolve();
}

function detectAudioFormat(bytes) {
  if (!bytes || bytes.length < 4) return null;
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return 'mp3';
  if (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) return 'mp3';
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) return 'wav';
  return null;
}

function base64ToBytes(base64Audio, format = 'mp3') {
  const clean = normalizeAudioBase64(base64Audio);
  if (!clean) throw new Error('No audio data received.');
  let binary;
  try {
    binary = atob(clean);
  } catch {
    throw new Error('Invalid audio data from server.');
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const detected = detectAudioFormat(bytes);
  const fmt = detected || String(format || 'mp3').toLowerCase();
  return { bytes, format: fmt };
}

function base64ToBlob(base64Audio, format = 'mp3') {
  const { bytes } = base64ToBytes(base64Audio, format);
  return new Blob([bytes]);
}

function mediaErrorMessage(audio) {
  const code = audio?.error?.code;
  if (code === 3) return 'Could not decode audio. Try English or restart the server.';
  if (code === 4) return 'This browser does not support the audio format from the server.';
  if (code === 2) return 'Network error while loading audio.';
  return 'Audio playback failed';
}

function cacheKey(index, language, voice) {
  return `${language}:${voice || 'default'}:${index}`;
}

let activeAudio = null;
let activeBlobUrl = null;

const wa = {
  ctx: null,
  source: null,
  buffer: null,
  segmentOffset: 0,
  playStartedAt: 0,
  pauseOffset: 0,
  useWebAudio: false,
  endingForPause: false,
};

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

function stopWebAudio() {
  if (wa.source) {
    try {
      wa.source.stop();
    } catch {
      /* ignore */
    }
    wa.source = null;
  }
  wa.buffer = null;
  wa.useWebAudio = false;
  wa.pauseOffset = 0;
  wa.segmentOffset = 0;
  wa.endingForPause = false;
}

async function ensureAudioContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) throw new Error('Web Audio is not supported in this browser.');
  if (!wa.ctx || wa.ctx.state === 'closed') {
    wa.ctx = new Ctx();
  }
  await wa.ctx.resume();
  return wa.ctx;
}

export function stopNativePlayback() {
  cleanupActiveAudio();
  stopWebAudio();
}

export function pauseNativePlayback() {
  if (wa.useWebAudio && wa.source && wa.ctx) {
    wa.endingForPause = true;
    wa.pauseOffset = wa.segmentOffset + (wa.ctx.currentTime - wa.playStartedAt);
    try {
      wa.source.stop();
    } catch {
      /* ignore */
    }
    wa.source = null;
    return;
  }
  activeAudio?.pause?.();
}

export function resumeNativePlayback() {
  activeAudio?.play?.().catch(() => {});
}

export async function getNativePlaybackPosition() {
  if (wa.useWebAudio && wa.ctx) {
    if (wa.source) {
      return wa.segmentOffset + (wa.ctx.currentTime - wa.playStartedAt);
    }
    return wa.pauseOffset;
  }
  return activeAudio?.currentTime || 0;
}

export function getNativePlaybackDuration() {
  if (wa.useWebAudio && wa.buffer?.duration > 0) {
    return wa.buffer.duration;
  }
  const dur = Number(activeAudio?.duration);
  return Number.isFinite(dur) && dur > 0 ? dur : 0;
}

async function measureBlobDurationMs(blob, fallbackBase64 = '') {
  if (!blob || blob.size < 32) {
    return estimateSegmentDurationMs(fallbackBase64);
  }
  if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
      await ctx.close().catch(() => {});
      if (buffer.duration > 0) {
        return Math.round(buffer.duration * 1000);
      }
    } catch {
      /* fall through */
    }
  }
  return estimateSegmentDurationMs(fallbackBase64);
}

function playBlobHtmlAudio(blob, { startAt = 0, isAborted, isPaused, onPlaybackStart } = {}) {
  cleanupActiveAudio();
  const url = URL.createObjectURL(blob);
  activeBlobUrl = url;
  const audio = new Audio();
  audio.setAttribute('playsinline', '');
  audio.preload = 'auto';
  audio.src = url;
  activeAudio = audio;

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (err) => {
      if (settled) return;
      settled = true;
      clearInterval(poll);
      clearTimeout(loadTimeout);
      cleanupActiveAudio();
      if (err) reject(err instanceof Error ? err : new Error(String(err)));
      else resolve();
    };

    const startPlayback = () => {
      if (settled || isAborted?.()) return;
      const dur = Number(audio.duration) || 0;
      const seek = dur > 0 ? Math.min(Math.max(0, startAt), Math.max(0, dur - 0.05)) : 0;
      if (seek > 0) {
        try {
          audio.currentTime = seek;
        } catch {
          /* ignore */
        }
      }
      audio.play().then(() => onPlaybackStart?.()).catch((e) => {
        if (e?.name === 'NotAllowedError') {
          finish(new Error('Tap Play again to allow audio in your browser.'));
        } else {
          finish(e);
        }
      });
    };

    audio.addEventListener('ended', () => finish(), { once: true });
    audio.addEventListener('error', () => finish(new Error(mediaErrorMessage(audio))), { once: true });
    audio.addEventListener('canplay', startPlayback, { once: true });

    const loadTimeout = setTimeout(() => {
      if (!settled && audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
        finish(new Error('Audio took too long to load. Try again.'));
      }
    }, 60000);

    const poll = setInterval(() => {
      if (isAborted?.()) {
        finish();
        return;
      }
      if (isPaused?.()) return;
      const dur = Number(audio.duration) || 0;
      const cur = Number(audio.currentTime) || 0;
      if (dur > 0 && cur >= dur - 0.15) finish();
    }, 250);
  });
}

function playBlobWebAudio(blob, { startAt = 0, isAborted, isPaused, onPlaybackStart } = {}) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let poll = null;
    let buffer = null;
    let ctx = null;

    const finish = (err) => {
      if (settled) return;
      settled = true;
      if (poll) clearInterval(poll);
      stopWebAudio();
      if (err) reject(err instanceof Error ? err : new Error(String(err)));
      else resolve();
    };

    const playFrom = (offset) => {
      if (!ctx || !buffer || settled) return;
      if (wa.source) {
        try {
          wa.source.stop();
        } catch {
          /* ignore */
        }
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx.destination);
      wa.playStartedAt = ctx.currentTime;
      wa.segmentOffset = offset;
      wa.source = src;
      wa.useWebAudio = true;
      wa.buffer = buffer;
      src.onended = () => {
        if (wa.endingForPause) {
          wa.endingForPause = false;
          return;
        }
        if (!isPaused?.()) finish();
      };
      try {
        src.start(0, Math.min(offset, Math.max(0, buffer.duration - 0.01)));
        onPlaybackStart?.();
      } catch (e) {
        finish(e);
      }
    };

    (async () => {
      try {
        ctx = await ensureAudioContext();
        const arrayBuffer = await blob.arrayBuffer();
        buffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
        wa.pauseOffset = Math.min(Math.max(0, startAt), buffer.duration);
        playFrom(wa.pauseOffset);

        poll = setInterval(() => {
          if (isAborted?.()) {
            finish();
            return;
          }
          if (isPaused?.()) {
            if (wa.source && !wa.endingForPause) {
              wa.endingForPause = true;
              wa.pauseOffset = wa.segmentOffset + (ctx.currentTime - wa.playStartedAt);
              try {
                wa.source.stop();
              } catch {
                /* ignore */
              }
              wa.source = null;
            }
            return;
          }
          if (!wa.source && buffer) {
            playFrom(wa.pauseOffset);
          }
          const cur = wa.source
            ? wa.segmentOffset + (ctx.currentTime - wa.playStartedAt)
            : wa.pauseOffset;
          if (buffer.duration > 0 && cur >= buffer.duration - 0.05) finish();
        }, 250);
      } catch (e) {
        finish(
          e instanceof DOMException
            ? new Error('Could not decode audio from the server. Try English or restart the API.')
            : e
        );
      }
    })();
  });
}

async function playBlobAndWait(blob, { startAt = 0, isAborted, isPaused, onPlaybackStart } = {}) {
  if (!blob || blob.size < 32) {
    throw new Error('Received empty or invalid audio from server.');
  }

  stopWebAudio();
  cleanupActiveAudio();

  if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
    try {
      return await playBlobWebAudio(blob, { startAt, isAborted, isPaused, onPlaybackStart });
    } catch (e) {
      console.warn('Web Audio playback failed, trying HTML audio', e);
    }
  }

  return playBlobHtmlAudio(blob, { startAt, isAborted, isPaused, onPlaybackStart });
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
    onSegmentPlaybackStart,
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
        if (payload?.voice_id) pinnedVoice = payload.voice_id;
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

      const durationMs = await measureBlobDurationMs(entry.blob, entry.payload?.audio);
      const startAt = i === startSegmentIndex ? checkpoint.offsetSec : 0;
      onSegmentStart?.(i, { durationMs, segmentText: segments[i], offsetSec: startAt });

      if (!halted && !isCancelled?.()) {
        let playbackStarted = false;
        const playPromise = playBlobAndWait(entry.blob, {
          startAt,
          isAborted: () => halted || isCancelled?.(),
          isPaused: () => paused,
          onPlaybackStart: () => {
            if (playbackStarted) return;
            playbackStarted = true;
            onSegmentPlaybackStart?.(i, { durationMs, offsetSec: startAt });
          },
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
