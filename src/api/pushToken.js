import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'trak_device_token';

function randomToken() {
  return `trak-mobile-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export async function getOrCreatePushToken() {
  const existing = await AsyncStorage.getItem(KEY);
  if (existing) return existing;
  const token = randomToken();
  await AsyncStorage.setItem(KEY, token);
  return token;
}
