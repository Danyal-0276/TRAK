import { Platform } from 'react-native';
import {
  PRODUCTION_API_BASE,
  ENABLE_NOTIFICATIONS_WS as PRODUCTION_NOTIFICATIONS_WS,
} from './api.production';

/**
 * Django API origin.
 * - Release builds: VPS (api.production.js — committed)
 * - Dev: emulator localhost or gitignored api.local.js override
 */
const defaultDevApiBase =
  Platform.select({
    android: 'http://10.0.2.2:8000',
    ios: 'http://localhost:8000',
    default: 'http://127.0.0.1:8000',
  }) || 'http://127.0.0.1:8000';

let localOverride = {};
if (__DEV__) {
  try {
    // eslint-disable-next-line global-require, import/no-unresolved
    localOverride = require('./api.local');
  } catch {
    localOverride = {};
  }
}

export const API_BASE = __DEV__
  ? localOverride.API_BASE ?? defaultDevApiBase
  : PRODUCTION_API_BASE;

export const ENABLE_NOTIFICATIONS_WS = __DEV__
  ? localOverride.ENABLE_NOTIFICATIONS_WS === true
  : PRODUCTION_NOTIFICATIONS_WS;

export const AUTH_PREFIX = `${API_BASE}/api/auth`;
export const USER_PREFIX = `${API_BASE}/api/user`;
export const ADMIN_PREFIX = `${API_BASE}/api/admin`;
