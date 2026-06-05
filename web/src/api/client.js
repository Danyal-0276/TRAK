import { API_BASE, AUTH_PREFIX } from '../config/api';
import { fetchWithTimeout } from './fetchWithTimeout';
import { clearAuthTokens } from '../utils/Service/api';
import { emitAuthSessionEnded } from '../utils/authSessionEvents';

const ACCESS_KEY = 'trak_access_token';
const REFRESH_KEY = 'trak_refresh_token';

function getAccess() {
  return localStorage.getItem(ACCESS_KEY);
}

function getRefresh() {
  return localStorage.getItem(REFRESH_KEY);
}

async function refreshAccess() {
  const refresh = getRefresh();
  if (!refresh) return null;
  const res = await fetchWithTimeout(`${AUTH_PREFIX}/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) {
    clearAuthTokens();
    emitAuthSessionEnded();
    return null;
  }
  const data = await res.json();
  if (data.access) localStorage.setItem(ACCESS_KEY, data.access);
  return data.access;
}

/**
 * @param {string} url
 * @param {RequestInit} [options]
 * @param {number} [timeoutMs] override default API timeout (e.g. TTS synthesis)
 */
export async function apiFetch(url, options = {}, timeoutMs) {
  let token = getAccess();
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res = await fetchWithTimeout(url, { ...options, headers }, timeoutMs);

  if (res.status === 401) {
    const next = await refreshAccess();
    if (next) {
      headers.Authorization = `Bearer ${next}`;
      res = await fetchWithTimeout(url, { ...options, headers }, timeoutMs);
    }
    if (res.status === 401) {
      clearAuthTokens();
      emitAuthSessionEnded();
    }
  }

  return res;
}
