import { API_BASE, AUTH_PREFIX } from '../config/api';

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
  const res = await fetch(`${AUTH_PREFIX}/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.access) localStorage.setItem(ACCESS_KEY, data.access);
  return data.access;
}

/**
 * @param {string} url
 * @param {RequestInit} [options]
 */
export async function apiFetch(url, options = {}) {
  let token = getAccess();
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    const next = await refreshAccess();
    if (next) {
      headers.Authorization = `Bearer ${next}`;
      res = await fetch(url, { ...options, headers });
    }
  }

  return res;
}
