export const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://127.0.0.1:8000';

export const AUTH_PREFIX = `${API_BASE}/api/auth`;
export const USER_PREFIX = `${API_BASE}/api/user`;
export const ADMIN_PREFIX = `${API_BASE}/api/admin`;
