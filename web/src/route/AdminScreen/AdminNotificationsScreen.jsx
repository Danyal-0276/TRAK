import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { getResponsivePadding, getResponsiveMaxWidth } from '../../utils/responsiveStyles';
import { Bell, ChevronRight } from 'lucide-react';
import { getAdminNotifications } from '../../api/adminApi';
import { SkeletonListRows } from '../../components/skeletons/SkeletonLayouts';

const AdminNotificationsScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const { isMobile, isTablet } = useResponsive();
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const backgroundColor = colors.background;
    const cardBackground = colors.surface;
    const textPrimary = colors.textPrimary;
    const textSecondary = colors.textSecondary;
    const borderColor = colors.border;

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getAdminNotifications();
                setRows(data.results || []);
            } catch {
                setRows([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div style={{ minHeight: '100vh', backgroundColor }}>
            <div style={{
                maxWidth: getResponsiveMaxWidth(isMobile, isTablet, '900px'),
                margin: '0 auto',
                padding: getResponsivePadding(isMobile, isTablet),
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: textSecondary, marginBottom: 10 }}>
                    <button type="button" onClick={() => navigate('/admin/dashboard')} style={{ border: 'none', background: 'transparent', color: textSecondary, cursor: 'pointer', padding: 0 }}>Admin</button>
                    <ChevronRight size={14} />
                    <span style={{ color: textPrimary, fontWeight: 600 }}>Notifications</span>
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: textPrimary, margin: '0 0 8px' }}>Admin notifications</h1>
                <p style={{ color: textSecondary, marginBottom: 24 }}>System notices and delivery log (same data as mobile admin).</p>

                {loading ? <SkeletonListRows rows={8} isDark={isDark} colors={colors} /> : null}
                {!loading && rows.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', color: textSecondary, border: `1px dashed ${borderColor}`, borderRadius: 12 }}>
                        No notifications yet.
                    </div>
                ) : null}
                {!loading && rows.map((n) => (
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
                            <span style={{ fontSize: 12, color: textSecondary }}>{n.read ? 'Read' : 'Unread'}</span>
                            {n.created_at ? (
                                <span style={{ fontSize: 12, color: textSecondary, marginLeft: 'auto' }}>
                                    {typeof n.created_at === 'string' ? n.created_at : new Date(n.created_at).toLocaleString()}
                                </span>
                            ) : null}
                        </div>
                        <div style={{ fontSize: 14, color: textSecondary }}>{n.text || ''}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminNotificationsScreen;
