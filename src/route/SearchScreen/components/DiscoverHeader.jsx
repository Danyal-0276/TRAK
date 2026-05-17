import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Compass } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';

/** Compact Discover title row — no logo block or subtitle. */
export default function DiscoverHeader() {
  const { theme } = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.row, { paddingTop: Math.max(insets.top, 8) + 4 }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.primary + '14' }]}>
        <Compass size={20} color={colors.primary} strokeWidth={2.25} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Discover</Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]} numberOfLines={1}>
          Explore topics & sources
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  hint: {
    fontSize: 13,
    marginTop: 1,
    fontWeight: '500',
  },
});
