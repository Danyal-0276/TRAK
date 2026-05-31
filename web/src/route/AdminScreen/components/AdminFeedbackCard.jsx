import React from 'react';
import { AlertTriangle, Eye, Shield, Copy, Ban, Scale, MessageSquare, User, Newspaper } from 'lucide-react';
import {
  getFeedbackCategoryMeta,
  formatFeedbackType,
  relativeTime,
  FEEDBACK_STATUS_META,
} from '../../../constants/feedbackCategoryMeta';

const ICONS = {
  alert: AlertTriangle,
  eye: Eye,
  shield: Shield,
  copy: Copy,
  ban: Ban,
  scale: Scale,
  message: MessageSquare,
};

function reporterInitials(row) {
  const email = String(row.reporter_email || '');
  if (email) return email.slice(0, 2).toUpperCase();
  return 'U';
}

export default function AdminFeedbackCard({ row, palette, onClick }) {
  const cat = getFeedbackCategoryMeta(row.category);
  const status = FEEDBACK_STATUS_META[row.status] || FEEDBACK_STATUS_META.pending;
  const Icon = ICONS[cat.icon] || MessageSquare;
  const message = row.message || row.category_label || 'No message provided';
  const articleTitle = row.article_title || row.meta?.post_title;

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
        <div style={{ width: 4, flexShrink: 0, background: status.color }} />
        <div style={{ flex: 1, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: `${cat.tone}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={16} color={cat.tone} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: palette.textPrimary }}>
                  {cat.label}
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
                  {formatFeedbackType(row.type)}
                </span>
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
                {message}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: palette.textSecondary }}>
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  background: palette.textPrimary,
                  color: palette.textInverse || '#fff',
                  fontSize: 10,
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {reporterInitials(row)}
              </span>
              {row.reporter_email || `User #${row.user_id}`}
            </span>
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
                color: status.color,
                marginLeft: 'auto',
              }}
            >
              {status.label}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
