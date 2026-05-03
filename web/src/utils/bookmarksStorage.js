const KEY = 'trak_bookmarks_v1';

function normalizeIds(ids = []) {
  const out = [];
  for (const raw of ids) {
    const s = String(raw || '').trim();
    if (s && !out.includes(s)) out.push(s);
  }
  return out;
}

export function getBookmarkIds() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return normalizeIds(Array.isArray(parsed) ? parsed : []);
  } catch {
    return [];
  }
}

export function setBookmarkIds(ids = []) {
  const cleaned = normalizeIds(ids);
  window.localStorage.setItem(KEY, JSON.stringify(cleaned));
  return cleaned;
}
