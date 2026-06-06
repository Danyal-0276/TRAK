import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resolveTopInset } from '../../utils/screenSafeArea';
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
  FileText,
  Mail,
  MessageSquare,
  Image,
  Hash,
  Sparkles,
} from 'lucide-react-native';
import { getNotificationPreferences, patchNotificationPreferences } from '../../api/notificationsApi';

import SettingsHeader from './components/SettingsHeader';
import SettingsSection from './components/SettingsSection';
import SettingsRow from './components/SettingsRow';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../components/ui/FeedbackProvider';
import Text from '../../components/ui/Text';
import { resetTabBarVisibility } from '../../navigation/tabBarVisibility';
import FeedbackModal from '../../components/FeedbackModal';

const ICON_SIZE = 18;

export default function SettingsScreen({ navigation, route }) {
  const embeddedInTab = Boolean(route?.params?.embeddedInTab);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [keywordAlerts, setKeywordAlerts] = useState(true);
  const [quietHours, setQuietHours] = useState(false);
  const [appFeedbackOpen, setAppFeedbackOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { colors, spacing } = theme;
  const { logout } = useAuth();
  const { confirm } = useFeedback();
  const darkTheme = theme.mode === 'dark';
  const insets = useSafeAreaInsets();
  const iconColor = colors.primary || colors.textPrimary;

  const openContentScreen = (routeName, params = {}) => {
    navigation.navigate(routeName, params);
  };

  useEffect(() => {
    resetTabBarVisibility();
    return () => resetTabBarVisibility();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const p = await getNotificationPreferences();
        setPushEnabled(!!p.push_enabled);
        setEmailEnabled(!!p.email_enabled);
        setKeywordAlerts(!!p.keyword_alerts);
      } catch {
        /* defaults */
      }
    })();
  }, []);

  const topInset = resolveTopInset(insets, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />

      <SettingsHeader navigation={navigation} embeddedInTab={embeddedInTab} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingHorizontal: spacing.md,
            paddingTop: spacing.md,
            paddingBottom: insets.bottom + spacing.xxl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.hero,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderLight,
            },
          ]}
        >
          <View style={[styles.heroIcon, { backgroundColor: `${iconColor}18` }]}>
            <Sparkles size={22} color={iconColor} strokeWidth={2} />
          </View>
          <View style={styles.heroText}>
            <Text variant="subtitle" color={colors.textPrimary} style={styles.heroTitle}>
              Your TRAK experience
            </Text>
            <Text variant="caption" color={colors.textSecondary} style={styles.heroSubtitle}>
              Tune alerts, topics, and how the app looks on this device.
            </Text>
          </View>
        </View>

        <SettingsSection title="Account">
          <SettingsRow
            icon={<User size={ICON_SIZE} color={iconColor} strokeWidth={2.25} />}
            label="Profile"
            subtitle="View and edit your account"
            onPress={() => navigation.navigate('ProfileScreen')}
          />
        </SettingsSection>

        <SettingsSection
          title="Content"
          description="Categories and keywords shape your feed and alerts."
        >
          <SettingsRow
            icon={<Tag size={ICON_SIZE} color={iconColor} strokeWidth={2.25} />}
            label="Browse categories"
            subtitle="Explore articles by topic"
            onPress={() => navigation.navigate('NewsFeed', { screen: 'BrowseCategories' })}
          />
          <SettingsRow
            icon={<Tag size={ICON_SIZE} color={iconColor} strokeWidth={2.25} />}
            label="Manage categories"
            subtitle="Topics you follow"
            onPress={() => openContentScreen('SettingsTagSelection', { fromSettings: true })}
          />
          <SettingsRow
            icon={<Hash size={ICON_SIZE} color={iconColor} strokeWidth={2.25} />}
            label="Custom keywords"
            subtitle="Extra terms for matching articles"
            onPress={() =>
              openContentScreen('SettingsKeywordSelection', {
                fromSettings: true,
                selectedTags: [],
              })
            }
          />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsRow
            icon={<Bell size={ICON_SIZE} color={iconColor} strokeWidth={2.25} />}
            label="Push notifications"
            subtitle="Breaking and personalized alerts"
            switchEnabled
            switchValue={pushEnabled}
            onSwitchChange={async (v) => {
              setPushEnabled(v);
              try {
                await patchNotificationPreferences({ push_enabled: v });
              } catch {
                setPushEnabled(!v);
              }
            }}
          />
          <SettingsRow
            icon={<Mail size={ICON_SIZE} color={iconColor} strokeWidth={2.25} />}
            label="Email notifications"
            subtitle="Summaries and important updates"
            switchEnabled
            switchValue={emailEnabled}
            onSwitchChange={async (v) => {
              setEmailEnabled(v);
              try {
                await patchNotificationPreferences({ email_enabled: v });
              } catch {
                setEmailEnabled(!v);
              }
            }}
          />
          <SettingsRow
            icon={<Hash size={ICON_SIZE} color={iconColor} strokeWidth={2.25} />}
            label="Keyword alerts"
            subtitle="When new articles match your keywords"
            switchEnabled
            switchValue={keywordAlerts}
            onSwitchChange={async (v) => {
              setKeywordAlerts(v);
              try {
                await patchNotificationPreferences({ keyword_alerts: v });
              } catch {
                setKeywordAlerts(!v);
              }
            }}
          />
          <SettingsRow
            icon={<Moon size={ICON_SIZE} color={iconColor} strokeWidth={2.25} />}
            label="Quiet hours"
            subtitle="Pause non-urgent alerts (coming soon)"
            switchEnabled
            switchValue={quietHours}
            onSwitchChange={setQuietHours}
          />
        </SettingsSection>

        <SettingsSection title="Privacy & legal">
          <SettingsRow
            icon={<Lock size={ICON_SIZE} color={iconColor} strokeWidth={2.25} />}
            label="Privacy & security"
            onPress={() => navigation.navigate('PrivacyScreen')}
          />
          <SettingsRow
            icon={<FileText size={ICON_SIZE} color={iconColor} strokeWidth={2.25} />}
            label="Terms of service"
            onPress={() => navigation.getParent()?.navigate('TermsScreen')}
          />
        </SettingsSection>

        <SettingsSection title="App">
          <SettingsRow
            icon={darkTheme ? <Sun size={ICON_SIZE} color={iconColor} strokeWidth={2.25} /> : <Moon size={ICON_SIZE} color={iconColor} strokeWidth={2.25} />}
            label="Appearance"
            subtitle={darkTheme ? 'Dark mode on' : 'Light mode on'}
            onPress={toggleTheme}
            trailing={
              <Text variant="caption" color={colors.textSecondary} style={styles.trailingPill}>
                {darkTheme ? 'Dark' : 'Light'}
              </Text>
            }
          />
          <SettingsRow
            icon={<Database size={ICON_SIZE} color={iconColor} strokeWidth={2.25} />}
            label="Data & storage"
            onPress={() => navigation.navigate('DataScreen')}
          />
          <SettingsRow
            icon={<Image size={ICON_SIZE} color={iconColor} strokeWidth={2.25} />}
            label="Pics"
            subtitle="Image-first discovery feed"
            onPress={() => navigation.getParent()?.navigate('Pics')}
          />
          <SettingsRow
            icon={<MessageSquare size={ICON_SIZE} color={iconColor} strokeWidth={2.25} />}
            label="Send feedback"
            onPress={() => setAppFeedbackOpen(true)}
          />
          <SettingsRow
            icon={<Info size={ICON_SIZE} color={iconColor} strokeWidth={2.25} />}
            label="About TRAK"
            onPress={() => navigation.navigate('AboutScreen')}
          />
        </SettingsSection>

        <SettingsSection title="Session">
          <SettingsRow
            icon={<LogOut size={ICON_SIZE} color={colors.error || '#ef4444'} strokeWidth={2.25} />}
            label="Log out"
            subtitle="Sign out on this device"
            labelColor={colors.error || '#ef4444'}
            danger
            onPress={async () => {
              const accepted = await confirm({
                title: 'Log out',
                message: 'Are you sure you want to log out?',
                confirmText: 'Log out',
                danger: true,
              });
              if (!accepted) return;
              await logout();
            }}
          />
        </SettingsSection>
      </ScrollView>

      <FeedbackModal
        visible={appFeedbackOpen}
        onClose={() => setAppFeedbackOpen(false)}
        type="app_feedback"
        title="Send app feedback"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {},
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
    gap: 14,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  heroSubtitle: {
    marginTop: 4,
    lineHeight: 18,
  },
  trailingPill: {
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
