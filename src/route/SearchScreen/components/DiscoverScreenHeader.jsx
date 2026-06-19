import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Compass } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';

export default function DiscoverScreenHeader() {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}14` }]}>
        <Compass size={22} color={colors.primary} strokeWidth={2.25} />
      </View>
      <View style={styles.copy}>
        <Text variant="title" color={colors.textPrimary} style={styles.title}>
          Discover
        </Text>
        <Text variant="caption" color={colors.textSecondary} style={styles.subtitle}>
          Curated topics and trusted sources
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
  },
  subtitle: {
    marginTop: 2,
  },
});
