import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAdminTheme } from '../useAdminTheme';

const PercentageCard = ({ percentage, label, count, color }) => {
  const { palette } = useAdminTheme();

  return (
    <View style={styles.percentageCard}>
      <View style={[styles.percentageCircle, { backgroundColor: color }]}>
        <Text style={[styles.percentageValue, { color: palette.textInverse }]}>{percentage}%</Text>
      </View>
      <Text style={[styles.percentageLabel, { color: palette.textSecondary }]}>{label}</Text>
      <Text style={[styles.percentageCount, { color: palette.textTertiary }]}>{count} articles</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  percentageCard: {
    alignItems: 'center',
    width: '31%',
  },
  percentageCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  percentageValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  percentageLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  percentageCount: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default PercentageCard;
