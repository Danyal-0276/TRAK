import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { useUIFeedback } from '../../components/ui/UIFeedback';
import { 
    Database, 
    HardDrive, 
    Trash2, 
    Download, 
    Upload,
    FileText,
    Image,
    Video,
    Music,
    Archive,
    AlertCircle,
    CheckCircle,
    RefreshCw
} from 'lucide-react';
import { SkeletonStatCards, SkeletonListRows } from '../../components/skeletons/SkeletonLayouts';

const DataScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';

    const [storageData, setStorageData] = useState({
        total: 0,
        used: 0,
        available: 0,
        breakdown: {
            articles: 0,
            images: 0,
            videos: 0,
            cache: 0,
            other: 0,
        }
    });

    const [loading, setLoading] = useState(true);
    const [clearing, setClearing] = useState(null);
    const { confirm, error: showError, success } = useUIFeedback();

    useEffect(() => {
        calculateStorage();
    }, []);

    const calculateStorage = () => {
        setLoading(true);
        // Calculate localStorage size
        let totalSize = 0;
        const breakdown = {
            articles: 0,
            images: 0,
            videos: 0,
            cache: 0,
            other: 0,
        };

        try {
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    const item = localStorage.getItem(key);
                    const size = new Blob([item]).size;
                    totalSize += size;

                    // Categorize by key
                    if (key.includes('bookmark') || key.includes('article')) {
                        breakdown.articles += size;
                    } else if (key.includes('image') || key.includes('avatar')) {
                        breakdown.images += size;
                    } else if (key.includes('video')) {
                        breakdown.videos += size;
                    } else if (key.includes('cache')) {
                        breakdown.cache += size;
                    } else {
                        breakdown.other += size;
                    }
                }
            }
        } catch (error) {
            console.error('Error calculating storage:', error);
        }

        // Simulate total storage (5MB limit for demo)
        const totalStorage = 5 * 1024 * 1024; // 5MB
        const used = totalSize;
        const available = totalStorage - used;

        setStorageData({
            total: totalStorage,
            used: used,
            available: available,
            breakdown
        });
        setLoading(false);
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const getPercentage = (value, total) => {
        return total > 0 ? Math.round((value / total) * 100) : 0;
    };

    const clearData = async (type) => {
        const accepted = await confirm({
            title: `Clear ${type}?`,
            message: `Are you sure you want to clear ${type}? This action cannot be undone.`,
            confirmText: 'Clear',
            danger: true,
        });
        if (!accepted) {
            return;
        }

        setClearing(type);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (type === 'cache') {
                // Clear cache-related items
                Object.keys(localStorage).forEach(key => {
                    if (key.includes('cache') || key.includes('temp')) {
                        localStorage.removeItem(key);
                    }
                });
            } else if (type === 'articles') {
                // Clear bookmarks and articles
                localStorage.removeItem('bookmarks');
                Object.keys(localStorage).forEach(key => {
                    if (key.includes('article') && !key.includes('bookmark')) {
                        localStorage.removeItem(key);
                    }
                });
            } else if (type === 'all') {
                // Clear everything except essential settings
                const essentialKeys = ['userSettings', 'userProfile', 'userAvatar', 'theme'];
                Object.keys(localStorage).forEach(key => {
                    if (!essentialKeys.includes(key)) {
                        localStorage.removeItem(key);
                    }
                });
            }

            calculateStorage();
            success(`${type} cleared successfully.`);
        } catch (err) {
            console.error('Error clearing data:', err);
            showError('Failed to clear data. Please try again.');
        } finally {
            setClearing(null);
        }
    };

    const exportData = () => {
        try {
            const data = {
                profile: localStorage.getItem('userProfile'),
                settings: localStorage.getItem('userSettings'),
                bookmarks: localStorage.getItem('bookmarks'),
                exportDate: new Date().toISOString(),
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `trak-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error exporting data:', err);
            showError('Failed to export data. Please try again.');
        }
    };

    const storageItems = [
        { 
            key: 'articles', 
            label: 'Articles & Bookmarks', 
            icon: FileText, 
            color: '#3b82f6',
            size: storageData.breakdown.articles 
        },
        { 
            key: 'images', 
            label: 'Images', 
            icon: Image, 
            color: '#10b981',
            size: storageData.breakdown.images 
        },
        { 
            key: 'videos', 
            label: 'Videos', 
            icon: Video, 
            color: '#ef4444',
            size: storageData.breakdown.videos 
        },
        { 
            key: 'cache', 
            label: 'Cache', 
            icon: RefreshCw, 
            color: '#f59e0b',
            size: storageData.breakdown.cache 
        },
        { 
            key: 'other', 
            label: 'Other Data', 
            icon: Database, 
            color: '#8b5cf6',
            size: storageData.breakdown.other 
        },
    ];

    const backgroundColor = colors.background;
    const cardBackground = colors.surface;
    const textPrimary = colors.textPrimary;
    const textSecondary = colors.textSecondary;
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
                {/* Header */}
                <div style={{
                    marginTop: '0',
                    marginBottom: '24px',
                    paddingTop: '0',
                }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: textPrimary,
                        margin: '0 0 8px 0',
                        paddingTop: '0',
                        letterSpacing: '-0.5px',
            }}>
                Data & Storage
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: textSecondary,
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        Manage your stored data and storage usage
                    </p>
                </div>

                {/* Storage Overview */}
                <div style={{
                    backgroundColor: cardBackground,
                    borderRadius: '12px',
                    border: `1px solid ${borderColor}`,
                    padding: '32px',
                    marginBottom: '24px',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '24px',
                    }}>
                        <HardDrive size={24} color={colors.primary} />
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: textPrimary,
                            margin: '0',
                        }}>
                            Storage Overview
                        </h2>
                    </div>

                    {loading ? (
                        <div>
                            <SkeletonStatCards count={3} isDark={isDark} colors={colors} />
                            <div style={{ marginTop: 20 }}>
                                <SkeletonListRows rows={6} isDark={isDark} colors={colors} />
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Storage Bar */}
                            <div style={{
                                marginBottom: '24px',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '12px',
                                }}>
                                    <div>
                                        <div style={{
                                            fontSize: '24px',
                                            fontWeight: '700',
                                            color: textPrimary,
                                            marginBottom: '4px',
                                        }}>
                                            {formatBytes(storageData.used)} / {formatBytes(storageData.total)}
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: textSecondary,
                                        }}>
                                            {getPercentage(storageData.used, storageData.total)}% used
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: '14px',
                                        color: textSecondary,
                                    }}>
                                        {formatBytes(storageData.available)} available
                                    </div>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '12px',
                                    backgroundColor: isDark ? '#334155' : '#f3f4f6',
                                    borderRadius: '6px',
                                    overflow: 'hidden',
                                }}>
                                    <div style={{
                                        width: `${getPercentage(storageData.used, storageData.total)}%`,
                                        height: '100%',
                                        backgroundColor: getPercentage(storageData.used, storageData.total) > 80 
                                            ? '#ef4444' 
                                            : getPercentage(storageData.used, storageData.total) > 60 
                                            ? '#f59e0b' 
                                            : '#10b981',
                                        transition: 'width 0.3s ease',
                                    }} />
                                </div>
                            </div>

                            {/* Storage Breakdown */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '16px',
                            }}>
                                {storageItems.map((item) => {
                                    const Icon = item.icon;
                                    const percentage = getPercentage(item.size, storageData.total);
                                    return (
                                        <div
                                            key={item.key}
                                            style={{
                                                padding: '16px',
                                                backgroundColor: isDark ? '#334155' : '#f9fafb',
                                                borderRadius: '8px',
                                                border: `1px solid ${borderColor}`,
                                            }}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                marginBottom: '12px',
                                            }}>
                                                <Icon size={18} color={item.color} />
                                                <div style={{
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: textPrimary,
                                                }}>
                                                    {item.label}
                                                </div>
                                            </div>
                                            <div style={{
                                                fontSize: '18px',
                                                fontWeight: '700',
                                                color: textPrimary,
                                                marginBottom: '4px',
                                            }}>
                                                {formatBytes(item.size)}
                                            </div>
                                            <div style={{
                                                fontSize: '11px',
                                                color: textSecondary,
                                            }}>
                                                {percentage}% of total
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Data Management */}
                <div style={{
                    backgroundColor: cardBackground,
                    borderRadius: '12px',
                    border: `1px solid ${borderColor}`,
                    padding: '32px',
                    marginBottom: '24px',
                }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: textPrimary,
                        margin: '0 0 24px 0',
                    }}>
                        Data Management
                    </h2>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                    }}>
                        <button
                            onClick={() => clearData('cache')}
                            disabled={clearing === 'cache'}
                            style={{
                                padding: '14px 20px',
                                border: `1px solid ${borderColor}`,
                                background: cardBackground,
                                borderRadius: '8px',
                                cursor: clearing === 'cache' ? 'not-allowed' : 'pointer',
                                fontSize: '15px',
                                fontWeight: '600',
                                color: textPrimary,
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                opacity: clearing === 'cache' ? 0.6 : 1,
                            }}
                            onMouseEnter={(e) => {
                                if (clearing !== 'cache') {
                                    e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#f9fafb';
                                    e.currentTarget.style.borderColor = isDark ? '#475569' : '#d1d5db';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (clearing !== 'cache') {
                                    e.currentTarget.style.backgroundColor = cardBackground;
                                    e.currentTarget.style.borderColor = borderColor;
                                }
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }}>
                                <RefreshCw size={18} color={textSecondary} />
                                <div>
                                    <div style={{
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        color: textPrimary,
                                    }}>
                                        Clear Cache
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: textSecondary,
                                    }}>
                                        Remove temporary files and cached data
                                    </div>
                                </div>
                            </div>
                            {clearing === 'cache' && (
                                <RefreshCw size={16} color={textSecondary} style={{
                                    animation: 'spin 1s linear infinite',
                                }} />
                            )}
                        </button>

                        <button
                            onClick={() => clearData('articles')}
                            disabled={clearing === 'articles'}
                            style={{
                                padding: '14px 20px',
                                border: `1px solid ${borderColor}`,
                                background: cardBackground,
                                borderRadius: '8px',
                                cursor: clearing === 'articles' ? 'not-allowed' : 'pointer',
                                fontSize: '15px',
                                fontWeight: '600',
                                color: textPrimary,
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                opacity: clearing === 'articles' ? 0.6 : 1,
                            }}
                            onMouseEnter={(e) => {
                                if (clearing !== 'articles') {
                                    e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#f9fafb';
                                    e.currentTarget.style.borderColor = isDark ? '#475569' : '#d1d5db';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (clearing !== 'articles') {
                                    e.currentTarget.style.backgroundColor = cardBackground;
                                    e.currentTarget.style.borderColor = borderColor;
                                }
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }}>
                                <FileText size={18} color={textSecondary} />
                                <div>
                                    <div style={{
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        color: textPrimary,
                                    }}>
                                        Clear Articles & Bookmarks
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: textSecondary,
                                    }}>
                                        Remove all saved articles and bookmarks
                                    </div>
                                </div>
                            </div>
                            {clearing === 'articles' && (
                                <RefreshCw size={16} color={textSecondary} style={{
                                    animation: 'spin 1s linear infinite',
                                }} />
                            )}
                        </button>

                        <button
                            onClick={() => clearData('all')}
                            disabled={clearing === 'all'}
                            style={{
                                padding: '14px 20px',
                                border: `1px solid ${clearing === 'all' ? borderColor : '#ef4444'}`,
                                background: cardBackground,
                                borderRadius: '8px',
                                cursor: clearing === 'all' ? 'not-allowed' : 'pointer',
                                fontSize: '15px',
                                fontWeight: '600',
                                color: clearing === 'all' ? textPrimary : '#ef4444',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                opacity: clearing === 'all' ? 0.6 : 1,
                            }}
                            onMouseEnter={(e) => {
                                if (clearing !== 'all') {
                                    e.currentTarget.style.backgroundColor = '#fef2f2';
                                    e.currentTarget.style.borderColor = '#fecaca';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (clearing !== 'all') {
                                    e.currentTarget.style.backgroundColor = cardBackground;
                                    e.currentTarget.style.borderColor = '#ef4444';
                                }
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }}>
                                <Trash2 size={18} color={clearing === 'all' ? textSecondary : '#ef4444'} />
                                <div>
                                    <div style={{
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        color: clearing === 'all' ? textPrimary : '#ef4444',
                                    }}>
                                        Clear All Data
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: textSecondary,
                                    }}>
                                        Remove all stored data (except settings)
                                    </div>
                                </div>
                            </div>
                            {clearing === 'all' && (
                                <RefreshCw size={16} color={textSecondary} style={{
                                    animation: 'spin 1s linear infinite',
                                }} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Export Data */}
                <div style={{
                    backgroundColor: cardBackground,
                    borderRadius: '12px',
                    border: `1px solid ${borderColor}`,
                    padding: '32px',
                }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: textPrimary,
                        margin: '0 0 16px 0',
                    }}>
                        Export Data
                    </h2>
                    <p style={{
                        fontSize: '14px',
                        color: textSecondary,
                        margin: '0 0 20px 0',
                        lineHeight: '1.6',
                    }}>
                        Download a copy of your data including profile, settings, and bookmarks.
                    </p>
                    <button
                        onClick={exportData}
                        style={{
                            padding: '12px 24px',
                            border: `1px solid ${borderColor}`,
                            background: isDark ? '#334155' : '#0f172a',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#ffffff',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? '#475569' : '#1e293b';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#0f172a';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <Download size={18} />
                        Export Data
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default DataScreen;
