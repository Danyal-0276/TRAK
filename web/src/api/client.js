import { API_BASE, AUTH_PREFIX } from '../config/api';
import { fetchWithTimeout } from './fetchWithTimeout';
import { clearAuthTokens, getAccessToken, refreshAccessTokenSingleFlight } from '../utils/Service/api';
import { emitAuthSessionEnded } from '../utils/authSessionEvents';

/**
 * @param {string} url
 * @param {RequestInit} [options]
 * @param {number} [timeoutMs] override default API timeout (e.g. TTS synthesis)
 */
export async function apiFetch(url, options = {}, timeoutMs) {
  let token = getAccessToken();
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res = await fetchWithTimeout(url, { ...options, headers }, timeoutMs);

  if (res.status === 401) {
    const next = await refreshAccessTokenSingleFlight();
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
