import { Platform } from 'react-native';
import { RENDER_API_BASE } from '../../config/apiBase';

// Copy to api.local.js (gitignored) to override API_BASE in dev.

/** true = Render (production API). false = local Django on your PC. */
const USE_RENDER = false;

/** Your PC Wi-Fi IPv4 (ipconfig) — phone and PC must be on the same network. */
const DEV_LAN_HOST = '192.168.1.8';

/**
 * USB debugging (recommended): run `adb reverse tcp:8000 tcp:8000`, set true.
 * Uses 127.0.0.1 on the phone so you do not need LAN IP.
 */
const ANDROID_USE_USB_REVERSE = false;

/** true = physical Android; false = emulator (10.0.2.2) */
const ANDROID_PHYSICAL_DEVICE = true;

const LOCAL_API_BASE = Platform.select({
  android: ANDROID_USE_USB_REVERSE
    ? 'http://127.0.0.1:8000'
    : ANDROID_PHYSICAL_DEVICE
      ? `http://${DEV_LAN_HOST}:8000`
      : 'http://10.0.2.2:8000',
  ios: `http://${DEV_LAN_HOST}:8000`,
  default: 'http://127.0.0.1:8000',
});

export const API_BASE = USE_RENDER ? RENDER_API_BASE : LOCAL_API_BASE;

// Backend: python manage.py runserver 0.0.0.0:8000
// MongoDB must be running. Match DEV_LAN_HOST to your PC IP if using Wi-Fi.
