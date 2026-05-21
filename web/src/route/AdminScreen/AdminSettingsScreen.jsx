import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import { getResponsivePadding, getResponsiveMaxWidth } from '../../utils/responsiveStyles';
import { getAdminSettings, patchAdminSettings } from '../../api/adminApi';
import { normAdminList, toAdminPayloadList } from '../../utils/adminLists';
import { useUIFeedback } from '../../components/ui/UIFeedback';
import { SkeletonPageBlocks } from '../../components/skeletons/SkeletonLayouts';
import AdminSettingRow from './components/AdminSettingRow';
import AdminToggle from './components/AdminToggle';
import AdminListModal from './components/AdminListModal';

const LANGUAGE_OPTIONS = ['English', 'Urdu', 'Arabic', 'French', 'Spanish'];
const TIMEZONE_OPTIONS = ['UTC', 'Asia/Karachi', 'Asia/Dubai', 'Europe/London', 'America/New_York'];

const AdminSettingsScreen = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';
  const { isMobile, isTablet } = useResponsive();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { success, error: showError, confirm } = useUIFeedback();

  const [settings, setSettings] = useState({
    pushNotification: true,
    emailNotification: true,
    inAppNotification: true,
    language: 'English',
    timezone: 'UTC',
  });
  const [categories, setCategories] = useState([]);
  const [connections, setConnections] = useState([]);
  const [categoryInput, setCategoryInput] = useState('');
  const [connectionInput, setConnectionInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [listModal, setListModal] = useState(null);

  const backgroundColor = isDark ? colors.background || '#0F172A' : '#f9fafb';
  const cardBackground = isDark ? colors.surface || '#1E293B' : '#ffffff';
  const inputBg = isDark ? colors.backgroundSecondary || '#334155' : '#f8fafc';
  const textPrimary = isDark ? colors.textPrimary || '#F1F5F9' : '#0f172a';
  const textSecondary = isDark ? colors.textSecondary || '#CBD5E1' : '#64748b';
  const borderColor = isDark ? colors.border || '#334155' : '#e5e7eb';
  const primary = colors.primary || '#3b82f6';
  const errorColor = colors.error || '#ef4444';

  const applySettingsFromApi = (updated) => {
    setSettings({
      pushNotification: !!updated.notifications_enabled_default,
      emailNotification: !!updated.notifications_enabled_default,
      inAppNotification: !!updated.notifications_enabled_default,
      language: updated.language || 'English',
      timezone: updated.timezone || 'UTC',
    });
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const s = await getAdminSettings();
      applySettingsFromApi(s);
      setCategories(normAdminList(s.categories || []));
      setConnections(normAdminList(s.connections || []));
    } catch {
      showError('Could not load admin settings.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSettingsChange = async (updates) => {
    const pushOn =
      updates.pushNotification !== undefined
        ? updates.pushNotification
        : updates.emailNotification !== undefined
          ? updates.emailNotification
          : updates.inAppNotification !== undefined
            ? updates.inAppNotification
            : settings.pushNotification;

    try {
      const payload = {
        notifications_enabled_default: pushOn !== undefined ? !!pushOn : !!settings.pushNotification,
        categories: toAdminPayloadList(categories),
        connections: toAdminPayloadList(connections),
        language: updates.language || settings.language || 'English',
        timezone: updates.timezone || settings.timezone || 'UTC',
      };
      const updated = await patchAdminSettings(payload);
      applySettingsFromApi(updated);
      if (updates.language) success(`Language set to ${updates.language}`);
      else if (updates.timezone) success(`Timezone set to ${updates.timezone}`);
    } catch (e) {
      showError(e?.message || 'Failed to update settings.');
    }
  };

  const handleAddCategory = async () => {
    const name = categoryInput.trim();
    if (!name) return;
    try {
      const next = [...toAdminPayloadList(categories), name];
      await patchAdminSettings({ categories: next });
      setCategoryInput('');
      await load();
      success('Category added.');
    } catch (e) {
      showError(e?.message || 'Failed.');
    }
  };

  const handleRemoveCategory = async (id) => {
    try {
      const next = toAdminPayloadList(categories).filter((c) => c !== id);
      await patchAdminSettings({ categories: next });
      await load();
    } catch (e) {
      showError(e?.message || 'Failed.');
    }
  };

  const handleAddConnection = async () => {
    const name = connectionInput.trim();
    if (!name) return;
    try {
      const next = [...toAdminPayloadList(connections), name];
      await patchAdminSettings({ connections: next });
      setConnectionInput('');
      await load();
      success('Connection added.');
    } catch (e) {
      showError(e?.message || 'Failed.');
    }
  };

  const handleRemoveConnection = async (id) => {
    try {
      const next = toAdminPayloadList(connections).filter((c) => c !== id);
      await patchAdminSettings({ connections: next });
      await load();
    } catch (e) {
      showError(e?.message || 'Failed.');
    }
  };

  const handleDeleteAllCategories = async () => {
    try {
      await patchAdminSettings({ categories: [] });
      await load();
      setListModal(null);
    } catch (e) {
      showError(e?.message || 'Failed.');
    }
  };

  const handleDeleteAllConnections = async () => {
    try {
      await patchAdminSettings({ connections: [] });
      await load();
      setListModal(null);
    } catch (e) {
      showError(e?.message || 'Failed.');
    }
  };

  const handleLogout = async () => {
    const accepted = await confirm({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      danger: true,
    });
    if (!accepted) return;
    await logout();
    navigate('/login', { replace: true });
  };

  const sectionStyle = {
    backgroundColor: cardBackground,
    border: `1px solid ${borderColor}`,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.06)',
  };

  const pillButtonStyle = {
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    background: primary,
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  };

  const inputStyle = {
    flex: 1,
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: 15,
    border: `1.5px solid ${borderColor}`,
    backgroundColor: inputBg,
    color: textPrimary,
    outline: 'none',
  };

  const iconBtnStyle = (bg) => ({
    width: 48,
    height: 48,
    borderRadius: 24,
    border: 'none',
    background: bg,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor }}>
      <div
        style={{
          maxWidth: getResponsiveMaxWidth(isMobile, isTablet, '720px'),
          margin: '0 auto',
          padding: getResponsivePadding(isMobile, isTablet),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: `${primary}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SettingsIcon size={20} color={primary} />
          </div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: textPrimary }}>Settings</h1>
        </div>

        {loading ? (
          <SkeletonPageBlocks isDark={isDark} colors={colors} minHeight="480px" />
        ) : (
          <>
            <section style={sectionStyle}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: textPrimary, margin: '0 0 16px 0' }}>
                Notification Setting
              </h2>
              <AdminSettingRow label="Push Notification" borderColor={borderColor} textPrimary={textPrimary}>
                <AdminToggle
                  value={settings.pushNotification}
                  onChange={(v) => handleSettingsChange({ pushNotification: v })}
                />
              </AdminSettingRow>
              <AdminSettingRow label="Email Notification" borderColor={borderColor} textPrimary={textPrimary}>
                <AdminToggle
                  value={settings.emailNotification}
                  onChange={(v) => handleSettingsChange({ emailNotification: v })}
                />
              </AdminSettingRow>
              <AdminSettingRow label="In-app Notification" borderColor={borderColor} textPrimary={textPrimary}>
                <AdminToggle
                  value={settings.inAppNotification}
                  onChange={(v) => handleSettingsChange({ inAppNotification: v })}
                />
              </AdminSettingRow>
            </section>

            <section style={sectionStyle}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: textPrimary, margin: '0 0 16px 0' }}>
                Language &amp; Region
              </h2>
              <AdminSettingRow label="Language" borderColor={borderColor} textPrimary={textPrimary}>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingsChange({ language: e.target.value })}
                  style={pillButtonStyle}
                >
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </AdminSettingRow>
              <AdminSettingRow label="Timezone" borderColor={borderColor} textPrimary={textPrimary}>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleSettingsChange({ timezone: e.target.value })}
                  style={{ ...pillButtonStyle, maxWidth: 200 }}
                >
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </AdminSettingRow>
            </section>

            <section style={sectionStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: textPrimary, margin: 0 }}>Manage Category</h2>
                <button type="button" style={pillButtonStyle} onClick={() => setListModal('category')}>
                  List
                </button>
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <input
                  style={inputStyle}
                  placeholder="Enter Category"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <button type="button" style={iconBtnStyle(primary)} onClick={handleAddCategory} aria-label="Add category">
                  <Plus size={18} color="#fff" />
                </button>
              </div>
              {categories.map((category) => (
                <div key={category.id} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      ...inputStyle,
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'default',
                    }}
                  >
                    {category.name}
                  </div>
                  <button
                    type="button"
                    style={iconBtnStyle(`${errorColor}15`)}
                    onClick={() => handleRemoveCategory(category.id)}
                    aria-label="Remove category"
                  >
                    <Trash2 size={18} color={errorColor} />
                  </button>
                </div>
              ))}
            </section>

            <section style={sectionStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: textPrimary, margin: 0 }}>Manage Connection</h2>
                <button type="button" style={pillButtonStyle} onClick={() => setListModal('connection')}>
                  List
                </button>
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <input
                  style={inputStyle}
                  placeholder="Enter Connection"
                  value={connectionInput}
                  onChange={(e) => setConnectionInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddConnection()}
                />
                <button type="button" style={iconBtnStyle(primary)} onClick={handleAddConnection} aria-label="Add connection">
                  <Plus size={18} color="#fff" />
                </button>
              </div>
              {connections.map((connection) => (
                <div key={connection.id} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', cursor: 'default' }}>
                    {connection.name}
                  </div>
                  <button
                    type="button"
                    style={iconBtnStyle(`${errorColor}15`)}
                    onClick={() => handleRemoveConnection(connection.id)}
                    aria-label="Remove connection"
                  >
                    <Trash2 size={18} color={errorColor} />
                  </button>
                </div>
              ))}
            </section>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 12,
                border: `1.5px solid ${borderColor}`,
                background: cardBackground,
                color: errorColor,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: 24,
              }}
            >
              LOGOUT
            </button>
          </>
        )}
      </div>

      <AdminListModal
        open={listModal === 'category'}
        onClose={() => setListModal(null)}
        title="Categories"
        items={categories}
        itemType="category"
        onDeleteItem={handleRemoveCategory}
        onDeleteAll={handleDeleteAllCategories}
        colors={{ textPrimary, textSecondary, border: borderColor, surface: cardBackground }}
      />
      <AdminListModal
        open={listModal === 'connection'}
        onClose={() => setListModal(null)}
        title="Connections"
        items={connections}
        itemType="connection"
        onDeleteItem={handleRemoveConnection}
        onDeleteAll={handleDeleteAllConnections}
        colors={{ textPrimary, textSecondary, border: borderColor, surface: cardBackground }}
      />
    </div>
  );
};

export default AdminSettingsScreen;
