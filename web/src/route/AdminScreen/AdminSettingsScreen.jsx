import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { getResponsivePadding, getResponsiveMaxWidth } from '../../utils/responsiveStyles';
import { ChevronRight, Plus, Trash2 } from 'lucide-react';
import { getAdminSettings, patchAdminSettings } from '../../api/adminApi';
import { useUIFeedback } from '../../components/ui/UIFeedback';
import { SkeletonPageBlocks } from '../../components/skeletons/SkeletonLayouts';

const AdminSettingsScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const { isMobile, isTablet } = useResponsive();
    const navigate = useNavigate();
    const { success, error: err } = useUIFeedback();
    const [categories, setCategories] = useState([]);
    const [connections, setConnections] = useState([]);
    const [catInput, setCatInput] = useState('');
    const [connInput, setConnInput] = useState('');
    const [loading, setLoading] = useState(true);

    const backgroundColor = isDark ? colors.background || '#0F172A' : '#ffffff';
    const cardBackground = isDark ? colors.surface || '#1E293B' : '#ffffff';
    const textPrimary = isDark ? colors.textPrimary || '#F1F5F9' : '#0f172a';
    const textSecondary = isDark ? colors.textSecondary || '#CBD5E1' : '#64748b';
    const borderColor = isDark ? colors.border || '#334155' : '#e5e7eb';

    const load = async () => {
        try {
            setLoading(true);
            const s = await getAdminSettings();
            setCategories(Array.isArray(s.categories) ? s.categories : []);
            setConnections(Array.isArray(s.connections) ? s.connections : []);
        } catch {
            err('Could not load admin settings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const normList = (raw) =>
        (Array.isArray(raw) ? raw : [])
            .map((x) => (typeof x === 'string' ? x : x?.name || x?.id || String(x)))
            .filter(Boolean);

    const addCategory = async () => {
        const v = catInput.trim();
        if (!v) return;
        try {
            const next = [...normList(categories), v];
            await patchAdminSettings({ categories: next });
            setCatInput('');
            await load();
            success('Category added.');
        } catch (e) {
            err(e?.message || 'Failed.');
        }
    };

    const removeCategory = async (item) => {
        const id = typeof item === 'string' ? item : item?.id;
        const next = normList(categories).filter((c) => c !== id && c !== item);
        try {
            await patchAdminSettings({ categories: next });
            await load();
            success('Removed.');
        } catch (e) {
            err(e?.message || 'Failed.');
        }
    };

    const addConnection = async () => {
        const v = connInput.trim();
        if (!v) return;
        try {
            const next = [...normList(connections), v];
            await patchAdminSettings({ connections: next });
            setConnInput('');
            await load();
            success('Connection added.');
        } catch (e) {
            err(e?.message || 'Failed.');
        }
    };

    const removeConnection = async (item) => {
        const id = typeof item === 'string' ? item : item?.id;
        const next = normList(connections).filter((c) => c !== id && c !== item);
        try {
            await patchAdminSettings({ connections: next });
            await load();
            success('Removed.');
        } catch (e) {
            err(e?.message || 'Failed.');
        }
    };

    const catItems = normList(categories);
    const connItems = normList(connections);

    return (
        <div style={{ minHeight: '100vh', backgroundColor }}>
            <div style={{
                maxWidth: getResponsiveMaxWidth(isMobile, isTablet, '800px'),
                margin: '0 auto',
                padding: getResponsivePadding(isMobile, isTablet),
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: textSecondary, marginBottom: 10 }}>
                    <button type="button" onClick={() => navigate('/admin/dashboard')} style={{ border: 'none', background: 'transparent', color: textSecondary, cursor: 'pointer', padding: 0 }}>Admin</button>
                    <ChevronRight size={14} />
                    <span style={{ color: textPrimary, fontWeight: 600 }}>Settings</span>
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: textPrimary, margin: '0 0 8px' }}>Manage categories &amp; connections</h1>
                <p style={{ color: textSecondary, marginBottom: 24 }}>CRUD for platform categories and external connections (Mongo-backed, same as mobile).</p>

                {loading ? (
                    <SkeletonPageBlocks isDark={isDark} colors={colors} minHeight="420px" />
                ) : (
                    <>
                <div style={{ background: cardBackground, border: `1px solid ${borderColor}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: textPrimary, margin: '0 0 12px' }}>Categories</h2>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                        <input
                            value={catInput}
                            onChange={(e) => setCatInput(e.target.value)}
                            placeholder="New category"
                            style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: `1px solid ${borderColor}`, background: isDark ? colors.surfaceElevated || '#334155' : '#fff', color: textPrimary }}
                        />
                        <button type="button" onClick={addCategory} style={{ padding: '0 16px', borderRadius: 8, border: 'none', background: isDark ? colors.primary || '#818CF8' : '#0f172a', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Plus size={18} /> Add
                        </button>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {catItems.map((c) => (
                            <li key={c} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${borderColor}`, color: textPrimary }}>
                                <span>{c}</span>
                                <button type="button" onClick={() => removeCategory(c)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }} aria-label="Remove">
                                    <Trash2 size={16} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div style={{ background: cardBackground, border: `1px solid ${borderColor}`, borderRadius: 12, padding: 20 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: textPrimary, margin: '0 0 12px' }}>Connections</h2>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                        <input
                            value={connInput}
                            onChange={(e) => setConnInput(e.target.value)}
                            placeholder="New connection / feed label"
                            style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: `1px solid ${borderColor}`, background: isDark ? colors.surfaceElevated || '#334155' : '#fff', color: textPrimary }}
                        />
                        <button type="button" onClick={addConnection} style={{ padding: '0 16px', borderRadius: 8, border: 'none', background: isDark ? colors.primary || '#818CF8' : '#0f172a', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Plus size={18} /> Add
                        </button>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {connItems.map((c) => (
                            <li key={c} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${borderColor}`, color: textPrimary }}>
                                <span>{c}</span>
                                <button type="button" onClick={() => removeConnection(c)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }} aria-label="Remove">
                                    <Trash2 size={16} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminSettingsScreen;
