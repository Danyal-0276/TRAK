import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'trak_reactions_v1';

function normalizeId(id) {
  return String(id || '');
}

export async function getReactionMap() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

export async function setReactionMap(map) {
  await AsyncStorage.setItem(KEY, JSON.stringify(map || {}));
}

export async function setReactionForArticle(articleId, reaction) {
  const id = normalizeId(articleId);
  if (!id) return;
  const map = await getReactionMap();
  map[id] = reaction || null; // 'up' | 'down' | null
  await setReactionMap(map);
}

export async function mergeReactionRows(rows = [], opts = {}) {
  const replace = opts.replace !== false;
  const base = replace ? {} : await getReactionMap();
  const next = { ...base };
  for (const r of rows) {
    const id = normalizeId(r?.article_id);
    if (!id) continue;
    next[id] = r?.reaction === 'like' ? 'up' : r?.reaction === 'dislike' ? 'down' : null;
  }
  await setReactionMap(next);
  return next;
}
