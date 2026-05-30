import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, Square, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import {
  TTS_LANGUAGES,
  requestArticleTtsPlan,
  playArticleTtsStreaming,
} from '../utils/articleTts';
import {
  lineIndicesForSegment,
  scheduleLineHighlights,
} from '../utils/ttsHighlight';

export default function ArticleTtsPlayer({
  text,
  disabled = false,
  highlightLines = [],
  onActiveLineIndex,
  defaultCollapsed = true,
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
  const cancelLineHighlightRef = useRef(null);

  const listenText = String(text || '').trim();
  const border = colors.border;
  const bg = colors.backgroundSecondary;
  const textPrimary = colors.textPrimary;
  const textSecondary = colors.textSecondary;
  const isActive = status === 'loading' || status === 'playing';

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
    clearLineHighlights();
    setProgress({ current: 0, total: 0 });
    setStatus('idle');
    setError('');
  }, [clearLineHighlights]);

  useEffect(() => () => stopPlayback(), [stopPlayback]);

  const handlePlay = async () => {
    if (!listenText || disabled) return;
    if (status === 'playing' || status === 'loading') {
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
      setError(e?.message || 'Could not play article audio. Try again.');
    }
  };

  if (!listenText) return null;

  const progressPct =
    progress.total > 0 ? Math.min(100, (progress.current / progress.total) * 100) : null;

  const playButton = (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handlePlay();
      }}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        borderRadius: 8,
        border: 'none',
        flexShrink: 0,
        background: colors.primary,
        color: colors.textOnPrimary || '#fff',
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {status === 'loading' ? (
        <Loader2 size={16} style={{ animation: 'trak-tts-spin 1s linear infinite' }} />
      ) : status === 'playing' ? (
        <Square size={16} fill="currentColor" />
      ) : (
        <Volume2 size={16} />
      )}
      {isActive ? 'Stop' : 'Play'}
    </button>
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
            {!expanded ? playButton : null}
            {expanded ? <ChevronUp size={18} color={textSecondary} /> : <ChevronDown size={18} color={textSecondary} />}
          </span>
        </button>

        {expanded ? (
          <div
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTop: `1px solid ${border}`,
            }}
          >
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
              {playButton}
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
