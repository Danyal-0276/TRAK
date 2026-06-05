import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminTheme } from './useAdminTheme';
import AdminPageLayout from './components/AdminPageLayout';
import AdminPageHeader from './components/AdminPageHeader';
import { useAdminPageMeta } from './adminPageMeta';
import { getAdminSettings, patchAdminSettings, createAdminCategory, deleteAdminCategory, addAdminSubcategory, deleteAdminSubcategory, createAdminConnection, deleteAdminConnection } from '../../api/adminApi';
import { normAdminCategories, normAdminConnections } from '../../utils/adminLists';
import { useUIFeedback } from '../../components/ui/UIFeedback';
import { SkeletonPageBlocks } from '../../components/skeletons/SkeletonLayouts';
import AdminSettingRow from './components/AdminSettingRow';
import AdminToggle from './components/AdminToggle';
import AdminListPanel from './components/AdminListPanel';
import AdminCategorySelect from './components/AdminCategorySelect';
import AdminAnimatedSelect from './components/AdminAnimatedSelect';

const LANGUAGE_OPTIONS = ['English', 'Urdu', 'Arabic', 'French', 'Spanish'];
const TIMEZONE_OPTIONS = ['UTC', 'Asia/Karachi', 'Asia/Dubai', 'Europe/London', 'America/New_York'];
const REGION_SELECT_WIDTH = 240;
const regionSelectWrapStyle = { width: REGION_SELECT_WIDTH, maxWidth: '100%', flexShrink: 0 };

const AdminSettingsScreen = () => {
  const { palette, isDark, colors } = useAdminTheme();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [connectionUrlInput, setConnectionUrlInput] = useState('');
  const [subInputs, setSubInputs] = useState({});
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [listPanel, setListPanel] = useState(null);

  const cardBackground = palette.card;
  const inputBg = palette.inputBg;
  const textPrimary = palette.textPrimary;
  const textSecondary = palette.textSecondary;
  const borderColor = palette.border;
  const primary = palette.primary;
  const errorColor = palette.error;
  const primaryButtonBg = palette.buttonPrimaryBg || primary;
  const primaryButtonText = palette.buttonPrimaryText || '#ffffff';
  const secondaryButtonBg = palette.buttonSecondaryBg || 'transparent';
  const secondaryButtonText = palette.buttonSecondaryText || textPrimary;
  const secondaryButtonBorder = palette.buttonSecondaryBorder || borderColor;

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
      const cats = normAdminCategories(s.categories || []);
      setCategories(cats);
      setConnections(normAdminConnections(s.connections || []));
      setSelectedCategorySlug((prev) => (prev && cats.some((c) => c.slug === prev) ? prev : ''));
      return cats;
    } catch {
      showError('Could not load admin settings.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (loading || location.hash !== '#admin-sources') return;
    const el = document.getElementById('admin-sources');
    if (el) {
      window.requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [loading, location.hash]);

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
      await createAdminCategory(name, []);
      setCategoryInput('');
      const cats = await load();
      const added = cats.find((c) => c.name.toLowerCase() === name.toLowerCase());
      if (added) setSelectedCategorySlug(added.slug);
      success('Category added.');
    } catch (e) {
      showError(e?.message || 'Failed.');
    }
  };

  const handleRemoveCategory = async (slug) => {
    try {
      await deleteAdminCategory(slug);
      await load();
      setSelectedCategorySlug((prev) => (prev === slug ? '' : prev));
    } catch (e) {
      showError(e?.message || 'Failed.');
    }
  };

  const selectedCategory = categories.find((c) => c.slug === selectedCategorySlug) || null;

  const handleAddSubcategory = async (categorySlug) => {
    const name = String(subInputs[categorySlug] || '').trim();
    if (!name) return;
    try {
      await addAdminSubcategory(categorySlug, name);
      setSubInputs((prev) => ({ ...prev, [categorySlug]: '' }));
      await load();
      success('Subcategory added.');
    } catch (e) {
      showError(e?.message || 'Failed.');
    }
  };

  const handleRemoveSubcategory = async (categorySlug, subSlug) => {
    try {
      await deleteAdminSubcategory(categorySlug, subSlug);
      await load();
    } catch (e) {
      showError(e?.message || 'Failed.');
    }
  };

  const handleAddConnection = async () => {
    const name = connectionInput.trim();
    const url = connectionUrlInput.trim();
    if (!name) return;
    if (!url) {
      showError('URL is required (RSS feed or site feed URL).');
      return;
    }
    try {
      await createAdminConnection(name, url);
      setConnectionInput('');
      setConnectionUrlInput('');
      await load();
      success('Connection added.');
    } catch (e) {
      showError(e?.message || 'Failed.');
    }
  };

  const handleRemoveConnection = async (slug) => {
    try {
      await deleteAdminConnection(slug);
      await load();
    } catch (e) {
      showError(e?.message || 'Failed.');
    }
  };

  const handleDeleteAllCategories = async () => {
    try {
      await patchAdminSettings({ categories: [] });
      await load();
      setListPanel(null);
    } catch (e) {
      showError(e?.message || 'Failed.');
    }
  };

  const handleDeleteAllConnections = async () => {
    try {
      await patchAdminSettings({ connections: [] });
      await load();
      setListPanel(null);
    } catch (e) {
      showError(e?.message || 'Failed.');
    }
  };

  const toggleListPanel = (key) => {
    setListPanel((prev) => (prev === key ? null : key));
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
    border: `1px solid ${secondaryButtonBorder}`,
    background: primaryButtonBg,
    color: primaryButtonText,
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

  const selectColors = {
    inputBg,
    cardBackground,
    borderColor,
    textPrimary,
    textSecondary,
    primary,
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

  const { title, description } = useAdminPageMeta();

  return (
    <AdminPageLayout maxWidth="720px">
      <AdminPageHeader title={title} description={description} />
      <div className="admin-page-body">
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
                <div style={regionSelectWrapStyle}>
                  <AdminAnimatedSelect
                    inputId="admin-language-select"
                    ariaLabel="Select language"
                    placeholder="Choose a language"
                    value={settings.language}
                    onChange={(language) => handleSettingsChange({ language })}
                    options={LANGUAGE_OPTIONS}
                    colors={selectColors}
                    isDark={isDark}
                    selectWidth={REGION_SELECT_WIDTH}
                  />
                </div>
              </AdminSettingRow>
              <AdminSettingRow label="Timezone" borderColor={borderColor} textPrimary={textPrimary}>
                <div style={regionSelectWrapStyle}>
                  <AdminAnimatedSelect
                    inputId="admin-timezone-select"
                    ariaLabel="Select timezone"
                    placeholder="Choose a timezone"
                    value={settings.timezone}
                    onChange={(timezone) => handleSettingsChange({ timezone })}
                    options={TIMEZONE_OPTIONS}
                    colors={selectColors}
                    isDark={isDark}
                    isSearchable
                    selectWidth={REGION_SELECT_WIDTH}
                  />
                </div>
              </AdminSettingRow>
            </section>

            <section style={sectionStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: textPrimary, margin: 0 }}>Manage Category</h2>
                <button
                  type="button"
                  style={{
                    ...pillButtonStyle,
                    background: listPanel === 'category' ? secondaryButtonBg : primaryButtonBg,
                    color: listPanel === 'category' ? secondaryButtonText : primaryButtonText,
                  }}
                  onClick={() => toggleListPanel('category')}
                >
                  {listPanel === 'category' ? 'Hide list' : 'List'}
                </button>
              </div>
              <AdminListPanel
                open={listPanel === 'category'}
                onClose={() => setListPanel(null)}
                title="All categories"
                items={categories}
                itemType="category"
                onDeleteItem={handleRemoveCategory}
                onDeleteAll={handleDeleteAllCategories}
                colors={{
                  textPrimary,
                  textSecondary,
                  border: borderColor,
                  panelBg: inputBg,
                  error: errorColor,
                }}
              />
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <input
                  style={inputStyle}
                  placeholder="Enter Category"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <button type="button" style={iconBtnStyle(primary)} onClick={handleAddCategory} aria-label="Add category">
                  <Plus size={18} color={primaryButtonText} />
                </button>
              </div>
              {categories.length > 0 ? (
                <>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: textSecondary, marginBottom: 8 }}>
                    Select category
                  </label>
                  <div style={{ marginBottom: 16, width: '100%' }}>
                    <AdminCategorySelect
                      categories={categories}
                      value={selectedCategorySlug}
                      onChange={setSelectedCategorySlug}
                      isDark={isDark}
                      colors={selectColors}
                    />
                  </div>

                  {selectedCategory ? (
                    <div
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        border: `1px solid ${borderColor}`,
                        backgroundColor: inputBg,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                        <div style={{ flex: 1, fontSize: 15, fontWeight: 700, color: textPrimary }}>
                          {selectedCategory.name}
                        </div>
                        <button
                          type="button"
                          style={iconBtnStyle(`${errorColor}15`)}
                          onClick={() => handleRemoveCategory(selectedCategory.slug)}
                          aria-label="Remove category"
                        >
                          <Trash2 size={18} color={errorColor} />
                        </button>
                      </div>
                      <p style={{ margin: '0 0 10px 0', fontSize: 13, color: textSecondary }}>Subcategories</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, minHeight: 32 }}>
                        {(selectedCategory.subcategories || []).length ? (
                          selectedCategory.subcategories.map((sub) => (
                            <span
                              key={sub.id}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '6px 10px',
                                borderRadius: 8,
                                backgroundColor: cardBackground,
                                border: `1px solid ${borderColor}`,
                                fontSize: 13,
                                color: textPrimary,
                              }}
                            >
                              {sub.name}
                              <button
                                type="button"
                                onClick={() => handleRemoveSubcategory(selectedCategory.slug, sub.slug)}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                                aria-label={`Remove ${sub.name}`}
                              >
                                <X size={14} color={textSecondary} />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: 13, color: textSecondary }}>No subcategories yet.</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          style={{ ...inputStyle, fontSize: 14, backgroundColor: cardBackground }}
                          placeholder="Add subcategory"
                          value={subInputs[selectedCategory.slug] || ''}
                          onChange={(e) =>
                            setSubInputs((prev) => ({ ...prev, [selectedCategory.slug]: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === 'Enter' && handleAddSubcategory(selectedCategory.slug)}
                        />
                        <button
                          type="button"
                          style={iconBtnStyle(primary)}
                          onClick={() => handleAddSubcategory(selectedCategory.slug)}
                          aria-label="Add subcategory"
                        >
                          <Plus size={16} color={primaryButtonText} />
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <p style={{ margin: 0, fontSize: 14, color: textSecondary }}>No categories yet. Add one above.</p>
              )}
            </section>

            <section id="admin-sources" style={sectionStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: textPrimary, margin: 0 }}>Manage Connection</h2>
                  <p style={{ margin: '6px 0 0 0', fontSize: 13, color: textSecondary }}>
                    News scrape sources (RSS feeds and built-in sites). Used when running the RSS scraper.
                  </p>
                </div>
                <button
                  type="button"
                  style={{
                    ...pillButtonStyle,
                    background: listPanel === 'connection' ? secondaryButtonBg : primaryButtonBg,
                    color: listPanel === 'connection' ? secondaryButtonText : primaryButtonText,
                  }}
                  onClick={() => toggleListPanel('connection')}
                >
                  {listPanel === 'connection' ? 'Hide list' : 'List'}
                </button>
              </div>
              <AdminListPanel
                open={listPanel === 'connection'}
                onClose={() => setListPanel(null)}
                title="All connections"
                items={connections}
                itemType="connection"
                onDeleteItem={handleRemoveConnection}
                onDeleteAll={handleDeleteAllConnections}
                colors={{
                  textPrimary,
                  textSecondary,
                  border: borderColor,
                  panelBg: inputBg,
                  error: errorColor,
                }}
              />
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <input
                  style={inputStyle}
                  placeholder="Connection name"
                  value={connectionInput}
                  onChange={(e) => setConnectionInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddConnection()}
                />
                <input
                  style={{ ...inputStyle, maxWidth: 280 }}
                  placeholder="RSS / feed URL (required)"
                  value={connectionUrlInput}
                  onChange={(e) => setConnectionUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddConnection()}
                />
                <button type="button" style={iconBtnStyle(primary)} onClick={handleAddConnection} aria-label="Add connection">
                  <Plus size={18} color={primaryButtonText} />
                </button>
              </div>
              {connections.length === 0 && listPanel !== 'connection' ? (
                <p style={{ margin: '12px 0 0 0', fontSize: 14, color: textSecondary }}>
                  No sources yet. Open List or add an RSS feed above.
                </p>
              ) : null}
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
    </AdminPageLayout>
  );
};

export default AdminSettingsScreen;
