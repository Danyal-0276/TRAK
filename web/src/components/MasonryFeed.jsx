import React from 'react';
import { useResponsive } from '../hooks/useResponsive';

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
});

export function MasonryFeed({ children, columnCount, gap = 16, style }) {
  const { isMobile, isTablet, isLargeDesktop } = useResponsive();
  const cols = columnCountForViewport(isMobile, isTablet, isLargeDesktop, columnCount);
  const items = React.Children.toArray(children).filter(Boolean);

  return (
    <div style={{ columnCount: cols, columnGap: gap, width: '100%', ...style }}>
      {items.map((child, index) => (
        <div key={child.key ?? `masonry-${index}`} style={itemWrapStyle(gap)}>
          {child}
        </div>
      ))}
    </div>
  );
}

export function MasonryFeedSkeleton({ count = 6, columnCount, gap = 16, cardBackground, borderColor, isDark }) {
  const { isMobile, isTablet, isLargeDesktop } = useResponsive();
  const cols = columnCountForViewport(isMobile, isTablet, isLargeDesktop, columnCount);
  const heights = [220, 280, 190, 310, 240, 260, 200, 300];

  return (
    <div style={{ columnCount: cols, columnGap: gap, width: '100%' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ ...itemWrapStyle(gap), backgroundColor: cardBackground, borderRadius: '16px', border: `1px solid ${borderColor}`, overflow: 'hidden', minHeight: heights[i % heights.length] }}>
          <div className="trak-feed-skel-shimmer" style={{ height: 120 + (i % 3) * 40, background: isDark ? '#334155' : '#e5e7eb' }} />
          <div style={{ padding: 16 }}>
            <div className="trak-feed-skel-shimmer" style={{ height: 12, width: '40%', borderRadius: 4, marginBottom: 12, background: isDark ? '#334155' : '#e5e7eb' }} />
            <div className="trak-feed-skel-shimmer" style={{ height: 16, width: '95%', borderRadius: 4, marginBottom: 8, background: isDark ? '#334155' : '#e5e7eb' }} />
            <div className="trak-feed-skel-shimmer" style={{ height: 16, width: '70%', borderRadius: 4, background: isDark ? '#475569' : '#f1f5f9' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
