import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Shield, LogOut } from 'lucide-react';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import AdminTabNav from './AdminTabNav';
import AdminKeepAliveOutlet from './AdminKeepAliveOutlet';

function AdminAvatarChip({ user, isSuperAdmin, colors, isDark }) {
  const email = user?.email || '';
  const initial = email.charAt(0).toUpperCase() || 'A';
  const accentBg = isDark ? 'rgba(129,140,248,0.15)' : '#f1f5f9';
  const accentText = isDark ? '#818cf8' : '#0f172a';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: accentBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 700, color: accentText, flexShrink: 0,
      }}>
        {initial}
      </div>
      <div style={{ lineHeight: 1.3 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {email}
        </div>
        <div style={{ fontSize: 11, color: isDark ? '#818cf8' : '#64748b', fontWeight: 500 }}>
          {isSuperAdmin ? 'Super Admin' : 'Administrator'}
        </div>
      </div>
    </div>
  );
}

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <AdminAvatarChip user={user} isSuperAdmin={isSuperAdmin} colors={colors} isDark={isDark} />
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

      <main style={{ overflow: 'visible' }}>
        <AdminKeepAliveOutlet />
      </main>
    </div>
  );
}
