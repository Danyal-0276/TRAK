import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { useAdminTheme } from './useAdminTheme';
import AdminPageLayout from './components/AdminPageLayout';
import AdminPageHeader from './components/AdminPageHeader';
import { useAdminPageMeta } from './adminPageMeta';
import { useUIFeedback } from '../../components/ui/UIFeedback';
import {
    Users,
    Search,
    Trash2,
    CheckCircle,
    XCircle,
    Mail,
    Calendar,
    UserX,
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
    const [selectedIds, setSelectedIds] = useState(() => new Set());

    const cardBackground = palette.card;
    const textPrimary = palette.textPrimary;
    const textSecondary = palette.textSecondary;
    const borderColor = palette.border;
    const inputBg = palette.inputBg || cardBackground;
    const avatarBg = palette.buttonPrimaryBg || (isDark ? '#262626' : '#0a0a0a');
    const avatarText = palette.buttonPrimaryText || (isDark ? '#fafafa' : '#ffffff');

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
            setSelectedIds(new Set());
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

    const selectableUsers = useMemo(() => users.filter((u) => !u.isAdmin), [users]);
    const allSelected = selectableUsers.length > 0 && selectableUsers.every((u) => selectedIds.has(u.id));

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(selectableUsers.map((u) => u.id)));
        }
    };

    const toggleSelect = (userId) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(userId)) next.delete(userId);
            else next.add(userId);
            return next;
        });
    };

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

    const handleBulkDelete = async () => {
        const ids = Array.from(selectedIds);
        if (!ids.length) return;
        const accepted = await confirm({
            title: `Delete ${ids.length} user(s)?`,
            message: 'This cannot be undone.',
            confirmText: 'Delete all',
            danger: true,
        });
        if (!accepted) return;
        try {
            await Promise.all(ids.map((id) => deleteAdminUser(id)));
            await loadUsers();
            success(`${ids.length} user(s) deleted.`);
        } catch (e) {
            notifyError(e?.message || 'Failed to delete selected users.');
        }
    };

    const handleBulkDeactivate = async () => {
        const ids = Array.from(selectedIds);
        if (!ids.length) return;
        const accepted = await confirm({
            title: `Deactivate ${ids.length} user(s)?`,
            message: 'Selected users will not be able to sign in.',
            confirmText: 'Deactivate',
            danger: true,
        });
        if (!accepted) return;
        try {
            await Promise.all(ids.map((id) => patchAdminUser(id, { is_active: false })));
            await loadUsers();
            success(`${ids.length} user(s) deactivated.`);
        } catch (e) {
            notifyError(e?.message || 'Failed to deactivate selected users.');
        }
    };

    const handleToggleStatus = async (userId, e) => {
        e?.stopPropagation?.();
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
        <AdminPageLayout maxWidth="1400px">
            <AdminPageHeader title={title} description={description} />
            <div className="admin-page-body">
                <div style={{ marginBottom: 24 }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Search size={18} color={textSecondary} style={{ position: 'absolute', left: 16, pointerEvents: 'none' }} />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 44px',
                                backgroundColor: inputBg,
                                border: `1px solid ${borderColor}`,
                                borderRadius: 8,
                                fontSize: 14,
                                outline: 'none',
                                color: textPrimary,
                            }}
                        />
                    </div>
                </div>

                {selectedIds.size > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                        <span style={{ fontSize: 13, color: textSecondary, alignSelf: 'center' }}>
                            {selectedIds.size} selected
                        </span>
                        <button
                            type="button"
                            onClick={handleBulkDeactivate}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '8px 14px',
                                borderRadius: 8,
                                border: `1px solid ${borderColor}`,
                                background: palette.pageAlt,
                                color: textPrimary,
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: 13,
                            }}
                        >
                            <UserX size={14} />
                            Deactivate selected
                        </button>
                        <button
                            type="button"
                            onClick={handleBulkDelete}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '8px 14px',
                                borderRadius: 8,
                                border: `1px solid ${palette.error}`,
                                background: palette.errorBg,
                                color: palette.error,
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: 13,
                            }}
                        >
                            <Trash2 size={14} />
                            Delete selected
                        </button>
                    </div>
                ) : null}

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
                        borderRadius: 12,
                        border: `1px solid ${borderColor}`,
                    }}>
                        <Users size={48} color={textSecondary} style={{ marginBottom: 16 }} />
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: textPrimary, margin: '0 0 8px 0' }}>
                            No users found
                        </h3>
                        <p style={{ fontSize: 14, color: textSecondary, margin: 0, textAlign: 'center' }}>
                            {searchQuery ? 'Try adjusting your search query' : 'No users in the system'}
                        </p>
                    </div>
                ) : (
                    <div className="admin-data-table">
                        <div
                            className={isMobile ? '' : 'admin-data-table__head'}
                            style={{
                            display: isMobile ? 'none' : 'grid',
                            gridTemplateColumns: isTablet ? '40px minmax(180px, 2fr) 1fr 1fr 100px' : '40px minmax(220px, 2.5fr) 1fr 1fr 120px',
                            gap: 16,
                            padding: '16px 20px',
                            alignItems: 'center',
                        }}>
                            <div>
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleSelectAll}
                                    aria-label="Select all users"
                                />
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: textSecondary, textTransform: 'uppercase' }}>Name</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: textSecondary, textTransform: 'uppercase' }}>Status</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: textSecondary, textTransform: 'uppercase' }}>Join Date</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: textSecondary, textTransform: 'uppercase', textAlign: 'right' }}>Actions</div>
                        </div>
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className={isMobile ? '' : 'admin-data-row'}
                                role="button"
                                tabIndex={0}
                                onClick={() => navigate(`/admin/users/${user.id}`)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') navigate(`/admin/users/${user.id}`);
                                }}
                                style={{
                                    display: isMobile ? 'block' : 'grid',
                                    gridTemplateColumns: isMobile ? 'none' : (isTablet ? '40px minmax(180px, 2fr) 1fr 1fr 100px' : '40px minmax(220px, 2.5fr) 1fr 1fr 120px'),
                                    gap: 16,
                                    padding: isMobile ? 16 : '16px 20px',
                                    alignItems: 'center',
                                    ...(isMobile ? {
                                        backgroundColor: cardBackground,
                                        border: `1px solid ${borderColor}`,
                                        borderRadius: 12,
                                        marginBottom: 12,
                                    } : {}),
                                }}
                            >
                                <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center' }}>
                                    {!user.isAdmin ? (
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(user.id)}
                                            onChange={() => toggleSelect(user.id)}
                                            aria-label={`Select ${user.email}`}
                                        />
                                    ) : null}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: isMobile ? 12 : 0, minWidth: 0 }}>
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 8,
                                        backgroundColor: avatarBg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: avatarText,
                                        fontSize: 16,
                                        fontWeight: 700,
                                        flexShrink: 0,
                                    }}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary, lineHeight: 1.3 }}>
                                            {user.name}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            marginTop: 4,
                                            fontSize: 13,
                                            color: textSecondary,
                                            lineHeight: 1.3,
                                        }}>
                                            <Mail size={12} color={textSecondary} style={{ flexShrink: 0 }} />
                                            <span style={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {user.email}
                                            </span>
                                        </div>
                                        {user.isAdmin ? (
                                            <div style={{ fontSize: 11, color: palette.warning, fontWeight: 600, marginTop: 4 }}>Admin</div>
                                        ) : null}
                                    </div>
                                </div>
                                <div style={{ marginBottom: isMobile ? 8 : 0 }} onClick={(e) => e.stopPropagation()}>
                                    <button
                                        type="button"
                                        onClick={(e) => handleToggleStatus(user.id, e)}
                                        style={{
                                            padding: '4px 12px',
                                            border: 'none',
                                            borderRadius: 6,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            backgroundColor: user.status === 'active' ? palette.successBg : palette.errorBg,
                                            color: user.status === 'active' ? palette.success : palette.error,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                        }}
                                    >
                                        {user.status === 'active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                        {user.status === 'active' ? 'Active' : 'Inactive'}
                                    </button>
                                </div>
                                <div style={{
                                    fontSize: 13,
                                    color: textSecondary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    marginBottom: isMobile ? 8 : 0,
                                }}>
                                    <Calendar size={12} color={textSecondary} />
                                    {new Date(user.joinDate).toLocaleDateString()}
                                </div>
                                <div
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: isMobile ? 'flex-start' : 'flex-end' }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {!user.isAdmin ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(user.id)}
                                            style={{
                                                padding: 6,
                                                border: `1px solid ${borderColor}`,
                                                background: palette.inputBg || cardBackground,
                                                borderRadius: 6,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <Trash2 size={14} color={palette.error} />
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminPageLayout>
    );
};

export default AdminUsersScreen;
