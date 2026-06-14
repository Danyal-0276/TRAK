export function mapServerChatMessage(m) {
  if (!m || typeof m !== 'object') return null;
  return {
    role: m.role,
    text: m.text,
    articleTitle: m.article_title,
    articleId: m.article_id,
    source: m.source,
  };
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
