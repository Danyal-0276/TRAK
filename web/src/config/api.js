import { PRODUCTION_WEB_API_BASE, VPS_API_BASE } from '../../../config/apiBase';

/**
 * Dev: VITE_API_URL or Vite proxy on :3000.
 * Production: always same-origin relative /api (Vercel vercel.json → VPS).
 * Ignores VITE_API_URL in prod so a mis-set dashboard env cannot call http://VPS directly (mixed content).
 */
export const API_BASE = import.meta.env.DEV
  ? import.meta.env.VITE_API_URL || 'http://localhost:3000'
  : '';

/** Display / diagnostics only — not used for fetch() in production. */
export const API_ORIGIN =
  API_BASE ||
  (typeof window !== 'undefined' ? window.location.origin : PRODUCTION_WEB_API_BASE);

/** Direct VPS URL (diagnostics only). */
export const VPS_API_ORIGIN = VPS_API_BASE;

export const AUTH_PREFIX = `${API_BASE}/api/auth`;
export const USER_PREFIX = `${API_BASE}/api/user`;
export const ADMIN_PREFIX = `${API_BASE}/api/admin`;
