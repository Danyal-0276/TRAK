import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAdminTheme } from '../useAdminTheme';

const ChartSection = ({ title, dateRange, data, config, showLegend = false, legend = [] }) => {
  const screenWidth = Dimensions.get('window').width;
  const { palette } = useAdminTheme();

  const defaultConfig = useMemo(
    () => ({
      backgroundColor: palette.card,
      backgroundGradientFrom: palette.card,
      backgroundGradientTo: palette.card,
      decimalPlaces: 1,
      color: (opacity = 1) =>
        palette.isDark
          ? `rgba(212, 212, 212, ${opacity})`
          : `rgba(212, 175, 55, ${opacity})`,
      labelColor: () => palette.textTertiary,
      propsForDots: { r: '0' },
      propsForBackgroundLines: { stroke: palette.borderLight, strokeWidth: 1 },
      ...config,
    }),
    [palette, config]
  );

  return (
    <View style={styles.chartSection}>
      <View style={styles.chartHeader}>
        <Text style={[styles.chartTitle, { color: palette.textPrimary }]}>{title}</Text>
        <Text style={[styles.chartDateRange, { color: palette.textTertiary }]}>{dateRange}</Text>
      </View>

      {showLegend && legend.length > 0 && (
        <View style={styles.legendContainer}>
          {legend.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={[styles.legendText, { color: palette.textSecondary }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      )}

      <LineChart
        data={data}
        width={screenWidth - 40}
        height={220}
        chartConfig={defaultConfig}
        bezier
        style={styles.chart}
        withInnerLines
        withOuterLines={false}
        withVerticalLines={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  chartDateRange: {
    fontSize: 13,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ChartSection;
