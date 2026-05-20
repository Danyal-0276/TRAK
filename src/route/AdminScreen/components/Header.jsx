import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Shield } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import Text from '../../../components/ui/Text';

const Header = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const { user, isSuperAdmin } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          paddingTop: Math.max(insets.top, 12),
        },
      ]}
    >
      <View style={styles.headerContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
          <Shield size={24} color={colors.primary} strokeWidth={2.5} />
        </View>
        <View style={styles.titleBlock}>
          <Text variant="title" style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Admin Panel
          </Text>
          {user?.email ? (
            <Text variant="caption" color={colors.textSecondary} numberOfLines={1} style={styles.emailLine}>
              {user.email}
              {isSuperAdmin ? ' · Super Admin' : ''}
            </Text>
          ) : null}
        </View>
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  emailLine: {
    marginTop: 2,
    fontSize: 12,
  },
});

export default Header;
