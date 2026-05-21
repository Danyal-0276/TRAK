import React from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { Shield, LogOut, User } from 'lucide-react';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import AdminTabNav from './AdminTabNav';

export default function AdminShell() {
  const { theme } = useTheme();
  const { colors } = theme;
  const { user, isAdmin, isSuperAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();
  const isDark = theme.mode === 'dark';

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDark ? colors.background : '#f9fafb',
        }}
      >
        <p style={{ color: colors.textSecondary }}>Loading admin panel…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/newsfeed" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: isDark ? colors.background || '#0F172A' : '#f9fafb',
      }}
    >
      <header
        style={{
          backgroundColor: colors.surface,
          borderBottom: `1px solid ${colors.border}`,
          boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: `${colors.primary || '#3b82f6'}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Shield size={24} color={colors.primary || '#3b82f6'} strokeWidth={2.5} />
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
                color: colors.textPrimary,
                letterSpacing: '-0.3px',
              }}
            >
              Admin Panel
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={() => navigate('/admin/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 10,
                border: `1px solid ${colors.border}`,
                background: isDark ? colors.backgroundSecondary || '#1e293b' : '#fff',
                color: colors.textPrimary,
                cursor: 'pointer',
                maxWidth: 280,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: colors.primary || '#3b82f6',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {(user?.email || 'A').charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: 'left', minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email || 'Admin'}
                </div>
                {isSuperAdmin ? (
                  <div style={{ fontSize: 11, color: colors.primary || '#3b82f6', fontWeight: 600 }}>Super Admin</div>
                ) : (
                  <div style={{ fontSize: 11, color: colors.textSecondary }}>Administrator</div>
                )}
              </div>
              <User size={16} color={colors.textSecondary} style={{ flexShrink: 0 }} />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 10,
                border: `1px solid ${colors.border}`,
                background: 'transparent',
                color: colors.textPrimary,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
        <AdminTabNav />
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
