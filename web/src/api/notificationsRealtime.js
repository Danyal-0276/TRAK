import { getAccessToken } from '../utils/Service/api';
import { API_BASE } from '../config/api';

function wsBase() {
  const origin = API_BASE || (typeof window !== 'undefined' ? window.location.origin : '');
  if (origin.startsWith('https://')) return origin.replace('https://', 'wss://');
  if (origin.startsWith('http://')) return origin.replace('http://', 'ws://');
  return '';
}

/** Live WS needs ASGI (daphne). Off in Vite dev by default — runserver resets /ws and spams proxy errors. */
export function isNotificationsWsEnabled() {
  const flag = import.meta.env.VITE_ENABLE_NOTIFICATIONS_WS;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return !import.meta.env.DEV;
}

/** HTTP fallback when live WebSocket is disabled. */
export const NOTIFICATIONS_POLL_FALLBACK_MS = 60_000;

/** Live push needs ASGI (e.g. daphne). Off unless VITE_ENABLE_NOTIFICATIONS_WS=true. */
export function openNotificationsSocket(onMessage) {
  if (!isNotificationsWsEnabled()) {
    return null;
  }
  const token = getAccessToken();
  if (!token) return null;
  const socket = new WebSocket(`${wsBase()}/ws/notifications/?token=${encodeURIComponent(token)}`);
  socket.onmessage = (event) => {
    try {
      onMessage?.(JSON.parse(event.data));
    } catch {
      // ignore malformed frames
    }
  };
  return socket;
}
