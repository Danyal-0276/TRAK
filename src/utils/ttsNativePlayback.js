import { Platform } from 'react-native';

const LINK_ERROR =
  'Audio playback is not available. Rebuild the app: npm run android or npm run ios';

let activeSession = null;
let activeTrackDurationSec = 0;
let nextSessionId = 0;

export function getNativePlaybackDuration() {
  return activeTrackDurationSec > 0 ? activeTrackDurationSec : 0;
}

function getModules() {
  try {
    return {
      Blob: require('react-native-blob-util').default,
      Sound: require('react-native-sound-player').default,
    };
  } catch {
    throw new Error(LINK_ERROR);
  }
}

export function normalizeAudioBase64(raw) {
  let s = String(raw || '').trim();
  const prefix = s.indexOf('base64,');
  if (prefix !== -1) s = s.slice(prefix + 7);
  return s.replace(/\s/g, '');
}

function fileUri(path) {
  const p = String(path || '');
  if (p.startsWith('file://')) return p;
  return `file://${p}`;
}

function estimateDurationSec(base64Len) {
  const bytes = (base64Len * 3) / 4;
  return Math.max(2, Math.min(180, bytes / 12000));
}

function stopSoundQuietly(Sound) {
  try {
    Sound.stop();
  } catch {
    /* ignore */
  }
}

export function pauseNativePlayback() {
  try {
    const Sound = require('react-native-sound-player').default;
    Sound.pause();
    if (activeSession) activeSession.paused = true;
  } catch {
    /* ignore */
  }
}

export function resumeNativePlayback() {
  try {
    const Sound = require('react-native-sound-player').default;
    Sound.resume();
    if (activeSession) activeSession.paused = false;
  } catch {
    /* ignore */
  }
}

export async function getNativePlaybackPosition() {
  if (activeSession && !activeSession.aborted) {
    return activeSession.elapsedSec || 0;
  }
  try {
    const Sound = require('react-native-sound-player').default;
    const info = await Sound.getInfo();
    return Number(info?.currentTime) || 0;
  } catch {
    return 0;
  }
}

export function seekNativePlayback(seconds) {
  try {
    const Sound = require('react-native-sound-player').default;
    Sound.seek(Number(seconds) || 0);
    if (activeSession) activeSession.elapsedSec = Number(seconds) || 0;
  } catch {
    /* ignore */
  }
}

export function stopNativePlayback() {
  const session = activeSession;
  if (session) {
    session.aborted = true;
    session.cleanup?.();
  } else {
    try {
      const Sound = require('react-native-sound-player').default;
      stopSoundQuietly(Sound);
    } catch {
      /* ignore */
    }
    activeTrackDurationSec = 0;
  }
}

/** Brief pause so native player can finish teardown before the next chunk. */
export function settleNativePlayback(ms = 100) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Play base64 MP3/WAV from cache dir. Resolves when playback ends, aborted, or errored.
 */
export function playBase64AudioAndWait(base64Audio, format = 'mp3', { isAborted, isPaused, onPlaybackStart } = {}) {
  const { Blob, Sound } = getModules();
  const ext = String(format || 'mp3').toLowerCase() === 'wav' ? 'wav' : 'mp3';
  const clean = normalizeAudioBase64(base64Audio);
  if (!clean) return Promise.reject(new Error('No audio data received.'));

  const sessionId = ++nextSessionId;
  stopSoundQuietly(Sound);
  activeTrackDurationSec = 0;

  return new Promise((resolve, reject) => {
    let settled = false;
    const subs = [];
    let maxTimer = null;
    let progressTimer = null;
    let armTimer = null;
    let pollAbort = null;
    const startedAt = Date.now();
    const estimatedSec = estimateDurationSec(clean.length);

    const session = {
      id: sessionId,
      aborted: false,
      paused: false,
      elapsedSec: 0,
      playbackStarted: false,
      armedForCompletion: false,
      cleanup: null,
      filePath: '',
    };
    activeSession = session;

    const removeListeners = () => {
      subs.forEach((s) => {
        try {
          s?.remove?.();
        } catch {
          /* ignore */
        }
      });
      subs.length = 0;
    };

    const deleteTempFile = () => {
      if (!session.filePath) return;
      Blob.fs.unlink(session.filePath).catch(() => {});
      session.filePath = '';
    };

    const finish = (err) => {
      if (settled || sessionId !== session.id) return;
      settled = true;
      if (maxTimer) clearTimeout(maxTimer);
      if (progressTimer) clearInterval(progressTimer);
      if (armTimer) clearTimeout(armTimer);
      if (pollAbort) clearInterval(pollAbort);
      removeListeners();
      stopSoundQuietly(Sound);
      deleteTempFile();
      if (activeSession === session) {
        activeSession = null;
        activeTrackDurationSec = 0;
      }
      if (err) reject(err instanceof Error ? err : new Error(String(err)));
      else resolve();
    };

    session.cleanup = () => finish();

    const armCompletion = () => {
      if (session.armedForCompletion || settled) return;
      session.armedForCompletion = true;
    };

    const markPlaybackStarted = () => {
      if (session.playbackStarted || settled) return;
      session.playbackStarted = true;
      if (Platform.OS === 'ios') {
        try {
          Sound.setSpeaker(true);
        } catch {
          /* ignore */
        }
      }
      armTimer = setTimeout(armCompletion, 400);
      Sound.getInfo()
        .then((info) => {
          if (info?.duration > 0) activeTrackDurationSec = info.duration;
          onPlaybackStart?.();
        })
        .catch(() => onPlaybackStart?.());
    };

    const maybeFinishNearEnd = (cur, dur) => {
      if (!session.armedForCompletion || session.paused || isPaused?.()) return;
      if (dur < 0.5) return;
      if (cur >= Math.max(dur - 0.45, dur * 0.97)) finish();
    };

    const startProgressTimer = () => {
      if (progressTimer) return;
      progressTimer = setInterval(async () => {
        if (settled || session.aborted || isAborted?.()) {
          finish();
          return;
        }
        if (session.paused || isPaused?.()) return;
        if (!session.playbackStarted) return;

        try {
          const info = await Sound.getInfo();
          const dur = Number(info?.duration) || activeTrackDurationSec || estimatedSec;
          const cur = Math.max(0, Number(info?.currentTime) || 0);
          if (dur > 0) activeTrackDurationSec = dur;
          session.elapsedSec = dur > 0 ? Math.min(cur, dur) : cur;
          maybeFinishNearEnd(session.elapsedSec, dur);
        } catch {
          session.elapsedSec = (Date.now() - startedAt) / 1000;
          maybeFinishNearEnd(session.elapsedSec, estimatedSec);
        }
      }, 200);
    };

    const onFinishedPlaying = () => {
      if (!session.armedForCompletion) return;
      if (session.paused || isPaused?.()) return;
      finish();
    };

    try {
      subs.push(Sound.addEventListener('FinishedPlaying', onFinishedPlaying));
      subs.push(
        Sound.addEventListener('OnSetupError', (data) =>
          finish(new Error(data?.message || 'Audio setup failed'))
        )
      );
      subs.push(
        Sound.addEventListener('FinishedLoadingURL', () => {
          if (settled || sessionId !== session.id) return;
          markPlaybackStarted();
          startProgressTimer();
        })
      );
    } catch {
      try {
        Sound.onFinishedPlaying((success) => {
          if (success !== false) onFinishedPlaying();
        });
      } catch {
        /* ignore */
      }
    }

    maxTimer = setTimeout(
      () => finish(new Error('Audio playback timed out')),
      Math.max(60000, Math.round((estimatedSec + 30) * 1000))
    );

    pollAbort = setInterval(() => {
      if (isAborted?.() || session.aborted) finish();
    }, 250);

    const path = `${Blob.fs.dirs.CacheDir}/trak-tts-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    session.filePath = path;
    const uri = fileUri(path);

    Blob.fs
      .writeFile(path, clean, 'base64')
      .then(() => {
        if (settled || session.aborted || isAborted?.()) {
          finish();
          return;
        }
        try {
          Sound.playUrl(uri);
          setTimeout(() => {
            if (settled || sessionId !== session.id || session.playbackStarted) return;
            markPlaybackStarted();
            startProgressTimer();
          }, 700);
        } catch (playErr) {
          finish(playErr);
        }
      })
      .catch((err) => finish(err));
  });
}
