import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useAdminTheme } from '../useAdminTheme';
import AdminSidebar from './AdminSidebar';
import AdminKeepAliveOutlet from './AdminKeepAliveOutlet';
import { DASHBOARD_POLL_INTERVAL_MS } from '../adminTheme';
import { dispatchAdminOverviewRefresh } from '../../../utils/adminOverviewEvents';
import {
  dispatchAdminNotification,
  dispatchAdminFeedbackRefresh,
  isFeedbackNotificationType,
  subscribeAdminNotificationSync,
} from '../../../utils/adminNotificationsEvents';
import { isDashboardPath } from '../hooks/useAdminTabActive';
import { loadAdminSettings } from '../../../utils/adminSettingsRuntime';
import { AdminLanguageProvider } from '../../../context/AdminLanguageContext';
import { getAdminNotifications } from '../../../api/adminApi';
import { openAdminNotificationsSocket, isAdminNotificationsWsEnabled } from '../../../api/adminNotificationsRealtime';
import { useUIFeedback } from '../../../components/ui/UIFeedback';
import './adminShell.css';

export default function AdminShell() {
  const { palette, isDark, cssVars } = useAdminTheme();
  const { user, isAdmin, isSuperAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { info } = useUIFeedback();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const socketRef = useRef(null);
  const reconnectRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  );

  const sidebarVisible = isDesktop || sidebarOpen;

  useEffect(() => {
    loadAdminSettings().catch(() => {});
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const data = await getAdminNotifications();
      const unread = (data.results || []).filter((n) => !n.read).length;
      setUnreadAlerts(unread);
    } catch {
      // ignore
    }
  }, []);

  const handleLiveNotification = useCallback(
    (n) => {
      if (!n?.id) return;
      dispatchAdminNotification(n);
      setUnreadAlerts((prev) => prev + 1);
      if (isFeedbackNotificationType(n.type)) {
        info(n.text || 'New user feedback received');
        dispatchAdminFeedbackRefresh({ notification: n });
      }
    },
    [info]
  );

  useEffect(() => {
    if (!isAdmin || loading) return undefined;
    refreshUnreadCount();
    if (!isAdminNotificationsWsEnabled()) return undefined;

    const connect = () => {
      const ws = openAdminNotificationsSocket((payload) => {
        if (payload?.type !== 'notification.created' || !payload.notification?.id) return;
        handleLiveNotification(payload.notification);
      });
      if (!ws) return;
      socketRef.current = ws;
      ws.onclose = () => {
        reconnectRef.current = window.setTimeout(connect, 2500);
      };
    };
    connect();
    return () => {
      if (socketRef.current) socketRef.current.close();
      if (reconnectRef.current) window.clearTimeout(reconnectRef.current);
    };
  }, [isAdmin, loading, refreshUnreadCount, handleLiveNotification]);

  useEffect(() => {
    if (location.pathname === '/admin/notifications') {
      refreshUnreadCount();
    }
  }, [location.pathname, refreshUnreadCount]);

  useEffect(() => {
    return subscribeAdminNotificationSync((evt) => {
      if (evt.type === 'read') {
        setUnreadAlerts((prev) => Math.max(0, prev - 1));
      } else if (evt.type === 'readAll') {
        setUnreadAlerts(0);
      } else if (evt.type === 'refresh') {
        refreshUnreadCount();
      }
    });
  }, [refreshUnreadCount]);

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
      if (
        document.visibilityState === 'visible' &&
        isDashboardPath(location.pathname)
      ) {
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
  }, [location.pathname]);

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
    <AdminLanguageProvider>
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
        unreadAlerts={unreadAlerts}
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
    </AdminLanguageProvider>
  );
}
