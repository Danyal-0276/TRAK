import { Platform } from 'react-native';
import { API_BASE } from '../config/api';

/**
 * Turn React Native fetch failures into a short, actionable message.
 */
export function formatNetworkError(err, context = 'reach the server') {
  const msg = err?.message || String(err);
  if (
    msg.includes('Network request failed') ||
    msg.includes('Failed to fetch') ||
    msg.includes('Network Error')
  ) {
    const hint =
      Platform.OS === 'android'
        ? ' Same Wi-Fi as PC, Windows Firewall must allow Python on port 8000, and run: python manage.py runserver 0.0.0.0:8000. USB fix: adb reverse tcp:8000 tcp:8000 then set ANDROID_PHYSICAL_DEVICE=false in api.local.js. Emulator: http://10.0.2.2:8000'
        : ' Ensure Django is running (python manage.py runserver).';
    return `Cannot ${context} at ${API_BASE}.${hint}`;
  }
  return msg;
}
