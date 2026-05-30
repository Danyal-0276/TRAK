import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { Bell } from 'lucide-react';
import AdminPageLayout from './components/AdminPageLayout';
import AdminPageHeader from './components/AdminPageHeader';
import { useAdminPageMeta } from './adminPageMeta';
import { getAdminNotifications } from '../../api/adminApi';
import { openAdminNotificationsSocket } from '../../api/adminNotificationsRealtime';
import { SkeletonListRows } from '../../components/skeletons/SkeletonLayouts';

const AdminNotificationsScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const { title, description } = useAdminPageMeta();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const socketRef = React.useRef(null);
    const reconnectRef = React.useRef(null);

    const cardBackground = isDark ? colors.surface || '#1E293B' : '#ffffff';
    const textPrimary = isDark ? colors.textPrimary || '#F1F5F9' : '#0f172a';
    const textSecondary = isDark ? colors.textSecondary || '#CBD5E1' : '#64748b';
    const borderColor = isDark ? colors.border || '#334155' : '#e5e7eb';

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
        loadRows();
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
                            created_at: n.created_at || new Date().toISOString(),
                        },
                        ...prev,
                    ];
                });
            });
            if (!ws) return;
            socketRef.current = ws;
            ws.onclose = () => {
                reconnectRef.current = setTimeout(connect, 2500);
            };
        };
        connect();
        return () => {
            if (socketRef.current) socketRef.current.close();
            if (reconnectRef.current) clearTimeout(reconnectRef.current);
        };
    }, []);

    const filtered = rows.filter((n) => {
        if (activeTab === 'Errors') return String(n.type || '').startsWith('admin_pipeline');
        if (activeTab === 'System') return n.type === 'admin_system';
        return true;
    });

    return (
        <AdminPageLayout maxWidth="1200px">
            <AdminPageHeader title={title} description={description}>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    {['All', 'Errors', 'System'].map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '8px 14px',
                                borderRadius: 8,
                                border: `1px solid ${activeTab === tab ? colors.primary || '#3b82f6' : borderColor}`,
                                background: activeTab === tab ? `${colors.primary || '#3b82f6'}18` : cardBackground,
                                color: activeTab === tab ? colors.primary || '#3b82f6' : textSecondary,
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
                        style={{
                            padding: 16,
                            marginBottom: 10,
                            borderRadius: 12,
                            border: `1px solid ${borderColor}`,
                            background: cardBackground,
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
