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
import {
  openNotificationsSocket,
  isNotificationsWsEnabled,
  NOTIFICATIONS_POLL_FALLBACK_MS,
} from '../api/notificationsRealtime';
import {
  subscribeUserNotificationSync,
  dispatchAllNotificationsRead,
  dispatchNotificationRead,
} from '../utils/userNotificationsEvents';

const CACHE_TTL_MS = 10 * 60 * 1000;
const BACKFILL_SESSION_KEY = 'trak_notifications_backfill_done';
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
  const cacheRef = useRef({ list: [], savedAt: 0 });
  const listLoadedRef = useRef(false);
  const [notifications, setNotifications] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const syncUnreadFromList = useCallback((list) => {
    const count = (Array.isArray(list) ? list : []).filter((n) => !n.read).length;
    setUnreadCount(count);
    return count;
  }, []);

  const applyList = useCallback((list) => {
    const next = Array.isArray(list) ? list : [];
    cacheRef.current = { list: next, savedAt: Date.now() };
    setNotifications(next);
    setHydrated(true);
    listLoadedRef.current = true;
    syncUnreadFromList(next);
  }, [syncUnreadFromList]);

  const refreshUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    if (listLoadedRef.current && hydrated) {
      syncUnreadFromList(cacheRef.current.list);
      return;
    }
    try {
      const res = await notificationsApi.getUnreadCount();
      setUnreadCount(Number(res?.unread) || 0);
    } catch {
      setUnreadCount(0);
    }
  }, [user, hydrated, syncUnreadFromList]);

  const refreshNotifications = useCallback(
    async ({ silent = false, force = false } = {}) => {
      if (!user) {
        applyList([]);
        return;
      }

      const cached = cacheRef.current;
      const cacheValid =
        !force &&
        cached.list.length > 0 &&
        Date.now() - cached.savedAt < CACHE_TTL_MS;

      if (cacheValid) {
        setNotifications(cached.list);
        setHydrated(true);
        listLoadedRef.current = true;
        syncUnreadFromList(cached.list);
        if (!silent) setLoading(false);
        return;
      }

      if (!silent) setLoading(true);

      try {
        const rows = await notificationsApi.getNotifications({ limit: LIST_LIMIT });
        applyList(rows);
      } catch {
        if (!cacheValid) applyList([]);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [user, applyList, syncUnreadFromList]
  );

  const ensureNotificationsLoaded = useCallback(
    async ({ runBackfill = false, force = true } = {}) => {
      if (!user) return;

      if (
        !force &&
        listLoadedRef.current &&
        cacheRef.current.list.length > 0 &&
        Date.now() - cacheRef.current.savedAt < CACHE_TTL_MS
      ) {
        setNotifications(cacheRef.current.list);
        setHydrated(true);
        syncUnreadFromList(cacheRef.current.list);
      } else {
        await refreshNotifications({ silent: false, force: true });
      }

      if (runBackfill && typeof sessionStorage !== 'undefined') {
        if (!sessionStorage.getItem(BACKFILL_SESSION_KEY)) {
          sessionStorage.setItem(BACKFILL_SESSION_KEY, '1');
          try {
            await notificationsApi.backfillKeywordNotifications({ hours: 72, limit: 50 });
            await refreshNotifications({ silent: true, force: true });
          } catch {
            /* non-fatal */
          }
        }
      }
    },
    [user, refreshNotifications, syncUnreadFromList]
  );

  const markAsRead = useCallback(async (notificationId) => {
    const id = String(notificationId);
    setNotifications((prev) => {
      const next = prev.map((n) => (String(n.id) === id ? { ...n, read: true } : n));
      cacheRef.current = { list: next, savedAt: Date.now() };
      return next;
    });
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await notificationsApi.markAsRead(id);
      dispatchNotificationRead(id);
    } catch {
      /* keep optimistic UI */
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      cacheRef.current = { list: next, savedAt: Date.now() };
      return next;
    });
    setUnreadCount(0);
    dispatchAllNotificationsRead();
    try {
      await notificationsApi.markAllAsRead();
    } catch {
      /* keep optimistic UI */
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
      cacheRef.current = { list: next, savedAt: Date.now() };
      return next;
    });
  }, []);

  useEffect(() => {
    if (!user) {
      cacheRef.current = { list: [], savedAt: 0 };
      listLoadedRef.current = false;
      setNotifications([]);
      setHydrated(false);
      setLoading(false);
      setUnreadCount(0);
      return undefined;
    }

    refreshUnreadCount();

    const unsubSync = subscribeUserNotificationSync((evt) => {
      if (evt.type === 'read') {
        const id = String(evt.id);
        setUnreadCount((c) => Math.max(0, c - 1));
        if (!listLoadedRef.current) return;
        setNotifications((prev) => {
          const next = prev.map((n) => (String(n.id) === id ? { ...n, read: true } : n));
          cacheRef.current = { list: next, savedAt: Date.now() };
          return next;
        });
      } else if (evt.type === 'readAll') {
        setUnreadCount(0);
        if (!listLoadedRef.current) return;
        setNotifications((prev) => {
          const next = prev.map((n) => ({ ...n, read: true }));
          cacheRef.current = { list: next, savedAt: Date.now() };
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

    let pollId = null;
    let reconnectRef = null;
    let socketRef = null;
    let reconnectAttempts = 0;
    const MAX_WS_RECONNECT = 3;

    const startPolling = () => {
      if (pollId) return;
      pollId = setInterval(() => refreshUnreadCount(), NOTIFICATIONS_POLL_FALLBACK_MS);
    };

    const connect = () => {
      if (!isNotificationsWsEnabled()) {
        startPolling();
        return;
      }
      const ws = openNotificationsSocket((payload) => {
        if (payload?.type !== 'notification.created' || !payload.notification?.id) return;
        upsertNotification(payload.notification);
      });
      if (!ws) {
        startPolling();
        return;
      }
      socketRef = ws;
      ws.onopen = () => {
        reconnectAttempts = 0;
      };
      ws.onerror = () => {
        ws.close();
      };
      ws.onclose = () => {
        socketRef = null;
        reconnectAttempts += 1;
        if (reconnectAttempts >= MAX_WS_RECONNECT) {
          startPolling();
          return;
        }
        reconnectRef = setTimeout(connect, 5000);
      };
    };
    connect();

    return () => {
      unsubSync();
      if (pollId) clearInterval(pollId);
      if (socketRef) socketRef.close();
      if (reconnectRef) clearTimeout(reconnectRef);
    };
  }, [user, refreshUnreadCount, refreshNotifications, upsertNotification]);

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
