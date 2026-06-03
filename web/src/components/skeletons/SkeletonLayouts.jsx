import React from 'react';

/** Mount once in App.jsx (global pulse keyframes). */
export function GlobalSkeletonStyles() {
    return (
        <style>{`
      @keyframes trak-sk-pulse {
        0% { opacity: 0.42; }
        50% { opacity: 1; }
        100% { opacity: 0.42; }
      }
      .trak-sk-pulse,
      .trak-feed-skel-shimmer,
      .trak-search-skel-shimmer {
        animation: trak-sk-pulse 1.15s ease-in-out infinite;
      }
    `}</style>
    );
}

/** Shared theme tokens for masonry / feed skeletons. */
export function getSkeletonFeedProps(isDark, colors = {}) {
    return {
        cardBackground: isDark ? colors.surfaceElevated || colors.surface || '#141414' : '#ffffff',
        borderColor: isDark ? colors.border || '#2e2e2e' : '#e5e7eb',
        bar1: isDark ? colors.borderLight || '#262626' : '#e5e7eb',
        bar2: isDark ? colors.border || '#2e2e2e' : '#f1f5f9',
        isDark: !!isDark,
    };
}

/** Category browse grid placeholder (Categories page). */
export function SkeletonCategoryGrid({ count = 8, isDark, colors = {} }) {
    const cardBg = isDark ? colors.surface : '#ffffff';
    const border = isDark ? colors.border || '#334155' : '#e5e7eb';
    const bar = isDark ? '#334155' : '#e5e7eb';
    const bar2 = isDark ? '#475569' : '#f1f5f9';
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 16,
                marginBottom: 32,
            }}
        >
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        padding: 20,
                        borderRadius: 12,
                        border: `1px solid ${border}`,
                        backgroundColor: cardBg,
                        minHeight: 108,
                    }}
                >
                    <div className="trak-sk-pulse" style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: bar, marginBottom: 12 }} />
                    <div className="trak-sk-pulse" style={{ width: '70%', height: 14, borderRadius: 4, backgroundColor: bar, marginBottom: 8 }} />
                    <div className="trak-sk-pulse" style={{ width: '40%', height: 12, borderRadius: 4, backgroundColor: bar2 }} />
                </div>
            ))}
        </div>
    );
}

/** Category accordion row placeholders (Categories page). */
export function SkeletonCategoryAccordion({ count = 6, isDark, colors = {} }) {
    const cardBg = isDark ? colors.surface : '#ffffff';
    const border = isDark ? colors.border || '#334155' : '#e5e7eb';
    const bar = isDark ? '#334155' : '#e5e7eb';
    const bar2 = isDark ? '#475569' : '#f1f5f9';
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '16px 20px',
                        borderRadius: 12,
                        border: `1px solid ${border}`,
                        backgroundColor: cardBg,
                    }}
                >
                    <div className="trak-sk-pulse" style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: bar, flexShrink: 0 }} />
                    <div className="trak-sk-pulse" style={{ flex: 1, height: 14, borderRadius: 4, backgroundColor: bar }} />
                    <div className="trak-sk-pulse" style={{ width: 56, height: 22, borderRadius: 999, backgroundColor: bar2 }} />
                    <div className="trak-sk-pulse" style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: bar2 }} />
                </div>
            ))}
        </div>
    );
}

export function SkeletonFeedCard({ cardBg, border, bar1, bar2 }) {
    return (
        <div
            style={{
                backgroundColor: cardBg,
                borderRadius: 8,
                border: `1px solid ${border}`,
                overflow: 'hidden',
                minHeight: 260,
            }}
        >
            <div className="trak-sk-pulse" style={{ height: 180, backgroundColor: bar1 }} />
            <div style={{ padding: 20 }}>
                <div className="trak-sk-pulse" style={{ width: '45%', height: 14, borderRadius: 6, marginBottom: 16, backgroundColor: bar1 }} />
                <div className="trak-sk-pulse" style={{ width: '100%', height: 18, borderRadius: 6, marginBottom: 8, backgroundColor: bar1 }} />
                <div className="trak-sk-pulse" style={{ width: '80%', height: 18, borderRadius: 6, marginBottom: 16, backgroundColor: bar1 }} />
                <div className="trak-sk-pulse" style={{ width: '100%', height: 12, borderRadius: 6, marginBottom: 8, backgroundColor: bar2 }} />
                <div className="trak-sk-pulse" style={{ width: '70%', height: 12, borderRadius: 6, marginTop: 8, backgroundColor: bar2 }} />
            </div>
        </div>
    );
}

/**
 * @param {{ count?: number, gap?: number, columns?: string, isDark?: boolean, colors?: Record<string, string> }} props
 */
export function SkeletonFeedGrid({ count = 6, gap = 24, columns = 'repeat(auto-fill, minmax(320px, 1fr))', isDark, colors = {} }) {
    const cardBg = isDark ? colors.surface : '#ffffff';
    const border = isDark ? colors.border || '#334155' : '#e5e7eb';
    const bar1 = isDark ? '#334155' : '#e5e7eb';
    const bar2 = isDark ? '#475569' : '#f1f5f9';
    return (
        <div style={{ display: 'grid', gridTemplateColumns: columns, gap }}>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonFeedCard key={i} cardBg={cardBg} border={border} bar1={bar1} bar2={bar2} />
            ))}
        </div>
    );
}

export function SkeletonTableRows({ rows = 8, isDark, colors = {} }) {
    const rowBg = isDark ? colors.surface : '#ffffff';
    const border = isDark ? colors.border || '#334155' : '#e5e7eb';
    const cell = isDark ? '#334155' : '#e5e7eb';
    return (
        <div style={{ border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        display: 'flex',
                        gap: 16,
                        padding: '14px 16px',
                        backgroundColor: rowBg,
                        borderBottom: i < rows - 1 ? `1px solid ${border}` : 'none',
                    }}
                >
                    <div className="trak-sk-pulse" style={{ flex: 1, height: 14, borderRadius: 4, backgroundColor: cell }} />
                    <div className="trak-sk-pulse" style={{ width: 80, height: 14, borderRadius: 4, backgroundColor: cell }} />
                    <div className="trak-sk-pulse" style={{ width: 100, height: 14, borderRadius: 4, backgroundColor: cell }} />
                </div>
            ))}
        </div>
    );
}

export function SkeletonStatCards({ count = 4, isDark, colors = {} }) {
    const border = isDark ? colors.border || '#334155' : '#e5e7eb';
    const bg = isDark ? colors.surface : '#f9fafb';
    const bar = isDark ? '#334155' : '#e5e7eb';
    return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(200px, 1fr))`, gap: 16 }}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="trak-sk-pulse"
                    style={{
                        height: 96,
                        borderRadius: 12,
                        border: `1px solid ${border}`,
                        backgroundColor: bg,
                        padding: 16,
                    }}
                >
                    <div style={{ width: '50%', height: 12, borderRadius: 4, backgroundColor: bar, marginBottom: 12, opacity: 0.9 }} />
                    <div style={{ width: '35%', height: 22, borderRadius: 4, backgroundColor: bar, opacity: 0.9 }} />
                </div>
            ))}
        </div>
    );
}

export function SkeletonListRows({ rows = 10, isDark, colors = {} }) {
    const border = isDark ? colors.border || '#334155' : '#e5e7eb';
    const bar = isDark ? '#334155' : '#e5e7eb';
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="trak-sk-pulse"
                    style={{ height: 56, borderRadius: 8, backgroundColor: bar, border: `1px solid ${border}` }}
                />
            ))}
        </div>
    );
}

/** Generic full-page blocks (auth bootstrap, simple pages). */
export function SkeletonPageBlocks({ isDark, colors = {}, minHeight = '70vh' }) {
    const border = isDark ? colors.border || '#334155' : '#e5e7eb';
    const bar = isDark ? '#334155' : '#e5e7eb';
    const bar2 = isDark ? '#475569' : '#f1f5f9';
    return (
        <div style={{ minHeight, padding: 24, maxWidth: 560, margin: '0 auto', width: '100%' }}>
            <div className="trak-sk-pulse" style={{ width: '55%', height: 28, borderRadius: 8, backgroundColor: bar, marginBottom: 24 }} />
            <div className="trak-sk-pulse" style={{ width: '100%', height: 14, borderRadius: 6, backgroundColor: bar2, marginBottom: 12 }} />
            <div className="trak-sk-pulse" style={{ width: '90%', height: 14, borderRadius: 6, backgroundColor: bar2, marginBottom: 32 }} />
            <div className="trak-sk-pulse" style={{ width: '100%', height: 120, borderRadius: 12, border: `1px solid ${border}`, backgroundColor: bar, marginBottom: 16 }} />
            <div className="trak-sk-pulse" style={{ width: '100%', height: 120, borderRadius: 12, border: `1px solid ${border}`, backgroundColor: bar }} />
        </div>
    );
}

/** Article-style detail skeleton. */
export function SkeletonArticleDetail({ isDark, colors = {} }) {
    const border = isDark ? colors.border || '#334155' : '#e5e7eb';
    const bar = isDark ? '#334155' : '#e5e7eb';
    const bar2 = isDark ? '#475569' : '#f1f5f9';
    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 24px 120px' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <div className="trak-sk-pulse" style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: bar }} />
                <div style={{ flex: 1 }}>
                    <div className="trak-sk-pulse" style={{ width: '40%', height: 14, borderRadius: 4, backgroundColor: bar, marginBottom: 8 }} />
                    <div className="trak-sk-pulse" style={{ width: '25%', height: 12, borderRadius: 4, backgroundColor: bar2 }} />
                </div>
            </div>
            <div className="trak-sk-pulse" style={{ width: '100%', height: 36, borderRadius: 8, backgroundColor: bar, marginBottom: 20 }} />
            <div className="trak-sk-pulse" style={{ width: '100%', height: 12, borderRadius: 4, backgroundColor: bar2, marginBottom: 8 }} />
            <div className="trak-sk-pulse" style={{ width: '100%', height: 12, borderRadius: 4, backgroundColor: bar2, marginBottom: 8 }} />
            <div className="trak-sk-pulse" style={{ width: '85%', height: 12, borderRadius: 4, backgroundColor: bar2, marginBottom: 8 }} />
            <div className="trak-sk-pulse" style={{ width: '92%', height: 12, borderRadius: 4, backgroundColor: bar2 }} />
        </div>
    );
}
