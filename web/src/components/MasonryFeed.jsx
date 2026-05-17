import React, { useEffect, useRef, useState } from 'react';
import { useResponsive } from '../hooks/useResponsive';

/** Match column breakpoints to a ~1200px content column (4-across at full width). */
export function columnCountForWidth(width) {
  if (width <= 0) return 1;
  if (width < 560) return 1;
  if (width < 840) return 2;
  if (width < 1120) return 3;
  return 4;
}

function columnCountForViewport(isMobile, isTablet, isLargeDesktop, override) {
  if (override != null) return override;
  if (isMobile) return 1;
  if (isTablet) return 2;
  if (isLargeDesktop) return 4;
  return 3;
}

const itemWrapStyle = (gap) => ({
  breakInside: 'avoid',
  WebkitColumnBreakInside: 'avoid',
  pageBreakInside: 'avoid',
  marginBottom: gap,
  display: 'inline-block',
  width: '100%',
  verticalAlign: 'top',
  boxSizing: 'border-box',
});

export function MasonryFeed({ children, columnCount, gap = 16, style, className }) {
  const { isMobile, isTablet, isLargeDesktop } = useResponsive();
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const measure = () => setContainerWidth(el.getBoundingClientRect().width);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cols = columnCount != null
    ? columnCount
    : (containerWidth > 0
      ? columnCountForWidth(containerWidth)
      : columnCountForViewport(isMobile, isTablet, isLargeDesktop, null));
  const items = React.Children.toArray(children).filter(Boolean);

  return (
    <div ref={containerRef} className={className} style={{ columnCount: cols, columnGap: gap, width: '100%', ...style }}>
      {items.map((child, index) => (
        <div key={child.key ?? `masonry-${index}`} style={itemWrapStyle(gap)}>
          {child}
        </div>
      ))}
    </div>
  );
}

export function MasonryFeedSkeleton({
  count = 6,
  columnCount,
  gap = 16,
  cardBackground = '#ffffff',
  borderColor = '#e5e7eb',
  isDark = false,
  bar1,
  bar2,
}) {
  const { isMobile, isTablet, isLargeDesktop } = useResponsive();
  const cols = columnCountForViewport(isMobile, isTablet, isLargeDesktop, columnCount);
  const heights = [220, 280, 190, 310, 240, 260, 200, 300];
  const shimmer1 = bar1 ?? (isDark ? '#334155' : '#e5e7eb');
  const shimmer2 = bar2 ?? (isDark ? '#475569' : '#f1f5f9');

  return (
    <div style={{ columnCount: cols, columnGap: gap, width: '100%' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ ...itemWrapStyle(gap), backgroundColor: cardBackground, borderRadius: 16, border: `1px solid ${borderColor}`, overflow: 'hidden', minHeight: heights[i % heights.length] }}>
          <div className="trak-sk-pulse" style={{ height: 120 + (i % 3) * 40, backgroundColor: shimmer1 }} />
          <div style={{ padding: 16 }}>
            <div className="trak-sk-pulse" style={{ height: 12, width: '40%', borderRadius: 4, marginBottom: 12, backgroundColor: shimmer1 }} />
            <div className="trak-sk-pulse" style={{ height: 16, width: '95%', borderRadius: 4, marginBottom: 8, backgroundColor: shimmer1 }} />
            <div className="trak-sk-pulse" style={{ height: 16, width: '70%', borderRadius: 4, backgroundColor: shimmer2 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
