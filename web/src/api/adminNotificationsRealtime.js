import { getAccessToken } from '../utils/Service/api';
import { API_BASE } from '../config/api';

function wsBase() {
  if (API_BASE.startsWith('https://')) return API_BASE.replace('https://', 'wss://');
  return API_BASE.replace('http://', 'ws://');
}

export function openAdminNotificationsSocket(onMessage) {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_NOTIFICATIONS_WS !== 'true') {
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
