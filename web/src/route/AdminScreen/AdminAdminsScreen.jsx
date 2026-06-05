import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Search, Trash2, Plus, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminTheme } from './useAdminTheme';
import AdminPageLayout from './components/AdminPageLayout';
import AdminPageHeader from './components/AdminPageHeader';
import { useAdminPageMeta } from './adminPageMeta';
import { useUIFeedback } from '../../components/ui/UIFeedback';
import { deleteAdminUser, getAdminUsers, postAdminCreate } from '../../api/adminApi';
import { SkeletonTableRows } from '../../components/skeletons/SkeletonLayouts';

export default function AdminAdminsScreen() {
  const { palette, isDark, colors } = useAdminTheme();
  const { isSuperAdmin } = useAuth();
  const { confirm, success, error: notifyError } = useUIFeedback();
  const [admins, setAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);

  const cardBackground = palette.card;
  const textPrimary = palette.textPrimary;
  const textSecondary = palette.textSecondary;
  const borderColor = palette.border;

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

  const { title, description } = useAdminPageMeta();

  const inputStyle = {
    width: '100%',
    marginTop: 6,
    padding: 10,
    borderRadius: 8,
    border: `1px solid ${borderColor}`,
    background: palette.inputBg,
    color: palette.inputText,
    fontSize: 14,
  };

  const createAdminAction = isSuperAdmin ? (
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
        background: palette.buttonPrimaryBg,
        color: palette.buttonPrimaryText,
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      <Plus size={18} />
      Create admin
    </button>
  ) : null;

  return (
    <>
      <AdminPageLayout maxWidth="1200px">
        <AdminPageHeader title={title} description={description} actions={createAdminAction} />
        <div className="admin-page-body">
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
                  backgroundColor: `${palette.primary}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Shield size={22} color={palette.primary} />
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
                      {new Date(admin.created_at).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                    </span>
                  ) : null}
                </div>
                {admin.is_super_admin ? (
                  <span style={{ fontSize: 12, color: palette.primary, fontWeight: 600, marginTop: 4, display: 'inline-block' }}>
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
                    border: `1px solid ${palette.error}`,
                    background: 'transparent',
                    color: palette.error,
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
      </AdminPageLayout>

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
                style={inputStyle}
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
                style={inputStyle}
              />
            </label>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                disabled={creating}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: `1px solid ${palette.buttonSecondaryBorder}`,
                  background: palette.buttonSecondaryBg,
                  color: palette.buttonSecondaryText,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                style={{
                  padding: '10px 16px',
                  background: palette.buttonPrimaryBg,
                  color: palette.buttonPrimaryText,
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
