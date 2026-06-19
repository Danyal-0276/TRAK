import { useEffect, useRef } from 'react';
import { registerFeedScrollFlush, restoreFeedScroll } from '../utils/feedScrollBridge';

/**
 * Debounced scroll tracking + immediate flush before article navigation + restore after cache hit.
 */
export function useFeedScrollPersistence({
  enabled = true,
  feedPath,
  onPersistScroll,
  restoreScrollY = 0,
  shouldRestore = false,
}) {
  const scrollYRef = useRef(0);
  const restoredRef = useRef(false);

  useEffect(() => {
    if (!enabled) return undefined;
    let timer;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        scrollYRef.current = window.scrollY;
        onPersistScroll?.(window.scrollY);
      }, 150);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [enabled, onPersistScroll]);

  useEffect(() => {
    if (!enabled) return undefined;
    return registerFeedScrollFlush(({ path, scrollY }) => {
      if (path !== feedPath) return;
      scrollYRef.current = scrollY;
      onPersistScroll?.(scrollY);
    });
  }, [enabled, feedPath, onPersistScroll]);

  useEffect(() => {
    if (!shouldRestore || restoredRef.current) return;
    const y = Number(restoreScrollY) || 0;
    if (y <= 0) return;
    restoredRef.current = true;
    restoreFeedScroll(y);
  }, [shouldRestore, restoreScrollY]);

  return { scrollYRef, restoredRef };
}
