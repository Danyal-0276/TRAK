import { Platform } from 'react-native';

/**
 * Django API origin. Override in `src/config/api.local.js` (gitignored) if needed.
 * Android emulator: 10.0.2.2 → host machine. iOS simulator: localhost.
 */
const defaultApiBase =
    Platform.select({
        // Emulator: 10.0.2.2 is the host machine. Physical device: use api.local.js with LAN IP.
        android: 'http://10.0.2.2:8000',
        ios: 'http://localhost:8000',
        default: 'http://127.0.0.1:8000',
    }) || 'http://127.0.0.1:8000';

let localOverride = {};
try {
    // Optional gitignored override:
    // export const API_BASE = 'http://192.168.1.10:8000'
    // eslint-disable-next-line global-require, import/no-unresolved
    localOverride = require('./api.local');
} catch (e) {
    localOverride = {};
}

export const API_BASE = localOverride.API_BASE || defaultApiBase;

export const AUTH_PREFIX = `${API_BASE}/api/auth`;
export const USER_PREFIX = `${API_BASE}/api/user`;
export const ADMIN_PREFIX = `${API_BASE}/api/admin`;
