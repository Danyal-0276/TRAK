import { Platform } from 'react-native';

// Copy to api.local.js (gitignored) — DEV ONLY.
// Release/App Store builds use api.production.js (VPS) automatically.

/** true = VPS (dev + release). false = local Django on your PC. */
const USE_VPS = true;

/** VPS production API */
const PRODUCTION_API_BASE = 'http://167.86.110.151:8000';

/** Your PC Wi-Fi IPv4 (ipconfig) — phone and PC must be on the same network. */
const DEV_LAN_HOST = '192.168.100.100';

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

export const API_BASE = USE_VPS ? PRODUCTION_API_BASE : LOCAL_API_BASE;

/** Live in-app notifications (requires daphne). Set true for local dev. */
export const ENABLE_NOTIFICATIONS_WS = true;
