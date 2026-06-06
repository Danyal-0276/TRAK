/** Fired when tokens are invalid (e.g. account deleted, session expired). */
const listeners = new Set();

export function onAuthSessionEnded(handler) {
  listeners.add(handler);
  return () => listeners.delete(handler);
}

export function emitAuthSessionEnded() {
  listeners.forEach((handler) => {
    try {
      handler();
    } catch {
      // ignore listener errors
    }
  });
}
