import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getNotifications } from '../api/notificationsApi';
import { openNotificationsSocket, isNotificationsWsEnabled, NOTIFICATIONS_POLL_FALLBACK_MS } from '../api/notificationsRealtime';
import {
  subscribeUserNotificationSync,
  dispatchNotificationCreated,
} from '../utils/userNotificationsEvents';

const NotificationUnreadContext = createContext({ unreadCount: 0, refreshUnreadCount: () => {} });

export function NotificationUnreadProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const rows = await getNotifications();
      setUnreadCount(rows.filter((n) => !n.read).length);
    } catch {
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return undefined;
    }

    refreshUnreadCount();

    const unsubSync = subscribeUserNotificationSync((evt) => {
      if (evt.type === 'read') {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else if (evt.type === 'readAll') {
        setUnreadCount(0);
      } else if (evt.type === 'created' && evt.notification && !evt.notification.read) {
        setUnreadCount((prev) => prev + 1);
      } else if (evt.type === 'refresh') {
        refreshUnreadCount();
      }
    });

    let pollId = null;
    let reconnectRef = null;
    let socketRef = null;

    const connect = () => {
      const ws = openNotificationsSocket((payload) => {
        if (payload?.type !== 'notification.created' || !payload.notification?.id) return;
        const n = payload.notification;
        if (!n.read) {
          dispatchNotificationCreated(n);
        }
      });
      if (!ws) return;
      socketRef = ws;
      ws.onclose = () => {
        reconnectRef = setTimeout(connect, 2500);
      };
    };
    connect();

    if (!isNotificationsWsEnabled()) {
      pollId = setInterval(refreshUnreadCount, NOTIFICATIONS_POLL_FALLBACK_MS);
    }

    return () => {
      unsubSync();
      if (pollId) clearInterval(pollId);
      if (socketRef) socketRef.close();
      if (reconnectRef) clearTimeout(reconnectRef);
    };
  }, [user, refreshUnreadCount]);

  return (
    <NotificationUnreadContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </NotificationUnreadContext.Provider>
  );
}

export function useNotificationUnread() {
  return useContext(NotificationUnreadContext);
}

export default NotificationUnreadContext;
