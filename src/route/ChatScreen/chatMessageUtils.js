export function mapChatRelatedArticles(res) {
  const raw =
    Array.isArray(res?.related_articles) && res.related_articles.length
      ? res.related_articles
      : Array.isArray(res?.articles) && res.articles.length
        ? res.articles
        : res?.has_trak_article && res?.primary_article
          ? [res.primary_article]
          : [];
  return raw
    .map((a) => ({
      articleId: a?.id || a?.article_id,
      articleTitle: a?.title,
      source: a?.source_key || a?.source,
    }))
    .filter((a) => a.articleId || a.articleTitle);
}

export function mapServerChatMessage(m) {
  if (!m || typeof m !== 'object') return null;
  const relatedArticles = [];
  if (m.article_id || m.article_title) {
    relatedArticles.push({
      articleId: m.article_id,
      articleTitle: m.article_title,
      source: m.source,
    });
  }
  if (Array.isArray(m.related_articles)) {
    for (const a of m.related_articles) {
      const articleId = a?.id || a?.article_id;
      if (!articleId && !a?.title) continue;
      if (relatedArticles.some((row) => String(row.articleId) === String(articleId))) continue;
      relatedArticles.push({
        articleId,
        articleTitle: a?.title,
        source: a?.source_key || a?.source,
      });
    }
  }
  return { role: m.role, text: m.text, relatedArticles };
}

export function mapServerChatMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages.map(mapServerChatMessage).filter(Boolean);
}

export function parseApiDate(iso) {
  if (!iso) return null;
  let text = String(iso).trim();
  if (!text) return null;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(text)) {
    text = text.replace(' ', 'T');
  }
  if (!/[zZ]|[+-]\d{2}:\d{2}$/.test(text)) {
    text += 'Z';
  }
  const d = new Date(text);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatConversationWhen(iso) {
  const d = parseApiDate(iso);
  if (!d) return '';

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayDiff = Math.floor((startOfToday.getTime() - startOfDay.getTime()) / 86400000);
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  if (dayDiff === 0) return time;
  if (dayDiff === 1) return `Yesterday, ${time}`;
  if (dayDiff < 7) {
    return d.toLocaleDateString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' });
  }
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
