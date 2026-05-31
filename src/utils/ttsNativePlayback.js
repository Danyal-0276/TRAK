import { Platform } from 'react-native';

const LINK_ERROR =
  'Audio playback is not available. Rebuild the app: npm run android or npm run ios';

let activeSession = null;

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

function estimateDurationMs(base64Len) {
  const bytes = (base64Len * 3) / 4;
  const sec = Math.max(2, Math.min(180, bytes / 12000));
  return (sec + 1.5) * 1000;
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
  try {
    const Sound = require('react-native-sound-player').default;
    const info = await Sound.getInfo();
    return Number(info?.currentTime ?? info?.currentTime ?? 0) || 0;
  } catch {
    return activeSession?.elapsedSec || 0;
  }
}

export function seekNativePlayback(seconds) {
  try {
    const Sound = require('react-native-sound-player').default;
    Sound.seek(Number(seconds) || 0);
  } catch {
    /* ignore */
  }
}

export function stopNativePlayback() {
  try {
    const Sound = require('react-native-sound-player').default;
    Sound.stop();
  } catch {
    /* native module not linked */
  }
  if (activeSession) {
    activeSession.aborted = true;
    activeSession.cleanup?.();
    activeSession = null;
  }
}

/**
 * Play base64 MP3/WAV from cache dir. Resolves when playback ends, aborted, or errored.
 * Supports pause/resume via Sound.pause/resume without resolving early.
 */
export function playBase64AudioAndWait(base64Audio, format = 'mp3', { isAborted, isPaused } = {}) {
  const { Blob, Sound } = getModules();
  const ext = String(format || 'mp3').toLowerCase() === 'wav' ? 'wav' : 'mp3';
  const clean = normalizeAudioBase64(base64Audio);
  if (!clean) return Promise.reject(new Error('No audio data received.'));

  return new Promise((resolve, reject) => {
    let settled = false;
    const subs = [];
    let maxTimer;
    let durationTimer;
    let positionTimer;
    const startedAt = Date.now();

    const session = {
      aborted: false,
      paused: false,
      elapsedSec: 0,
      cleanup: null,
    };
    activeSession = session;

    const finish = (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(maxTimer);
      clearTimeout(durationTimer);
      clearInterval(positionTimer);
      subs.forEach((s) => {
        try {
          s?.remove?.();
        } catch {
          /* ignore */
        }
      });
      try {
        Sound.stop();
      } catch {
        /* ignore */
      }
      if (activeSession === session) activeSession = null;
      if (err) reject(err instanceof Error ? err : new Error(String(err)));
      else resolve();
    };

    session.cleanup = () => finish();

    let playbackStarted = false;
    const onReadyPlay = () => {
      if (playbackStarted) return;
      playbackStarted = true;
      try {
        if (Platform.OS === 'ios') {
          try {
            Sound.setSpeaker(true);
          } catch {
            /* ignore */
          }
        }
        Sound.play();
        durationTimer = setTimeout(() => finish(), estimateDurationMs(clean.length));
        Sound.getInfo()
          .then((info) => {
            if (info?.duration > 0) {
              clearTimeout(durationTimer);
              durationTimer = setTimeout(
                () => finish(),
                Math.min((info.duration + 1.5) * 1000, 180000)
              );
            }
          })
          .catch(() => {});
        positionTimer = setInterval(() => {
          if (session.paused) return;
          session.elapsedSec = (Date.now() - startedAt) / 1000;
        }, 400);
      } catch (e) {
        finish(e);
      }
    };

    const attachListeners = () => {
      try {
        subs.push(Sound.addEventListener('FinishedPlaying', () => finish()));
        subs.push(
          Sound.addEventListener('OnSetupError', (data) =>
            finish(new Error(data?.message || 'Audio setup failed'))
          )
        );
        subs.push(Sound.addEventListener('FinishedLoadingURL', onReadyPlay));
        subs.push(Sound.addEventListener('FinishedLoading', onReadyPlay));
        subs.push(Sound.addEventListener('FinishedLoadingFile', onReadyPlay));
      } catch {
        try {
          Sound.onFinishedPlaying((success) => {
            if (success !== false) finish();
          });
        } catch {
          /* ignore */
        }
      }
    };

    attachListeners();
    maxTimer = setTimeout(() => finish(new Error('Audio playback timed out')), 180000);

    const pollAbort = setInterval(() => {
      if (isAborted?.() || session.aborted) {
        clearInterval(pollAbort);
        finish();
      }
    }, 200);

    const path = `${Blob.fs.dirs.CacheDir}/trak-tts-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const uri = fileUri(path);

    Blob.fs
      .writeFile(path, clean, 'base64')
      .then(() => {
        if (isAborted?.() || session.aborted) {
          clearInterval(pollAbort);
          finish();
          return;
        }
        try {
          Sound.loadUrl(uri);
        } catch {
          try {
            Sound.playUrl(uri);
            durationTimer = setTimeout(() => finish(), estimateDurationMs(clean.length));
          } catch (playErr) {
            clearInterval(pollAbort);
            finish(playErr);
          }
        }
      })
      .catch((err) => {
        clearInterval(pollAbort);
        finish(err);
      });
  });
}
