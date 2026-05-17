/** Variants for slug vs spaced category/keyword labels. */
export function keywordVariants(term) {
  const base = String(term || '').trim().toLowerCase();
  if (!base) return [];
  const slug = base.replace(/\s+/g, '-');
  const spaced = base.replace(/-/g, ' ');
  return [...new Set([base, slug, spaced])];
}

export function articleHaystack(article) {
  const parts = [
    article.title,
    article.excerpt,
    article.summary,
    article.description,
    article.content,
    article.fullContent,
    article.clean_text,
    article.category,
    article.source,
    ...(article.topic_keywords || []),
    ...(article.categories || []),
    ...(article.matchedKeywords || []),
  ];
  return parts.map((p) => String(p || '').toLowerCase()).join(' ');
}

/** True when at least one user keyword appears in the article text/metadata. */
export function articleMatchesUserKeywords(article, userKeywords = []) {
  if (!userKeywords?.length) return false;
  const hay = articleHaystack(article);
  return userKeywords.some((kw) =>
    keywordVariants(kw).some((v) => v.length >= 2 && hay.includes(v))
  );
}

export function filterFeedByUserKeywords(items, userKeywords = []) {
  if (!userKeywords?.length) return [];
  return (items || []).filter((item) => articleMatchesUserKeywords(item, userKeywords));
}
