import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatRow = ({ label, value, percentage, color }) => {
  return (
    <View style={styles.statRow}>
      <View style={styles.statRowLeft}>
        <View style={[styles.statIndicator, { backgroundColor: color }]} />
        <Text style={styles.statRowLabel}>{label}</Text>
      </View>
      <View style={styles.statRowRight}>
        <Text style={styles.statRowValue}>{value}</Text>
        <View style={styles.statBar}>
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
    borderBottomColor: '#f0f0f0',
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
    color: '#333',
    fontWeight: '500',
  },
  statRowRight: {
    alignItems: 'flex-end',
    flex: 1,
  },
  statRowValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  statBar: {
    width: 120,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default StatRow;