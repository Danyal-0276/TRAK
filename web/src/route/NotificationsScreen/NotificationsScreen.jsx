import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
import { 
    Bell, 
    Check, 
    CheckCheck, 
    MessageCircle, 
    Heart, 
    UserPlus, 
    Hash,
    X,
    Clock
} from 'lucide-react';
import {
    getNotificationSourceName,
    getNotificationSourceInitial,
    isArticleKeywordNotification,
} from '../../utils/notificationDisplay';
import { useNotifications } from '../../context/NotificationUnreadContext';
import { SkeletonListRows } from '../../components/skeletons/SkeletonLayouts';

const NotificationsScreen = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const {
        notifications,
        loading,
        hydrated,
        unreadCount,
        markAllAsRead,
        markAsRead,
        ensureNotificationsLoaded,
    } = useNotifications();
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState('All');
    const [selectedNotification, setSelectedNotification] = useState(null);
    const openedRef = React.useRef(false);

    useEffect(() => {
        if (openedRef.current) return;
        openedRef.current = true;
        ensureNotificationsLoaded({ runBackfill: true });
    }, [ensureNotificationsLoaded]);

    useEffect(() => {
        filterNotifications();
    }, [activeTab, notifications]);

    const filterNotifications = () => {
        if (activeTab === 'All') {
            setFilteredNotifications(notifications);
        } else if (activeTab === 'Unread') {
            setFilteredNotifications(notifications.filter((n) => !n.read));
        } else if (activeTab === 'Keywords') {
            setFilteredNotifications(notifications.filter((n) => n.type === 'keyword_match'));
        } else if (activeTab === 'System') {
            setFilteredNotifications(
                notifications.filter((n) => ['system', 'welcome_back'].includes(n.type))
            );
        } else if (activeTab === 'Important') {
            setFilteredNotifications(notifications.filter((n) => n.important));
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read && notification.id) {
            markAsRead(notification.id);
        }
        const articleId = notification.meta?.article_id;
        if (articleId && (notification.type === 'keyword_match' || notification.type === 'keyword')) {
            navigate(`/article/${encodeURIComponent(String(articleId))}`);
            return;
        }
        setSelectedNotification(notification);
    };

    const handleCloseDetail = () => {
        setSelectedNotification(null);
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'mention':
                return <MessageCircle size={20} color={colors.primary} />;
            case 'like':
                return <Heart size={20} color="#ef4444" />;
            case 'comment':
                return <MessageCircle size={20} color="#10b981" />;
            case 'follow':
                return <UserPlus size={20} color="#8b5cf6" />;
            case 'keyword':
            case 'keyword_match':
                return <Hash size={20} color="#f59e0b" />;
            case 'welcome_back':
                return <Bell size={20} color={colors.primary} />;
            default:
                return <Bell size={20} color="#64748b" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'mention':
                return colors.primary;
            case 'like':
                return '#ef4444';
            case 'comment':
                return '#10b981';
            case 'follow':
                return '#8b5cf6';
            case 'keyword':
            case 'keyword_match':
                return '#f59e0b';
            default:
                return '#64748b';
        }
    };

    const isKeywordNotification = isArticleKeywordNotification;
    const textSecondary = colors.textSecondary;

    const getNotificationAvatar = (notification, variant = 'list') => {
        const isDetail = variant === 'detail';
        const sourceLabel = getNotificationSourceName(notification);
        const sourceInitial = getNotificationSourceInitial(notification);
        const markStyle = {
            width: isDetail ? '48px' : '40px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isDetail ? '15px' : '13px',
            fontWeight: 600,
            color: textSecondary,
            letterSpacing: '0.2px',
        };

        if (isKeywordNotification(notification)) {
            return (
                <span style={markStyle} title={sourceLabel}>
                    {sourceInitial}
                </span>
            );
        }

        return (
            <div style={{
                width: isDetail ? '48px' : '40px',
                height: isDetail ? '48px' : '40px',
                borderRadius: isDetail ? '12px' : '10px',
                backgroundColor: getNotificationColor(notification.type) + '20',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0,
            }}>
                {getNotificationIcon(notification.type)}
            </div>
        );
    };

    const visibleUnread = notifications.filter((n) => !n.read).length;
    const importantCount = notifications.filter(n => n.important).length;
    const showLoading = loading && !hydrated;

    const backgroundColor = colors.background;
    const cardBackground = colors.surface;
    const textPrimary = colors.textPrimary;
    const borderColor = colors.border;

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: backgroundColor,
            paddingTop: '0',
            marginTop: '0',
        }}>
            <div style={{
                maxWidth: '900px',
                margin: '0 auto',
                width: '100%',
                padding: '0 24px 24px 24px',
            }}>
                {/* Header Section */}
                <div style={{
                    marginTop: '0',
                    marginBottom: '24px',
                    paddingTop: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            color: textPrimary,
                            margin: '0 0 8px 0',
                            paddingTop: '0',
                            letterSpacing: '-0.5px',
            }}>
                Notifications
                        </h1>
                        <p style={{
                            fontSize: '15px',
                            color: textSecondary,
                            margin: '0',
                            lineHeight: '1.5',
                        }}>
                            {visibleUnread > 0 ? `${visibleUnread} unread notification${visibleUnread === 1 ? '' : 's'}` : 'All caught up!'}
                        </p>
                    </div>
                    {visibleUnread > 0 && (
                        <button
                            onClick={markAllAsRead}
                            style={{
                                padding: '10px 20px',
                                border: `1px solid ${borderColor}`,
                                background: cardBackground,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: textPrimary,
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = colors.primary;
                                e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated : '#f9fafb';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = borderColor;
                                e.currentTarget.style.backgroundColor = cardBackground;
                            }}
                        >
                            <CheckCheck size={16} color={textPrimary} />
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '24px',
                    borderBottom: `1px solid ${borderColor}`,
                    paddingBottom: '0',
                }}>
                    {[
                        { id: 'All', label: 'All', count: notifications.length },
                        { id: 'Unread', label: 'Unread', count: visibleUnread },
                        {
                            id: 'Keywords',
                            label: 'Keywords',
                            count: notifications.filter((n) => n.type === 'keyword_match').length,
                        },
                        {
                            id: 'System',
                            label: 'System',
                            count: notifications.filter((n) =>
                                ['system', 'welcome_back'].includes(n.type)
                            ).length,
                        },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '10px 16px',
                                border: 'none',
                                background: activeTab === tab.id 
                                    ? (isDark ? colors.surfaceElevated : '#f3f4f6')
                                    : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                borderBottom: activeTab === tab.id 
                                    ? `3px solid ${colors.primary}`
                                    : '2px solid transparent',
                                marginBottom: activeTab === tab.id ? '-2px' : '-1px',
                                borderRadius: '0',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                            onMouseEnter={(e) => {
                                if (activeTab !== tab.id) {
                                    e.currentTarget.style.backgroundColor = colors.surfaceHover;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== tab.id) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <span style={{
                                fontSize: '14px',
                                fontWeight: activeTab === tab.id ? '700' : '500',
                                color: activeTab === tab.id 
                                    ? (colors.primary)
                                    : textSecondary,
                            }}>
                                {tab.label}
                            </span>
                            <span style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                color: activeTab === tab.id 
                                    ? (colors.primary)
                                    : textSecondary,
                                backgroundColor: activeTab === tab.id 
                                    ? (isDark ? colors.primary + '20' || 'rgba(129, 140, 248, 0.2)' : '#e5e7eb')
                                    : (isDark ? colors.surfaceElevated : '#f3f4f6'),
                                padding: '3px 8px',
                                borderRadius: '12px',
                                minWidth: '28px',
                                textAlign: 'center',
                            }}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Notification Detail View */}
                {selectedNotification ? (
                    <div style={{
                        marginBottom: '24px',
                        backgroundColor: cardBackground,
                        border: `1px solid ${borderColor}`,
                        borderRadius: '8px',
                        padding: '24px',
                    }}>
                        {/* Close Button */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginBottom: '20px',
                        }}>
                            <button
                                onClick={handleCloseDetail}
                                style={{
                                    padding: '6px',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    borderRadius: '6px',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.surfaceHover;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <X size={18} color={textSecondary} />
                            </button>
                        </div>

                        {/* Notification Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            marginBottom: '20px',
                        }}>
                            {getNotificationAvatar(selectedNotification, 'detail')}
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: textPrimary,
                                    marginBottom: '4px',
                                }}>
                                    {selectedNotification.user}
                                </div>
                                <div style={{
                                    fontSize: '13px',
                                    color: textSecondary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}>
                                    <Clock size={12} color={textSecondary} />
                                    {selectedNotification.time}
                                </div>
                            </div>
                            {selectedNotification.important && (
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    color: '#ef4444',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    padding: '4px 10px',
                                    backgroundColor: '#fef2f2',
                                    borderRadius: '4px',
                                }}>
                                    Important
                                </span>
                            )}
                        </div>

                        {/* Notification Content */}
                        <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: textPrimary,
                            marginBottom: '12px',
                        }}>
                            {selectedNotification.text}
                        </div>

                        {selectedNotification.postTitle && (
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: textSecondary,
                                marginBottom: '16px',
                            }}>
                                Post: {selectedNotification.postTitle}
                            </div>
                        )}

                        {selectedNotification.keyword && (
                            <div style={{
                                marginBottom: '16px',
                            }}>
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    color: textSecondary,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    padding: '4px 10px',
                                    backgroundColor: isDark ? colors.surfaceElevated : '#f3f4f6',
                                    borderRadius: '4px',
                                    display: 'inline-block',
                                }}>
                                    Keyword: {selectedNotification.keyword}
                                </span>
                            </div>
                        )}

                        <div style={{
                            fontSize: '15px',
                            lineHeight: '1.7',
                            color: isDark ? colors.textSecondary : '#374151',
                            padding: '16px',
                            backgroundColor: isDark ? colors.surfaceElevated : '#f9fafb',
                            borderRadius: '8px',
                            border: `1px solid ${borderColor}`,
                        }}>
                            {selectedNotification.details}
                        </div>
                    </div>
                ) : null}

                {/* Notifications List */}
                {showLoading ? (
                    <SkeletonListRows rows={10} isDark={isDark} colors={colors} />
                ) : filteredNotifications.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '100px 20px',
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: textPrimary,
                            margin: '0 0 8px 0',
                        }}>
                            All caught up!
                        </h3>
                        <p style={{
                            fontSize: '14px',
                            color: textSecondary,
                            margin: '0',
                            textAlign: 'center',
                        }}>
                            {activeTab === 'Unread' 
                                ? "You don't have any unread notifications" 
                                : activeTab === 'Important'
                                ? "You don't have any important notifications"
                                : "You're all up to date! New notifications will appear here"}
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                    }}>
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                style={{
                                    padding: '16px',
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: '8px',
                                    backgroundColor: notification.read 
                                        ? cardBackground 
                                        : (isDark ? colors.surfaceElevated : '#f9fafb'),
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    borderLeft: notification.read 
                                        ? `1px solid ${borderColor}` 
                                        : `4px solid ${getNotificationColor(notification.type)}`,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.surfaceHover;
                                    e.currentTarget.style.borderColor = isDark ? colors.borderLight : '#d1d5db';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = notification.read 
                                        ? cardBackground 
                                        : (isDark ? colors.surfaceElevated : '#f9fafb');
                                    e.currentTarget.style.borderColor = borderColor;
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    gap: '16px',
                                }}>
                                    {getNotificationAvatar(notification)}

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '15px',
                                            fontWeight: notification.read ? '500' : '600',
                                            color: textPrimary,
                                            marginBottom: '6px',
                                            lineHeight: '1.4',
                                        }}>
                                            {notification.text}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            flexWrap: 'wrap',
                                        }}>
                                            <div style={{
                                                fontSize: '13px',
                                                color: textSecondary,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                            }}>
                                                <span>{notification.user}</span>
                                                <span>•</span>
                                                <span>{notification.time}</span>
                                            </div>
                                            {notification.keyword && (
                                                <span style={{
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    color: textSecondary,
                                                    padding: '2px 8px',
                                                    backgroundColor: isDark ? colors.surfaceElevated : '#f3f4f6',
                                                    borderRadius: '4px',
                                                }}>
                                                    #{notification.keyword}
                                                </span>
                                            )}
                                            {notification.important && (
                                                <span style={{
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    color: '#ef4444',
                                                    padding: '2px 8px',
                                                    backgroundColor: '#fef2f2',
                                                    borderRadius: '4px',
                                                }}>
                                                    Important
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Unread Indicator */}
                                    {!notification.read && (
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: getNotificationColor(notification.type),
                                            flexShrink: 0,
                                            marginTop: '4px',
                                        }} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                h1 {
                    margin-top: 0 !important;
                    padding-top: 0 !important;
                }
            `}</style>
        </div>
    );
};

export default NotificationsScreen;
