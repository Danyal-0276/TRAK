import { useCallback, useEffect, useRef } from 'react';

/**
 * Calls onLoadMore when a sentinel element enters the viewport.
 */
export function useInfiniteScroll({ onLoadMore, hasMore, loading, rootMargin = '400px' }) {
    const sentinelRef = useRef(null);

    const stableLoad = useCallback(() => {
        if (!loading && hasMore) onLoadMore?.();
    }, [loading, hasMore, onLoadMore]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el || !hasMore) return undefined;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) stableLoad();
            },
            { root: null, rootMargin, threshold: 0 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [stableLoad, hasMore, rootMargin]);

    return sentinelRef;
}
