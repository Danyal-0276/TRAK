import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Settings, LogOut } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import { getResponsivePadding, getResponsiveMaxWidth } from '../../utils/responsiveStyles';

export default function AdminProfileScreen() {
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';
  const { isMobile, isTablet } = useResponsive();
  const navigate = useNavigate();
  const { user, isSuperAdmin, logout } = useAuth();

  const backgroundColor = isDark ? colors.background || '#0F172A' : '#f9fafb';
  const cardBackground = colors.surface;
  const textPrimary = colors.textPrimary;
  const textSecondary = colors.textSecondary;
  const borderColor = colors.border;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const created = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div style={{ minHeight: '100vh', backgroundColor }}>
      <div
        style={{
          maxWidth: getResponsiveMaxWidth(isMobile, isTablet, '640px'),
          margin: '0 auto',
          padding: getResponsivePadding(isMobile, isTablet),
        }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 700, color: textPrimary, margin: '0 0 8px' }}>Admin profile</h1>
        <p style={{ color: textSecondary, marginBottom: 24 }}>Signed-in administrator account</p>

        <div
          style={{
            backgroundColor: cardBackground,
            border: `1px solid ${borderColor}`,
            borderRadius: 16,
            padding: 24,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: colors.primary || '#3b82f6',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              {(user?.email || 'A').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: textPrimary }}>{user?.email}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <Shield size={14} color={colors.primary} />
                <span style={{ fontSize: 13, color: textSecondary }}>
                  {isSuperAdmin ? 'Super Admin' : 'Administrator'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: 16 }}>
            <Row label="Role" value={user?.role || 'admin'} textPrimary={textPrimary} textSecondary={textSecondary} />
            <Row label="Member since" value={created} textPrimary={textPrimary} textSecondary={textSecondary} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/settings')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 16px',
            marginBottom: 10,
            borderRadius: 12,
            border: `1px solid ${borderColor}`,
            background: cardBackground,
            color: textPrimary,
            cursor: 'pointer',
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          <Settings size={18} />
          Admin settings
        </button>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 16px',
            borderRadius: 12,
            border: `1px solid ${borderColor}`,
            background: cardBackground,
            color: colors.error || '#ef4444',
            cursor: 'pointer',
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, textPrimary, textSecondary }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ color: textSecondary, fontSize: 14 }}>{label}</span>
      <span style={{ color: textPrimary, fontSize: 14, fontWeight: 600 }}>{value}</span>
    </div>
  );
}
