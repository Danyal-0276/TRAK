import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import {
  FileText,
  BarChart3,
  Activity,
  Users,
  AlertTriangle,
  Layers,
  Rss,
  Play,
  CheckCircle2,
} from 'lucide-react-native';
import Text from '../../../components/ui/Text';
import AdminPipelineProgressBar from '../components/AdminPipelineProgressBar';
import AdminStatKpiCard from '../components/AdminStatKpiCard';
import AdminDashboardCharts from '../components/AdminDashboardCharts';
import AdminScrapeSourcesPanel from '../components/AdminScrapeSourcesPanel';
import { buildDashboardStatCards, emptyAnalyticsSnapshot } from '../dashboardChartUtils';
import AdminKpiSkeleton from '../components/skeletons/AdminKpiSkeleton';
import AdminChartSkeleton from '../components/skeletons/AdminChartSkeleton';
import { ADMIN_TEXT_STYLE } from '../adminTypography';
import { adminFilledButtonColors } from '../adminTheme';

const SCRAPE_ONLY_LIMIT = 10;

const STAT_ICONS = {
  raw: FileText,
  processed: CheckCircle2,
  queue: Activity,
  failed: AlertTriangle,
  completion: BarChart3,
  sources: Rss,
  users: Users,
  credibility: Layers,
};

const DashboardTab = ({
  palette,
  chartData,
  hasAnalytics = false,
  statCards: statCardsProp,
  analyticsError = null,
  overviewLoading = false,
  isOverviewActive = true,
  onKpiPress,
  onManageSettings,
  refreshing = false,
  onRunScrape,
  activePipelineAction = null,
  pipelineProgress = 0,
  pipelineRunPhase = 'idle',
  pipelineRunLabel = '',
  liveUpdatedLabel = '',
}) => {
  const actionBtn = adminFilledButtonColors(palette);
  const snapshot = chartData || emptyAnalyticsSnapshot();
  const kpiWidth = Dimensions.get('window').width >= 520 ? '23%' : '48%';
  const pipelineBusy = Boolean(activePipelineAction);
  const isActionRunning = (id) => activePipelineAction === id;

  const statCards = (statCardsProp?.length
    ? statCardsProp
    : buildDashboardStatCards(snapshot, palette)
  ).map((card) => ({
    ...card,
    icon: STAT_ICONS[card.key] || FileText,
    value: overviewLoading ? '…' : card.value,
    width: kpiWidth,
  }));

  const failures = snapshot?.recent_pipeline_failures || [];

  return (
    <View style={[styles.container, { backgroundColor: palette.page }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="caption" color={palette.textTertiary} style={ADMIN_TEXT_STYLE.eyebrow}>
            ADMIN
          </Text>
          <Text variant="title" color={palette.textPrimary}>
            Dashboard
          </Text>
          <Text variant="caption" color={palette.textSecondary}>
            Live scrape, pipeline & credibility{liveUpdatedLabel ? ` · Updated ${liveUpdatedLabel}` : ''}
          </Text>
          {isOverviewActive ? (
            <View style={styles.liveRow}>
              <View style={[styles.liveDot, { backgroundColor: palette.primary, opacity: refreshing ? 0.45 : 1 }]} />
              <Text variant="caption" color={palette.textTertiary} style={{ fontWeight: '600' }}>
                {refreshing ? 'Updating…' : 'Live · refreshes every 20s'}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {overviewLoading ? (
        <View style={{ paddingHorizontal: 20 }}>
          <AdminKpiSkeleton palette={palette} count={8} cardWidth={kpiWidth} />
          <AdminChartSkeleton palette={palette} count={2} />
        </View>
      ) : (
        <>
          <View style={styles.statsGrid}>
            {statCards.map((stat) => (
              <AdminStatKpiCard
                key={stat.key}
                stat={stat}
                palette={palette}
                onPress={onKpiPress ? () => onKpiPress(stat.key) : undefined}
              />
            ))}
          </View>

          {analyticsError ? (
            <View style={[styles.errorBanner, { backgroundColor: palette.warningBg, borderColor: palette.warning }]}>
              <Text variant="caption" color={palette.textSecondary} style={{ lineHeight: 18 }}>
                {analyticsError} Data still updates automatically every 20 seconds.
              </Text>
            </View>
          ) : null}

          {isOverviewActive ? (
            <AdminDashboardCharts snapshot={snapshot} palette={palette} />
          ) : null}

          <View style={styles.pipelineRowSection}>
            <View style={[styles.pipelineCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <Text variant="subtitle" color={palette.textPrimary} style={{ fontWeight: '700', marginBottom: 6 }}>
                AI pipeline
              </Text>
              <Text variant="caption" color={palette.textSecondary} style={{ marginBottom: 14, lineHeight: 18 }}>
                Run fake detection, fact-check, summary, and keywords on pending raw articles.{' '}
                <Text style={{ color: palette.textPrimary, fontWeight: '700' }}>
                  {snapshot?.pipeline_summary?.queued ?? 0}
                </Text>{' '}
                in queue.
              </Text>
              <View style={styles.pipelineRow}>
                <TouchableOpacity
                  onPress={onRunScrape}
                  disabled={pipelineBusy}
                  style={[
                    styles.runBtn,
                    {
                      backgroundColor: actionBtn.background,
                      opacity: pipelineBusy && !isActionRunning('scrape') ? 0.55 : 1,
                    },
                  ]}
                >
                  {isActionRunning('scrape') ? (
                    <ActivityIndicator color={actionBtn.foreground} size="small" />
                  ) : (
                    <>
                      <Play size={16} color={actionBtn.foreground} fill={actionBtn.foreground} />
                      <Text variant="body" style={[styles.runBtnText, { color: actionBtn.foreground }]}>
                        Run scrape (~{SCRAPE_ONLY_LIMIT} fair mix)
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                {pipelineRunPhase !== 'idle' ? (
                  <AdminPipelineProgressBar
                    progress={pipelineProgress}
                    phase={pipelineRunPhase}
                    label={pipelineRunLabel}
                    palette={palette}
                  />
                ) : null}
              </View>
            </View>

            <View style={[styles.failuresCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <Text variant="subtitle" color={palette.textPrimary} style={{ fontWeight: '700', marginBottom: 10 }}>
                Recent failures
              </Text>
              {failures.length === 0 ? (
                <Text variant="caption" color={palette.textSecondary}>
                  No recent pipeline errors.
                </Text>
              ) : (
                <ScrollView
                  style={styles.failuresScroll}
                  contentContainerStyle={styles.failuresScrollContent}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator
                >
                  {failures.slice(0, 5).map((f, i, arr) => (
                    <View
                      key={`${f.title}-${i}`}
                      style={[
                        styles.failureItem,
                        i < arr.length - 1 && { borderBottomColor: palette.borderLight, borderBottomWidth: 1 },
                      ]}
                    >
                      <Text variant="caption" color={palette.textPrimary} style={{ fontWeight: '600' }} numberOfLines={2}>
                        {f.title}
                      </Text>
                      <Text variant="caption" color={palette.textTertiary} style={{ marginTop: 2 }}>
                        {f.source_key}
                      </Text>
                      <Text variant="caption" color={palette.error} style={{ marginTop: 4 }} numberOfLines={3}>
                        {f.error}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>

          <AdminScrapeSourcesPanel
            connections={snapshot?.scrape_connections}
            palette={palette}
            onManageSettings={onManageSettings}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingTop: 8, paddingBottom: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  pipelineRowSection: { paddingHorizontal: 20, gap: 12, marginBottom: 8 },
  pipelineCard: { padding: 16, borderRadius: 14, borderWidth: 1 },
  failuresCard: { padding: 16, borderRadius: 14, borderWidth: 1 },
  failuresScroll: { maxHeight: 168 },
  failuresScrollContent: { paddingBottom: 4 },
  pipelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' },
  runBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  runBtnText: { fontWeight: '700' },
  failureItem: { paddingBottom: 10, marginBottom: 10 },
});

export default React.memo(DashboardTab);
