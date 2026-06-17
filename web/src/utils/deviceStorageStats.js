/** Local device storage helpers for the web app (localStorage). */

export const STORAGE_BUDGET_BYTES = 5 * 1024 * 1024;

export const ESSENTIAL_STORAGE_KEYS = new Set([
  'userSettings',
  'userProfile',
  'userAvatar',
  'theme',
]);

export const STORAGE_CATEGORIES = [
  { key: 'articles', label: 'Articles & bookmarks', color: '#3b82f6' },
  { key: 'images', label: 'Images & avatars', color: '#10b981' },
  { key: 'videos', label: 'Videos', color: '#ef4444' },
  { key: 'cache', label: 'Cache & temp', color: '#f59e0b' },
  { key: 'other', label: 'Other data', color: '#8b5cf6' },
];

export function categorizeStorageKey(key) {
  const k = String(key || '').toLowerCase();
  if (k.includes('bookmark') || k.includes('article') || k.includes('profile')) return 'articles';
  if (k.includes('image') || k.includes('avatar') || k.includes('pic')) return 'images';
  if (k.includes('video')) return 'videos';
  if (k.includes('cache') || k.includes('temp')) return 'cache';
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

export function readLocalStorageEntries() {
  const entries = [];
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) continue;
      const value = localStorage.getItem(key) ?? '';
      entries.push({ key, size: new Blob([value]).size });
    }
  } catch {
    /* ignore quota / access errors */
  }
  return entries;
}

export function calculateLocalStorageSummary(budget = STORAGE_BUDGET_BYTES) {
  return summarizeStorageEntries(readLocalStorageEntries(), budget);
}

export function keysMatchingClearType(type) {
  const keys = Object.keys(localStorage);
  if (type === 'cache') {
    return keys.filter((key) => /cache|temp/i.test(key));
  }
  if (type === 'articles') {
    return keys.filter(
      (key) =>
        /bookmark|article|profile/i.test(key)
        && !ESSENTIAL_STORAGE_KEYS.has(key)
    );
  }
  if (type === 'all') {
    return keys.filter((key) => !ESSENTIAL_STORAGE_KEYS.has(key));
  }
  return [];
}

export function clearLocalStorageByType(type) {
  const keys = keysMatchingClearType(type);
  keys.forEach((key) => localStorage.removeItem(key));
  return keys.length;
}

export function buildLocalStorageExport() {
  return {
    profile: localStorage.getItem('userProfile'),
    settings: localStorage.getItem('userSettings'),
    bookmarks: localStorage.getItem('bookmarks'),
    theme: localStorage.getItem('theme'),
    exportDate: new Date().toISOString(),
    platform: 'web',
  };
}

export function downloadJsonExport(payload, filenamePrefix = 'trak-data') {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${filenamePrefix}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
