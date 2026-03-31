const KEY = 'trak_recent_searches_web';
const MAX_ITEMS = 15;

function iconForQuery(query) {
  const lower = String(query).toLowerCase();
  if (/sport|nba|cricket|football/.test(lower)) return '⚽';
  if (/tech|ai|quantum|software/.test(lower)) return '💻';
  if (/climate|environment|green/.test(lower)) return '🌱';
  if (/electric|vehicle|car/.test(lower)) return '⚡';
  if (/space|rocket|nasa/.test(lower)) return '🚀';
  if (/business|market|stock/.test(lower)) return '📈';
  if (/wildlife|animal/.test(lower)) return '🐾';
  return '🔍';
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return 'Just now';
}

export async function getRecentSearches() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function addRecentSearch(query) {
  const q = String(query || '').trim();
  if (!q) return getRecentSearches();
  const prev = await getRecentSearches();
  const ts = Date.now();
  const filtered = prev.filter((x) => x.query?.toLowerCase() !== q.toLowerCase());
  const row = {
    id: String(ts),
    query: q,
    time: timeAgo(ts),
    icon: iconForQuery(q),
    timestamp: ts,
  };
  const next = [row, ...filtered].slice(0, MAX_ITEMS);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function deleteRecentSearch(searchId) {
  const prev = await getRecentSearches();
  const next = prev.filter((x) => String(x.id) !== String(searchId));
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
