import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, AppState } from 'react-native';
import { Volume2, Square, ChevronDown, ChevronUp, Pause, Play } from 'lucide-react-native';
import Text from './ui/Text';
import { useTheme } from '../theme/ThemeContext';
import {
  TTS_LANGUAGES,
  requestArticleTtsPlan,
  playArticleTtsStreaming,
  stopNativePlayback,
  createTtsSessionId,
  getNativePlaybackPosition,
  getNativePlaybackDuration,
} from '../utils/articleTts';
import {
  lineIndicesForSegment,
  syncHighlightsToPlayback,
} from '../utils/ttsHighlight';

export default function ArticleTtsPlayer({
  text,
  colors,
  disabled = false,
  highlightLines = [],
  onActiveLineIndex,
  defaultCollapsed = true,
  articleId = '',
}) {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
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
  const sessionOptsRef = useRef({ ttsSessionId: null, voice: null, startSegmentIndex: 0 });
  statusRef.current = status;

  const listenText = String(text || '').trim();
  const palette = colors || theme.colors;
  const border = palette.border || '#e5e7eb';
  const bg = palette.surfaceElevated || palette.backgroundSecondary || '#f8fafc';
  const textPrimary = palette.textPrimary || '#0f172a';
  const textSecondary = palette.textSecondary || '#64748b';
  const isActive = status === 'loading' || status === 'playing' || status === 'paused';
  const btnBg = isActive ? palette.textTertiary || '#737373' : isDark ? palette.textPrimary : palette.primary;
  const btnFg = isDark ? palette.background || '#0a0a0a' : palette.textOnPrimary || '#ffffff';

  useEffect(() => {
    if (isActive) setExpanded(true);
  }, [isActive]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background' && statusRef.current === 'playing') {
        playbackRef.current?.pause?.();
        setStatus('paused');
        highlightControllerRef.current?.pause?.();
        getNativePlaybackPosition().then((sec) => {
          highlightCheckpointRef.current.elapsedMs = Math.round((sec || 0) * 1000);
        });
      }
    });
    return () => sub.remove();
  }, []);

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
    stopNativePlayback();
    clearLineHighlights();
    setProgress({ current: 0, total: 0 });
    setStatus('idle');
    setError('');
    sessionOptsRef.current = { ttsSessionId: null, voice: null, startSegmentIndex: 0 };
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
          const liveDur = getNativePlaybackDuration();
          const durSec =
            liveDur > 0 ? liveDur : segmentPlaybackRef.current.durationMs / 1000;
          const elapsed = Math.max(0, Math.min(Number(pos) || 0, durSec || 0));
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
        intervalMs: 200,
      });

      highlightControllerRef.current = controller;
      cancelLineHighlightRef.current = () => controller?.cancel?.();
    },
    [highlightLines, onActiveLineIndex]
  );

  const runPlayback = async (startIndex = 0) => {
    const segments = segmentsRef.current;
    if (!segments.length) return;

    if (!sessionOptsRef.current.ttsSessionId) {
      sessionOptsRef.current.ttsSessionId = createTtsSessionId(articleId);
    }

    const session = playArticleTtsStreaming(segments, language, {
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
      setError(
        'Playback did not start. Restart Django, run pip install -r requirements.txt, then try again.'
      );
      return;
    }
    setStatus('idle');
    setProgress({ current: 0, total: 0 });
    sessionOptsRef.current = { ttsSessionId: null, voice: null, startSegmentIndex: 0 };
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

    if (statusRef.current === 'playing' || statusRef.current === 'loading') {
      playbackRef.current?.pause?.();
      setStatus('paused');
      highlightControllerRef.current?.pause?.();
      getNativePlaybackPosition().then((sec) => {
        highlightCheckpointRef.current.elapsedMs = Math.round((sec || 0) * 1000);
      });
      return;
    }

    cancelledRef.current = false;
    audioStartedRef.current = false;
    setError('');
    setProgress({ current: 0, total: 0 });
    clearLineHighlights();
    setStatus('loading');
    sessionOptsRef.current = { ttsSessionId: createTtsSessionId(articleId), voice: null, startSegmentIndex: 0 };

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
      const msg = e?.message || 'Could not play audio.';
      if (
        msg.includes('Cannot find module') ||
        msg.includes('native module') ||
        msg.includes('not linked') ||
        msg.includes('Rebuild the app')
      ) {
        setError('Rebuild the app: npm install, then npm run android (or ios).');
      } else if (msg.includes('Sign in')) {
        setError(msg);
      } else if (msg.includes('timed out') || msg.includes('reachable')) {
        setError(`${msg} Set API_BASE in src/config/api.local.js to your Django server IP.`);
      } else {
        setError(msg);
      }
    }
  };

  if (!listenText) return null;

  const progressPct =
    progress.total > 0 ? Math.min(100, (progress.current / progress.total) * 100) : null;

  const primaryIcon =
    status === 'loading' ? (
      <ActivityIndicator color={btnFg} size="small" />
    ) : status === 'playing' ? (
      <Pause size={16} color={btnFg} />
    ) : status === 'paused' ? (
      <Play size={16} color={btnFg} />
    ) : (
      <Volume2 size={16} color={btnFg} />
    );

  const primaryLabel =
    status === 'loading' ? 'Loading' : status === 'playing' ? 'Pause' : status === 'paused' ? 'Resume' : 'Play';

  const playControls = (compact = false) => (
    <View style={styles.controlRow}>
      <TouchableOpacity
        style={[compact ? styles.playBtnCompact : styles.playBtn, { backgroundColor: btnBg }]}
        onPress={handlePlay}
        disabled={disabled || status === 'loading'}
        activeOpacity={0.85}
        accessibilityLabel={primaryLabel}
      >
        {primaryIcon}
        {!compact ? <Text style={[styles.playLabel, { color: btnFg }]}>{primaryLabel}</Text> : null}
      </TouchableOpacity>
      {isActive && status !== 'loading' ? (
        <TouchableOpacity
          style={[styles.stopBtn, { borderColor: border }]}
          onPress={stopPlayback}
          accessibilityLabel="Stop listening"
        >
          <Square size={14} color={textSecondary} fill={textSecondary} />
          {!compact ? (
            <Text style={[styles.stopLabel, { color: textSecondary }]}>Stop</Text>
          ) : null}
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.wrap, { borderColor: border, backgroundColor: bg }]}>
      <View style={styles.summaryRow}>
        <TouchableOpacity
          style={styles.summaryTap}
          onPress={() => setExpanded((v) => !v)}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
        >
          <Volume2 size={18} color={textSecondary} />
          <Text variant="caption" color={textPrimary} style={styles.summaryLabel}>
            Listen to article
          </Text>
        </TouchableOpacity>
        <View style={styles.summaryActions}>
          {!expanded ? playControls(true) : null}
          <TouchableOpacity
            onPress={() => setExpanded((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={expanded ? 'Collapse listen options' : 'Expand listen options'}
          >
            {expanded ? (
              <ChevronUp size={18} color={textSecondary} />
            ) : (
              <ChevronDown size={18} color={textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {expanded ? (
        <View style={styles.expandedBody}>
          <View style={styles.langRow}>
            {TTS_LANGUAGES.map((lang) => {
              const active = language === lang.id;
              return (
                <TouchableOpacity
                  key={lang.id}
                  disabled={isActive || disabled}
                  onPress={() => {
                    if (language !== lang.id) {
                      stopPlayback();
                      setLanguage(lang.id);
                    }
                  }}
                  style={[
                    styles.langChip,
                    {
                      borderColor: active ? textPrimary : border,
                      backgroundColor: active ? `${textPrimary}18` : 'transparent',
                    },
                  ]}
                >
                  <Text
                    variant="caption"
                    style={{ color: active ? textPrimary : textSecondary, fontWeight: '700', fontSize: 12 }}
                  >
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.playRow}>
            {playControls(false)}
            {isActive ? (
              <View style={[styles.progressTrack, { backgroundColor: border }]}>
                {progressPct == null ? (
                  <View style={[styles.progressIndeterminate, { backgroundColor: textSecondary }]} />
                ) : (
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: textSecondary, width: `${progressPct}%` },
                    ]}
                  />
                )}
              </View>
            ) : null}
          </View>

          {error ? (
            <Text variant="caption" style={{ color: colors?.error || '#ef4444', marginTop: 8 }}>
              {error}
            </Text>
          ) : null}
        </View>
      ) : error && isActive ? (
        <Text variant="caption" style={{ color: colors?.error || '#ef4444', marginTop: 8 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
  },
  summaryTap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    flex: 1,
    fontWeight: '700',
    fontSize: 13,
  },
  summaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandedBody: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.25)',
  },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  playRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 40,
  },
  controlRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  playBtnCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  playLabel: { fontWeight: '700', fontSize: 13 },
  stopLabel: { fontWeight: '600', fontSize: 12 },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    minWidth: 72,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressIndeterminate: {
    width: '35%',
    height: '100%',
    borderRadius: 3,
    opacity: 0.9,
  },
});
