import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdminTheme } from '../useAdminTheme';
import { useAuth } from '../../../context/AuthContext';
import Text from '../../../components/ui/Text';
import TrakLogo from '../../../components/TrakLogo';

const Header = () => {
  const { palette } = useAdminTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const email = user?.email || '';
  const roleLabel = user?.is_super_admin ? 'Super Admin' : 'Administrator';
  const initial = email ? email.charAt(0).toUpperCase() : 'A';

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
      <View style={styles.headerContent}>
        <TrakLogo size={32} showContainer />
        <View style={styles.titleBlock}>
          <Text variant="subtitle" color={palette.textPrimary} style={{ fontWeight: '700' }}>
            TRAK Admin
          </Text>
          <Text variant="caption" style={{ color: palette.textTertiary, marginTop: 2 }}>
            News operations
          </Text>
        </View>
        {email ? (
          <View style={styles.userBlock}>
            <View style={[styles.avatar, { backgroundColor: `${palette.primary}20` }]}>
              <Text variant="caption" color={palette.primary} style={{ fontWeight: '800' }}>
                {initial}
              </Text>
            </View>
            <View style={styles.userText}>
              <Text variant="caption" color={palette.textPrimary} style={{ fontWeight: '600' }} numberOfLines={1}>
                {email}
              </Text>
              <Text variant="caption" color={palette.textTertiary}>
                {roleLabel}
              </Text>
            </View>
          </View>
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    alignItems: 'flex-start',
  },
  userBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '42%',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userText: {
    flex: 1,
    minWidth: 0,
  },
});

export default Header;
