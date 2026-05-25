import React from 'react';

/**
 * Pipeline batch progress — shown only while a run is active (parent controls visibility).
 */
export default function AdminPipelineProgressBar({
  progress = 0,
  phase = 'running',
  label = '',
  palette,
  isDark = false,
}) {
  const pct = Math.min(100, Math.max(0, progress));
  const running = phase === 'running';
  const done = phase === 'success';
  const failed = phase === 'error';

  const trackBg = isDark
    ? 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)'
    : 'linear-gradient(180deg, #e8e8e8 0%, #d4d4d4 100%)';

  const fillBg = running
    ? `linear-gradient(90deg, ${palette.chart?.secondary || palette.primary} 0%, ${palette.primary} 55%, ${palette.chart?.processed || palette.primary} 100%)`
    : failed
      ? `linear-gradient(90deg, ${palette.error} 0%, ${palette.error}88 100%)`
      : done
        ? `linear-gradient(90deg, ${palette.success} 0%, ${palette.success}88 100%)`
        : isDark
          ? '#262626'
          : '#0a0a0a';

  const statusColor = failed
    ? palette.error
    : done
      ? palette.success
      : running
        ? palette.primary
        : palette.textTertiary;

  return (
    <div style={{ flex: '1 1 200px', minWidth: 180, maxWidth: 360 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: palette.textTertiary,
          }}
        >
          Batch progress
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
            color: statusColor,
            letterSpacing: '-0.02em',
          }}
        >
          {Math.round(pct)}%
        </span>
      </div>

      <div
        style={{
          position: 'relative',
          height: 12,
          borderRadius: 999,
          background: trackBg,
          boxShadow: isDark
            ? 'inset 0 1px 3px rgba(0,0,0,0.55)'
            : 'inset 0 1px 3px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          border: `1px solid ${isDark ? '#2e2e2e' : '#c4c4c4'}`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '2px',
            right: 'auto',
            width: `calc(${pct}% - 4px)`,
            minWidth: pct > 0 ? 8 : 0,
            height: 'calc(100% - 4px)',
            borderRadius: 999,
            background: fillBg,
            boxShadow: running
              ? `0 0 12px ${palette.primary}55, inset 0 1px 0 rgba(255,255,255,0.25)`
              : 'none',
            transition:
              running
                ? 'width 0.32s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease'
                : 'width 0.4s ease, background 0.35s ease',
          }}
        />
        {running && pct > 8 ? (
          <div
            style={{
              position: 'absolute',
              inset: '2px',
              right: 'auto',
              width: `calc(${pct}% - 4px)`,
              minWidth: 8,
              height: 'calc(100% - 4px)',
              borderRadius: 999,
              background:
                'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.35) 48%, transparent 92%)',
              animation: 'adminPipelineShimmer 1.4s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />
        ) : null}
      </div>

      {label ? (
        <p
          style={{
            margin: '8px 0 0',
            fontSize: 12,
            fontWeight: 600,
            color: statusColor,
            lineHeight: 1.4,
          }}
        >
          {label}
        </p>
      ) : null}

      <style>{`
        @keyframes adminPipelineShimmer {
          0% { opacity: 0.35; transform: translateX(-12%); }
          50% { opacity: 0.85; transform: translateX(8%); }
          100% { opacity: 0.35; transform: translateX(-12%); }
        }
      `}</style>
    </div>
  );
}
