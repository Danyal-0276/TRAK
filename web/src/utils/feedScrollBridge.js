/** Immediate feed scroll flush before navigating to an article (registered by feed screens). */
const flushCallbacks = new Set();

export function registerFeedScrollFlush(callback) {
  flushCallbacks.add(callback);
  return () => flushCallbacks.delete(callback);
}

export function flushFeedScrollBeforeNavigate() {
  const scrollY = window.scrollY;
  const path = window.location.pathname;
  try {
    sessionStorage.setItem(
      'trak:feed-scroll-backup',
      JSON.stringify({ path, scrollY, at: Date.now() }),
    );
  } catch {
    /* ignore quota */
  }
  flushCallbacks.forEach((cb) => {
    try {
      cb({ path, scrollY });
    } catch {
      /* ignore */
    }
  });
}

export function readFeedScrollBackup(path) {
  try {
    const raw = sessionStorage.getItem('trak:feed-scroll-backup');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.path !== path) return null;
    if (Date.now() - (parsed.at || 0) > 10 * 60 * 1000) return null;
    return Number(parsed.scrollY) || 0;
  } catch {
    return null;
  }
}

export function restoreFeedScroll(scrollY) {
  const y = Number(scrollY) || 0;
  if (y <= 0) return;
  const apply = () => window.scrollTo(0, y);
  requestAnimationFrame(() => {
    apply();
    requestAnimationFrame(apply);
  });
  setTimeout(apply, 80);
  setTimeout(apply, 250);
}
