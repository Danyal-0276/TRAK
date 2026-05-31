import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAdminTheme } from './useAdminTheme';
import AdminPageLayout from './components/AdminPageLayout';
import AdminPageHeader from './components/AdminPageHeader';
import { useAdminPageMeta } from './adminPageMeta';
import { getAdminNotifications } from '../../api/adminApi';
import { openAdminNotificationsSocket, isAdminNotificationsWsEnabled } from '../../api/adminNotificationsRealtime';
import { SkeletonListRows } from '../../components/skeletons/SkeletonLayouts';

const AdminNotificationsScreen = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const tabActive = pathname === '/admin/notifications';
    const { palette, isDark, colors } = useAdminTheme();
    const { title, description } = useAdminPageMeta();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const socketRef = useRef(null);
    const reconnectRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);

    const cardBackground = palette.card;
    const textPrimary = palette.textPrimary;
    const textSecondary = palette.textSecondary;
    const borderColor = palette.border;

    const loadRows = async () => {
        try {
            setLoading(true);
            const data = await getAdminNotifications();
            setRows(
                (data.results || []).map((n) => ({
                    id: n.id,
                    type: n.type || 'alert',
                    text: n.text || '',
                    details: n.details || '',
                    read: !!n.read,
                    important: !!n.important,
                    meta: n.meta || {},
                    created_at: n.created_at,
                }))
            );
        } catch {
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!tabActive) return undefined;
        loadRows();
        if (!isAdminNotificationsWsEnabled()) return undefined;

        const maxReconnects = 3;
        const connect = () => {
            const ws = openAdminNotificationsSocket((payload) => {
                if (payload?.type !== 'notification.created' || !payload.notification?.id) return;
                const n = payload.notification;
                setRows((prev) => {
                    if (prev.some((r) => String(r.id) === String(n.id))) return prev;
                    return [
                        {
                            id: n.id,
                            type: n.type || 'alert',
                            text: n.text || '',
                            details: n.details || '',
                            read: false,
                            important: !!n.important,
                            meta: n.meta || {},
                            created_at: n.created_at || new Date().toISOString(),
                        },
                        ...prev,
                    ];
                });
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
    }, [tabActive]);

    const filtered = rows.filter((n) => {
        if (activeTab === 'Errors') return String(n.type || '').startsWith('admin_pipeline');
        if (activeTab === 'System') return n.type === 'admin_system';
        if (activeTab === 'Reports') {
            return n.type === 'admin_user_report' || n.type === 'admin_user_feedback';
        }
        return true;
    });

    const handleRowClick = (n) => {
        if (n.meta?.feedback_id) {
            navigate('/admin/feedback');
            return;
        }
        if (n.meta?.article_id) {
            navigate(`/article/${n.meta.article_id}`);
        }
    };

    return (
        <AdminPageLayout maxWidth="1200px">
            <AdminPageHeader title={title} description={description}>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    {['All', 'Errors', 'Reports', 'System'].map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '8px 14px',
                                borderRadius: 8,
                                border: `1px solid ${activeTab === tab ? palette.primary : borderColor}`,
                                background: activeTab === tab ? `${palette.primary}18` : cardBackground,
                                color: activeTab === tab ? palette.primary : textSecondary,
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </AdminPageHeader>

            <div className="admin-page-body">
                {loading ? <SkeletonListRows rows={8} isDark={isDark} colors={colors} /> : null}
                {!loading && filtered.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', color: textSecondary, border: `1px dashed ${borderColor}`, borderRadius: 12 }}>
                        No notifications yet.
                    </div>
                ) : null}
                {!loading && filtered.map((n) => (
                    <div
                        key={n.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleRowClick(n)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRowClick(n)}
                        style={{
                            padding: 16,
                            marginBottom: 10,
                            borderRadius: 12,
                            border: `1px solid ${borderColor}`,
                            background: cardBackground,
                            cursor: n.meta?.feedback_id || n.meta?.article_id ? 'pointer' : 'default',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                            <Bell size={16} color={textSecondary} />
                            <span style={{ fontWeight: 600, color: textPrimary }}>{n.type || 'notice'}</span>
                            {n.important ? (
                                <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700 }}>Important</span>
                            ) : null}
                            <span style={{ fontSize: 12, color: textSecondary }}>{n.read ? 'Read' : 'Unread'}</span>
                            {n.created_at ? (
                                <span style={{ fontSize: 12, color: textSecondary, marginLeft: 'auto' }}>
                                    {typeof n.created_at === 'string' ? n.created_at : new Date(n.created_at).toLocaleString()}
                                </span>
                            ) : null}
                        </div>
                        <div style={{ fontSize: 14, color: textSecondary }}>{n.text || ''}</div>
                        {n.details ? (
                            <div style={{ fontSize: 13, color: textSecondary, marginTop: 6, opacity: 0.9 }}>
                                {n.details}
                            </div>
                        ) : null}
                    </div>
                ))}
            </div>
        </AdminPageLayout>
    );
};

export default AdminNotificationsScreen;
