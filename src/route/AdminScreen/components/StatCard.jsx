import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';

const StatCard = ({ label, value }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={[styles.statCard, {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    }]}>
      <LinearGradient
        colors={[`${colors.primary}20`, `${colors.primary}10`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientOverlay}
      />
      <Text variant="title" style={[styles.statValue, { color: colors.primary }]}>
        {value}
      </Text>
      <Text variant="caption" color={colors.textSecondary} style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default StatCard;