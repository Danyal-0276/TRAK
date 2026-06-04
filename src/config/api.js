import { Platform } from 'react-native';

/**
 * Django API origin.
 * - Release builds: VPS (set in gitignored `api.local.js`)
 * - Dev: emulator/simulator localhost (override in `api.local.js` for a physical device)
 */
const defaultApiBase =
    Platform.select({
        android: 'http://10.0.2.2:8000',
        ios: 'http://localhost:8000',
        default: 'http://127.0.0.1:8000',
    }) || 'http://127.0.0.1:8000';

let localOverride = {};
try {
    // Optional gitignored override — see api.local.example.js
    // eslint-disable-next-line global-require, import/no-unresolved
    localOverride = require('./api.local');
} catch (e) {
    localOverride = {};
}

export const API_BASE = localOverride.API_BASE ?? defaultApiBase;

export const AUTH_PREFIX = `${API_BASE}/api/auth`;
export const USER_PREFIX = `${API_BASE}/api/user`;
export const ADMIN_PREFIX = `${API_BASE}/api/admin`;
