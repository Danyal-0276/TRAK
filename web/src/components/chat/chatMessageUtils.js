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

export function formatConversationWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
