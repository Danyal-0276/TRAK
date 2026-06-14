import { PRODUCTION_WEB_API_BASE, VPS_API_BASE } from '../../../config/apiBase';

/** Production: same-origin on Vercel (see vercel.json). Dev: .env or local proxy. */
export const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  PRODUCTION_WEB_API_BASE;

/** Direct VPS URL (diagnostics / docs only — browser uses API_BASE in production). */
export const VPS_API_ORIGIN = VPS_API_BASE;

export const AUTH_PREFIX = `${API_BASE}/api/auth`;
export const USER_PREFIX = `${API_BASE}/api/user`;
export const ADMIN_PREFIX = `${API_BASE}/api/admin`;
