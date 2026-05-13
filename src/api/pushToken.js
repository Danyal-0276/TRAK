import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const KEY = 'trak_device_token';

function randomToken() {
  return `trak-mobile-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function tryFcmToken() {
  try {
    // Optional native dependency: add @react-native-firebase/app + messaging and google-services config.
    // eslint-disable-next-line global-require, import/no-unresolved
    const messaging = require('@react-native-firebase/messaging').default;
    return messaging;
  } catch {
    return null;
  }
}

export async function getOrCreatePushToken() {
  const messaging = tryFcmToken();
  if (messaging) {
    try {
      if (Platform.OS === 'ios') {
        await messaging().requestPermission();
      }
      const token = await messaging().getToken();
      if (token && typeof token === 'string') {
        await AsyncStorage.setItem(KEY, token);
        return token;
      }
    } catch {
      // fall through to placeholder token
    }
  }
  const existing = await AsyncStorage.getItem(KEY);
  if (existing) return existing;
  const token = randomToken();
  await AsyncStorage.setItem(KEY, token);
  return token;
}
