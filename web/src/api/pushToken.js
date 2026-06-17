/** Web push is not implemented yet — FCM requires a service worker + VAPID key setup. */

const KEY = 'trak_web_push_token';

function randomToken() {
  return `trak-web-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

/** Local placeholder only; do not register with the backend until web FCM is wired up. */
export function getOrCreatePushToken() {
  const existing = localStorage.getItem(KEY);
  if (existing) return existing;
  const token = randomToken();
  localStorage.setItem(KEY, token);
  return token;
}
