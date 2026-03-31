import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import PercentageCard from '../components/PercentageCard';
import ChartSection from '../components/ChartSection';
import StatRow from '../components/StatRow';
import Text from '../../../components/ui/Text';

function ServerAnalyticsView({ data, colors, modelMetrics }) {
  const rawBy = data.raw_by_pipeline_status || {};
  const credBy = data.processed_by_credibility_label || {};
  const rawEntries = Object.entries(rawBy).sort((a, b) => b[1] - a[1]);
  const credEntries = Object.entries(credBy).sort((a, b) => b[1] - a[1]);

  return (
    <View style={[styles.container, { paddingHorizontal: 20 }]}>
      <Text variant="title" color={colors.textPrimary} style={styles.sectionTitle}>
        Live data (Mongo)
      </Text>
      <Text variant="caption" color={colors.textSecondary} style={{ marginBottom: 16 }}>
        Totals: {data.raw_total ?? 0} raw · {data.processed_total ?? 0} processed
      </Text>
      <Text variant="subtitle" color={colors.textPrimary} style={{ marginBottom: 8 }}>
        Raw by pipeline_status
      </Text>
      {rawEntries.length === 0 ? (
        <Text variant="caption" color={colors.textSecondary} style={{ marginBottom: 20 }}>
          No raw articles or status not set.
        </Text>
      ) : (
        rawEntries.map(([k, v]) => (
          <StatRow key={k} label={String(k)} value={String(v)} percentage={100} color={colors.primary} />
        ))
      )}
      <Text variant="subtitle" color={colors.textPrimary} style={{ marginTop: 16, marginBottom: 8 }}>
        Processed by credibility_label
      </Text>
      {credEntries.length === 0 ? (
        <Text variant="caption" color={colors.textSecondary}>
          No processed articles yet.
        </Text>
      ) : (
        credEntries.map(([k, v]) => (
          <StatRow key={k} label={String(k)} value={String(v)} percentage={100} color="#4CAF50" />
        ))
      )}
      {modelMetrics ? (
        <View style={{ marginTop: 20 }}>
          <Text variant="subtitle" color={colors.textPrimary} style={{ marginBottom: 8 }}>
            Model performance
          </Text>
          <StatRow
            label="Accuracy"
            value={Number(modelMetrics.accuracy ?? 0).toFixed(4)}
            percentage={100}
            color={colors.primary}
          />
          <StatRow
            label="Macro F1"
            value={Number(modelMetrics.macro_avg?.['f1-score'] ?? 0).toFixed(4)}
            percentage={100}
            color="#4CAF50"
          />
          <StatRow
            label="Weighted F1"
            value={Number(modelMetrics.weighted_avg?.['f1-score'] ?? 0).toFixed(4)}
            percentage={100}
            color="#FF9800"
          />
          <Text variant="subtitle" color={colors.textPrimary} style={{ marginTop: 14, marginBottom: 8 }}>
            Confusion matrix (rows=true, cols=pred)
          </Text>
          <Text variant="caption" color={colors.textSecondary} style={{ marginBottom: 6 }}>
            Labels order: 0=real, 1=fake, 2=suspicious
          </Text>
          <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, overflow: 'hidden' }}>
            {(modelMetrics.confusion_matrix?.matrix || []).map((row, rIdx) => {
              const rowMax = Math.max(...(row || [1]), 1);
              return (
                <View key={`cm-row-${rIdx}`} style={{ flexDirection: 'row' }}>
                  {(row || []).map((v, cIdx) => {
                    const intensity = Math.max(0.15, Number(v || 0) / rowMax);
                    return (
                      <View
                        key={`cm-cell-${rIdx}-${cIdx}`}
                        style={{
                          flex: 1,
                          minHeight: 52,
                          borderRightWidth: cIdx < 2 ? 1 : 0,
                          borderBottomWidth: rIdx < 2 ? 1 : 0,
                          borderColor: colors.border,
                          backgroundColor: `rgba(59, 130, 246, ${intensity})`,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text variant="caption" color={colors.textInverse || '#fff'} style={{ fontWeight: '700' }}>
                          {String(v)}
                        </Text>
                        <Text variant="caption" color={colors.textInverse || '#fff'} style={{ fontSize: 11 }}>
                          {`r${rIdx}->c${cIdx}`}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const AnalyticsTab = ({ analytics, serverAnalytics, modelMetrics }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  if (serverAnalytics) {
    return <ServerAnalyticsView data={serverAnalytics} colors={colors} modelMetrics={modelMetrics} />;
  }

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