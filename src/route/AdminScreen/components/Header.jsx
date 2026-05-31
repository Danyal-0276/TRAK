import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdminTheme } from '../useAdminTheme';
import Text from '../../../components/ui/Text';
import TrakLogo from '../../../components/TrakLogo';

const Header = () => {
  const { palette } = useAdminTheme();
  const insets = useSafeAreaInsets();

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
  titleBlock: {
    alignItems: 'flex-start',
  },
});

export default Header;
