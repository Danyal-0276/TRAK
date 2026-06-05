import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdminTheme } from '../useAdminTheme';
import { useAuth } from '../../../context/AuthContext';
import { resolveTopInset } from '../../../utils/screenSafeArea';
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
  const navigation = useNavigation();
  const { palette } = useAdminTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const email = user?.email || '';
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
          paddingTop: resolveTopInset(insets, 8),
        },
      ]}
    >
      <View style={styles.row}>
        <TrakLogo size={28} showContainer />

        <View style={styles.titleBlock}>
          <Text variant="subtitle" color={palette.textPrimary} style={styles.sectionTitle} numberOfLines={1}>
            {sectionLabel}
          </Text>
          {displayName ? (
            <Text variant="caption" color={palette.textTertiary} numberOfLines={1}>
              {displayName}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.avatar, { backgroundColor: `${palette.primary}18` }]}
          onPress={() => navigation.navigate('ProfileScreen')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={email ? `${displayName}, ${email}` : displayName}
          accessibilityHint="Opens your profile"
        >
          <Text variant="caption" color={palette.primary} style={{ fontWeight: '800', fontSize: 13 }}>
            {initial}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    zIndex: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: -0.2,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Header;
