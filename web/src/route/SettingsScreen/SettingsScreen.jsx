import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    User, 
    Bell, 
    Lock, 
    Tag, 
    Database, 
    Info, 
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

export default function SettingsScreen() {
    const { theme, toggleTheme } = useTheme();
    const { colors } = theme;
    const { logout } = useAuth();
    const { confirm } = useUIFeedback();
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

    // Save settings to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('userSettings', JSON.stringify(settings));
    }, [settings]);

    const handleToggle = (key) => {
        setIsSaving(true);
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
        setTimeout(() => {
            setIsSaving(false);
            setShowSaveSuccess(true);
            setTimeout(() => setShowSaveSuccess(false), 2000);
        }, 450);
    };

    const handleSelectChange = (key, value) => {
        setIsSaving(true);
        setSettings(prev => ({ ...prev, [key]: value }));
        setTimeout(() => {
            setIsSaving(false);
            setShowSaveSuccess(true);
            setTimeout(() => setShowSaveSuccess(false), 2000);
        }, 450);
    };

    const handleLogout = async () => {
        const shouldLogout = await confirm({
            title: 'Log out?',
            message: 'Are you sure you want to log out?',
            confirmText: 'Log out',
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
                    e.currentTarget.style.backgroundColor = darkTheme ? '#334155' : '#f9fafb';
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
                        backgroundColor: switchValue ? (darkTheme ? '#818CF8' : '#0f172a') : (darkTheme ? '#334155' : '#e5e7eb'),
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
                        backgroundColor: '#ffffff',
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
                        e.target.style.borderColor = darkTheme ? '#818CF8' : '#0f172a';
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

    const backgroundColor = darkTheme ? colors.background || '#0F172A' : '#ffffff';
    const cardBackground = darkTheme ? colors.surface || '#1E293B' : '#ffffff';
    const textPrimary = darkTheme ? colors.textPrimary || '#F1F5F9' : '#0f172a';
    const textSecondary = darkTheme ? colors.textSecondary || '#CBD5E1' : '#64748b';
    const borderColor = darkTheme ? colors.border || '#334155' : '#e5e7eb';

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
                        Settings
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: textSecondary,
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        Manage your account settings and preferences
                    </p>
                </div>

                {/* Save Success Message */}
                {isSaving && (
                    <div style={{
                        padding: '12px 16px',
                        backgroundColor: darkTheme ? '#1e293b' : '#f8fafc',
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
                            Saving changes...
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
                            Settings saved successfully
                        </span>
                    </div>
                )}

                {/* Account Section */}
                <SettingsSection title="Account">
                    <SettingsRow
                        icon={<User size={20} color={colors.textPrimary || '#0f172a'} />}
                        label="Profile"
                        description="Edit your profile information"
                        onPress={() => navigate("/profile")}
                    />
                    <SettingsRow
                        icon={<User size={20} color={colors.textPrimary || '#0f172a'} />}
                        label="Edit Profile"
                        description="Update your name, bio, and other details"
                        onPress={() => navigate("/edit-profile")}
                    />
                </SettingsSection>

                {/* Notifications Section */}
                <SettingsSection 
                    title="Notifications"
                    description="Manage how you receive notifications"
                >
                    <SettingsRow
                        icon={<Bell size={20} color={colors.textPrimary || '#0f172a'} />}
                        label="Push Notifications"
                        description="Receive notifications in your browser"
                        switchEnabled
                        switchValue={settings.pushNotifications}
                        onSwitchChange={() => handleToggle('pushNotifications')}
                    />
                    <SettingsRow
                        icon={<Mail size={20} color={colors.textPrimary || '#0f172a'} />}
                        label="Email Notifications"
                        description="Get notified via email"
                        switchEnabled
                        switchValue={settings.emailNotifications}
                        onSwitchChange={() => handleToggle('emailNotifications')}
                    />
                    <SettingsRow
                        icon={<Tag size={20} color={colors.textPrimary || '#0f172a'} />}
                        label="Keyword Alerts"
                        description="Get notified when articles match your keywords"
                        switchEnabled
                        switchValue={settings.keywordAlerts}
                        onSwitchChange={() => handleToggle('keywordAlerts')}
                    />
                    <SettingsRow
                        icon={<Clock size={20} color={colors.textPrimary || '#0f172a'} />}
                        label="Quiet Hours"
                        description="Mute notifications during specific hours"
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
                            <span style={{ color: textSecondary }}>to</span>
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
                <SettingsSection title="Privacy & Security">
                    <SettingsRow
                        icon={<Lock size={20} color={colors.textPrimary || '#0f172a'} />}
                        label="Privacy & Security"
                        description="Manage your privacy settings"
                        onPress={() => navigate("/privacy")}
                    />
                    <SettingsRow
                        icon={<Shield size={20} color={colors.textPrimary || '#0f172a'} />}
                        label="Data & Storage"
                        description="View and manage your data"
                        onPress={() => navigate("/data")}
                    />
                </SettingsSection>

                {/* Content */}
                <SettingsSection title="Content">
                    <SettingsRow
                        icon={<Tag size={20} color={colors.textPrimary || '#0f172a'} />}
                        label="Manage Categories"
                        description="Customize your news categories"
                        onPress={() => navigate("/tag-selection?fromSettings=1", { state: { fromSettings: true } })}
                    />
                </SettingsSection>

                {/* Preferences */}
                <SettingsSection title="Preferences">
                    <SettingsRow
                        icon={darkTheme ? <Sun size={20} color={colors.textPrimary || '#0f172a'} /> : <Moon size={20} color={colors.textPrimary || '#0f172a'} />}
                        label={darkTheme ? "Light Mode" : "Dark Mode"}
                        description="Switch between light and dark theme"
                        onPress={toggleTheme}
                    />
                    <SettingsRow
                        icon={<Globe size={20} color={colors.textPrimary || '#0f172a'} />}
                        label="Language"
                        description="Choose your preferred language"
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
                        icon={<Clock size={20} color={colors.textPrimary || '#0f172a'} />}
                        label="Timezone"
                        description="Set your timezone"
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
                <SettingsSection title="About">
                    <SettingsRow
                        icon={<Info size={20} color={colors.textPrimary || '#0f172a'} />}
                        label="About TRAK"
                        description="Learn more about the app"
                        onPress={() => navigate("/about")}
                    />
                </SettingsSection>

                {/* Logout */}
                <SettingsSection>
                    <SettingsRow
                        icon={<LogOut size={20} color="#ef4444" />}
                        label="Log Out"
                        description="Sign out of your account"
                        labelColor="#ef4444"
                        onPress={handleLogout}
                    />
                </SettingsSection>
            </div>
        </div>
    );
}
