import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    User, 
    Bell, 
    Lock, 
    Tag, 
    Database, 
    Info,
    MessageSquare,
    LogOut, 
    Moon,
    Sun,
    Mail,
    Shield,
    Globe,
    Volume2,
    VolumeX,
    Clock,
    CheckCircle,
    Loader2,
} from "lucide-react";
import { useTheme } from "../../theme/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useUIFeedback } from "../../components/ui/UIFeedback";
import { getNotificationPreferences, patchNotificationPreferences } from "../../utils/Service/api";
import { SkeletonPageBlocks } from "../../components/skeletons/SkeletonLayouts";
import FeedbackModal from "../../components/FeedbackModal";
import { useLanguage } from "../../context/LanguageContext";

export default function SettingsScreen() {
    const { theme, toggleTheme } = useTheme();
    const { colors } = theme;
    const { logout } = useAuth();
    const { confirm } = useUIFeedback();
    const { t, setLanguage } = useLanguage();
    const navigate = useNavigate();
    const darkTheme = theme.mode === "dark";

    // Load settings from localStorage
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('userSettings');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            pushNotifications: true,
            emailNotifications: false,
            keywordAlerts: true,
            quietHours: false,
            quietHoursStart: '22:00',
            quietHoursEnd: '08:00',
            language: 'English',
            timezone: 'UTC',
        };
    });

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [prefsLoading, setPrefsLoading] = useState(true);
    const [appFeedbackOpen, setAppFeedbackOpen] = useState(false);

    // Save settings to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('userSettings', JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        (async () => {
            try {
                const p = await getNotificationPreferences();
                setSettings((prev) => ({
                    ...prev,
                    pushNotifications: !!p.push_enabled,
                    emailNotifications: !!p.email_enabled,
                    keywordAlerts: !!p.keyword_alerts,
                }));
            } catch {
                /* keep local defaults */
            } finally {
                setPrefsLoading(false);
            }
        })();
    }, []);

    const handleToggle = (key) => {
        setIsSaving(true);
        const serverKey =
            key === 'pushNotifications'
                ? 'push_enabled'
                : key === 'emailNotifications'
                  ? 'email_enabled'
                  : key === 'keywordAlerts'
                    ? 'keyword_alerts'
                    : null;
        setSettings((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            if (serverKey) {
                patchNotificationPreferences({ [serverKey]: next[key] }).catch(() => {});
            }
            return next;
        });
        setTimeout(() => {
            setIsSaving(false);
            setShowSaveSuccess(true);
            setTimeout(() => setShowSaveSuccess(false), 2000);
        }, 450);
    };

    const handleSelectChange = (key, value) => {
        setIsSaving(true);
        if (key === 'language') {
            setLanguage(value);
        }
        setSettings(prev => ({ ...prev, [key]: value }));
        setTimeout(() => {
            setIsSaving(false);
            setShowSaveSuccess(true);
            setTimeout(() => setShowSaveSuccess(false), 2000);
        }, 450);
    };

    const handleLogout = async () => {
        const shouldLogout = await confirm({
            title: t('settings.logOutConfirmTitle'),
            message: t('settings.logOutConfirmMessage'),
            confirmText: t('settings.logOutConfirm'),
            danger: true,
        });
        if (shouldLogout) {
            // Clear user data
            localStorage.removeItem('userProfile');
            localStorage.removeItem('userAvatar');
            localStorage.removeItem('bookmarks');
            logout();
            navigate('/login');
        }
    };

    const SettingsRow = ({ 
        icon, 
        label, 
        description,
        onPress, 
        switchEnabled, 
        switchValue, 
        onSwitchChange, 
        labelColor,
        selectEnabled,
        selectValue,
        selectOptions,
        onSelectChange
    }) => (
        <div
            onClick={onPress}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                cursor: onPress ? 'pointer' : 'default',
                width: '100%',
                borderBottom: `1px solid ${borderColor}`,
                transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
                if (onPress) {
                    e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                }
            }}
            onMouseLeave={(e) => {
                if (onPress) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                }
            }}
        >
                    <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12,
                flex: 1,
            }}>
                {icon}
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: labelColor || textPrimary,
                        marginBottom: description ? '4px' : '0',
                    }}>
                        {label}
                    </div>
                    {description && (
                        <div style={{
                            fontSize: '13px',
                            color: textSecondary,
                        }}>
                            {description}
                        </div>
                    )}
                </div>
            </div>
            {switchEnabled && (
                <div
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSwitchChange();
                    }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                    }}
                    style={{
                        position: 'relative',
                        width: '44px',
                        height: '24px',
                        borderRadius: '12px',
                        backgroundColor: switchValue ? colors.primary : (darkTheme ? colors.surfaceElevated : colors.border),
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: '2px',
                        left: switchValue ? '22px' : '2px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: colors.surface,
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                    }} />
                </div>
            )}
            {selectEnabled && (
                <select
                    value={selectValue}
                    onChange={(e) => onSelectChange(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        padding: '6px 12px',
                        border: `1px solid ${borderColor}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: textPrimary,
                        backgroundColor: cardBackground,
                        cursor: 'pointer',
                        outline: 'none',
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = borderColor;
                    }}
                >
                    {selectOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );

    const SettingsSection = ({ title, description, children }) => (
        <div style={{
            backgroundColor: cardBackground,
            borderRadius: '12px',
            border: `1px solid ${borderColor}`,
            marginBottom: '20px',
            overflow: 'hidden',
        }}>
                    {(title || description) && (
                <div style={{
                    padding: '20px 20px 12px 20px',
                    borderBottom: `1px solid ${borderColor}`,
                }}>
                    {title && (
                        <div style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: textPrimary,
                            marginBottom: description ? '4px' : '0',
                        }}>
                            {title}
                        </div>
                    )}
                    {description && (
                        <div style={{
                            fontSize: '13px',
                            color: textSecondary,
                        }}>
                            {description}
                        </div>
                    )}
                </div>
            )}
            <div>
                {children}
            </div>
        </div>
    );

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
                maxWidth: '800px',
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
                        {t('settings.title')}
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: textSecondary,
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        {t('settings.subtitle')}
                    </p>
                </div>

                {prefsLoading ? (
                    <SkeletonPageBlocks isDark={darkTheme} colors={colors} minHeight="560px" />
                ) : (
                <>
                {/* Save Success Message */}
                {isSaving && (
                    <div style={{
                        padding: '12px 16px',
                        backgroundColor: colors.backgroundSecondary,
                        border: `1px solid ${borderColor}`,
                        borderRadius: '8px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                    }}>
                        <Loader2 size={16} color={textSecondary} style={{ animation: 'spin 0.8s linear infinite' }} />
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: textSecondary,
                        }}>
                            {t('settings.saving')}
                        </span>
                    </div>
                )}
                {showSaveSuccess && !isSaving && (
                    <div style={{
                        padding: '12px 16px',
                        backgroundColor: darkTheme ? '#064E3B' : '#f0fdf4',
                        border: `1px solid ${darkTheme ? '#10b981' : '#86efac'}`,
                        borderRadius: '8px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                    }}>
                        <CheckCircle size={16} color="#10b981" />
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: darkTheme ? '#34D399' : '#166534',
                        }}>
                            {t('settings.saved')}
                        </span>
                    </div>
                )}

                {/* Account Section */}
                <SettingsSection title={t('settings.account')}>
                    <SettingsRow
                        icon={<User size={20} color={colors.textPrimary} />}
                        label={t('settings.profile')}
                        description={t('settings.profileDesc')}
                        onPress={() => navigate("/profile")}
                    />
                    <SettingsRow
                        icon={<User size={20} color={colors.textPrimary} />}
                        label={t('settings.editProfile')}
                        description={t('settings.editProfileDesc')}
                        onPress={() => navigate("/edit-profile")}
                    />
                </SettingsSection>

                <SettingsSection
                    title={t('settings.feedChannels')}
                    description={t('settings.feedChannelsDesc')}
                >
                    <SettingsRow
                        icon={<Tag size={20} color={colors.textPrimary} />}
                        label={t('settings.followingChannels')}
                        description={t('settings.followingChannelsDesc')}
                        onPress={() => navigate('/tag-selection', { state: { fromSettings: true } })}
                    />
                </SettingsSection>

                {/* Notifications Section */}
                <SettingsSection 
                    title={t('settings.notifications')}
                    description={t('settings.notificationsDesc')}
                >
                    <SettingsRow
                        icon={<Bell size={20} color={colors.textPrimary} />}
                        label={t('settings.pushNotifications')}
                        description={t('settings.pushNotificationsDesc')}
                        switchEnabled
                        switchValue={settings.pushNotifications}
                        onSwitchChange={() => handleToggle('pushNotifications')}
                    />
                    <SettingsRow
                        icon={<Mail size={20} color={colors.textPrimary} />}
                        label={t('settings.emailNotifications')}
                        description={t('settings.emailNotificationsDesc')}
                        switchEnabled
                        switchValue={settings.emailNotifications}
                        onSwitchChange={() => handleToggle('emailNotifications')}
                    />
                    <SettingsRow
                        icon={<Tag size={20} color={colors.textPrimary} />}
                        label={t('settings.keywordAlerts')}
                        description={t('settings.keywordAlertsDesc')}
                        switchEnabled
                        switchValue={settings.keywordAlerts}
                        onSwitchChange={() => handleToggle('keywordAlerts')}
                    />
                    <SettingsRow
                        icon={<Clock size={20} color={colors.textPrimary} />}
                        label={t('settings.quietHours')}
                        description={t('settings.quietHoursDesc')}
                        switchEnabled
                        switchValue={settings.quietHours}
                        onSwitchChange={() => handleToggle('quietHours')}
                    />
                    {settings.quietHours && (
                        <div style={{
                            padding: '16px 20px',
                            backgroundColor: darkTheme ? '#334155' : '#f9fafb',
                            borderTop: `1px solid ${borderColor}`,
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center',
                        }}>
                            <input
                                type="time"
                                value={settings.quietHoursStart}
                                onChange={(e) => handleSelectChange('quietHoursStart', e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    backgroundColor: cardBackground,
                                    color: textPrimary,
                                }}
                            />
                            <span style={{ color: textSecondary }}>{t('settings.to')}</span>
                            <input
                                type="time"
                                value={settings.quietHoursEnd}
                                onChange={(e) => handleSelectChange('quietHoursEnd', e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    backgroundColor: cardBackground,
                                    color: textPrimary,
                                }}
                            />
                        </div>
                    )}
                </SettingsSection>

                {/* Privacy & Security */}
                <SettingsSection title={t('settings.privacy')}>
                    <SettingsRow
                        icon={<Lock size={20} color={colors.textPrimary} />}
                        label={t('settings.privacy')}
                        description={t('settings.privacyDesc')}
                        onPress={() => navigate("/privacy")}
                    />
                    <SettingsRow
                        icon={<Shield size={20} color={colors.textPrimary} />}
                        label={t('settings.dataStorage')}
                        description={t('settings.dataStorageDesc')}
                        onPress={() => navigate("/data")}
                    />
                </SettingsSection>

                {/* Content */}
                <SettingsSection title={t('settings.content')}>
                    <SettingsRow
                        icon={<Tag size={20} color={colors.textPrimary} />}
                        label={t('settings.manageCategories')}
                        description={t('settings.manageCategoriesDesc')}
                        onPress={() => navigate("/tag-selection?fromSettings=1", { state: { fromSettings: true } })}
                    />
                </SettingsSection>

                {/* Preferences */}
                <SettingsSection title={t('settings.preferences')}>
                    <SettingsRow
                        icon={darkTheme ? <Sun size={20} color={colors.textPrimary} /> : <Moon size={20} color={colors.textPrimary} />}
                        label={darkTheme ? t('settings.lightMode') : t('settings.darkMode')}
                        description={t('settings.themeDesc')}
                        onPress={toggleTheme}
                    />
                    <SettingsRow
                        icon={<Globe size={20} color={colors.textPrimary} />}
                        label={t('settings.language')}
                        description={t('settings.languageDesc')}
                        selectEnabled
                        selectValue={settings.language}
                        selectOptions={[
                            { value: 'English', label: 'English' },
                            { value: 'Spanish', label: 'Spanish' },
                            { value: 'French', label: 'French' },
                            { value: 'German', label: 'German' },
                            { value: 'Urdu', label: 'Urdu' },
                        ]}
                        onSelectChange={(value) => handleSelectChange('language', value)}
                    />
                    <SettingsRow
                        icon={<Clock size={20} color={colors.textPrimary} />}
                        label={t('settings.timezone')}
                        description={t('settings.timezoneDesc')}
                        selectEnabled
                        selectValue={settings.timezone}
                        selectOptions={[
                            { value: 'UTC', label: 'UTC' },
                            { value: 'EST', label: 'Eastern Time' },
                            { value: 'PST', label: 'Pacific Time' },
                            { value: 'PKT', label: 'Pakistan Time' },
                            { value: 'IST', label: 'India Time' },
                        ]}
                        onSelectChange={(value) => handleSelectChange('timezone', value)}
                    />
                </SettingsSection>

                {/* About */}
                <SettingsSection title={t('settings.aboutSection')}>
                    <SettingsRow
                        icon={<MessageSquare size={20} color={colors.textPrimary} />}
                        label={t('settings.sendFeedback')}
                        description={t('settings.sendFeedbackDesc')}
                        onPress={() => setAppFeedbackOpen(true)}
                    />
                    <SettingsRow
                        icon={<Info size={20} color={colors.textPrimary} />}
                        label={t('settings.aboutTrak')}
                        description={t('settings.aboutTrakDesc')}
                        onPress={() => navigate("/about")}
                    />
                </SettingsSection>

                {/* Logout */}
                <SettingsSection>
                    <SettingsRow
                        icon={<LogOut size={20} color="#ef4444" />}
                        label={t('settings.logOut')}
                        description={t('settings.logOutDesc')}
                        labelColor="#ef4444"
                        onPress={handleLogout}
                    />
                </SettingsSection>
                </>
                )}
            </div>
            <FeedbackModal
                open={appFeedbackOpen}
                onClose={() => setAppFeedbackOpen(false)}
                type="app_feedback"
                title="Send app feedback"
            />
        </div>
    );
}
