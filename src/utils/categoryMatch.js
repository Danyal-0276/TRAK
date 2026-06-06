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

export function articleMatchesCategory(article, categoryName) {
  if (!categoryName) return true;
  const key = categoryKey(categoryName);
  const blob = buildArticleBlob(article);
  const display = key.replace(/-/g, ' ');
  if (blob.includes(display) || blob.includes(key)) return true;

  for (const syn of CATEGORY_SYNONYMS[key] || []) {
    if (blob.includes(syn)) return true;
  }
  for (const sub of newsTagsWithSubcategories[key] || []) {
    const subPhrase = sub.replace(/-/g, ' ');
    if (blob.includes(subPhrase) || blob.includes(sub)) return true;
  }
  return false;
}

export function buildCategoryList(articles, platformCategoryNames = []) {
  const fromPlatform = (platformCategoryNames || [])
    .map((c) => (typeof c === 'string' ? c : c?.name || c?.id || ''))
    .map(normalizeCategoryName)
    .filter(Boolean);

  const defaultNames = Object.keys(newsTagsWithSubcategories).map(normalizeCategoryName);
  const canonical = [...new Set([...fromPlatform, ...defaultNames])];

  const seen = new Set();
  const list = [];

  for (const name of canonical) {
    const key = categoryKey(name);
    if (seen.has(key)) continue;
    seen.add(key);
    const count = (articles || []).filter((a) => articleMatchesCategory(a, name)).length;
    list.push({ name, key, count });
  }

  return list
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
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
