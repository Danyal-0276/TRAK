import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { useTheme } from '../../../theme/ThemeContext';

function formatCategoryLabel(tab) {
  if (!tab || tab === 'All') return 'All';
  return String(tab)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ExploreCategoryBar({ categories, activeTab, onTabPress, counts = {} }) {
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
    const ro = new ResizeObserver(updateScrollHints);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollHints);
      ro.disconnect();
    };
  }, [categories, updateScrollHints]);

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };

  const trackBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)';
  const trackBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
  const fadeLeft = isDark
    ? `linear-gradient(90deg, ${colors.background} 0%, transparent 100%)`
    : `linear-gradient(90deg, ${colors.background} 0%, transparent 100%)`;
  const fadeRight = isDark
    ? `linear-gradient(270deg, ${colors.background} 0%, transparent 100%)`
    : `linear-gradient(270deg, ${colors.background} 0%, transparent 100%)`;

  return (
    <div style={{ position: 'relative', marginBottom: 20 }}>
      <div
        style={{
          borderRadius: 16,
          border: `1px solid ${trackBorder}`,
          background: isDark
            ? `linear-gradient(180deg, ${colors.surface} 0%, ${colors.backgroundSecondary} 100%)`
            : `linear-gradient(180deg, ${colors.surface} 0%, ${trackBg} 100%)`,
          padding: '10px 12px',
          boxShadow: isDark
            ? '0 1px 0 rgba(255,255,255,0.04) inset'
            : '0 1px 2px rgba(15,23,42,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {canScrollLeft ? (
            <button
              type="button"
              aria-label="Scroll categories left"
              onClick={() => scrollBy(-1)}
              style={scrollBtnStyle(colors, isDark)}
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>
          ) : null}

          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            {canScrollLeft ? (
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 28,
                  background: fadeLeft,
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              />
            ) : null}
            {canScrollRight ? (
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 28,
                  background: fadeRight,
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              />
            ) : null}

            <div
              ref={scrollerRef}
              style={{
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                padding: '2px 4px',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {categories.map((tab) => {
                const isActive = activeTab === tab;
                const count = counts[tab] ?? 0;
                const label = formatCategoryLabel(tab);

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => onTabPress(tab)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      flexShrink: 0,
                      padding: '8px 14px',
                      borderRadius: 999,
                      border: isActive
                        ? `1px solid ${isDark ? colors.primaryLight : colors.primary}`
                        : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)'}`,
                      background: isActive
                        ? isDark
                          ? 'linear-gradient(135deg, #262626 0%, #0a0a0a 100%)'
                          : 'linear-gradient(135deg, #171717 0%, #0a0a0a 100%)'
                        : isDark
                          ? 'rgba(255,255,255,0.03)'
                          : colors.surface,
                      color: isActive ? colors.textOnPrimary : colors.textSecondary,
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                      boxShadow: isActive
                        ? isDark
                          ? '0 4px 14px rgba(0,0,0,0.45)'
                          : '0 4px 14px rgba(15,23,42,0.18)'
                        : 'none',
                      transform: isActive ? 'translateY(-1px)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (isActive) return;
                      e.currentTarget.style.borderColor = isDark
                        ? 'rgba(255,255,255,0.18)'
                        : 'rgba(15,23,42,0.18)';
                      e.currentTarget.style.background = isDark
                        ? 'rgba(255,255,255,0.06)'
                        : colors.backgroundSecondary;
                    }}
                    onMouseLeave={(e) => {
                      if (isActive) return;
                      e.currentTarget.style.borderColor = isDark
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(15,23,42,0.1)';
                      e.currentTarget.style.background = isDark
                        ? 'rgba(255,255,255,0.03)'
                        : colors.surface;
                    }}
                  >
                    {tab === 'All' ? (
                      <LayoutGrid
                        size={14}
                        strokeWidth={2.25}
                        color={isActive ? colors.textOnPrimary : colors.textTertiary}
                      />
                    ) : null}
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: isActive ? 700 : 600,
                        letterSpacing: '-0.01em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        lineHeight: 1,
                        padding: '4px 7px',
                        borderRadius: 999,
                        minWidth: 22,
                        textAlign: 'center',
                        background: isActive
                          ? 'rgba(255,255,255,0.18)'
                          : isDark
                            ? 'rgba(255,255,255,0.08)'
                            : 'rgba(15,23,42,0.06)',
                        color: isActive ? colors.textOnPrimary : colors.textTertiary,
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {canScrollRight ? (
            <button
              type="button"
              aria-label="Scroll categories right"
              onClick={() => scrollBy(1)}
              style={scrollBtnStyle(colors, isDark)}
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          ) : null}
        </div>
      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

function scrollBtnStyle(colors, isDark) {
  return {
    flexShrink: 0,
    width: 32,
    height: 32,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : colors.border}`,
    background: isDark ? colors.surface : colors.surface,
    color: colors.textSecondary,
    cursor: 'pointer',
  };
}
