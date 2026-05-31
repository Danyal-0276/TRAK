import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Flag, Clock, User, ExternalLink } from 'lucide-react';
import { useAdminTheme } from './useAdminTheme';
import AdminPageLayout from './components/AdminPageLayout';
import AdminPageHeader from './components/AdminPageHeader';
import { useAdminPageMeta } from './adminPageMeta';
import { getAdminFeedback, patchAdminFeedback } from '../../api/adminApi';
import { useUIFeedback } from '../../components/ui/UIFeedback';
import { SkeletonListRows } from '../../components/skeletons/SkeletonLayouts';

const STATUS_TABS = ['pending', 'reviewed', 'dismissed', 'all'];

const AdminFeedbackScreen = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
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

  const cardBackground = palette.card;
  const textPrimary = palette.textPrimary;
  const textSecondary = palette.textSecondary;
  const borderColor = palette.border;

  const loadRows = useCallback(async () => {
    if (!tabActive) return;
    try {
      setLoading(true);
      const status = statusTab === 'all' ? '' : statusTab;
      const data = await getAdminFeedback({ status, limit: 100 });
      setRows(data.results || []);
      setStats(data.stats || { pending: 0, reviewed: 0, dismissed: 0, total: 0 });
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [statusTab, tabActive]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const openDetail = (row) => {
    setSelected(row);
    setAdminNotes(row.admin_notes || '');
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
      loadRows();
    } catch (e) {
      notifyError(e?.message || 'Could not update feedback.');
    } finally {
      setSaving(false);
    }
  };

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
        {!loading &&
          rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => openDetail(row)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: 16,
                marginBottom: 10,
                borderRadius: 12,
                border: `1px solid ${borderColor}`,
                background: cardBackground,
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <Flag size={14} color={palette.primary} />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: palette.primary,
                    background: `${palette.primary}15`,
                    padding: '2px 8px',
                    borderRadius: 6,
                  }}
                >
                  {row.category_label || row.category}
                </span>
                <span style={{ fontSize: 12, color: textSecondary }}>{row.type?.replace(/_/g, ' ')}</span>
                <span style={{ fontSize: 12, color: textSecondary, marginLeft: 'auto' }}>
                  {row.created_at ? new Date(row.created_at).toLocaleString() : ''}
                </span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary, marginBottom: 4 }}>
                {row.message || row.category_label || 'No message'}
              </div>
              <div style={{ fontSize: 12, color: textSecondary, display: 'flex', gap: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <User size={12} /> {row.reporter_email || `User #${row.user_id}`}
                </span>
                {row.article_id ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Article {String(row.article_id).slice(0, 8)}…
                  </span>
                ) : null}
              </div>
            </button>
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
              {selected.category_label} · {selected.status}
            </p>
            <p style={{ color: textPrimary, lineHeight: 1.5, marginBottom: 12 }}>
              {selected.message || '(No additional message)'}
            </p>
            <p style={{ color: textSecondary, fontSize: 13, marginBottom: 8 }}>
              From: {selected.reporter_email || selected.user_id}
            </p>
            {selected.article_id ? (
              <button
                type="button"
                onClick={() => navigate(`/article/${selected.article_id}`)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 16,
                  border: 'none',
                  background: 'transparent',
                  color: palette.primary,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                View article <ExternalLink size={14} />
              </button>
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
    </AdminPageLayout>
  );
};

export default AdminFeedbackScreen;
