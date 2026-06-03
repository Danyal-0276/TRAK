import React from 'react';
import {
  AlertTriangle,
  Bell,
  Flag,
  MessageSquare,
  Settings,
  User,
  Newspaper,
} from 'lucide-react';
import {
  getNotificationTypeMeta,
  NOTIFICATION_GROUP_LABELS,
  relativeTime,
  notificationAccentColor,
  notificationReadStatus,
} from '../../../constants/adminNotificationMeta';

const ICONS = {
  alert: AlertTriangle,
  bell: Bell,
  flag: Flag,
  message: MessageSquare,
  settings: Settings,
};

function reporterInitials(row) {
  const email = String(row.meta?.reporter_email || '');
  if (email) return email.slice(0, 2).toUpperCase();
  return 'A';
}

export default function AdminNotificationCard({ row, palette, onClick }) {
  const typeMeta = getNotificationTypeMeta(row.type);
  const readStatus = notificationReadStatus(row);
  const Icon = ICONS[typeMeta.icon] || Bell;
  const excerpt = row.text || row.details || 'No message';
  const articleTitle = row.meta?.post_title || row.meta?.article_title;
  const reporter = row.meta?.reporter_email || (row.meta?.user_id ? `User #${row.meta.user_id}` : '');
  const reporterAvatarBg = palette.isDark
    ? (palette.surfaceElevated || palette.inputBg || '#262626')
    : (palette.textPrimary || '#0a0a0a');
  const reporterAvatarText = palette.isDark
    ? (palette.textPrimary || '#fafafa')
    : (palette.textInverse || '#ffffff');

  return (
    <button
      type="button"
      onClick={() => onClick?.(row)}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: 0,
        marginBottom: 10,
        borderRadius: 12,
        border: `1px solid ${palette.border}`,
        background: palette.card,
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
      }}
    >
      <div style={{ display: 'flex', minHeight: 88 }}>
        <div style={{ width: 4, flexShrink: 0, background: notificationAccentColor(row) }} />
        <div style={{ flex: 1, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: `${typeMeta.tone}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={16} color={typeMeta.tone} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: palette.textPrimary }}>
                  {typeMeta.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: palette.textSecondary,
                    background: palette.inputBg || palette.backgroundSecondary,
                    padding: '2px 8px',
                    borderRadius: 999,
                  }}
                >
                  {NOTIFICATION_GROUP_LABELS[typeMeta.group] || 'Alert'}
                </span>
                {row.important ? (
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444' }}>Important</span>
                ) : null}
                <span style={{ marginLeft: 'auto', fontSize: 12, color: palette.textTertiary }}>
                  {relativeTime(row.created_at)}
                </span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: palette.textSecondary,
                  marginTop: 6,
                  lineHeight: 1.45,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {excerpt}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {reporter ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: palette.textSecondary }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    background: reporterAvatarBg,
                    color: reporterAvatarText,
                    border: `1px solid ${palette.border}`,
                    fontSize: 10,
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {reporterInitials(row)}
                </span>
                <User size={12} />
                {reporter}
              </span>
            ) : null}
            {articleTitle ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: palette.textSecondary, minWidth: 0 }}>
                <Newspaper size={12} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                  {articleTitle}
                </span>
              </span>
            ) : null}
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: readStatus.color,
                marginLeft: 'auto',
              }}
            >
              {readStatus.label}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
