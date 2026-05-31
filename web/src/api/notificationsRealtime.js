import { getAccessToken } from '../utils/Service/api';
import { API_BASE } from '../config/api';

function wsBase() {
  if (API_BASE.startsWith('https://')) return API_BASE.replace('https://', 'wss://');
  return API_BASE.replace('http://', 'ws://');
}

export function isNotificationsWsEnabled() {
  return import.meta.env.VITE_ENABLE_NOTIFICATIONS_WS !== 'false';
}

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
