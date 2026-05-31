import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ExternalLink } from 'lucide-react';
import { useAdminTheme } from './useAdminTheme';
import AdminPageLayout from './components/AdminPageLayout';
import AdminPageHeader from './components/AdminPageHeader';
import AdminNotificationCard from './components/AdminNotificationCard';
import { useAdminPageMeta } from './adminPageMeta';
import { getAdminNotifications, markAdminNotificationRead } from '../../api/adminApi';
import { openAdminNotificationsSocket, isAdminNotificationsWsEnabled } from '../../api/adminNotificationsRealtime';
import { subscribeAdminNotifications, dispatchAdminNotificationRead } from '../../utils/adminNotificationsEvents';
import { SkeletonListRows } from '../../components/skeletons/SkeletonLayouts';
import {
  NOTIFICATION_FILTER_TABS,
  countNotificationsByFilter,
  matchesNotificationFilter,
  getNotificationTypeMeta,
  notificationReadStatus,
} from '../../constants/adminNotificationMeta';

function normalizeNotification(n) {
  return {
    id: n.id,
    type: n.type || 'alert',
    text: n.text || '',
    details: n.details || '',
    read: !!n.read,
    important: !!n.important,
    meta: n.meta || {},
    created_at: n.created_at,
  };
}

const AdminNotificationsScreen = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const tabActive = pathname === '/admin/notifications';
  const { palette, isDark, colors } = useAdminTheme();
  const { title, description } = useAdminPageMeta();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selected, setSelected] = useState(null);
  const socketRef = useRef(null);
  const reconnectRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  const cardBackground = palette.card;
  const textPrimary = palette.textPrimary;
  const textSecondary = palette.textSecondary;
  const borderColor = palette.border;

  const prependRow = useCallback((n) => {
    if (!n?.id) return;
    setRows((prev) => {
      if (prev.some((r) => String(r.id) === String(n.id))) return prev;
      return [normalizeNotification(n), ...prev];
    });
  }, []);

  const loadRows = useCallback(async ({ silent = false } = {}) => {
    if (!tabActive) return;
    try {
      if (!silent) setLoading(true);
      const data = await getAdminNotifications();
      setRows((data.results || []).map(normalizeNotification));
    } catch {
      if (!silent) setRows([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [tabActive]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  useEffect(() => {
    if (!tabActive) return undefined;
    if (!isAdminNotificationsWsEnabled()) return undefined;

    const maxReconnects = 3;
    const connect = () => {
      const ws = openAdminNotificationsSocket((payload) => {
        if (payload?.type !== 'notification.created' || !payload.notification?.id) return;
        prependRow(payload.notification);
      });
      if (!ws) return;
      socketRef.current = ws;
      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
      };
      ws.onclose = () => {
        if (reconnectAttemptsRef.current >= maxReconnects) return;
        reconnectAttemptsRef.current += 1;
        reconnectRef.current = setTimeout(connect, 2500 * reconnectAttemptsRef.current);
      };
      ws.onerror = () => {
        ws.close();
      };
    };
    connect();
    return () => {
      if (socketRef.current) socketRef.current.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      reconnectAttemptsRef.current = 0;
    };
  }, [tabActive, prependRow]);

  useEffect(() => {
    return subscribeAdminNotifications((n) => prependRow(n));
  }, [prependRow]);

  const counts = useMemo(() => countNotificationsByFilter(rows), [rows]);
  const filtered = useMemo(
    () => rows.filter((n) => matchesNotificationFilter(n, activeTab)),
    [rows, activeTab]
  );

  const openDetail = async (row) => {
    setSelected(row);
    if (!row.read && row.id) {
      try {
        await markAdminNotificationRead(row.id);
        setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, read: true } : r)));
        setSelected({ ...row, read: true });
        dispatchAdminNotificationRead(row.id);
      } catch {
        // keep drawer open even if mark-read fails
      }
    }
  };

  const selectedType = selected ? getNotificationTypeMeta(selected.type) : null;
  const selectedRead = selected ? notificationReadStatus(selected) : null;

  return (
    <AdminPageLayout maxWidth="1200px">
      <AdminPageHeader title={title} description={description}>
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          {NOTIFICATION_FILTER_TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: `1px solid ${activeTab === key ? palette.primary : borderColor}`,
                background: activeTab === key ? `${palette.primary}18` : cardBackground,
                color: activeTab === key ? palette.primary : textSecondary,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {label} ({counts[key] ?? 0})
            </button>
          ))}
        </div>
      </AdminPageHeader>

      <div className="admin-page-body">
        {loading ? <SkeletonListRows rows={8} isDark={isDark} colors={colors} /> : null}
        {!loading && filtered.length === 0 ? (
          <div
            style={{
              padding: 48,
              textAlign: 'center',
              color: textSecondary,
              border: `1px dashed ${borderColor}`,
              borderRadius: 16,
            }}
          >
            <Bell size={32} color={textSecondary} style={{ marginBottom: 12 }} />
            <div>No notifications in this view.</div>
          </div>
        ) : null}
        {!loading && filtered.map((row) => (
          <AdminNotificationCard key={row.id} row={row} palette={palette} onClick={openDetail} />
        ))}
      </div>

      {selected ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(15,23,42,0.4)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 440,
              height: '100%',
              background: cardBackground,
              borderLeft: `1px solid ${borderColor}`,
              padding: 24,
              overflow: 'auto',
            }}
          >
            <h3 style={{ margin: '0 0 8px', color: textPrimary }}>Notification detail</h3>
            <p style={{ color: textSecondary, fontSize: 13, marginBottom: 16 }}>
              {selectedType?.label}
              {selectedRead ? (
                <span style={{ color: selectedRead.color, fontWeight: 700 }}> · {selectedRead.label}</span>
              ) : null}
              {selected.important ? (
                <span style={{ color: '#ef4444', fontWeight: 700 }}> · Important</span>
              ) : null}
            </p>

            <p style={{ color: textPrimary, lineHeight: 1.5, marginBottom: 12, fontWeight: 600 }}>
              {selected.text || '(No headline)'}
            </p>
            {selected.details ? (
              <p style={{ color: textSecondary, fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
                {selected.details}
              </p>
            ) : null}

            {selected.meta?.reporter_email || selected.meta?.user_id ? (
              <p style={{ color: textSecondary, fontSize: 13, marginBottom: 12 }}>
                From: {selected.meta.reporter_email || `User #${selected.meta.user_id}`}
              </p>
            ) : null}

            {selected.meta?.post_title ? (
              <div
                style={{
                  marginBottom: 16,
                  padding: 12,
                  borderRadius: 10,
                  border: `1px solid ${borderColor}`,
                  background: palette.inputBg || palette.backgroundSecondary,
                }}
              >
                <div style={{ fontSize: 12, color: textSecondary, marginBottom: 4 }}>Linked article</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>
                  {selected.meta.post_title}
                </div>
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {selected.meta?.feedback_id ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelected(null);
                    navigate('/admin/feedback');
                  }}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: 'none',
                    background: palette.primary,
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Open feedback
                </button>
              ) : null}
              {selected.meta?.canonical_url || selected.meta?.url ? (
                <a
                  href={selected.meta.canonical_url || selected.meta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: `1px solid ${borderColor}`,
                    color: palette.primary,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Source <ExternalLink size={12} />
                </a>
              ) : null}
              <button
                type="button"
                onClick={() => setSelected(null)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'transparent',
                  color: textSecondary,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPageLayout>
  );
};

export default AdminNotificationsScreen;
