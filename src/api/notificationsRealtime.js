import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../config/api';

function wsBase() {
  if (API_BASE.startsWith('https://')) return API_BASE.replace('https://', 'wss://');
  return API_BASE.replace('http://', 'ws://');
}

async function getToken() {
  return (await AsyncStorage.getItem('trak_access_token')) || (await AsyncStorage.getItem('trak_access'));
}

/** HTTP fallback when live WebSocket is unavailable. */
export const NOTIFICATIONS_POLL_FALLBACK_MS = 60_000;

export async function openNotificationsSocket(onMessage) {
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
