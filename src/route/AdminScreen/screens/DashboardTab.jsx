import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import StatCard from '../components/StatCard';
import ChartSection from '../components/ChartSection';
import KeywordTable from '../components/KeywordTable';

const DashboardTab = ({ stats, keywords }) => {
  const userTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [1.8, 2.2, 2.8, 3.4, 4.8, 6.2, 7.8],
      color: (opacity = 1) => `rgba(212, 175, 55, ${opacity})`,
      strokeWidth: 3,
    }],
  };

  return (
    <>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <StatCard key={index} label={stat.label} value={stat.value} />
        ))}
      </View>

      <ChartSection
        title="User trend"
        dateRange="Last 7 days"
        data={userTrendData}
        config={{
          yAxisSuffix: 'K',
          propsForDots: { r: '0' },
        }}
      />

      <KeywordTable keywords={keywords} />
    </>
  );
};

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
});

export default DashboardTab;