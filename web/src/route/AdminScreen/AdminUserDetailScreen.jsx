import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, Bookmark, CheckCircle, XCircle } from 'lucide-react';
import { useAdminTheme } from './useAdminTheme';
import AdminPageLayout from './components/AdminPageLayout';
import { getAdminUserDetail } from '../../api/adminApi';
import { useUIFeedback } from '../../components/ui/UIFeedback';
import { SkeletonPageBlocks } from '../../components/skeletons/SkeletonLayouts';

const AdminUserDetailScreen = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { palette, isDark, colors } = useAdminTheme();
  const { error: notifyError } = useUIFeedback();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await getAdminUserDetail(userId);
      setUser(data);
    } catch (e) {
      notifyError(e?.message || 'Could not load user details.');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [userId, notifyError]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (loading) {
    return (
      <AdminPageLayout maxWidth="900px">
        <SkeletonPageBlocks isDark={isDark} colors={colors} minHeight="320px" />
      </AdminPageLayout>
    );
  }

  if (!user) {
    return (
      <AdminPageLayout maxWidth="900px">
        <button
          type="button"
          onClick={() => navigate('/admin/users')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
            background: 'none',
            border: 'none',
            color: palette.textPrimary,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={18} />
          Back to users
        </button>
        <p style={{ color: palette.textSecondary }}>User not found.</p>
      </AdminPageLayout>
    );
  }

  const displayName = user.full_name || user.username || user.email?.split('@')[0] || 'User';

  return (
    <AdminPageLayout maxWidth="900px">
      <button
        type="button"
        onClick={() => navigate('/admin/users')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 20,
          background: 'none',
          border: 'none',
          color: palette.textPrimary,
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        <ArrowLeft size={18} />
        Back to users
      </button>

      <div
        style={{
          background: palette.card,
          border: `1px solid ${palette.border}`,
          borderRadius: 14,
          padding: 24,
          marginBottom: 20,
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 22, color: palette.textPrimary }}>{displayName}</h1>
        <p style={{ margin: '0 0 16px', color: palette.textSecondary, fontSize: 14 }}>{user.email}</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              background: user.is_active ? `${palette.success}20` : `${palette.error}20`,
              color: user.is_active ? palette.success : palette.error,
            }}
          >
            {user.is_active ? 'Active' : 'Inactive'}
          </span>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              background: user.email_verified ? `${palette.success}20` : `${palette.warning}20`,
              color: user.email_verified ? palette.success : palette.warning,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {user.email_verified ? <CheckCircle size={12} /> : <XCircle size={12} />}
            Email {user.email_verified ? 'verified' : 'not verified'}
          </span>
          {user.phone ? (
            <span style={{ fontSize: 12, color: palette.textSecondary, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Phone size={12} />
              {user.phone}
              {user.phone_verified ? ' (verified)' : ''}
            </span>
          ) : null}
        </div>

        <div style={{ display: 'grid', gap: 10, fontSize: 14, color: palette.textSecondary }}>
          {user.username ? <div><strong style={{ color: palette.textPrimary }}>Username:</strong> {user.username}</div> : null}
          {user.bio ? <div><strong style={{ color: palette.textPrimary }}>Bio:</strong> {user.bio}</div> : null}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} />
            Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Mail size={14} />
            Role: {user.role}
          </div>
        </div>
      </div>

      <section
        style={{
          background: palette.card,
          border: `1px solid ${palette.border}`,
          borderRadius: 14,
          padding: 24,
        }}
      >
        <h2 style={{ margin: '0 0 16px', fontSize: 16, color: palette.textPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bookmark size={18} />
          Saved articles ({user.bookmarks?.length || 0})
        </h2>
        {!user.bookmarks?.length ? (
          <p style={{ margin: 0, color: palette.textSecondary, fontSize: 14 }}>No bookmarks yet.</p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
            {user.bookmarks.map((b) => (
              <li
                key={`${b.article_id}-${b.created_at}`}
                style={{
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: `1px solid ${palette.borderLight}`,
                  background: palette.pageAlt,
                }}
              >
                <div style={{ fontWeight: 600, color: palette.textPrimary, fontSize: 14 }}>{b.title}</div>
                {b.url ? (
                  <a href={b.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: palette.textSecondary }}>
                    View original
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminPageLayout>
  );
};

export default AdminUserDetailScreen;
