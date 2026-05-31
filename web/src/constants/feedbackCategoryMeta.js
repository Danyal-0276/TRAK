export const FEEDBACK_CATEGORIES = [
  { key: 'incorrect_fact', label: 'News appears factually incorrect', tone: '#ef4444', icon: 'alert' },
  { key: 'misleading', label: 'Misleading or out of context', tone: '#f59e0b', icon: 'eye' },
  { key: 'fake_source', label: 'Suspected fake / unreliable source', tone: '#dc2626', icon: 'shield' },
  { key: 'duplicate', label: 'Duplicate or reposted content', tone: '#64748b', icon: 'copy' },
  { key: 'offensive', label: 'Offensive or harmful content', tone: '#b91c1c', icon: 'ban' },
  { key: 'credibility_disagree', label: 'I disagree with credibility rating', tone: '#6366f1', icon: 'scale' },
  { key: 'other', label: 'Other', tone: '#64748b', icon: 'message' },
];

export const FEEDBACK_STATUS_META = {
  pending: { label: 'Pending', color: '#f59e0b' },
  reviewed: { label: 'Reviewed', color: '#22c55e' },
  dismissed: { label: 'Dismissed', color: '#94a3b8' },
};

export function getFeedbackCategoryMeta(key) {
  return FEEDBACK_CATEGORIES.find((c) => c.key === key) || FEEDBACK_CATEGORIES[FEEDBACK_CATEGORIES.length - 1];
}

export function formatFeedbackType(type) {
  if (type === 'article_report') return 'Article report';
  if (type === 'app_feedback') return 'App feedback';
  return String(type || 'Feedback').replace(/_/g, ' ');
}

export function relativeTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  return d.toLocaleDateString();
}

export default FEEDBACK_CATEGORIES;
