const NAV_MENU_TOKENS = new Set([
  'latest', 'home', 'world', 'sports', 'business', 'health', 'entertainment',
  'showbiz', 'pakistan', 'royal', 'opinion', 'videos', 'video', 'photos', 'photo',
  'contact', 'about', 'menu', 'search', 'login', 'subscribe', 'trending',
  'national', 'international', 'sci-tech', 'technology', 'crime', 'lifestyle',
]);

function normalizeLine(line) {
  return String(line || '').replace(/\s+/g, ' ').trim();
}

export function isNavBoilerplateLine(line) {
  const s = normalizeLine(line);
  if (!s) return true;
  const low = s.toLowerCase();
  if (NAV_MENU_TOKENS.has(low)) return true;
  const words = low.split(/\s+/).filter(Boolean);
  if (words.length <= 4 && words.every((w) => NAV_MENU_TOKENS.has(w))) return true;
  if (s.length < 28 && low === s.toLowerCase() && !s.includes(' ')) return true;
  return false;
}

export function sanitizeArticleBody(text, { title = '' } = {}) {
  const raw = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!raw) return '';
  const titleNorm = normalizeLine(title).toLowerCase();
  const kept = [];
  for (const block of raw.split(/\n\s*\n+/)) {
    const line = normalizeLine(block);
    if (!line) continue;
    if (isNavBoilerplateLine(line)) continue;
    if (titleNorm && line.toLowerCase() === titleNorm) continue;
    if (titleNorm && line.toLowerCase().startsWith(titleNorm) && line.length <= titleNorm.length + 12) {
      continue;
    }
    kept.push(line);
  }
  return kept.join('\n\n').trim();
}

export function sanitizeArticleSummary(summary, { title = '', body = '' } = {}) {
  let s = normalizeLine(summary);
  const t = normalizeLine(title);
  if (!s) return s;
  s = s.replace(/\s+Home\s*$/i, '').trim();
  if (t && (s.toLowerCase() === t.toLowerCase() || s.toLowerCase().startsWith(t.toLowerCase()))) {
    const cleaned = sanitizeArticleBody(body, { title });
    for (const block of cleaned.split(/\n\s*\n+/)) {
      const line = normalizeLine(block);
      if (line.length >= 60 && !isNavBoilerplateLine(line)) {
        if (!line.toLowerCase().startsWith(t.toLowerCase().slice(0, Math.max(20, t.length)))) {
          return line.slice(0, 500);
        }
        if (line.length > t.length + 40) return line.slice(0, 500);
      }
    }
    return '';
  }
  return s;
}
