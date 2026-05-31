import { getAccessToken } from '../utils/Service/api';
import { API_BASE } from '../config/api';

function wsBase() {
  if (API_BASE.startsWith('https://')) return API_BASE.replace('https://', 'wss://');
  return API_BASE.replace('http://', 'ws://');
}

/** WebSocket needs ASGI (daphne). Off unless VITE_ENABLE_NOTIFICATIONS_WS=true in .env */
export function isAdminNotificationsWsEnabled() {
  return import.meta.env.VITE_ENABLE_NOTIFICATIONS_WS === 'true';
}

export function openAdminNotificationsSocket(onMessage) {
  if (!isAdminNotificationsWsEnabled()) {
    return null;
  }
  const token = getAccessToken();
  if (!token) return null;
  const socket = new WebSocket(
    `${wsBase()}/ws/admin/notifications/?token=${encodeURIComponent(token)}`
  );
  socket.onmessage = (event) => {
    try {
      onMessage?.(JSON.parse(event.data));
    } catch {
      // ignore
    }
  };
  return socket;
}
