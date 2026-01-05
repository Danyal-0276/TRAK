import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import PercentageCard from '../components/PercentageCard';
import ChartSection from '../components/ChartSection';
import StatRow from '../components/StatRow';
import Text from '../../../components/ui/Text';

const AnalyticsTab = ({ analytics }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  
  if (!analytics) return null;

  const { newsStats, weeklyData, monthlyTrend } = analytics;
  const total = newsStats.real + newsStats.fake + newsStats.underReview;
  const realPercentage = ((newsStats.real / total) * 100).toFixed(1);
  const fakePercentage = ((newsStats.fake / total) * 100).toFixed(1);
  const reviewPercentage = ((newsStats.underReview / total) * 100).toFixed(1);

  const weeklyChartData = {
    labels: weeklyData.map(d => d.day),
    datasets: [
      {
        data: weeklyData.map(d => d.real),
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: weeklyData.map(d => d.fake),
        color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: weeklyData.map(d => d.underReview),
        color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const monthlyChartData = {
    labels: monthlyTrend.map(d => d.month),
    datasets: [
      {
        data: monthlyTrend.map(d => d.real),
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
      },
      {
        data: monthlyTrend.map(d => d.fake),
        color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
      },
      {
        data: monthlyTrend.map(d => d.underReview),
        color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
      },
    ],
  };

  const legendData = [
    { label: 'Real', color: '#4CAF50' },
    { label: 'Fake', color: '#f44336' },
    { label: 'Under Review', color: '#FF9800' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.analyticsHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <TrendingUp size={20} color={colors.primary} />
          </View>
          <View>
            <Text variant="title" color={colors.textPrimary} style={styles.sectionTitle}>
              News Analytics
            </Text>
            <Text variant="caption" color={colors.textSecondary} style={styles.analyticsSubtitle}>
              Comprehensive news verification statistics
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.percentageCards}>
        <PercentageCard
          percentage={realPercentage}
          label="Real News"
          count={newsStats.real}
          color="#4CAF50"
        />
        <PercentageCard
          percentage={fakePercentage}
          label="Fake News"
          count={newsStats.fake}
          color="#f44336"
        />
        <PercentageCard
          percentage={reviewPercentage}
          label="Under Review"
          count={newsStats.underReview}
          color="#FF9800"
        />
      </View>

      <ChartSection
        title="Weekly News Distribution"
        dateRange="Last 7 days"
        data={weeklyChartData}
        config={{
          decimalPlaces: 0,
          propsForDots: { r: '4' },
        }}
        showLegend={true}
        legend={legendData}
      />

      <ChartSection
        title="Monthly Trend Comparison"
        dateRange="Last 3 months"
        data={monthlyChartData}
        config={{
          decimalPlaces: 0,
          propsForDots: { r: '5' },
        }}
      />

        <View style={styles.statsBreakdown}>
        <Text variant="subtitle" color={colors.textPrimary} style={styles.sectionTitle}>
          Detailed Statistics
        </Text>
        
        <StatRow
          label="Verified Real News"
          value={newsStats.real}
          percentage={realPercentage}
          color="#4CAF50"
        />
        <StatRow
          label="Identified Fake News"
          value={newsStats.fake}
          percentage={fakePercentage}
          color="#f44336"
        />
        <StatRow
          label="Pending Verification"
          value={newsStats.underReview}
          percentage={reviewPercentage}
          color="#FF9800"
        />

        <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
          <Text variant="body" color={colors.textPrimary} style={styles.totalLabel}>
            Total Articles Analyzed
          </Text>
          <Text variant="title" color={colors.primary} style={styles.totalValue}>
            {total}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  analyticsHeader: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  analyticsSubtitle: {
    fontSize: 14,
  },
  percentageCards: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    justifyContent: 'space-between',
  },
  statsBreakdown: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    marginTop: 12,
    borderTopWidth: 2,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '700',
  },
});

export default AnalyticsTab;