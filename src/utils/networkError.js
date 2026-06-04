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
        ? ' Same Wi-Fi as PC and Windows Firewall must allow inbound TCP 8000 for Python. Backend: python -m daphne -b 0.0.0.0 -p 8000 TRAK_Backend.asgi:application. USB: adb reverse tcp:8000 tcp:8000 and ANDROID_USE_USB_REVERSE=true in api.local.js. Emulator: http://10.0.2.2:8000'
        : ' Ensure Daphne is running on your PC (daphne -b 0.0.0.0 -p 8000).';
    return `Cannot ${context} at ${API_BASE}.${hint}`;
  }
  return msg;
}
