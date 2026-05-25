import { Platform } from 'react-native';

const LINK_ERROR =
  'Audio playback is not available. Rebuild the app: npm run android or npm run ios';

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

/** Rough MP3 length from base64 size (fallback when FinishedPlaying never fires). */
function estimateDurationMs(base64Len) {
  const bytes = (base64Len * 3) / 4;
  const sec = Math.max(2, Math.min(180, bytes / 12000));
  return (sec + 1.5) * 1000;
}

/**
 * Play base64 MP3/WAV from cache dir. Resolves when playback ends or on error.
 */
export function playBase64AudioAndWait(base64Audio, format = 'mp3') {
  const { Blob, Sound } = getModules();
  const ext = String(format || 'mp3').toLowerCase() === 'wav' ? 'wav' : 'mp3';
  const clean = normalizeAudioBase64(base64Audio);
  if (!clean) return Promise.reject(new Error('No audio data received.'));

  return new Promise((resolve, reject) => {
    let settled = false;
    const subs = [];
    let maxTimer;
    let durationTimer;

    const finish = (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(maxTimer);
      clearTimeout(durationTimer);
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
      if (err) reject(err instanceof Error ? err : new Error(String(err)));
      else resolve();
    };

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
        /* older API */
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

    const path = `${Blob.fs.dirs.CacheDir}/trak-tts-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const uri = fileUri(path);

    Blob.fs
      .writeFile(path, clean, 'base64')
      .then(() => {
        try {
          Sound.loadUrl(uri);
        } catch {
          try {
            Sound.playUrl(uri);
            durationTimer = setTimeout(() => finish(), estimateDurationMs(clean.length));
          } catch (playErr) {
            finish(playErr);
          }
        }
      })
      .catch((err) => finish(err));
  });
}

export function stopNativePlayback() {
  try {
    const Sound = require('react-native-sound-player').default;
    Sound.stop();
  } catch {
    /* native module not linked */
  }
}
