import { newsTagsWithSubcategories } from '../route/TagSelectionScreen/constants/newsCategories';

/** Credibility labels from API — not browse categories. */
const CREDIBILITY_SKIP = new Set([
  'news',
  'real',
  'suspicious',
  'fake',
  'verified',
  'unverified',
  'misleading',
  'satire',
]);

export function normalizeCategoryName(raw) {
  if (raw == null || raw === '') return '';
  const s = String(raw).trim();
  if (!s) return '';
  return s
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function categoryKey(name) {
  return String(name).toLowerCase().trim().replace(/\s+/g, '-');
}

/** Match backend platform_taxonomy._slugify for count/browse key alignment. */
export function normalizeCategorySlug(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function platformCategorySlug(entry) {
  if (entry == null || entry === '') return '';
  if (typeof entry === 'string') return normalizeCategorySlug(entry);
  if (typeof entry === 'object') {
    const slug = String(entry.slug || '').trim();
    if (slug) return normalizeCategorySlug(slug);
    return normalizeCategorySlug(String(entry.name || entry.id || '').trim());
  }
  return '';
}

function buildNormalizedCountMap(categoryCounts) {
  const out = {};
  if (!categoryCounts || typeof categoryCounts !== 'object') return out;
  for (const [rawKey, rawValue] of Object.entries(categoryCounts)) {
    const key = normalizeCategorySlug(rawKey);
    if (!key) continue;
    out[key] = (out[key] || 0) + Number(rawValue || 0);
  }
  return out;
}

const CATEGORY_SYNONYMS = {
  politics: ['politics', 'political', 'election', 'government', 'parliament', 'congress', 'minister', 'biden', 'trump'],
  business: ['business', 'economy', 'market', 'stock', 'finance', 'trade', 'company', 'corporate', 'tariff', 'ceo'],
  technology: ['technology', 'tech', 'software', 'artificial intelligence', 'digital', 'cyber', 'startup', 'apple', 'google', 'microsoft'],
  sports: ['sports', 'sport', 'football', 'soccer', 'nba', 'cricket', 'olympic', 'match', 'league', 'athlete', 'tennis'],
  entertainment: ['entertainment', 'celebrity', 'movie', 'music', 'hollywood', 'netflix', 'grammy', 'oscar'],
  health: ['health', 'medical', 'medicine', 'hospital', 'doctor', 'wellness', 'disease', 'covid', 'vaccine'],
  science: ['science', 'scientific', 'research', 'space', 'nasa', 'physics', 'biology', 'discovery'],
  'world-news': ['world', 'international', 'global', 'foreign', 'diplomacy', 'ukraine', 'gaza', 'nato'],
  'local-news': ['local', 'community', 'city', 'county', 'neighborhood'],
  'breaking-news': ['breaking', 'urgent', 'alert', 'live updates'],
  finance: ['finance', 'banking', 'investment', 'cryptocurrency', 'bitcoin', 'wall street', 'fed', 'inflation'],
  weather: ['weather', 'storm', 'hurricane', 'flood', 'forecast', 'temperature'],
  education: ['education', 'school', 'university', 'student', 'teacher', 'college'],
  lifestyle: ['lifestyle', 'fashion', 'relationship', 'self-improvement'],
  food: ['food', 'restaurant', 'recipe', 'cooking', 'chef'],
  travel: ['travel', 'tourism', 'airline', 'hotel', 'vacation'],
  automotive: ['automotive', 'car', 'vehicle', 'electric vehicle', 'tesla', 'ford'],
  'real-estate': ['real estate', 'housing', 'mortgage', 'rent', 'property'],
  opinion: ['opinion', 'editorial', 'commentary', 'op-ed'],
  culture: ['culture', 'art', 'literature', 'heritage', 'museum'],
  environment: ['environment', 'climate', 'pollution', 'carbon', 'renewable', 'conservation', 'wildlife', 'species'],
  crime: ['crime', 'police', 'court', 'murder', 'arrest', 'prison', 'fbi'],
  military: ['military', 'army', 'defense', 'pentagon', 'veteran', 'weapon'],
  gaming: ['gaming', 'video game', 'esports', 'playstation', 'xbox'],
  startup: ['startup', 'unicorn', 'venture', 'funding round', 'entrepreneur'],
  'social-media': ['social media', 'instagram', 'tiktok', 'facebook', 'twitter', 'influencer'],
};

function buildArticleBlob(article) {
  if (!article) return '';
  const parts = [
    article.title,
    article.excerpt,
    article.summary,
    article.content,
    article.fullContent,
    article.source,
    ...(article.topic_keywords || []).map(String),
    ...(article.categories || []).filter((c) => !CREDIBILITY_SKIP.has(String(c).toLowerCase())),
  ];
  return parts.filter(Boolean).join(' ').toLowerCase();
}

function articleMlCategorySlugs(article) {
  const slugs = new Set();
  const primary = normalizeCategorySlug(article?.primary_category || '');
  if (primary && !CREDIBILITY_SKIP.has(primary)) slugs.add(primary);
  for (const raw of article?.categories || []) {
    const slug = normalizeCategorySlug(String(raw));
    if (slug && !CREDIBILITY_SKIP.has(slug)) slugs.add(slug);
  }
  return slugs;
}

export function articleMatchesCategory(article, categoryName) {
  if (!categoryName) return true;
  const key = normalizeCategorySlug(categoryKey(categoryName));

  const mlSlugs = articleMlCategorySlugs(article);
  if (mlSlugs.size) {
    return mlSlugs.has(key);
  }

  const blob = buildArticleBlob(article);
  const display = key.replace(/-/g, ' ');
  if (blob.includes(display) || blob.includes(key)) return true;

  for (const syn of CATEGORY_SYNONYMS[key] || []) {
    if (termInBlob(syn, blob)) return true;
  }
  for (const sub of newsTagsWithSubcategories[key] || []) {
    const subPhrase = sub.replace(/-/g, ' ');
    if (termInBlob(subPhrase, blob) || termInBlob(sub, blob)) return true;
  }
  return false;
}

function termInBlob(term, blob) {
  const t = String(term || '').trim().toLowerCase();
  if (!t || !blob) return false;
  if (t.includes(' ') || t.length > 5) return blob.includes(t);
  const re = new RegExp(`(?<![a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-z0-9])`);
  return re.test(blob);
}

export function buildCategoryList(platformCategories = [], categoryCounts = null) {
  const normCounts = buildNormalizedCountMap(categoryCounts);
  const useApiCounts = Object.keys(normCounts).length > 0;

  const rows = [];
  const raw = Array.isArray(platformCategories) ? platformCategories : [];
  if (raw.length) {
    for (const c of raw) {
      if (c && typeof c === 'object' && c.active === false) continue;
      const key = platformCategorySlug(c);
      if (!key) continue;
      const name = typeof c === 'string'
        ? normalizeCategoryName(c)
        : normalizeCategoryName(String(c?.name || '').trim() || key);
      rows.push({ name, key });
    }
  } else {
    for (const slug of Object.keys(newsTagsWithSubcategories)) {
      rows.push({ name: normalizeCategoryName(slug), key: slug });
    }
  }

  const seen = new Set();
  const list = [];
  for (const row of rows) {
    if (!row.key || seen.has(row.key)) continue;
    seen.add(row.key);
    list.push({
      name: row.name,
      key: row.key,
      count: useApiCounts ? Number(normCounts[row.key] ?? 0) : 0,
    });
  }

  return list.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

const CATEGORY_ICONS = {
  politics: '🏛️',
  business: '📈',
  technology: '💻',
  sports: '⚽',
  entertainment: '🎬',
  health: '🏥',
  science: '🔬',
  'world-news': '🌍',
  'local-news': '📍',
  'breaking-news': '🚨',
  finance: '💰',
  weather: '🌤️',
  education: '🎓',
  lifestyle: '✨',
  food: '🍽️',
  travel: '✈️',
  automotive: '🚗',
  'real-estate': '🏠',
  opinion: '💬',
  culture: '🎭',
  environment: '🌱',
  crime: '⚖️',
  military: '🎖️',
  gaming: '🎮',
  startup: '🚀',
  'social-media': '📱',
};

export function getCategoryIcon(name) {
  return CATEGORY_ICONS[categoryKey(name)] || '📰';
}
