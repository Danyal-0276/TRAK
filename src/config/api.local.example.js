import { Platform } from 'react-native';
import { RENDER_API_BASE } from '../../config/apiBase';

// Copy to api.local.js (gitignored) to override API_BASE in dev.

/** true = Render (production API). false = local Django on your PC. */
/** Release builds auto-use Render via api.local.js (__DEV__ check). */
const USE_RENDER = true;

const DEV_LAN_HOST = '192.168.1.8';

/** true = physical Android on Wi-Fi; false = Android emulator (10.0.2.2) */
const ANDROID_PHYSICAL_DEVICE = true;

const LOCAL_API_BASE = Platform.select({
  android: ANDROID_PHYSICAL_DEVICE ? `http://${DEV_LAN_HOST}:8000` : 'http://10.0.2.2:8000',
  ios: 'http://localhost:8000',
  default: 'http://127.0.0.1:8000',
});

export const API_BASE = USE_RENDER ? RENDER_API_BASE : LOCAL_API_BASE;
