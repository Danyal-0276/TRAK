import { Platform } from 'react-native';

// Quick toggle: local Django vs deployed Render.
// Local dev: set USE_RENDER = false and point web/.env VITE_API_URL to http://127.0.0.1:8000
const USE_RENDER = true;

/** Your PC’s Wi-Fi IP (ipconfig → IPv4). Phone and PC must be on the same network. */
const DEV_LAN_HOST = '192.168.1.13';

/**
 * true  = real Android phone/tablet (USB or Wi-Fi)
 * false = Android Studio emulator (uses 10.0.2.2 → host)
 */
const ANDROID_PHYSICAL_DEVICE = true;

const RENDER_API_BASE = 'https://trak-backend-upip.onrender.com';

const LOCAL_API_BASE = Platform.select({
  android: ANDROID_PHYSICAL_DEVICE
    ? `http://${DEV_LAN_HOST}:8000`
    : 'http://10.0.2.2:8000',
  ios: 'http://localhost:8000',
  default: 'http://127.0.0.1:8000',
});

export const API_BASE = USE_RENDER ? RENDER_API_BASE : LOCAL_API_BASE;

// Django on PC: python manage.py runserver 0.0.0.0:8000
// USB alternative: adb reverse tcp:8000 tcp:8000 → set ANDROID_PHYSICAL_DEVICE false and use 127.0.0.1 in api.js
