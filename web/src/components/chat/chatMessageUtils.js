export function mapServerChatMessage(m) {
  if (!m || typeof m !== 'object') return null;
  const path =
    (typeof m.article_path === 'string' && m.article_path.startsWith('/article/') && m.article_path) ||
    (m.article_id ? `/article/${encodeURIComponent(String(m.article_id))}` : null);
  const relatedArticles = [];
  if (path) {
    relatedArticles.push({ title: m.article_title, source: m.source, path });
  }
  if (Array.isArray(m.related_articles)) {
    for (const a of m.related_articles) {
      const p =
        a?.trak_path ||
        a?.article_path ||
        (a?.id ? `/article/${encodeURIComponent(String(a.id))}` : null);
      if (p) relatedArticles.push({ title: a.title, source: a.source, path: p });
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
