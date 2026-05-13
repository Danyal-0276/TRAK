const KEY = 'trak_reactions_v1';

function normalizeId(id) {
  return String(id || '').trim();
}

export function getReactionMap() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function setReactionMap(map = {}) {
  window.localStorage.setItem(KEY, JSON.stringify(map || {}));
}

export function setReactionForArticle(articleId, reaction) {
  const id = normalizeId(articleId);
  if (!id) return;
  const map = getReactionMap();
  map[id] = reaction || null;
  setReactionMap(map);
}

export function mergeReactionRows(rows = [], opts = {}) {
  const replace = opts.replace !== false;
  const base = replace ? {} : getReactionMap();
  const next = { ...base };
  for (const r of rows) {
    const id = normalizeId(r?.article_id);
    if (!id) continue;
    next[id] = r?.reaction === 'like' ? 'up' : r?.reaction === 'dislike' ? 'down' : null;
  }
  setReactionMap(next);
  return next;
}
