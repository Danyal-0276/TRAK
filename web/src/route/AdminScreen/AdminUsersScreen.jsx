import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { getResponsivePadding, getResponsiveMaxWidth, getResponsiveFontSize } from '../../utils/responsiveStyles';
import { 
    Users, 
    Search, 
    Edit, 
    Trash2, 
    CheckCircle, 
    XCircle,
    Mail,
    Calendar
} from 'lucide-react';

const AdminUsersScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const { isMobile, isTablet } = useResponsive();
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const backgroundColor = isDark ? colors.background || '#0F172A' : '#ffffff';
    const cardBackground = isDark ? colors.surface || '#1E293B' : '#ffffff';
    const textPrimary = isDark ? colors.textPrimary || '#F1F5F9' : '#0f172a';
    const textSecondary = isDark ? colors.textSecondary || '#CBD5E1' : '#64748b';
    const borderColor = isDark ? colors.border || '#334155' : '#e5e7eb';

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            // Mock user data
            const mockUsers = [
                { id: 1, name: 'Ali', email: 'ali@user.com', status: 'inactive', joinDate: '2024-01-15', isAdmin: false },
                { id: 2, name: 'Daniyal', email: 'daniya@admin.com', status: 'active', joinDate: '2024-01-10', isAdmin: true },
                { id: 3, name: 'Shahroz', email: 'shahroz@admin.com', status: 'active', joinDate: '2024-01-08', isAdmin: true },
                { id: 4, name: 'Abdullah', email: 'abdullah@admin.com', status: 'active', joinDate: '2024-01-05', isAdmin: true },
                { id: 5, name: 'Zain', email: 'zain@user.com', status: 'active', joinDate: '2024-01-20', isAdmin: false },
                { id: 6, name: 'Subhan', email: 'Subhan@user.com', status: 'inactive', joinDate: '2024-01-18', isAdmin: false },
            ];
            setUsers(mockUsers);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setUsers(users.filter(u => u.id !== userId));
        }
    };

    const handleToggleStatus = (userId) => {
        setUsers(users.map(u => 
            u.id === userId 
                ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
                : u
        ));
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            <div style={{
                minHeight: '100vh',
                backgroundColor: backgroundColor,
                paddingTop: '0',
                marginTop: '0',
            }}>
            <div style={{
                maxWidth: getResponsiveMaxWidth(isMobile, isTablet, '1400px'),
                margin: '0 auto',
                width: '100%',
                padding: getResponsivePadding(isMobile, isTablet),
            }}>
                {/* Header Section */}
                <div style={{
                    marginTop: '0',
                    marginBottom: isMobile ? '16px' : '24px',
                    paddingTop: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '12px' : '0',
                }}>
                    <div>
                        <h1 style={{
                            fontSize: getResponsiveFontSize(isMobile, isTablet, 28),
                            fontWeight: '700',
                            color: textPrimary,
                            margin: '0 0 8px 0',
                            paddingTop: '0',
                            letterSpacing: '-0.5px',
                        }}>
                            Users Management
                        </h1>
                        <p style={{
                            fontSize: '15px',
                            color: textSecondary,
                            margin: '0',
                            lineHeight: '1.5',
                        }}>
                            Manage all platform users and their accounts
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <div style={{
                    marginBottom: '24px',
                }}>
                    <div style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        <Search size={18} color={textSecondary} style={{ position: 'absolute', left: '16px', pointerEvents: 'none' }} />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 44px',
                                backgroundColor: isDark ? colors.surface || '#1E293B' : '#f9fafb',
                                border: `1px solid ${borderColor}`,
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                color: textPrimary,
                            }}
                            onFocus={(e) => {
                                e.target.style.backgroundColor = isDark ? colors.backgroundElevated || '#334155' : '#ffffff';
                                e.target.style.borderColor = isDark ? colors.primary || '#818CF8' : '#0f172a';
                                e.target.style.boxShadow = isDark 
                                    ? '0 0 0 3px rgba(129, 140, 248, 0.2)' 
                                    : '0 0 0 3px rgba(0, 0, 0, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.backgroundColor = isDark ? colors.surface || '#1E293B' : '#f9fafb';
                                e.target.style.borderColor = borderColor;
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                </div>

                {/* Users Table */}
                {loading ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '400px',
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            border: `3px solid ${borderColor}`,
                            borderTop: `3px solid ${isDark ? colors.primary || '#818CF8' : '#0f172a'}`,
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                        }} />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '80px 20px',
                        backgroundColor: isDark ? colors.surfaceElevated || '#334155' : '#f9fafb',
                        borderRadius: '12px',
                        border: `1px solid ${borderColor}`,
                    }}>
                        <Users size={48} color={textSecondary} style={{ marginBottom: '16px' }} />
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: textPrimary,
                            margin: '0 0 8px 0',
                        }}>
                            No users found
                        </h3>
                        <p style={{
                            fontSize: '14px',
                            color: textSecondary,
                            margin: '0',
                            textAlign: 'center',
                        }}>
                            {searchQuery ? 'Try adjusting your search query' : 'No users in the system'}
                        </p>
                    </div>
                ) : (
                    <div style={{
                        backgroundColor: cardBackground,
                        borderRadius: '12px',
                        border: `1px solid ${borderColor}`,
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            display: isMobile ? 'none' : 'grid',
                            gridTemplateColumns: isTablet ? '1fr 1.5fr 1fr 1fr 100px' : '1fr 2fr 1fr 1fr 120px',
                            gap: isMobile ? '8px' : '16px',
                            padding: isMobile ? '12px 16px' : '16px 20px',
                            borderBottom: `1px solid ${borderColor}`,
                            backgroundColor: isDark ? colors.surfaceElevated || '#334155' : '#f9fafb',
                        }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: textSecondary, textTransform: 'uppercase' }}>Name</div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: textSecondary, textTransform: 'uppercase' }}>Email</div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: textSecondary, textTransform: 'uppercase' }}>Status</div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: textSecondary, textTransform: 'uppercase' }}>Join Date</div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: textSecondary, textTransform: 'uppercase' }}>Actions</div>
                        </div>
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                style={{
                                    display: isMobile ? 'block' : 'grid',
                                    gridTemplateColumns: isMobile ? 'none' : (isTablet ? '1fr 1.5fr 1fr 1fr 100px' : '1fr 2fr 1fr 1fr 120px'),
                                    gap: isMobile ? '12px' : '16px',
                                    padding: isMobile ? '16px' : '16px 20px',
                                    borderBottom: `1px solid ${borderColor}`,
                                    borderRadius: isMobile ? '8px' : '0',
                                    marginBottom: isMobile ? '12px' : '0',
                                    border: isMobile ? `1px solid ${borderColor}` : 'none',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated || '#334155' : '#f9fafb';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = cardBackground;
                                }}
                            >
                                <div style={{
                                    display: isMobile ? 'flex' : 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: isMobile ? '12px' : '0',
                                }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '8px',
                                        backgroundColor: isDark ? colors.primary || '#818CF8' : '#0f172a',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#ffffff',
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        flexShrink: 0,
                                    }}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: textPrimary,
                                        }}>
                                            {user.name}
                                        </div>
                                        {user.isAdmin && (
                                            <div style={{
                                                fontSize: '11px',
                                                color: '#f59e0b',
                                                fontWeight: '600',
                                                marginTop: '2px',
                                            }}>
                                                Admin
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{
                                    display: isMobile ? 'flex' : 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '14px',
                                    color: textSecondary,
                                    marginBottom: isMobile ? '8px' : '0',
                                }}>
                                    <Mail size={14} color={textSecondary} />
                                    {user.email}
                                </div>
                                <div style={{ marginBottom: isMobile ? '8px' : '0' }}>
                                    <button
                                        onClick={() => handleToggleStatus(user.id)}
                                        style={{
                                            padding: '4px 12px',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            backgroundColor: user.status === 'active' 
                                                ? '#10b98120' 
                                                : '#ef444420',
                                            color: user.status === 'active' 
                                                ? '#10b981' 
                                                : '#ef4444',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                        }}
                                    >
                                        {user.status === 'active' ? (
                                            <CheckCircle size={12} />
                                        ) : (
                                            <XCircle size={12} />
                                        )}
                                        {user.status === 'active' ? 'Active' : 'Inactive'}
                                    </button>
                                </div>
                                <div style={{
                                    fontSize: '13px',
                                    color: textSecondary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    marginBottom: isMobile ? '8px' : '0',
                                }}>
                                    <Calendar size={12} color={textSecondary} />
                                    {new Date(user.joinDate).toLocaleDateString()}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    justifyContent: isMobile ? 'flex-start' : 'flex-end',
                                }}>
                                    <button
                                        onClick={() => handleToggleStatus(user.id)}
                                        style={{
                                            padding: '6px',
                                            border: `1px solid ${borderColor}`,
                                            background: 'transparent',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated || '#334155' : '#f9fafb';
                                            e.currentTarget.style.borderColor = isDark ? colors.primary || '#818CF8' : '#0f172a';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.borderColor = borderColor;
                                        }}
                                    >
                                        <Edit size={14} color={textPrimary} />
                                    </button>
                                    {!user.isAdmin && (
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            style={{
                                                padding: '6px',
                                                border: `1px solid ${borderColor}`,
                                                background: 'transparent',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#ef444420';
                                                e.currentTarget.style.borderColor = '#ef4444';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.borderColor = borderColor;
                                            }}
                                        >
                                            <Trash2 size={14} color="#ef4444" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

export default AdminUsersScreen;

