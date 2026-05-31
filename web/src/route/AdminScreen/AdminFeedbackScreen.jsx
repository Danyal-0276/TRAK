import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, ExternalLink } from 'lucide-react';
import { useAdminTheme } from './useAdminTheme';
import AdminPageLayout from './components/AdminPageLayout';
import AdminPageHeader from './components/AdminPageHeader';
import AdminFeedbackCard from './components/AdminFeedbackCard';
import AdminArticleReviewModal from './components/AdminArticleReviewModal';
import { useAdminPageMeta } from './adminPageMeta';
import { getAdminFeedback, patchAdminFeedback, getAdminArticleById } from '../../api/adminApi';
import { useUIFeedback } from '../../components/ui/UIFeedback';
import { SkeletonListRows } from '../../components/skeletons/SkeletonLayouts';
import { FEEDBACK_POLL_INTERVAL_MS } from './adminTheme';
import { subscribeAdminFeedbackRefresh } from '../../utils/adminNotificationsEvents';
import { FEEDBACK_STATUS_META } from '../../constants/feedbackCategoryMeta';
import { enableAdminAppPreview } from '../../utils/adminAppPreview';

const AdminFeedbackScreen = () => {
  const { pathname } = useLocation();
  const tabActive = pathname === '/admin/feedback';
  const { palette, isDark, colors } = useAdminTheme();
  const { title, description } = useAdminPageMeta();
  const { success, error: notifyError } = useUIFeedback();
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({ pending: 0, reviewed: 0, dismissed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [reviewArticle, setReviewArticle] = useState(null);
  const [articleLoading, setArticleLoading] = useState(false);
  const [articleError, setArticleError] = useState('');

  const cardBackground = palette.card;
  const textPrimary = palette.textPrimary;
  const textSecondary = palette.textSecondary;
  const borderColor = palette.border;

  const loadRows = useCallback(async ({ silent = false } = {}) => {
    if (!tabActive) return;
    try {
      if (!silent) setLoading(true);
      const status = statusTab === 'all' ? '' : statusTab;
      const data = await getAdminFeedback({ status, limit: 100 });
      setRows(data.results || []);
      setStats(data.stats || { pending: 0, reviewed: 0, dismissed: 0, total: 0 });
    } catch {
      if (!silent) setRows([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [statusTab, tabActive]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  useEffect(() => {
    if (!tabActive) return undefined;
    const poll = () => {
      if (document.visibilityState === 'visible') loadRows({ silent: true });
    };
    const id = window.setInterval(poll, FEEDBACK_POLL_INTERVAL_MS);
    const unsubRefresh = subscribeAdminFeedbackRefresh(() => loadRows({ silent: true }));
    document.addEventListener('visibilitychange', poll);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', poll);
      unsubRefresh();
    };
  }, [tabActive, loadRows]);

  const openDetail = (row) => {
    setSelected(row);
    setAdminNotes(row.admin_notes || '');
    setArticleError('');
  };

  const openArticleReview = async () => {
    if (!selected?.article_id) return;
    setArticleLoading(true);
    setArticleError('');
    try {
      const article = await getAdminArticleById(selected.article_id);
      setReviewArticle(article);
    } catch (e) {
      setArticleError(e?.message || 'Could not load article.');
      if (selected.url) window.open(selected.url, '_blank', 'noopener,noreferrer');
    } finally {
      setArticleLoading(false);
    }
  };

  const saveDetail = async (status) => {
    if (!selected?.id) return;
    setSaving(true);
    try {
      const updated = await patchAdminFeedback(selected.id, {
        status,
        admin_notes: adminNotes,
      });
      success('Feedback updated.');
      setSelected(null);
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      loadRows({ silent: true });
    } catch (e) {
      notifyError(e?.message || 'Could not update feedback.');
    } finally {
      setSaving(false);
    }
  };

  const selectedStatus = selected ? FEEDBACK_STATUS_META[selected.status] : null;

  return (
    <AdminPageLayout maxWidth="1200px">
      <AdminPageHeader title={title} description={description}>
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { key: 'pending', label: 'Pending', count: stats.pending },
            { key: 'reviewed', label: 'Reviewed', count: stats.reviewed },
            { key: 'dismissed', label: 'Dismissed', count: stats.dismissed },
            { key: 'all', label: 'All', count: stats.total },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusTab(key)}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: `1px solid ${statusTab === key ? palette.primary : borderColor}`,
                background: statusTab === key ? `${palette.primary}18` : cardBackground,
                color: statusTab === key ? palette.primary : textSecondary,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </AdminPageHeader>

      <div className="admin-page-body">
        {loading ? <SkeletonListRows rows={6} isDark={isDark} colors={colors} /> : null}
        {!loading && rows.length === 0 ? (
          <div
            style={{
              padding: 48,
              textAlign: 'center',
              color: textSecondary,
              border: `1px dashed ${borderColor}`,
              borderRadius: 16,
            }}
          >
            <MessageSquare size={32} color={textSecondary} style={{ marginBottom: 12 }} />
            <div>No feedback in this view.</div>
          </div>
        ) : null}
        {!loading && rows.map((row) => (
          <AdminFeedbackCard key={row.id} row={row} palette={palette} onClick={openDetail} />
        ))}
      </div>

      {selected ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(15,23,42,0.4)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 440,
              height: '100%',
              background: cardBackground,
              borderLeft: `1px solid ${borderColor}`,
              padding: 24,
              overflow: 'auto',
            }}
          >
            <h3 style={{ margin: '0 0 8px', color: textPrimary }}>Feedback detail</h3>
            <p style={{ color: textSecondary, fontSize: 13, marginBottom: 16 }}>
              {selected.category_label}
              {selectedStatus ? (
                <span style={{ color: selectedStatus.color, fontWeight: 700 }}> · {selectedStatus.label}</span>
              ) : null}
            </p>
            <p style={{ color: textPrimary, lineHeight: 1.5, marginBottom: 12 }}>
              {selected.message || '(No additional message)'}
            </p>
            <p style={{ color: textSecondary, fontSize: 13, marginBottom: 12 }}>
              From: {selected.reporter_email || selected.user_id}
            </p>

            {selected.article_id ? (
              <div
                style={{
                  marginBottom: 16,
                  padding: 12,
                  borderRadius: 10,
                  border: `1px solid ${borderColor}`,
                  background: palette.inputBg || palette.backgroundSecondary,
                }}
              >
                <div style={{ fontSize: 12, color: textSecondary, marginBottom: 4 }}>Linked article</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary, marginBottom: 10 }}>
                  {selected.article_title || 'Article'}
                </div>
                <button
                  type="button"
                  disabled={articleLoading}
                  onClick={openArticleReview}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: palette.primary,
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {articleLoading ? 'Loading…' : 'Review article'}
                </button>
                {articleError ? (
                  <p style={{ color: colors.error, fontSize: 12, marginTop: 8 }}>{articleError}</p>
                ) : null}
                {selected.url ? (
                  <a
                    href={selected.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      marginLeft: 10,
                      fontSize: 12,
                      color: palette.primary,
                    }}
                  >
                    Source <ExternalLink size={12} />
                  </a>
                ) : null}
              </div>
            ) : null}

            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: textSecondary, marginBottom: 8 }}>
              Admin notes
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: 12,
                borderRadius: 10,
                border: `1px solid ${borderColor}`,
                background: isDark ? colors.background : '#fff',
                color: textPrimary,
                marginBottom: 16,
              }}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled={saving}
                onClick={() => saveDetail('reviewed')}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: palette.primary,
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Mark reviewed
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => saveDetail('dismissed')}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: `1px solid ${borderColor}`,
                  background: 'transparent',
                  color: textSecondary,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'transparent',
                  color: textSecondary,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AdminArticleReviewModal
        open={!!reviewArticle}
        article={reviewArticle}
        onClose={() => setReviewArticle(null)}
        onSaved={() => loadRows({ silent: true })}
        onOpenInApp={(article) => {
          enableAdminAppPreview();
          if (article?.id) {
            window.open(`/article/${article.id}`, '_blank', 'noopener,noreferrer');
          }
        }}
        feedbackBanner={
          selected
            ? `Reviewing article linked to report — ${selected.category_label || selected.category}`
            : ''
        }
      />
    </AdminPageLayout>
  );
};

export default AdminFeedbackScreen;
