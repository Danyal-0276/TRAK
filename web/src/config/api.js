import { RENDER_API_BASE } from '../../../config/apiBase';

export const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || RENDER_API_BASE;

export const AUTH_PREFIX = `${API_BASE}/api/auth`;
export const USER_PREFIX = `${API_BASE}/api/user`;
export const ADMIN_PREFIX = `${API_BASE}/api/admin`;
