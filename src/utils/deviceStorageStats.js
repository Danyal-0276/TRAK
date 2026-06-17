/** Local device storage helpers for the mobile app (AsyncStorage). */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_BUDGET_BYTES = 50 * 1024 * 1024;

export const ESSENTIAL_STORAGE_KEYS = new Set([
  'trak_access_token',
  'trak_refresh_token',
  'trak_user',
  'trak_user_cache_v1',
  'theme',
]);

export const STORAGE_CATEGORIES = [
  { key: 'articles', label: 'Articles & bookmarks', color: '#3b82f6' },
  { key: 'images', label: 'Images & avatars', color: '#10b981' },
  { key: 'videos', label: 'Videos', color: '#ef4444' },
  { key: 'cache', label: 'Cache & temp', color: '#f59e0b' },
  { key: 'other', label: 'Other data', color: '#8b5cf6' },
];

function byteSize(value) {
  const str = String(value ?? '');
  if (!str) return 0;
  try {
    return new TextEncoder().encode(str).length;
  } catch {
    return str.length * 2;
  }
}

export function categorizeStorageKey(key) {
  const k = String(key || '').toLowerCase();
  if (
    k.includes('bookmark')
    || k.includes('article')
    || k.includes('profile')
    || k.includes('reaction')
  ) {
    return 'articles';
  }
  if (k.includes('image') || k.includes('avatar') || k.includes('pic')) return 'images';
  if (k.includes('video')) return 'videos';
  if (k.includes('cache') || k.includes('temp') || k.includes('_v1')) return 'cache';
  return 'other';
}

export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  const value = bytes / k ** i;
  return `${Math.round(value * 100) / 100} ${sizes[i]}`;
}

export function getPercentage(value, total) {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

export function getUsageTone(percent) {
  if (percent > 80) return { tone: 'critical', color: '#ef4444' };
  if (percent > 60) return { tone: 'warn', color: '#f59e0b' };
  return { tone: 'ok', color: '#10b981' };
}

export function summarizeStorageEntries(entries, budget = STORAGE_BUDGET_BYTES) {
  const breakdown = {
    articles: 0,
    images: 0,
    videos: 0,
    cache: 0,
    other: 0,
  };

  let used = 0;
  for (const entry of entries || []) {
    const size = Number(entry?.size) || 0;
    used += size;
    const bucket = categorizeStorageKey(entry?.key);
    breakdown[bucket] += size;
  }

  return {
    total: budget,
    used,
    available: Math.max(0, budget - used),
    breakdown,
  };
}

export async function readAsyncStorageEntries() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    if (!keys?.length) return [];
    const pairs = await AsyncStorage.multiGet(keys);
    return pairs.map(([key, value]) => ({ key, size: byteSize(value) }));
  } catch {
    return [];
  }
}

export async function calculateAsyncStorageSummary(budget = STORAGE_BUDGET_BYTES) {
  const entries = await readAsyncStorageEntries();
  return summarizeStorageEntries(entries, budget);
}

function keysMatchingClearType(keys, type) {
  if (type === 'cache') {
    return keys.filter((key) => /cache|temp|_v1/i.test(key) && !ESSENTIAL_STORAGE_KEYS.has(key));
  }
  if (type === 'articles') {
    return keys.filter(
      (key) =>
        /bookmark|article|profile|reaction|keyword/i.test(key)
        && !ESSENTIAL_STORAGE_KEYS.has(key)
    );
  }
  if (type === 'all') {
    return keys.filter((key) => !ESSENTIAL_STORAGE_KEYS.has(key));
  }
  return [];
}

export async function clearAsyncStorageByType(type) {
  const keys = await AsyncStorage.getAllKeys();
  const toRemove = keysMatchingClearType(keys, type);
  if (toRemove.length) {
    await AsyncStorage.multiRemove(toRemove);
  }
  return toRemove.length;
}

export async function buildAsyncStorageExport() {
  const keys = [
    'trak_user',
    'trak_profile_cache_v1',
    'trak_profile_bookmarks_cache_v1',
    'trak_user_keywords',
    'theme',
  ];
  const pairs = await AsyncStorage.multiGet(keys);
  const payload = {
    exportDate: new Date().toISOString(),
    platform: 'mobile',
  };
  pairs.forEach(([key, value]) => {
    payload[key] = value;
  });
  return payload;
}
