import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BarChart3 } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import StatCard from '../components/StatCard';
import ChartSection from '../components/ChartSection';
import KeywordTable from '../components/KeywordTable';
import Text from '../../../components/ui/Text';

const DashboardTab = ({ stats, keywords }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  
  const userTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [1.8, 2.2, 2.8, 3.4, 4.8, 6.2, 7.8],
      color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
      strokeWidth: 3,
    }],
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
          <BarChart3 size={20} color={colors.primary} />
        </View>
        <Text variant="title" color={colors.textPrimary} style={styles.title}>
          Dashboard Overview
        </Text>
      </View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
});

export default DashboardTab;