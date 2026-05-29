import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, Square, Loader2 } from 'lucide-react';
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
  isDark = false,
  highlightLines = [],
  onActiveLineIndex,
}) {
  const [language, setLanguage] = useState('english');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const playbackRef = useRef(null);
  const cancelledRef = useRef(false);
  const audioStartedRef = useRef(false);
  const cancelLineHighlightRef = useRef(null);

  const listenText = String(text || '').trim();

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

  const border = isDark ? '#334155' : '#e5e7eb';
  const bg = isDark ? '#1e293b' : '#f8fafc';
  const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const isActive = status === 'loading' || status === 'playing';
  const progressPct =
    progress.total > 0 ? Math.min(100, (progress.current / progress.total) * 100) : null;

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
          marginBottom: 20,
          padding: '14px 16px',
          borderRadius: 10,
          border: `1px solid ${border}`,
          backgroundColor: bg,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>Listen to article</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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
                    background: active ? (isDark ? 'rgba(241,245,249,0.12)' : '#f1f5f9') : 'transparent',
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
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 40 }}>
          <button
            type="button"
            onClick={handlePlay}
            disabled={disabled}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              flexShrink: 0,
              background: isDark ? (isActive ? '#475569' : '#1e293b') : (isActive ? '#334155' : '#0f172a'),
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            {status === 'loading' ? (
              <Loader2 size={18} style={{ animation: 'trak-tts-spin 1s linear infinite' }} />
            ) : status === 'playing' ? (
              <Square size={18} fill="#fff" />
            ) : (
              <Volume2 size={18} />
            )}
            {isActive ? 'Stop' : 'Play'}
          </button>

          {isActive ? (
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPct ?? undefined}
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
                    backgroundColor: isDark ? '#94a3b8' : '#0f172a',
                    animation: 'trak-tts-indet 1.1s ease-in-out infinite',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: `${progressPct}%`,
                    height: '100%',
                    borderRadius: 3,
                    backgroundColor: isDark ? '#94a3b8' : '#0f172a',
                    transition: 'width 0.2s ease',
                  }}
                />
              )}
            </div>
          ) : null}
        </div>

        {error ? (
          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#ef4444' }}>{error}</p>
        ) : null}
      </div>
    </>
  );
}
