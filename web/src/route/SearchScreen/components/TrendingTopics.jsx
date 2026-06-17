import React, { useRef, useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { useTheme } from '../../../theme/ThemeContext';

const TrendingTopics = ({ topics, onTopicPress, searchQuery }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const scrollerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollHints = useCallback(() => {
        const el = scrollerRef.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        setCanScrollLeft(scrollLeft > 4);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    }, []);

    useEffect(() => {
        updateScrollHints();
        const el = scrollerRef.current;
        if (!el) return undefined;
        el.addEventListener('scroll', updateScrollHints, { passive: true });
        const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateScrollHints) : null;
        ro?.observe(el);
        return () => {
            el.removeEventListener('scroll', updateScrollHints);
            ro?.disconnect();
        };
    }, [topics, updateScrollHints]);

    if (searchQuery?.trim()) return null;
    if (!topics || topics.length === 0) return null;

    const ranked = topics.slice(0, 10);
    const trackBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
    const trackBg = isDark ? colors.surface : colors.backgroundSecondary;

    const scrollBy = (dir) => {
        scrollerRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' });
    };

    return (
        <section style={{ marginBottom: 24 }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                    gap: 12,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrendingUp size={16} color={colors.primary} strokeWidth={2.25} />
                    <h2
                        style={{
                            margin: 0,
                            fontSize: 14,
                            fontWeight: 700,
                            color: colors.textPrimary,
                            letterSpacing: '-0.01em',
                        }}
                    >
                        Trending topics
                    </h2>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: colors.textTertiary }}>
                    Tap to search
                </span>
            </div>

            <div
                style={{
                    position: 'relative',
                    borderRadius: 14,
                    border: `1px solid ${trackBorder}`,
                    background: trackBg,
                    padding: '10px 8px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {canScrollLeft ? (
                        <button
                            type="button"
                            aria-label="Scroll topics left"
                            onClick={() => scrollBy(-1)}
                            style={arrowBtnStyle(colors, isDark)}
                        >
                            <ChevronLeft size={16} strokeWidth={2.5} />
                        </button>
                    ) : null}

                    <div
                        ref={scrollerRef}
                        style={{
                            display: 'flex',
                            gap: 8,
                            overflowX: 'auto',
                            flex: 1,
                            minWidth: 0,
                            padding: '2px 4px',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch',
                        }}
                    >
                        {ranked.map((topic, index) => {
                            const isHot = index === 0 || topic.trending;
                            return (
                                <button
                                    key={topic.id}
                                    type="button"
                                    onClick={() => onTopicPress(topic.name)}
                                    style={{
                                        flexShrink: 0,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '9px 14px',
                                        borderRadius: 999,
                                        border: `1px solid ${
                                            isHot
                                                ? isDark
                                                    ? `${colors.primary}55`
                                                    : `${colors.primary}40`
                                                : colors.border
                                        }`,
                                        background: isHot
                                            ? isDark
                                                ? `${colors.primary}18`
                                                : `${colors.primary}0d`
                                            : colors.surface,
                                        cursor: 'pointer',
                                        transition: 'border-color 0.15s ease, background 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = colors.primary;
                                        e.currentTarget.style.background = isDark
                                            ? `${colors.primary}22`
                                            : `${colors.primary}12`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = isHot
                                            ? isDark
                                                ? `${colors.primary}55`
                                                : `${colors.primary}40`
                                            : colors.border;
                                        e.currentTarget.style.background = isHot
                                            ? isDark
                                                ? `${colors.primary}18`
                                                : `${colors.primary}0d`
                                            : colors.surface;
                                    }}
                                >
                                    {isHot ? (
                                        <span
                                            style={{
                                                fontSize: 10,
                                                fontWeight: 800,
                                                letterSpacing: '0.04em',
                                                textTransform: 'uppercase',
                                                color: colors.primary,
                                            }}
                                        >
                                            Hot
                                        </span>
                                    ) : null}
                                    <span
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: colors.textPrimary,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {topic.name}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: colors.textTertiary,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {topic.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {canScrollRight ? (
                        <button
                            type="button"
                            aria-label="Scroll topics right"
                            onClick={() => scrollBy(1)}
                            style={arrowBtnStyle(colors, isDark)}
                        >
                            <ChevronRight size={16} strokeWidth={2.5} />
                        </button>
                    ) : null}
                </div>
            </div>

            <style>{`
                section div::-webkit-scrollbar { display: none; }
            `}</style>
        </section>
    );
};

function arrowBtnStyle(colors, isDark) {
    return {
        flexShrink: 0,
        width: 32,
        height: 32,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : colors.border}`,
        background: colors.surface,
        color: colors.textSecondary,
        cursor: 'pointer',
    };
}

export default TrendingTopics;
