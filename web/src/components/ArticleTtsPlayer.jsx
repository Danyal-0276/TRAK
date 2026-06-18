import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, Square, Loader2, ChevronDown, ChevronUp, Pause, Play } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import {
  TTS_LANGUAGES,
  requestArticleTtsPlan,
  playArticleTtsStreaming,
  createTtsSessionId,
  getNativePlaybackPosition,
  getNativePlaybackDuration,
  unlockWebAudioPlayback,
} from '../utils/articleTts';
import {
  lineIndicesForSegment,
  syncHighlightsToPlayback,
} from '../utils/ttsHighlight';

export default function ArticleTtsPlayer({
  text,
  disabled = false,
  highlightLines = [],
  onActiveLineIndex,
  defaultCollapsed = true,
  articleId = '',
}) {
  const { theme } = useTheme();
  const { colors } = theme;

  const [language, setLanguage] = useState('english');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [expanded, setExpanded] = useState(!defaultCollapsed);
  const playbackRef = useRef(null);
  const cancelledRef = useRef(false);
  const audioStartedRef = useRef(false);
  const statusRef = useRef(status);
  const cancelLineHighlightRef = useRef(null);
  const highlightControllerRef = useRef(null);
  const highlightCheckpointRef = useRef({ segmentIndex: 0, lineOffset: 0, elapsedMs: 0, durationMs: 0 });
  const segmentPlaybackRef = useRef({ segmentIndex: -1, durationMs: 0, offsetSec: 0 });
  const segmentsRef = useRef([]);
  const sessionOptsRef = useRef({ ttsSessionId: null, voice: null });
  statusRef.current = status;

  const listenText = String(text || '').trim();
  const border = colors.border;
  const bg = colors.backgroundSecondary;
  const textPrimary = colors.textPrimary;
  const textSecondary = colors.textSecondary;
  const isActive = status === 'loading' || status === 'playing' || status === 'paused';
  const isDark = theme.mode === 'dark';
  const btnBg = isActive ? colors.textTertiary : isDark ? colors.textPrimary : colors.primary;
  const btnFg = isDark ? colors.background : colors.textOnPrimary || '#ffffff';

  useEffect(() => {
    if (isActive) setExpanded(true);
  }, [isActive]);

  const clearLineHighlights = useCallback(() => {
    highlightControllerRef.current?.cancel?.();
    highlightControllerRef.current = null;
    cancelLineHighlightRef.current = null;
    onActiveLineIndex?.(-1);
  }, [onActiveLineIndex]);

  const stopPlayback = useCallback(() => {
    cancelledRef.current = true;
    playbackRef.current?.stop?.();
    playbackRef.current = null;
    clearLineHighlights();
    setProgress({ current: 0, total: 0 });
    setStatus('idle');
    setError('');
    sessionOptsRef.current = { ttsSessionId: null, voice: null };
  }, [clearLineHighlights]);

  useEffect(() => () => stopPlayback(), [stopPlayback]);

  const startHighlightForSegment = useCallback(
    (segmentIndex, durationMs, offsetSec = 0) => {
      cancelLineHighlightRef.current?.();
      const indices = lineIndicesForSegment(highlightLines, segmentIndex);
      if (!indices.length) return;

      const duration = Math.max(1, Number(durationMs) || 0);
      segmentPlaybackRef.current = { segmentIndex, durationMs: duration, offsetSec: offsetSec || 0 };
      highlightCheckpointRef.current = {
        segmentIndex,
        lineOffset: highlightCheckpointRef.current.segmentIndex === segmentIndex
          ? highlightCheckpointRef.current.lineOffset
          : 0,
        elapsedMs: Math.round((offsetSec || 0) * 1000),
        durationMs: duration,
      };

      const controller = syncHighlightsToPlayback({
        lineIndices: indices,
        lines: highlightLines,
        getElapsedSec: async () => {
          const pos = await getNativePlaybackPosition();
          const elapsed = Math.max(0, Number(pos) || 0);
          highlightCheckpointRef.current.elapsedMs = Math.round(elapsed * 1000);
          return elapsed;
        },
        getDurationSec: () => {
          const live = getNativePlaybackDuration();
          if (live > 0) {
            segmentPlaybackRef.current.durationMs = Math.round(live * 1000);
            return live;
          }
          return segmentPlaybackRef.current.durationMs / 1000;
        },
        onLine: (lineIdx) => {
          const localOffset = indices.indexOf(lineIdx);
          if (localOffset >= 0) highlightCheckpointRef.current.lineOffset = localOffset;
          onActiveLineIndex?.(lineIdx);
        },
        isCancelled: () => cancelledRef.current,
      });

      highlightControllerRef.current = controller;
      cancelLineHighlightRef.current = () => controller?.cancel?.();
    },
    [highlightLines, onActiveLineIndex]
  );

  const runPlayback = async (startIndex = 0) => {
    const session = playArticleTtsStreaming(segmentsRef.current, language, {
      startSegmentIndex: startIndex,
      ttsSessionId: sessionOptsRef.current.ttsSessionId,
      voice: sessionOptsRef.current.voice,
      isCancelled: () => cancelledRef.current,
      onFirstReady: () => {
        if (!cancelledRef.current) {
          audioStartedRef.current = true;
          setStatus('playing');
        }
      },
      onSegmentStart: (segmentIndex, { durationMs, offsetSec }) => {
        if (cancelledRef.current) return;
        const cp = playbackRef.current?.getCheckpoint?.();
        if (cp?.voice) sessionOptsRef.current.voice = cp.voice;
        segmentPlaybackRef.current = {
          segmentIndex,
          durationMs: Math.max(1, Number(durationMs) || 0),
          offsetSec: offsetSec || 0,
        };
      },
      onSegmentPlaybackStart: (segmentIndex, { durationMs, offsetSec }) => {
        if (cancelledRef.current) return;
        startHighlightForSegment(segmentIndex, durationMs, offsetSec);
      },
      onProgress: (current, total) => {
        if (!cancelledRef.current) setProgress({ current, total });
      },
    });
    playbackRef.current = session;
    await session.promise;
    if (cancelledRef.current) return;
    playbackRef.current = null;
    clearLineHighlights();
    if (!audioStartedRef.current) {
      setStatus('error');
      setError('Playback did not start. Restart Django and try again.');
      return;
    }
    setStatus('idle');
    setProgress({ current: 0, total: 0 });
    sessionOptsRef.current = { ttsSessionId: null, voice: null };
  };

  const handlePlay = async () => {
    if (!listenText || disabled) return;

    if (statusRef.current === 'paused') {
      playbackRef.current?.resume?.();
      setStatus('playing');
      const cp = playbackRef.current?.getCheckpoint?.();
      if (cp) {
        if (cp.voice) sessionOptsRef.current.voice = cp.voice;
        const offsetSec =
          (highlightCheckpointRef.current.elapsedMs || 0) / 1000 || cp.offsetSec || 0;
        startHighlightForSegment(
          cp.segmentIndex,
          highlightCheckpointRef.current.durationMs,
          offsetSec
        );
      }
      return;
    }

    if (statusRef.current === 'playing') {
      playbackRef.current?.pause?.();
      setStatus('paused');
      highlightControllerRef.current?.pause?.();
      getNativePlaybackPosition().then((sec) => {
        highlightCheckpointRef.current.elapsedMs = Math.round((sec || 0) * 1000);
      });
      return;
    }

    if (statusRef.current === 'loading') return;

    unlockWebAudioPlayback();

    cancelledRef.current = false;
    audioStartedRef.current = false;
    setError('');
    setProgress({ current: 0, total: 0 });
    clearLineHighlights();
    setStatus('loading');
    sessionOptsRef.current = { ttsSessionId: createTtsSessionId(articleId), voice: null };

    try {
      const segments = await requestArticleTtsPlan(listenText);
      if (cancelledRef.current) return;
      segmentsRef.current = segments;
      setProgress({ current: 0, total: segments.length });
      await runPlayback(0);
    } catch (e) {
      if (cancelledRef.current) return;
      stopPlayback();
      setStatus('error');
      setError(e?.message || 'Could not play article audio.');
    }
  };

  if (!listenText) return null;

  const progressPct =
    progress.total > 0 ? Math.min(100, (progress.current / progress.total) * 100) : null;

  const primaryLabel =
    status === 'loading' ? 'Loading' : status === 'playing' ? 'Pause' : status === 'paused' ? 'Resume' : 'Play';

  const playControls = (compact = false) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handlePlay();
        }}
        disabled={disabled || status === 'loading'}
        aria-label={primaryLabel}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: compact ? 0 : 6,
          width: compact ? 36 : 'auto',
          height: compact ? 36 : 'auto',
          padding: compact ? 0 : '8px 14px',
          borderRadius: compact ? 18 : 8,
          border: 'none',
          background: btnBg,
          color: btnFg,
          fontSize: 13,
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {status === 'loading' ? (
          <Loader2 size={16} style={{ animation: 'trak-tts-spin 1s linear infinite' }} />
        ) : status === 'playing' ? (
          <Pause size={16} />
        ) : status === 'paused' ? (
          <Play size={16} />
        ) : (
          <Volume2 size={16} />
        )}
        {!compact ? primaryLabel : null}
      </button>
      {isActive && status !== 'loading' ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            stopPlayback();
          }}
          aria-label="Stop listening"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '8px 10px',
            borderRadius: 8,
            border: `1px solid ${border}`,
            background: 'transparent',
            color: textSecondary,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Square size={14} fill="currentColor" />
          {!compact ? 'Stop' : null}
        </button>
      ) : null}
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes trak-tts-spin { to { transform: rotate(360deg); } }
        @keyframes trak-tts-indet {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
      <div
        style={{
          marginBottom: 16,
          padding: '10px 12px',
          borderRadius: 10,
          border: `1px solid ${border}`,
          backgroundColor: bg,
        }}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            padding: 0,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <Volume2 size={18} color={textSecondary} />
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: textPrimary }}>
            Listen to article
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!expanded ? playControls(true) : null}
            {expanded ? <ChevronUp size={18} color={textSecondary} /> : <ChevronDown size={18} color={textSecondary} />}
          </span>
        </button>

        {expanded ? (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${border}` }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {TTS_LANGUAGES.map((lang) => {
                const active = language === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    disabled={isActive || disabled}
                    onClick={() => {
                      if (language !== lang.id) {
                        stopPlayback();
                        setLanguage(lang.id);
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: `1px solid ${active ? textPrimary : border}`,
                      background: active ? colors.surfaceHover : 'transparent',
                      color: active ? textPrimary : textSecondary,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 40 }}>
              {playControls(false)}
              {isActive ? (
                <div
                  role="progressbar"
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: border,
                    overflow: 'hidden',
                    minWidth: 72,
                  }}
                >
                  {progressPct == null ? (
                    <div
                      style={{
                        width: '35%',
                        height: '100%',
                        borderRadius: 3,
                        backgroundColor: colors.textSecondary,
                        animation: 'trak-tts-indet 1.1s ease-in-out infinite',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: `${progressPct}%`,
                        height: '100%',
                        borderRadius: 3,
                        backgroundColor: colors.textSecondary,
                        transition: 'width 0.2s ease',
                      }}
                    />
                  )}
                </div>
              ) : null}
            </div>

            {error ? (
              <p style={{ margin: '8px 0 0', fontSize: 12, color: colors.error }}>{error}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
