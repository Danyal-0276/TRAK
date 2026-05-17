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
        ? ' On Android emulator use http://10.0.2.2:8000; on a real phone use your PC’s Wi-Fi IP and run: python manage.py runserver 0.0.0.0:8000'
        : ' Ensure Django is running (python manage.py runserver).';
    return `Cannot ${context} at ${API_BASE}.${hint}`;
  }
  return msg;
}
