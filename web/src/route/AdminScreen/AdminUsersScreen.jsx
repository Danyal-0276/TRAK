import React, { useState, useEffect, useCallback } from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { useAdminTheme } from './useAdminTheme';
import AdminPageLayout from './components/AdminPageLayout';
import AdminPageHeader from './components/AdminPageHeader';
import { useAdminPageMeta } from './adminPageMeta';
import { useUIFeedback } from '../../components/ui/UIFeedback';
import { 
    Users, 
    Search, 
    Edit, 
    Trash2, 
    CheckCircle, 
    XCircle,
    Mail,
    Calendar,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deleteAdminUser, getAdminUsers, patchAdminUser } from '../../api/adminApi';
import { SkeletonTableRows } from '../../components/skeletons/SkeletonLayouts';

const AdminUsersScreen = () => {
    const navigate = useNavigate();
    const { palette, isDark, colors } = useAdminTheme();
    const { isMobile, isTablet } = useResponsive();
    const { confirm, success, error: notifyError } = useUIFeedback();
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const cardBackground = palette.card;
    const textPrimary = palette.textPrimary;
    const textSecondary = palette.textSecondary;
    const borderColor = palette.border;

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAdminUsers({ q: searchQuery.trim(), role: 'user' });
            const mapped = (data.results || []).map((u) => ({
                id: u.id,
                name: u.email?.split('@')[0] || 'user',
                email: u.email,
                status: u.is_active ? 'active' : 'inactive',
                joinDate: u.created_at,
                isAdmin: u.role === 'admin',
            }));
            setUsers(mapped);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        const t = window.setTimeout(() => {
            loadUsers();
        }, 280);
        return () => window.clearTimeout(t);
    }, [loadUsers]);

    const handleDelete = async (userId) => {
        const accepted = await confirm({
            title: 'Delete user?',
            message: 'Are you sure you want to delete this user?',
            confirmText: 'Delete',
            danger: true,
        });
        if (accepted) {
            try {
                await deleteAdminUser(userId);
                await loadUsers();
                success('User deleted.');
            } catch (e) {
                notifyError(e?.message || 'Failed to delete user.');
            }
        }
    };

    const handleToggleStatus = async (userId) => {
        const target = users.find((u) => u.id === userId);
        if (!target) return;
        const nextStatus = target.status === 'active' ? 'inactive' : 'active';
        try {
            await patchAdminUser(userId, { is_active: nextStatus === 'active' });
            setUsers(users.map(u => (u.id === userId ? { ...u, status: nextStatus } : u)));
            success(`User set to ${nextStatus}.`);
        } catch (e) {
            notifyError(e?.message || 'Failed to update user status.');
        }
    };

    const { title, description } = useAdminPageMeta();

    return (
        <>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            <AdminPageLayout maxWidth="1400px">
                <AdminPageHeader title={title} description={description} />
                <div className="admin-page-body">

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
                                backgroundColor: palette.inputBg,
                                border: `1px solid ${borderColor}`,
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                color: textPrimary,
                            }}
                            onFocus={(e) => {
                                e.target.style.backgroundColor = palette.card;
                                e.target.style.borderColor = palette.textPrimary;
                                e.target.style.boxShadow = isDark 
                                    ? '0 0 0 3px rgba(129, 140, 248, 0.2)' 
                                    : '0 0 0 3px rgba(0, 0, 0, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.backgroundColor = palette.inputBg;
                                e.target.style.borderColor = borderColor;
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                </div>

                {/* Users Table */}
                {loading ? (
                    <SkeletonTableRows rows={10} isDark={isDark} colors={colors} />
                ) : users.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '80px 20px',
                        backgroundColor: palette.pageAlt,
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
                            backgroundColor: palette.pageAlt,
                        }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: textSecondary, textTransform: 'uppercase' }}>Name</div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: textSecondary, textTransform: 'uppercase' }}>Email</div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: textSecondary, textTransform: 'uppercase' }}>Status</div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: textSecondary, textTransform: 'uppercase' }}>Join Date</div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: textSecondary, textTransform: 'uppercase' }}>Actions</div>
                        </div>
                        {users.map((user) => (
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
                                    e.currentTarget.style.backgroundColor = palette.pageAlt;
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
                                        backgroundColor: palette.textPrimary,
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
                                            e.currentTarget.style.backgroundColor = palette.pageAlt;
                                            e.currentTarget.style.borderColor = palette.textPrimary;
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
            </AdminPageLayout>
        </>
    );
};

export default AdminUsersScreen;

