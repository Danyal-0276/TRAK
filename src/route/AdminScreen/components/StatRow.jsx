import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAdminTheme } from '../useAdminTheme';

const StatRow = ({ label, value, percentage, color }) => {
  const { palette } = useAdminTheme();

  return (
    <View style={[styles.statRow, { borderBottomColor: palette.borderLight }]}>
      <View style={styles.statRowLeft}>
        <View style={[styles.statIndicator, { backgroundColor: color }]} />
        <Text style={[styles.statRowLabel, { color: palette.textSecondary }]}>{label}</Text>
      </View>
      <View style={styles.statRowRight}>
        <Text style={[styles.statRowValue, { color: palette.textPrimary }]}>{value}</Text>
        <View style={[styles.statBar, { backgroundColor: palette.pageAlt }]}>
          <View style={[styles.statBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  statRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statRowLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  statRowRight: {
    alignItems: 'flex-end',
    flex: 1,
  },
  statRowValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statBar: {
    width: 120,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default StatRow;
