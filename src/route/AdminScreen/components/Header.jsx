import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdminTheme } from '../useAdminTheme';
import { useAuth } from '../../../context/AuthContext';
import Text from '../../../components/ui/Text';
import TrakLogo from '../../../components/TrakLogo';

const TAB_LABELS = {
  overview: 'Overview',
  users: 'Users',
  admins: 'Admins',
  articles: 'Articles',
  feedback: 'Feedback',
  notifications: 'Notifications',
  settings: 'Settings',
};

function displayNameFromEmail(email) {
  const local = String(email || '').split('@')[0] || 'Admin';
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const Header = ({ activeTab = 'overview' }) => {
  const { palette } = useAdminTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const email = user?.email || '';
  const roleLabel = user?.is_super_admin ? 'Super Admin' : 'Administrator';
  const displayName = displayNameFromEmail(email);
  const initial = displayName.charAt(0).toUpperCase() || 'A';
  const sectionLabel = TAB_LABELS[activeTab] || 'Admin';

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: palette.card,
          borderBottomColor: palette.border,
          paddingTop: Math.max(insets.top, 12),
        },
      ]}
    >
      <View style={styles.userRow}>
        <View style={[styles.avatar, { backgroundColor: `${palette.primary}22` }]}>
          <Text variant="subtitle" color={palette.primary} style={{ fontWeight: '800' }}>
            {initial}
          </Text>
        </View>
        <View style={styles.userMeta}>
          <Text variant="subtitle" color={palette.textPrimary} style={{ fontWeight: '700' }} numberOfLines={1}>
            {displayName}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: palette.navActiveBg, borderColor: palette.border }]}>
            <Text variant="caption" color={palette.textSecondary} style={{ fontWeight: '600' }}>
              {roleLabel}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.brandRow}>
        <TrakLogo size={24} showContainer />
        <View style={{ flex: 1 }}>
          <Text variant="caption" color={palette.textPrimary} style={{ fontWeight: '700' }}>
            TRAK Admin
          </Text>
          <Text variant="caption" color={palette.textTertiary}>
            {sectionLabel} · News operations
          </Text>
        </View>
        {email ? (
          <Text variant="caption" color={palette.textTertiary} numberOfLines={1} style={{ maxWidth: '40%' }}>
            {email}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 12,
  },
  userMeta: { flex: 1, minWidth: 0 },
  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Header;
