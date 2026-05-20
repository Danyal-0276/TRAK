import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Search, Trash2, Plus, Mail, Calendar } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import { getResponsivePadding, getResponsiveMaxWidth, getResponsiveFontSize } from '../../utils/responsiveStyles';
import { useUIFeedback } from '../../components/ui/UIFeedback';
import { deleteAdminUser, getAdminUsers, postAdminCreate } from '../../api/adminApi';
import { SkeletonTableRows } from '../../components/skeletons/SkeletonLayouts';

export default function AdminAdminsScreen() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';
  const { isMobile, isTablet } = useResponsive();
  const { isSuperAdmin } = useAuth();
  const { confirm, success, error: notifyError } = useUIFeedback();
  const [admins, setAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);

  const backgroundColor = colors.background;
  const cardBackground = colors.surface;
  const textPrimary = colors.textPrimary;
  const textSecondary = colors.textSecondary;
  const borderColor = colors.border;

  const loadAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers({ q: searchQuery.trim(), role: 'admin' });
      setAdmins(data.results || []);
    } catch (e) {
      notifyError(e?.message || 'Could not load admins.');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, notifyError]);

  useEffect(() => {
    const t = window.setTimeout(loadAdmins, 280);
    return () => window.clearTimeout(t);
  }, [loadAdmins]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    setCreating(true);
    try {
      await postAdminCreate(newEmail.trim(), newPassword);
      setShowCreate(false);
      setNewEmail('');
      setNewPassword('');
      await loadAdmins();
      success('Admin account created.');
    } catch (err) {
      notifyError(err?.message || 'Failed to create admin.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (admin) => {
    if (!isSuperAdmin) return;
    if (admin.is_super_admin) {
      notifyError('Cannot delete a super admin account.');
      return;
    }
    const accepted = await confirm({
      title: 'Delete admin?',
      message: `Remove ${admin.email} from administrators?`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!accepted) return;
    try {
      await deleteAdminUser(admin.id);
      await loadAdmins();
      success('Admin removed.');
    } catch (err) {
      notifyError(err?.message || 'Failed to delete admin.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor }}>
      <div
        style={{
          maxWidth: getResponsiveMaxWidth(isMobile, isTablet, '1200px'),
          margin: '0 auto',
          padding: getResponsivePadding(isMobile, isTablet),
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: getResponsiveFontSize(isMobile, isTablet, 28), fontWeight: 700, color: textPrimary, margin: '0 0 8px' }}>
              Administrators
            </h1>
            <p style={{ color: textSecondary, margin: 0 }}>Admin accounts only</p>
          </div>
          {isSuperAdmin ? (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 18px',
                borderRadius: 10,
                border: 'none',
                background: colors.primary || '#3b82f6',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={18} />
              Create admin
            </button>
          ) : null}
        </div>

        <div style={{ position: 'relative', marginBottom: 20 }}>
          <Search size={18} color={textSecondary} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="search"
            placeholder="Search admins by email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              borderRadius: 10,
              border: `1px solid ${borderColor}`,
              background: cardBackground,
              color: textPrimary,
              fontSize: 15,
            }}
          />
        </div>

        {loading ? <SkeletonTableRows rows={6} isDark={isDark} colors={colors} /> : null}

        {!loading && admins.length === 0 ? (
          <p style={{ color: textSecondary, textAlign: 'center', padding: 32 }}>No administrators found.</p>
        ) : null}

        {!loading &&
          admins.map((admin) => (
            <div
              key={admin.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: 16,
                marginBottom: 12,
                borderRadius: 12,
                border: `1px solid ${borderColor}`,
                background: cardBackground,
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: `${colors.primary || '#3b82f6'}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Shield size={22} color={colors.primary} />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontWeight: 700, color: textPrimary }}>{admin.email}</div>
                <div style={{ fontSize: 13, color: textSecondary, display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Mail size={12} /> {admin.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {admin.created_at ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} />
                      {new Date(admin.created_at).toLocaleDateString()}
                    </span>
                  ) : null}
                </div>
                {admin.is_super_admin ? (
                  <span style={{ fontSize: 12, color: colors.primary, fontWeight: 600, marginTop: 4, display: 'inline-block' }}>
                    Super Admin
                  </span>
                ) : null}
              </div>
              {isSuperAdmin && !admin.is_super_admin ? (
                <button
                  type="button"
                  onClick={() => handleDelete(admin)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: `1px solid ${colors.error || '#ef4444'}`,
                    background: 'transparent',
                    color: colors.error || '#ef4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              ) : null}
            </div>
          ))}
      </div>

      {showCreate ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => !creating && setShowCreate(false)}
        >
          <form
            onSubmit={handleCreate}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 400,
              background: cardBackground,
              borderRadius: 16,
              padding: 24,
              border: `1px solid ${borderColor}`,
            }}
          >
            <h2 style={{ margin: '0 0 16px', color: textPrimary }}>Create admin</h2>
            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: textSecondary }}>Email</span>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: `1px solid ${borderColor}` }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: textSecondary }}>Password</span>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: `1px solid ${borderColor}` }}
              />
            </label>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowCreate(false)} disabled={creating}>
                Cancel
              </button>
              <button type="submit" disabled={creating} style={{ padding: '10px 16px', background: colors.primary, color: '#fff', border: 'none', borderRadius: 8 }}>
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
