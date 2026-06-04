import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE, ENABLE_NOTIFICATIONS_WS } from '../config/api';

function wsBase() {
  if (API_BASE.startsWith('https://')) return API_BASE.replace('https://', 'wss://');
  return API_BASE.replace('http://', 'ws://');
}

async function getToken() {
  return (await AsyncStorage.getItem('trak_access_token')) || (await AsyncStorage.getItem('trak_access'));
}

/** Live push needs ASGI (daphne). Off by default on local `runserver` — set ENABLE_NOTIFICATIONS_WS in api.local.js. */
export function isNotificationsWsEnabled() {
  return ENABLE_NOTIFICATIONS_WS === true;
}

/** HTTP fallback when live WebSocket is disabled or unavailable. */
export const NOTIFICATIONS_POLL_FALLBACK_MS = 60_000;

export const NOTIFICATIONS_WS_MAX_RECONNECT = 3;

export async function openNotificationsSocket(onMessage) {
  if (!isNotificationsWsEnabled()) return null;
  const token = await getToken();
  if (!token) return null;
  const socket = new WebSocket(`${wsBase()}/ws/notifications/?token=${encodeURIComponent(token)}`);
  socket.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      onMessage?.(payload);
    } catch {
      // ignore malformed frames
    }
  };
  return socket;
}
