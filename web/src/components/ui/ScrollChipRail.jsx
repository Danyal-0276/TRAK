import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import './ScrollChipRail.css';

export default function ScrollChipRail({
  children,
  title,
  hint,
  muted = false,
  scrollStep = 220,
  className,
  style,
}) {
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
  }, [children, updateScrollHints]);

  const scrollBy = (dir) => {
    scrollerRef.current?.scrollBy({ left: dir * scrollStep, behavior: 'smooth' });
  };

  return (
    <div className={cn('trak-chip-rail', muted && 'trak-chip-rail--muted', className)} style={style}>
      {title || hint ? (
        <div className="trak-chip-rail__header">
          {title ? <h2 className="trak-chip-rail__title">{title}</h2> : <span />}
          {hint ? <span className="trak-chip-rail__hint">{hint}</span> : null}
        </div>
      ) : null}

      <div className="trak-chip-rail__viewport">
        {canScrollLeft ? <div className="trak-chip-rail__fade trak-chip-rail__fade--left" aria-hidden /> : null}
        {canScrollRight ? <div className="trak-chip-rail__fade trak-chip-rail__fade--right" aria-hidden /> : null}

        <div className="trak-chip-rail__row">
          {canScrollLeft ? (
            <button
              type="button"
              className="trak-chip-rail__nav"
              aria-label="Scroll left"
              onClick={() => scrollBy(-1)}
            >
              <ChevronLeft size={15} strokeWidth={2.25} />
            </button>
          ) : null}

          <div ref={scrollerRef} className="trak-chip-rail__track">
            {children}
          </div>

          {canScrollRight ? (
            <button
              type="button"
              className="trak-chip-rail__nav"
              aria-label="Scroll right"
              onClick={() => scrollBy(1)}
            >
              <ChevronRight size={15} strokeWidth={2.25} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
