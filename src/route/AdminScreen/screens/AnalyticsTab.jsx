import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { getAdminDashboardPalette } from '../adminTheme';
import { pipelineColor, credibilityColor, CRED_NAMES } from '../adminTheme';
import StatRow from '../components/StatRow';
import Text from '../../../components/ui/Text';

function ServerAnalyticsView({ data, palette, modelMetrics }) {
  const rawBy = data.raw_by_pipeline_status || {};
  const credNamed = data.processed_by_credibility_label_named;
  const credBy = credNamed || data.processed_by_credibility_label || {};
  const rawEntries = Object.entries(rawBy).sort((a, b) => b[1] - a[1]);
  const credEntries = Object.entries(credBy).sort((a, b) => b[1] - a[1]);
  const ps = data.pipeline_summary || {};

  return (
    <View style={[styles.container, { paddingHorizontal: 20 }]}>
      <Text variant="title" color={palette.textPrimary} style={styles.sectionTitle}>
        Live analytics
      </Text>
      <Text variant="caption" color={palette.textSecondary} style={{ marginBottom: 12 }}>
        {data.raw_total ?? 0} raw · {data.processed_total ?? 0} processed · {ps.completion_pct ?? 0}% complete
      </Text>

      <View style={[styles.progressTrack, { backgroundColor: palette.pageAlt, borderColor: palette.border }]}>
        {[
          { n: ps.done, label: 'done', color: pipelineColor(palette, 'done') },
          { n: ps.pending, label: 'pending', color: pipelineColor(palette, 'pending') },
          { n: ps.processing, label: 'processing', color: pipelineColor(palette, 'processing') },
          { n: ps.failed, label: 'failed', color: pipelineColor(palette, 'failed') },
        ]
          .filter((x) => x.n > 0)
          .map((seg) => (
            <View key={seg.label} style={{ flex: seg.n, backgroundColor: seg.color, minWidth: 4 }} />
          ))}
      </View>

      <Text variant="subtitle" color={palette.textPrimary} style={{ marginTop: 18, marginBottom: 8 }}>
        Raw by pipeline status
      </Text>
      {rawEntries.length === 0 ? (
        <Text variant="caption" color={palette.textSecondary} style={{ marginBottom: 16 }}>
          No raw pipeline data.
        </Text>
      ) : (
        rawEntries.map(([k, v]) => (
          <StatRow
            key={k}
            label={String(k)}
            value={String(v)}
            percentage={100}
            color={pipelineColor(palette, k)}
          />
        ))
      )}

      <Text variant="subtitle" color={palette.textPrimary} style={{ marginTop: 16, marginBottom: 8 }}>
        Credibility mix
      </Text>
      {credEntries.length === 0 ? (
        <Text variant="caption" color={palette.textSecondary}>
          No processed articles yet.
        </Text>
      ) : (
        credEntries.map(([k, v]) => {
          const label = credNamed ? k : CRED_NAMES[k] || k;
          return (
            <StatRow
              key={k}
              label={String(label)}
              value={String(v)}
              percentage={100}
              color={credibilityColor(palette, label) || credibilityColor(palette, k)}
            />
          );
        })
      )}

      {modelMetrics ? (
        <View style={{ marginTop: 20 }}>
          <Text variant="subtitle" color={palette.textPrimary} style={{ marginBottom: 8 }}>
            Model performance
          </Text>
          <StatRow
            label="Accuracy"
            value={Number(modelMetrics.accuracy ?? 0).toFixed(4)}
            percentage={100}
            color={palette.primary}
          />
          <StatRow
            label="Macro F1"
            value={Number(modelMetrics.macro_avg?.['f1-score'] ?? 0).toFixed(4)}
            percentage={100}
            color={palette.success}
          />
        </View>
      ) : null}
    </View>
  );
}

const AnalyticsTab = ({ serverAnalytics, modelMetrics }) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const palette = getAdminDashboardPalette(theme.colors, isDark);

  if (!serverAnalytics) {
    return (
      <View style={{ padding: 20 }}>
        <Text variant="caption" color={palette.textSecondary}>
          Load dashboard to see live Mongo analytics.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.analyticsHeader}>
        <View style={[styles.iconContainer, { backgroundColor: palette.infoBg }]}>
          <TrendingUp size={20} color={palette.primary} />
        </View>
        <Text variant="title" color={palette.textPrimary} style={styles.sectionTitle}>
          Analytics detail
        </Text>
      </View>
      <ServerAnalyticsView data={serverAnalytics} palette={palette} modelMetrics={modelMetrics} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingTop: 8, paddingBottom: 16 },
  analyticsHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  iconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  progressTrack: { flexDirection: 'row', height: 10, borderRadius: 999, overflow: 'hidden', borderWidth: 1 },
});

export default AnalyticsTab;
