import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Volume2, Square, ChevronDown, ChevronUp } from 'lucide-react-native';
import Text from './ui/Text';
import { useTheme } from '../theme/ThemeContext';
import {
  TTS_LANGUAGES,
  requestArticleTtsPlan,
  playArticleTtsStreaming,
  stopNativePlayback,
} from '../utils/articleTts';
import {
  lineIndicesForSegment,
  scheduleLineHighlights,
} from '../utils/ttsHighlight';

export default function ArticleTtsPlayer({
  text,
  colors,
  disabled = false,
  highlightLines = [],
  onActiveLineIndex,
  defaultCollapsed = true,
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
  statusRef.current = status;

  const listenText = String(text || '').trim();
  const palette = colors || theme.colors;
  const border = palette.border || '#e5e7eb';
  const bg = palette.surfaceElevated || palette.backgroundSecondary || '#f8fafc';
  const textPrimary = palette.textPrimary || '#0f172a';
  const textSecondary = palette.textSecondary || '#64748b';
  const isActive = status === 'loading' || status === 'playing';
  const btnBg = isActive ? palette.textTertiary || '#737373' : isDark ? palette.textPrimary : palette.primary;
  const btnFg = isDark ? palette.background || '#0a0a0a' : palette.textOnPrimary || '#ffffff';

  useEffect(() => {
    if (isActive) setExpanded(true);
  }, [isActive]);

  const clearLineHighlights = useCallback(() => {
    cancelLineHighlightRef.current?.();
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
  }, [clearLineHighlights]);

  useEffect(() => () => stopPlayback(), [stopPlayback]);

  const handlePlay = async () => {
    if (!listenText || disabled) return;
    if (statusRef.current === 'playing' || statusRef.current === 'loading') {
      stopPlayback();
      return;
    }

    cancelledRef.current = false;
    audioStartedRef.current = false;
    setError('');
    setProgress({ current: 0, total: 0 });
    clearLineHighlights();
    setStatus('loading');

    try {
      const segments = await requestArticleTtsPlan(listenText);
      if (cancelledRef.current) return;

      setProgress({ current: 0, total: segments.length });

      const session = playArticleTtsStreaming(segments, language, {
        isCancelled: () => cancelledRef.current,
        onFirstReady: () => {
          if (!cancelledRef.current) {
            audioStartedRef.current = true;
            setStatus('playing');
          }
        },
        onSegmentStart: (segmentIndex, { durationMs }) => {
          if (cancelledRef.current) return;
          cancelLineHighlightRef.current?.();
          const indices = lineIndicesForSegment(highlightLines, segmentIndex);
          if (!indices.length) return;
          cancelLineHighlightRef.current = scheduleLineHighlights(
            indices,
            highlightLines,
            durationMs,
            (lineIdx) => onActiveLineIndex?.(lineIdx),
            () => cancelledRef.current
          );
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

  const playButton = (compact = false) => (
    <TouchableOpacity
      style={[
        compact ? styles.playBtnCompact : styles.playBtn,
        { backgroundColor: btnBg },
      ]}
      onPress={handlePlay}
      disabled={disabled}
      activeOpacity={0.85}
      accessibilityLabel={isActive ? 'Stop listening' : 'Play article audio'}
    >
      {status === 'loading' ? (
        <ActivityIndicator color={btnFg} size="small" />
      ) : status === 'playing' ? (
        <Square size={16} color={btnFg} fill={btnFg} />
      ) : (
        <Volume2 size={16} color={btnFg} />
      )}
      {!compact ? (
        <Text style={[styles.playLabel, { color: btnFg }]}>{isActive ? 'Stop' : 'Play'}</Text>
      ) : null}
    </TouchableOpacity>
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
          {!expanded ? playButton(true) : null}
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
            {playButton(false)}
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
  playLabel: { fontWeight: '700', fontSize: 13 },
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
