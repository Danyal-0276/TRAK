import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import * as notificationsApi from '../api/notificationsApi';
import { openNotificationsSocket, NOTIFICATIONS_POLL_FALLBACK_MS } from '../api/notificationsRealtime';
import {
  getNotificationsCache,
  isNotificationsCacheFresh,
  saveNotificationsCache,
  clearNotificationsCache,
  isNotificationBackfillDone,
  markNotificationBackfillDone,
} from '../utils/notificationsSessionCache';
import {
  subscribeUserNotificationSync,
  dispatchAllNotificationsRead,
  dispatchNotificationRead,
} from '../utils/userNotificationsEvents';

const LIST_LIMIT = 80;

const defaultValue = {
  notifications: [],
  hydrated: false,
  loading: false,
  unreadCount: 0,
  refreshNotifications: async () => {},
  refreshUnreadCount: async () => {},
  ensureNotificationsLoaded: async () => {},
  markAllAsRead: async () => {},
  markAsRead: async () => {},
};

const NotificationUnreadContext = createContext(defaultValue);

export function NotificationUnreadProvider({ children }) {
  const { user } = useAuth();
  const listLoadedRef = useRef(isNotificationsCacheFresh());
  const [notifications, setNotifications] = useState(() =>
    isNotificationsCacheFresh() ? getNotificationsCache() : []
  );
  const [hydrated, setHydrated] = useState(() => isNotificationsCacheFresh());
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const applyList = useCallback((list) => {
    const next = Array.isArray(list) ? list : [];
    saveNotificationsCache(next);
    setNotifications(next);
    setHydrated(true);
    listLoadedRef.current = true;
    setUnreadCount(next.filter((n) => !n.read).length);
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await notificationsApi.getUnreadCount();
      setUnreadCount(Number(res?.unread) || 0);
    } catch {
      setUnreadCount(0);
    }
  }, [user]);

  const refreshNotifications = useCallback(
    async ({ silent = false, force = false } = {}) => {
      if (!user) {
        applyList([]);
        return;
      }

      const cacheValid = !force && isNotificationsCacheFresh();

      if (cacheValid) {
        const cached = getNotificationsCache();
        setNotifications(cached);
        setHydrated(true);
        listLoadedRef.current = true;
        setUnreadCount(cached.filter((n) => !n.read).length);
        if (!silent) setLoading(false);
        return;
      }

      if (!silent) setLoading(true);

      try {
        const rows = await notificationsApi.getNotifications({ limit: LIST_LIMIT });
        applyList(rows);
      } catch {
        const cached = getNotificationsCache();
        if (cached.length) {
          setNotifications(cached);
          setHydrated(true);
          listLoadedRef.current = true;
          setUnreadCount(cached.filter((n) => !n.read).length);
        } else if (!cacheValid) {
          applyList([]);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [user, applyList]
  );

  const ensureNotificationsLoaded = useCallback(
    async ({ runBackfill = false, force = false } = {}) => {
      if (!user) return;

      if (!force && isNotificationsCacheFresh()) {
        const cached = getNotificationsCache();
        setNotifications(cached);
        setHydrated(true);
        listLoadedRef.current = true;
        setUnreadCount(cached.filter((n) => !n.read).length);
      } else {
        await refreshNotifications({ silent: false, force: true });
      }

      if (runBackfill && !isNotificationBackfillDone()) {
        markNotificationBackfillDone();
        try {
          await notificationsApi.backfillKeywordNotifications({ hours: 72, limit: 50 });
          await refreshNotifications({ silent: true, force: true });
        } catch {
          /* non-fatal */
        }
      }
    },
    [user, refreshNotifications]
  );

  const markAsRead = useCallback(async (notificationId) => {
    const id = String(notificationId);
    setNotifications((prev) => {
      const next = prev.map((n) => (String(n.id) === id ? { ...n, read: true } : n));
      saveNotificationsCache(next);
      return next;
    });
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await notificationsApi.markAsRead(id);
      dispatchNotificationRead(id);
    } catch {
      /* optimistic */
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      saveNotificationsCache(next);
      return next;
    });
    setUnreadCount(0);
    dispatchAllNotificationsRead();
    try {
      await notificationsApi.markAllAsRead();
    } catch {
      /* optimistic */
    }
  }, []);

  const upsertNotification = useCallback((incoming) => {
    if (!incoming?.id) return;
    const normalized = notificationsApi.normalizeNotification(incoming);
    if (!normalized.read) {
      setUnreadCount((c) => c + 1);
    }
    if (!listLoadedRef.current) return;
    setNotifications((prev) => {
      if (prev.some((n) => String(n.id) === String(normalized.id))) return prev;
      const next = [normalized, ...prev];
      saveNotificationsCache(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!user) {
      clearNotificationsCache();
      listLoadedRef.current = false;
      setNotifications([]);
      setHydrated(false);
      setLoading(false);
      setUnreadCount(0);
      return undefined;
    }

    refreshUnreadCount();
    ensureNotificationsLoaded({ runBackfill: true, force: false }).catch(() => {});

    const unsubSync = subscribeUserNotificationSync((evt) => {
      if (evt.type === 'read') {
        const id = String(evt.id);
        setUnreadCount((c) => Math.max(0, c - 1));
        if (!listLoadedRef.current) return;
        setNotifications((prev) => {
          const next = prev.map((n) => (String(n.id) === id ? { ...n, read: true } : n));
          saveNotificationsCache(next);
          return next;
        });
      } else if (evt.type === 'readAll') {
        setUnreadCount(0);
        if (!listLoadedRef.current) return;
        setNotifications((prev) => {
          const next = prev.map((n) => ({ ...n, read: true }));
          saveNotificationsCache(next);
          return next;
        });
      } else if (evt.type === 'created' && evt.notification) {
        upsertNotification(evt.notification);
      } else if (evt.type === 'refresh') {
        refreshUnreadCount();
        if (listLoadedRef.current) {
          refreshNotifications({ silent: true, force: true });
        }
      }
    });

    let pollRef = null;
    let reconnectRef = null;
    let socketRef = null;
    let wsConnected = false;

    const startRealtime = async () => {
      const ws = await openNotificationsSocket((payload) => {
        if (payload?.type !== 'notification.created' || !payload.notification?.id) return;
        upsertNotification(payload.notification);
      });
      if (!ws) return;
      socketRef = ws;
      ws.onopen = () => {
        wsConnected = true;
      };
      ws.onclose = () => {
        wsConnected = false;
        reconnectRef = setTimeout(startRealtime, 2500);
      };
    };

    startRealtime();
    pollRef = setInterval(() => {
      if (!wsConnected) refreshUnreadCount();
    }, NOTIFICATIONS_POLL_FALLBACK_MS);

    return () => {
      unsubSync();
      if (pollRef) clearInterval(pollRef);
      if (socketRef) socketRef.close();
      if (reconnectRef) clearTimeout(reconnectRef);
    };
  }, [user, refreshUnreadCount, refreshNotifications, upsertNotification, ensureNotificationsLoaded]);

  const value = useMemo(
    () => ({
      notifications,
      hydrated,
      loading,
      unreadCount,
      refreshNotifications,
      refreshUnreadCount,
      ensureNotificationsLoaded,
      markAllAsRead,
      markAsRead,
    }),
    [
      notifications,
      hydrated,
      loading,
      unreadCount,
      refreshNotifications,
      refreshUnreadCount,
      ensureNotificationsLoaded,
      markAllAsRead,
      markAsRead,
    ]
  );

  return (
    <NotificationUnreadContext.Provider value={value}>
      {children}
    </NotificationUnreadContext.Provider>
  );
}

export function useNotificationUnread() {
  const ctx = useContext(NotificationUnreadContext);
  return {
    unreadCount: ctx.unreadCount,
    refreshUnreadCount: ctx.refreshUnreadCount,
  };
}

export function useNotifications() {
  return useContext(NotificationUnreadContext);
}

export default NotificationUnreadContext;
