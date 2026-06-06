import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import Text from '../../../components/ui/Text';
import {
  activityAreaData,
  barListRows,
  buildActivityChartAxisLabels,
  credibilityPieData,
  feedbackStatusPieData,
  feedbackCategoryBarData,
  pipelinePieData,
  sourceBarData,
} from '../dashboardChartUtils';
import AdminHorizontalBarList from './AdminHorizontalBarList';
import { chartSeriesColor, factCheckVerdictColor } from '../adminTheme';

const CHART_HEIGHT = 232;
const ACTIVITY_CHART_HEIGHT = 248;
const H_PAD = 20;
const ACTIVITY_LABEL_MIN_WIDTH = 48;

function ChartCard({ title, subtitle, palette, children, emptyMessage, isEmpty }) {
  return (
    <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <View style={[styles.cardHeader, { borderBottomColor: palette.borderLight }]}>
        <Text variant="subtitle" color={palette.textPrimary} style={{ fontWeight: '700' }}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color={palette.textSecondary} style={{ marginTop: 4 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={[styles.chartBody, isEmpty && styles.chartBodyEmpty]}>
        {isEmpty ? (
          <Text variant="caption" color={palette.textSecondary} style={styles.empty}>
            {emptyMessage}
          </Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

function LegendPill({ label, value, color, textColor }) {
  return (
    <View style={[styles.pill, { backgroundColor: `${color}22` }]}>
      <View style={[styles.pillDot, { backgroundColor: color }]} />
      <Text variant="caption" style={{ color: textColor, fontSize: 11 }}>
        <Text style={{ fontWeight: '700' }}>{value}</Text> {label}
      </Text>
    </View>
  );
}

function useChartConfig(palette) {
  return useMemo(
    () => ({
      backgroundColor: palette.card,
      backgroundGradientFrom: palette.card,
      backgroundGradientTo: palette.card,
      backgroundGradientFromOpacity: 1,
      backgroundGradientToOpacity: 1,
      fillShadowGradientFrom: palette.primary,
      fillShadowGradientTo: palette.primary,
      fillShadowGradientFromOpacity: 1,
      fillShadowGradientToOpacity: 1,
      decimalPlaces: 0,
      color: (opacity = 1) =>
        palette.isDark
          ? `rgba(212, 212, 212, ${opacity})`
          : `rgba(37, 99, 235, ${opacity})`,
      labelColor: () => palette.textTertiary,
      propsForBackgroundLines: { stroke: palette.borderLight, strokeWidth: 1 },
      propsForLabels: { fontSize: 9 },
    }),
    [palette]
  );
}

export default function AdminDashboardCharts({ snapshot, palette }) {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - H_PAD * 2 - 8;
  const baseConfig = useChartConfig(palette);

  const activity = activityAreaData(snapshot);
  const pipeline = pipelinePieData(snapshot, palette);
  const credibility = credibilityPieData(snapshot, palette);
  const feedbackStatus = feedbackStatusPieData(snapshot, palette);
  const feedbackCategories = feedbackCategoryBarData(snapshot).map((row) => ({
    key: row.name,
    name: row.name,
    value: row.count,
    fill: palette.chart.info,
  }));
  const factRows = barListRows(Object.entries(snapshot?.fact_check_by_verdict || {}), palette, {
    nameFormatter: (n) => String(n).replace(/_/g, ' '),
    colorPicker: (name, i) => factCheckVerdictColor(palette, name, i),
  })
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);

  const sourcesRaw = sourceBarData(snapshot, 'raw_by_source_key', 8, palette).map((s, i) => ({
    key: s.name,
    name: s.name,
    value: s.count,
    fill: s.fill || chartSeriesColor(palette, i),
  }));

  const sourcesProc = sourceBarData(snapshot, 'processed_by_source_key', 8, palette).map((s, i) => ({
    key: s.name,
    name: s.name,
    value: s.count,
    fill: s.fill || chartSeriesColor(palette, i),
  }));
  const ps = snapshot?.pipeline_summary || {};
  const inFlight = Number(ps.active_processing ?? ps.processing) || 0;
  const workers = Number(ps.pipeline_workers) || 1;

  const activityChart = useMemo(() => {
    if (!activity.length) return null;
    const axisLabels = buildActivityChartAxisLabels(activity, {
      chartWidth,
      minPointWidth: ACTIVITY_LABEL_MIN_WIDTH,
    });
    const totalScraped = activity.reduce((sum, d) => sum + (d.scraped || 0), 0);
    const totalProcessed = activity.reduce((sum, d) => sum + (d.processed || 0), 0);
    return {
      labels: axisLabels,
      datasets: [
        {
          data: activity.map((d) => Math.max(0, d.scraped || 0)),
          color: () => palette.chart.scraped,
          strokeWidth: 2,
          withDots: false,
        },
        {
          data: activity.map((d) => Math.max(0, d.processed || 0)),
          color: () => palette.chart.processed,
          strokeWidth: 2,
          withDots: false,
        },
      ],
      totalScraped,
      totalProcessed,
    };
  }, [activity, palette, chartWidth]);

  const toPieData = (rows) =>
    rows.map((r) => ({
      name: r.name,
      population: r.value,
      color: r.fill,
      legendFontColor: palette.textSecondary,
    }));

  const pipelineSegments = [
    { n: ps.done, color: palette.pipeline.done, label: 'Done' },
    { n: ps.pending, color: palette.pipeline.pending, label: 'Pending' },
    { n: inFlight, color: palette.pipeline.processing, label: 'Processing' },
    { n: ps.failed, color: palette.pipeline.failed, label: 'Failed' },
    { n: ps.unknown, color: palette.pipeline.unknown, label: 'Unknown' },
  ].filter((x) => x.n > 0);

  return (
    <View style={styles.root}>
      <View style={[styles.pipelineCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <View style={styles.pipelineHeader}>
          <View style={{ flex: 1 }}>
            <Text variant="subtitle" color={palette.textPrimary} style={{ fontWeight: '700' }}>
              Pipeline progress
            </Text>
            <Text variant="caption" color={palette.textSecondary} style={{ marginTop: 4 }}>
              {ps.completion_pct ?? 0}% of raw corpus complete · {ps.queued ?? 0} in queue
              {workers > 1 ? ` · up to ${workers} at once` : ''}
            </Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: palette.primary }}>{ps.completion_pct ?? 0}%</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: palette.pageAlt }]}>
          {pipelineSegments.map((seg) => (
            <View key={seg.label} style={{ flex: seg.n, backgroundColor: seg.color, minWidth: seg.n > 0 ? 4 : 0 }} />
          ))}
        </View>
        <View style={styles.pillRow}>
          {pipelineSegments.map((seg) => (
            <LegendPill key={seg.label} label={seg.label.toLowerCase()} value={seg.n} color={seg.color} textColor={palette.textSecondary} />
          ))}
        </View>
      </View>

      <Text variant="caption" color={palette.textTertiary} style={styles.sectionEyebrow}>
        ANALYTICS
      </Text>

      <ChartCard
        title="Scrape & process activity"
        subtitle="Last 14 days · scraped vs pipeline completed (by scrape date)"
        palette={palette}
        isEmpty={!activityChart}
        emptyMessage="No dated activity in this period"
      >
        {activityChart ? (
          <View>
            <View style={styles.activityLegend}>
              <LegendPill
                label="scraped"
                value={activityChart.totalScraped}
                color={palette.chart.scraped}
                textColor={palette.textSecondary}
              />
              <LegendPill
                label="processed"
                value={activityChart.totalProcessed}
                color={palette.chart.processed}
                textColor={palette.textSecondary}
              />
            </View>
            <LineChart
              data={{
                labels: activityChart.labels,
                datasets: activityChart.datasets,
              }}
              width={chartWidth}
              height={ACTIVITY_CHART_HEIGHT}
              chartConfig={baseConfig}
              bezier
              style={styles.chart}
              withDots={false}
              withShadow={false}
              withInnerLines
              withOuterLines={false}
              withVerticalLines={false}
              fromZero
              segments={4}
              horizontalLabelRotation={0}
              xLabelsOffset={0}
              formatXLabel={(value) => (value?.trim() ? value : '')}
            />
          </View>
        ) : null}
      </ChartCard>

      <ChartCard
        title="Fact-check outcomes"
        subtitle={`${factRows.length ? `${factRows.reduce((s, r) => s + r.value, 0)} articles · ` : ''}${factRows.length} verdict type${factRows.length === 1 ? '' : 's'}`}
        palette={palette}
        isEmpty={!factRows.length}
        emptyMessage="No fact-check data yet. Process articles or refresh when the API is connected."
      >
        <AdminHorizontalBarList rows={factRows} palette={palette} />
      </ChartCard>

      <ChartCard
        title="Top sources (raw)"
        subtitle={`${sourcesRaw.length ? `${sourcesRaw.reduce((s, r) => s + r.value, 0)} articles · ` : ''}${sourcesRaw.length} source${sourcesRaw.length === 1 ? '' : 's'}`}
        palette={palette}
        isEmpty={!sourcesRaw.length}
        emptyMessage="No raw source breakdown yet."
      >
        <AdminHorizontalBarList rows={sourcesRaw} palette={palette} />
      </ChartCard>

      <ChartCard
        title="Top sources (processed)"
        subtitle={`${sourcesProc.length ? `${sourcesProc.reduce((s, r) => s + r.value, 0)} articles · ` : ''}${sourcesProc.length} source${sourcesProc.length === 1 ? '' : 's'}`}
        palette={palette}
        isEmpty={!sourcesProc.length}
        emptyMessage="No processed source breakdown."
      >
        <AdminHorizontalBarList rows={sourcesProc} palette={palette} />
      </ChartCard>

      <ChartCard
        title="Pipeline status"
        subtitle="Raw articles by status"
        palette={palette}
        isEmpty={!pipeline.length}
        emptyMessage="No pipeline data"
      >
        {pipeline.length ? (
          <PieChart
            data={toPieData(pipeline)}
            width={chartWidth}
            height={CHART_HEIGHT}
            chartConfig={baseConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="12"
            absolute
            hasLegend
          />
        ) : null}
      </ChartCard>

      <ChartCard
        title="Credibility mix"
        subtitle="Processed verdicts"
        palette={palette}
        isEmpty={!credibility.length}
        emptyMessage="No processed articles"
      >
        {credibility.length ? (
          <PieChart
            data={toPieData(credibility)}
            width={chartWidth}
            height={CHART_HEIGHT}
            chartConfig={baseConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="12"
            absolute
            hasLegend
          />
        ) : null}
      </ChartCard>

      <ChartCard
        title="User feedback"
        subtitle="By review status"
        palette={palette}
        isEmpty={!feedbackStatus.length}
        emptyMessage="No feedback yet"
      >
        {feedbackStatus.length ? (
          <PieChart
            data={toPieData(feedbackStatus)}
            width={chartWidth}
            height={CHART_HEIGHT}
            chartConfig={baseConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="12"
            absolute
            hasLegend
          />
        ) : null}
      </ChartCard>

      <ChartCard
        title="Feedback by category"
        subtitle="Top report categories"
        palette={palette}
        isEmpty={!feedbackCategories.length}
        emptyMessage="No category breakdown"
      >
        {feedbackCategories.length ? (
          <AdminHorizontalBarList rows={feedbackCategories} palette={palette} />
        ) : null}
      </ChartCard>

    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: H_PAD, gap: 16, marginBottom: 8 },
  sectionEyebrow: {
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 4,
  },
  pipelineCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
  },
  pipelineHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  progressTrack: { flexDirection: 'row', height: 10, borderRadius: 999, overflow: 'hidden' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillDot: { width: 8, height: 8, borderRadius: 4 },
  card: { borderRadius: 14, borderWidth: 1, marginBottom: 4 },
  cardHeader: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1 },
  chartBody: { paddingVertical: 4, paddingHorizontal: 0, minHeight: 120 },
  chartBodyEmpty: { minHeight: CHART_HEIGHT },
  chart: { borderRadius: 12, marginVertical: 4 },
  activityLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  empty: { textAlign: 'center', paddingVertical: 48 },
});
