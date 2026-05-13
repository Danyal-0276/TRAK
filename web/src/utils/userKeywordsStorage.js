const KEY = 'trak_user_keywords';

function normalize(arr = []) {
  const out = [];
  for (const raw of arr) {
    const s = String(raw || '').trim().toLowerCase();
    if (s && !out.includes(s)) out.push(s);
  }
  return out;
}

export function getUserKeywords() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return normalize(Array.isArray(parsed) ? parsed : []);
  } catch {
    return [];
  }
}

export function setUserKeywords(keywords) {
  const cleaned = normalize(keywords);
  window.localStorage.setItem(KEY, JSON.stringify(cleaned));
  try {
    window.dispatchEvent(new CustomEvent('trak-keywords-changed', { detail: cleaned }));
  } catch {
    /* ignore */
  }
  return cleaned;
}
