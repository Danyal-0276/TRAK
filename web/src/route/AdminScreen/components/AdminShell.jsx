import React, { useState, useEffect, useMemo } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminKeepAliveOutlet from './AdminKeepAliveOutlet';
import './adminShell.css';

export default function AdminShell() {
  const { theme } = useTheme();
  const { colors } = theme;
  const { user, isAdmin, isSuperAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme.mode === 'dark';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  );

  const sidebarVisible = isDesktop || sidebarOpen;

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => {
      setIsDesktop(mq.matches);
      if (mq.matches) setSidebarOpen(false);
    };
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const shellVars = useMemo(
    () => ({
      '--admin-border': colors.border,
      '--admin-sidebar-bg': isDark ? '#0f172a' : '#ffffff',
      '--admin-topbar-bg': isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)',
      '--admin-card': isDark ? '#1e293b' : '#ffffff',
      '--admin-text-primary': colors.textPrimary,
      '--admin-text-secondary': colors.textSecondary,
      '--admin-text-tertiary': isDark ? '#94a3b8' : '#64748b',
      '--admin-primary': colors.primary || '#2563eb',
      '--admin-brand-icon-bg': isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
      '--admin-nav-hover': isDark ? 'rgba(148, 163, 184, 0.08)' : '#f4f4f5',
      '--admin-nav-active-bg': isDark ? 'rgba(59, 130, 246, 0.12)' : '#eff6ff',
      '--admin-nav-active-text': isDark ? '#93c5fd' : '#1d4ed8',
      '--admin-error': '#ef4444',
      '--admin-error-bg': isDark ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2',
      '--admin-page-bg': isDark ? '#0a0a0a' : '#f5f5f5',
      '--admin-shadow-light': isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.04)',
    }),
    [colors, isDark]
  );

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDark ? colors.background : '#f5f5f5',
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
    <div className="admin-shell" style={shellVars}>
      {sidebarOpen ? (
        <button
          type="button"
          className="admin-shell__backdrop"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <AdminSidebar
        open={sidebarVisible}
        onClose={() => setSidebarOpen(false)}
        user={user}
        isSuperAdmin={isSuperAdmin}
        onLogout={handleLogout}
      />

      <div className="admin-shell__main">
        {!isDesktop ? (
          <button
            type="button"
            className="admin-shell__mobile-menu"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
        ) : null}

        <div className="admin-shell__content">
          <AdminKeepAliveOutlet />
        </div>
      </div>
    </div>
  );
}
