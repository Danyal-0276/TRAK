/** Fired when tokens are invalid (e.g. account deleted, session expired). */
const listeners = new Set();

export function onAuthSessionEnded(handler) {
  listeners.add(handler);
  return () => listeners.delete(handler);
}

/** @param {'expired' | 'manual'} [reason] */
export function emitAuthSessionEnded(reason = 'expired') {
  listeners.forEach((handler) => {
    try {
      handler(reason);
    } catch {
      // ignore listener errors
    }
  });
}
