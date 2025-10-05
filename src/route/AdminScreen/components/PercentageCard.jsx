import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PercentageCard = ({ percentage, label, count, color }) => {
  return (
    <View style={styles.percentageCard}>
      <View style={[styles.percentageCircle, { backgroundColor: color }]}>
        <Text style={styles.percentageValue}>{percentage}%</Text>
      </View>
      <Text style={styles.percentageLabel}>{label}</Text>
      <Text style={styles.percentageCount}>{count} articles</Text>
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
    color: '#fff',
  },
  percentageLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  percentageCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default PercentageCard;