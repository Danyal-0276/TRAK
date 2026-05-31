import { relativeTime } from './feedbackCategoryMeta';

export { relativeTime };

export const NOTIFICATION_FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'reports', label: 'Reports' },
  { key: 'errors', label: 'Errors' },
  { key: 'system', label: 'System' },
];

export const NOTIFICATION_TYPE_META = {
  admin_user_report: { label: 'User report', group: 'reports', icon: 'flag', tone: '#ef4444' },
  admin_user_feedback: { label: 'User feedback', group: 'reports', icon: 'message', tone: '#6366f1' },
  admin_pipeline_error: { label: 'Pipeline error', group: 'errors', icon: 'alert', tone: '#ef4444' },
  admin_system: { label: 'System update', group: 'system', icon: 'settings', tone: '#64748b' },
};

export const NOTIFICATION_GROUP_LABELS = {
  reports: 'User report',
  errors: 'Pipeline',
  system: 'System',
};

export const READ_STATUS_META = {
  unread: { label: 'Unread', color: '#3b82f6' },
  read: { label: 'Read', color: '#94a3b8' },
};

export function getNotificationTypeMeta(type) {
  const key = String(type || '');
  if (NOTIFICATION_TYPE_META[key]) return NOTIFICATION_TYPE_META[key];
  if (key.startsWith('admin_pipeline')) {
    return NOTIFICATION_TYPE_META.admin_pipeline_error;
  }
  return {
    label: key.replace(/^admin_/, '').replace(/_/g, ' ') || 'Notification',
    group: key.startsWith('admin_pipeline') ? 'errors' : 'system',
    icon: 'bell',
    tone: '#64748b',
  };
}

export function matchesNotificationFilter(row, filterKey) {
  const type = String(row.type || '');
  if (filterKey === 'unread') return !row.read;
  if (filterKey === 'errors') return type.startsWith('admin_pipeline');
  if (filterKey === 'system') return type === 'admin_system';
  if (filterKey === 'reports') {
    return type === 'admin_user_report' || type === 'admin_user_feedback';
  }
  return true;
}

export function countNotificationsByFilter(rows) {
  const counts = { all: rows.length, unread: 0, reports: 0, errors: 0, system: 0 };
  rows.forEach((row) => {
    if (!row.read) counts.unread += 1;
    if (matchesNotificationFilter(row, 'reports')) counts.reports += 1;
    if (matchesNotificationFilter(row, 'errors')) counts.errors += 1;
    if (matchesNotificationFilter(row, 'system')) counts.system += 1;
  });
  return counts;
}

export function notificationAccentColor(row) {
  if (row.important && !row.read) return '#ef4444';
  return row.read ? READ_STATUS_META.read.color : READ_STATUS_META.unread.color;
}

export function notificationReadStatus(row) {
  return row.read ? READ_STATUS_META.read : READ_STATUS_META.unread;
}
