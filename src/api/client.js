import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWithTimeout } from './fetchWithTimeout';
import { emitAuthSessionEnded } from '../utils/authSessionEvents';

const ACCESS_KEY = 'trak_access_token';
const REFRESH_KEY = 'trak_refresh_token';

export async function getAccessToken() {
    return AsyncStorage.getItem(ACCESS_KEY);
}

export async function setTokens(access, refresh) {
    await AsyncStorage.setItem(ACCESS_KEY, access);
    if (refresh) await AsyncStorage.setItem(REFRESH_KEY, refresh);
}

export async function clearTokens() {
    await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
}

async function refreshAccess(baseUrl) {
    const refresh = await AsyncStorage.getItem(REFRESH_KEY);
    if (!refresh) return null;
    const res = await fetchWithTimeout(`${baseUrl}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refresh }),
    });
    if (!res.ok) {
        // Refresh token rejected (e.g. account deleted or DB rebuilt).
        await clearTokens();
        emitAuthSessionEnded();
        return null;
    }
    const data = await res.json();
    if (data.access) await AsyncStorage.setItem(ACCESS_KEY, data.access);
    return data.access;
}

/**
 * @param {string} url - full URL
 * @param {RequestInit} options
 */
/**
 * @param {string} url
 * @param {RequestInit} [options]
 * @param {string} [baseUrlForRefresh]
 * @param {number} [timeoutMs] optional timeout (e.g. TTS synthesis)
 */
export async function apiFetch(url, options = {}, baseUrlForRefresh = '', timeoutMs) {
    let token = await getAccessToken();
    const headers = {
        Accept: 'application/json',
        ...(options.headers || {}),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    let res = await fetchWithTimeout(url, { ...options, headers }, timeoutMs);

    if (res.status === 401 && baseUrlForRefresh) {
        const newAccess = await refreshAccess(baseUrlForRefresh);
        if (newAccess) {
            headers.Authorization = `Bearer ${newAccess}`;
            res = await fetchWithTimeout(url, { ...options, headers }, timeoutMs);
        }
        if (res.status === 401) {
            await clearTokens();
            emitAuthSessionEnded();
        }
    }

    return res;
}
