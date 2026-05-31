import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useAdminTheme } from '../useAdminTheme';
import AdminSidebar from './AdminSidebar';
import AdminKeepAliveOutlet from './AdminKeepAliveOutlet';
import { DASHBOARD_POLL_INTERVAL_MS } from '../adminTheme';
import { dispatchAdminOverviewRefresh } from '../../../utils/adminOverviewEvents';
import './adminShell.css';

export default function AdminShell() {
  const { palette, isDark, cssVars } = useAdminTheme();
  const { user, isAdmin, isSuperAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  useEffect(() => {
    const prevBg = document.body.style.backgroundColor;
    const prevColor = document.body.style.color;
    document.body.style.backgroundColor = palette.page;
    document.body.style.color = palette.textPrimary;
    return () => {
      document.body.style.backgroundColor = prevBg;
      document.body.style.color = prevColor;
    };
  }, [palette.page, palette.textPrimary]);

  useEffect(() => {
    const poll = () => {
      if (document.visibilityState === 'visible') {
        dispatchAdminOverviewRefresh({ silent: true });
      }
    };
    const id = window.setInterval(poll, DASHBOARD_POLL_INTERVAL_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') poll();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: palette.page,
        }}
      >
        <p style={{ color: palette.textSecondary }}>Loading admin panel…</p>
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
    <div className="admin-shell" style={cssVars}>
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
