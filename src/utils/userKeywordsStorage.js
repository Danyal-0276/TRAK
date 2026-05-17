import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAccessToken } from '../api/client';
import { fetchUserKeywords } from '../api/newsApi';

const KEY = 'trak_user_keywords';

function normalize(arr = []) {
  const out = [];
  for (const raw of arr) {
    const s = String(raw || '').trim().toLowerCase();
    if (s && !out.includes(s)) out.push(s);
  }
  return out;
}

export async function getUserKeywords() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return normalize(Array.isArray(parsed) ? parsed : []);
  } catch {
    return [];
  }
}

let keywordsInflight = null;
let keywordsCache = { at: 0, data: null };

export async function setUserKeywords(keywords) {
  const cleaned = normalize(keywords);
  await AsyncStorage.setItem(KEY, JSON.stringify(cleaned));
  keywordsCache = { at: Date.now(), data: cleaned };
  return cleaned;
}

export function invalidateUserKeywordsCache() {
  keywordsCache = { at: 0, data: null };
  keywordsInflight = null;
}

/** Load keywords from API when signed in (including empty), sync cache; offline uses AsyncStorage. */
export async function loadUserKeywords({ force = false } = {}) {
  const now = Date.now();
  if (!force && keywordsCache.data && now - keywordsCache.at < 5000) {
    return keywordsCache.data;
  }
  if (keywordsInflight) {
    return keywordsInflight;
  }

  keywordsInflight = (async () => {
    const local = await getUserKeywords();
    try {
      const token = await getAccessToken();
      if (!token) {
        keywordsCache = { at: Date.now(), data: local };
        return local;
      }
      const remote = await fetchUserKeywords();
      const normalized = normalize(remote);
      await setUserKeywords(normalized);
      return normalized;
    } catch {
      keywordsCache = { at: Date.now(), data: local };
      return local;
    } finally {
      keywordsInflight = null;
    }
  })();

  return keywordsInflight;
}
