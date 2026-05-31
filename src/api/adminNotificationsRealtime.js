import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../config/api';

function wsBase() {
  if (API_BASE.startsWith('https://')) return API_BASE.replace('https://', 'wss://');
  return API_BASE.replace('http://', 'ws://');
}

async function getToken() {
  return (await AsyncStorage.getItem('trak_access_token')) || (await AsyncStorage.getItem('trak_access'));
}

export async function openAdminNotificationsSocket(onMessage) {
  if (__DEV__) {
    return null;
  }
  const token = await getToken();
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
