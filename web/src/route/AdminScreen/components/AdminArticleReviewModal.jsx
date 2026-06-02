import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Eye } from 'lucide-react';
import { useAdminTheme } from '../useAdminTheme';
import { patchAdminArticle } from '../../../api/adminApi';
import { useUIFeedback } from '../../../components/ui/UIFeedback';
import ArticleInsightBadges, {
  ArticleTopicKeywords,
  ArticleCredibilityIndicator,
} from './ArticleInsightBadges';
import AdminArticleHeroImage from './AdminArticleHeroImage';

const MODERATION_OPTIONS = [
  { value: 'review', label: 'Needs review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

function sourceInitials(source) {
  return String(source || 'N').substring(0, 2).toUpperCase();
}

export default function AdminArticleReviewModal({
  article,
  open,
  onClose,
  onSaved,
  onOpenInApp,
  feedbackBanner = '',
}) {
  const { palette, isDark } = useAdminTheme();
  const { success, error: notifyError } = useUIFeedback();
  const [status, setStatus] = useState('review');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (article) setStatus(article.moderation_status || 'review');
  }, [article]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  if (!open || !article) return null;

  const avatarBg = isDark ? '#ffffff' : palette.textPrimary;
  const avatarText = isDark ? '#0a0a0a' : '#ffffff';
  const primaryButtonBg = palette.buttonPrimaryBg || palette.primary;
  const primaryButtonText = palette.buttonPrimaryText || (isDark ? palette.textPrimary : '#ffffff');

  const handleSave = async () => {
    setSaving(true);
    try {
      await patchAdminArticle(article.scope, article.id, { status });
      success('Review saved.');
      onSaved?.({ ...article, moderation_status: status });
      onClose?.();
    } catch (e) {
      notifyError(e?.message || 'Could not save review.');
    } finally {
      setSaving(false);
    }
  };

  const factHits = Array.isArray(article.fact_check_hits) ? article.fact_check_hits : [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: feedbackBanner ? 2100 : 1000,
        backgroundColor: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 720,
          maxHeight: '92vh',
          overflow: 'auto',
          backgroundColor: palette.card,
          borderRadius: 14,
          border: `1px solid ${palette.border}`,
          boxShadow: `0 16px 48px ${palette.shadow}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {feedbackBanner ? (
          <div
            style={{
              padding: '10px 20px',
              fontSize: 12,
              fontWeight: 600,
              color: palette.primary,
              background: `${palette.primary}12`,
              borderBottom: `1px solid ${palette.border}`,
            }}
          >
            {feedbackBanner}
          </div>
        ) : null}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '18px 20px',
            borderBottom: `1px solid ${palette.border}`,
            position: 'sticky',
            top: 0,
            backgroundColor: palette.card,
            zIndex: 1,
          }}
        >
          <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: avatarBg,
                  color: avatarText,
                  border: `1px solid ${palette.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 12,
                  flexShrink: 0,
                }}
              >
                {sourceInitials(article.source)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: palette.textPrimary }}>
                  {article.source || 'Source'}
                </div>
                <div style={{ fontSize: 11, color: palette.textSecondary }}>
                  {article.scope} · {article.time || '—'}
                  {article.pipeline_status ? ` · ${article.pipeline_status}` : ''}
                </div>
              </div>
              <ArticleCredibilityIndicator article={article} />
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: palette.textPrimary, lineHeight: 1.35 }}>
              {article.title || 'Untitled'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              border: 'none',
              background: palette.pageAlt,
              borderRadius: 8,
              padding: 8,
              cursor: 'pointer',
              color: palette.textPrimary,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 20 }}>
          <AdminArticleHeroImage
            src={article.image_url}
            alt={article.title || 'Article'}
            maxHeight={320}
            backgroundColor={palette.inputBg}
            dynamicAspect
          />

          <ArticleInsightBadges
            article={article}
            textSecondary={palette.textSecondary}
            borderColor={palette.border}
          />
          <ArticleTopicKeywords
            keywords={article.topic_keywords}
            textSecondary={palette.textSecondary}
            isDark={isDark}
            borderColor={palette.border}
          />

          {article.ai_summary ? (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: palette.textSecondary, marginBottom: 6 }}>
                AI summary
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: palette.textPrimary }}>
                {article.ai_summary}
              </p>
            </div>
          ) : null}

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: palette.textSecondary, marginBottom: 6 }}>
              Full article
            </div>
            <div
              style={{
                fontSize: 14,
                lineHeight: 1.65,
                color: palette.textPrimary,
                whiteSpace: 'pre-wrap',
                maxHeight: 280,
                overflow: 'auto',
                padding: 14,
                borderRadius: 10,
                border: `1px solid ${palette.border}`,
                backgroundColor: palette.inputBg,
              }}
            >
              {article.fullContent || article.content || article.excerpt || 'No content available.'}
            </div>
          </div>

          {article.fact_check_verdict || factHits.length ? (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: palette.textSecondary, marginBottom: 6 }}>
                Fact check
              </div>
              <div style={{ fontSize: 13, color: palette.textPrimary }}>
                Verdict: {article.fact_check_verdict || '—'}
                {article.fact_check_provider ? ` (${article.fact_check_provider})` : ''}
              </div>
              {factHits.slice(0, 5).map((hit, i) => (
                <div key={i} style={{ fontSize: 12, color: palette.textSecondary, marginTop: 6 }}>
                  · {typeof hit === 'string' ? hit : hit?.title || hit?.claim || JSON.stringify(hit)}
                </div>
              ))}
            </div>
          ) : null}

          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: `1px solid ${palette.border}`,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <label style={{ fontSize: 13, fontWeight: 600, color: palette.textPrimary }}>
              Moderation
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  marginLeft: 8,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: `1px solid ${palette.border}`,
                  backgroundColor: palette.inputBg,
                  color: palette.textPrimary,
                }}
              >
                {MODERATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: `1px solid ${palette.buttonSecondaryBorder || palette.border}`,
                backgroundColor: primaryButtonBg,
                color: primaryButtonText,
                fontWeight: 600,
                cursor: saving ? 'wait' : 'pointer',
              }}
            >
              {saving ? 'Saving…' : 'Save review'}
            </button>
            {article.canonical_url ? (
              <a
                href={article.canonical_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  color: palette.primary,
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={14} /> Source
              </a>
            ) : null}
            {onOpenInApp ? (
              <button
                type="button"
                onClick={() => onOpenInApp(article)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1px solid ${palette.border}`,
                  background: palette.pageAlt,
                  color: palette.textPrimary,
                  cursor: 'pointer',
                }}
              >
                <Eye size={14} /> In app
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
