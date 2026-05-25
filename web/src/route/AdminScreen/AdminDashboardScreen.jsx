import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import {
  getResponsivePadding,
  getResponsiveMaxWidth,
  getResponsiveGap,
  getResponsiveFontSize,
} from '../../utils/responsiveStyles';
import {
  FileText,
  BarChart3,
  Activity,
  Users,
  AlertTriangle,
  Layers,
  Rss,
  Play,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { postAdminPipelineRun } from '../../api/adminApi';
import { loadAdminOverview, buildOverviewStatCards } from './loadAdminOverview';
import { emptyAnalyticsSnapshot, enrichAnalyticsSnapshot, isAnalyticsPayload } from './dashboardChartUtils';
import { getAdminDashboardPalette, DASHBOARD_POLL_INTERVAL_MS } from './adminTheme';
import { isDashboardPath } from './hooks/useAdminTabActive';
import AdminDashboardCharts from './components/AdminDashboardCharts';
import AdminScrapeSourcesPanel from './components/AdminScrapeSourcesPanel';
import AdminStatKpiCard from './components/AdminStatKpiCard';
import AdminPipelineProgressBar from './components/AdminPipelineProgressBar';
import { SkeletonStatCards } from '../../components/skeletons/SkeletonLayouts';

const PIPELINE_BATCH_SIZE = 15;

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

const AdminDashboardScreen = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';
  const { isMobile, isTablet } = useResponsive();
  const navigate = useNavigate();
  const location = useLocation();
  const dashboardActive = isDashboardPath(location.pathname);
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pipelineBusy, setPipelineBusy] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [pipelineRunPhase, setPipelineRunPhase] = useState('idle');
  const [pipelineRunLabel, setPipelineRunLabel] = useState('');
  const [analyticsError, setAnalyticsError] = useState(null);
  const [liveUpdatedAt, setLiveUpdatedAt] = useState(null);
  const hasSnapshotRef = useRef(false);

  const palette = useMemo(() => getAdminDashboardPalette(colors, isDark), [colors, isDark]);
  const chartData = snapshot || emptyAnalyticsSnapshot();
  const showInitialSkeleton = loading && !snapshot;

  useEffect(() => {
    hasSnapshotRef.current = Boolean(snapshot);
  }, [snapshot]);

  const loadStats = useCallback(async ({ silent = false, manual = false } = {}) => {
    const isInitial = !hasSnapshotRef.current;
    try {
      setRefreshing(true);
      if (isInitial && !silent) setLoading(true);
      setAnalyticsError(null);

      const data = await loadAdminOverview({
        cacheBust: manual || !silent,
        requireAnalytics: manual,
      });

      const mappedArticles = (data.articles || []).map((doc) => ({
        scope: doc.scope,
        fetched_at: doc.fetched_at,
        processed_at: doc.processed_at,
      }));
      const enriched = enrichAnalyticsSnapshot(data.serverAnalytics, mappedArticles);
      const hasActivity =
        enriched.activity_daily?.some((r) => (r.scraped || 0) + (r.processed || 0) > 0) ||
        isAnalyticsPayload(data.serverAnalytics);

      if (hasActivity || data.serverAnalytics) {
        setSnapshot({ ...enriched, _refreshedAt: Date.now() });
        setAnalyticsError(data.serverAnalytics ? null : data.analyticsError || null);
      } else {
        setAnalyticsError(data.analyticsError || 'Could not load analytics from the server.');
        if (manual || !silent) setSnapshot(null);
      }
      setLiveUpdatedAt(new Date());
    } catch (error) {
      console.error('Error loading admin stats:', error);
      setAnalyticsError(error?.message || 'Failed to load analytics.');
      if (manual || !silent) setSnapshot(null);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    loadStats({ manual: true, silent: false });
  }, [loadStats]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (!dashboardActive) return undefined;

    const poll = () => {
      if (document.visibilityState === 'visible') loadStats({ silent: true });
    };

    const id = window.setInterval(poll, DASHBOARD_POLL_INTERVAL_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') loadStats({ silent: true });
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [dashboardActive, loadStats]);

  const statCards = buildOverviewStatCards({
    serverAnalytics: chartData,
    palette,
  }).map((card) => ({
    ...card,
    icon: STAT_ICONS[card.key] || FileText,
    value: showInitialSkeleton ? '—' : card.value,
  }));

  const resetPipelineRunUi = () => {
    setPipelineRunPhase('idle');
    setPipelineProgress(0);
    setPipelineRunLabel('');
  };

  const runPipeline = async () => {
    if (pipelineBusy) return;
    setPipelineBusy(true);
    setPipelineRunPhase('running');
    setPipelineProgress(4);
    setPipelineRunLabel('Starting batch…');

    const maxSimulated = 90;
    const tick = window.setInterval(() => {
      setPipelineProgress((prev) => {
        if (prev >= maxSimulated) return prev;
        const bump = Math.max(2, (maxSimulated - prev) * 0.12);
        return Math.min(maxSimulated, prev + bump);
      });
    }, 280);

    try {
      const result = await postAdminPipelineRun(PIPELINE_BATCH_SIZE);
      window.clearInterval(tick);
      const ok = result?.processed_ok ?? 0;
      const err = result?.errors ?? 0;
      setPipelineProgress(100);
      setPipelineRunPhase('success');
      setPipelineRunLabel(`Done · ${ok} processed${err ? ` · ${err} errors` : ''}`);
      await loadStats({ silent: true });
      window.setTimeout(resetPipelineRunUi, 2200);
    } catch (e) {
      window.clearInterval(tick);
      setPipelineProgress(100);
      setPipelineRunPhase('error');
      setPipelineRunLabel(e?.message || 'Pipeline run failed');
      window.setTimeout(resetPipelineRunUi, 2800);
    } finally {
      setPipelineBusy(false);
    }
  };

  const showPipelineProgress = pipelineRunPhase !== 'idle';

  const failures = chartData?.recent_pipeline_failures || [];
  const updatedLabel = liveUpdatedAt
    ? liveUpdatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : chartData?.generated_at
      ? chartData.generated_at.slice(0, 16).replace('T', ' ')
      : null;

  const kpiGridColumns = isMobile
    ? '1fr'
    : isTablet
      ? 'repeat(2, minmax(0, 1fr))'
      : 'repeat(4, minmax(0, 1fr))';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: palette.page, paddingTop: 0 }}>
      <div
        style={{
          maxWidth: getResponsiveMaxWidth(isMobile, isTablet, '1400px'),
          margin: '0 auto',
          width: '100%',
          padding: getResponsivePadding(isMobile, isTablet),
        }}
      >
        <header
          style={{
            marginBottom: isMobile ? 20 : 28,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
          }}
        >
          <div>
            <p
              style={{
                margin: '0 0 6px',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: palette.textTertiary,
              }}
            >
              Admin
            </p>
            <h1
              style={{
                fontSize: getResponsiveFontSize(isMobile, isTablet, 28),
                fontWeight: 800,
                color: palette.textPrimary,
                margin: '0 0 6px',
                letterSpacing: '-0.03em',
              }}
            >
              Dashboard
            </h1>
            <p style={{ fontSize: 14, color: palette.textSecondary, margin: 0, maxWidth: 520, lineHeight: 1.5 }}>
              Live scrape, pipeline, and credibility metrics
              {updatedLabel ? ` · Updated ${updatedLabel}` : ''}
            </p>
            {dashboardActive ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  color: palette.textTertiary,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: palette.primary,
                    opacity: refreshing ? 0.45 : 1,
                    boxShadow: refreshing ? 'none' : `0 0 0 3px ${palette.border}`,
                  }}
                />
                {refreshing ? 'Updating…' : 'Live · refreshes every 20s'}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-busy={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 10,
              border: `1px solid ${refreshing ? palette.primary : palette.border}`,
              background: refreshing ? palette.infoBg : palette.card,
              color: palette.textPrimary,
              fontWeight: 600,
              fontSize: 13,
              cursor: refreshing ? 'wait' : 'pointer',
              opacity: refreshing ? 0.9 : 1,
              boxShadow: `0 1px 2px ${palette.shadowLight}`,
            }}
          >
            <RefreshCw
              size={16}
              color={palette.primary}
              style={{
                animation: refreshing ? 'spin 0.85s linear infinite' : 'none',
              }}
            />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </header>

        {showInitialSkeleton ? (
          <SkeletonStatCards count={8} isDark={isDark} colors={colors} />
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: kpiGridColumns,
                gap: getResponsiveGap(isMobile, isTablet),
                marginBottom: 24,
              }}
            >
              {statCards.map((stat) => (
                <AdminStatKpiCard
                  key={stat.key}
                  stat={stat}
                  palette={palette}
                  isDark={isDark}
                  primary={palette.primary}
                  onNavigate={navigate}
                />
              ))}
            </div>

            {analyticsError ? (
              <div
                style={{
                  padding: '14px 18px',
                  marginBottom: 16,
                  color: palette.textSecondary,
                  backgroundColor: palette.warningBg,
                  borderRadius: 10,
                  border: `1px solid ${palette.warning}`,
                  fontSize: 13,
                }}
              >
                {analyticsError} Charts below use empty data until the API works. Restart the backend and click
                Refresh.
              </div>
            ) : null}

            <section id="dashboard-charts" style={{ marginBottom: 24 }}>
              <AdminDashboardCharts
                snapshot={chartData}
                palette={palette}
                isMobile={isMobile}
                isTablet={isTablet}
              />
            </section>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr',
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  backgroundColor: palette.card,
                  borderRadius: 14,
                  border: `1px solid ${palette.border}`,
                  boxShadow: `0 1px 2px ${palette.shadowLight}`,
                  padding: 20,
                }}
              >
                <h2 style={{ fontSize: 15, fontWeight: 700, color: palette.textPrimary, margin: '0 0 6px' }}>
                  AI pipeline
                </h2>
                <p style={{ fontSize: 13, color: palette.textSecondary, margin: '0 0 18px', lineHeight: 1.45 }}>
                  Run fake detection, fact-check, summary, and keywords on pending raw articles.
                  <strong style={{ color: palette.textPrimary }}> {chartData?.pipeline_summary?.queued ?? 0}</strong>{' '}
                  in queue.
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    flexWrap: 'wrap',
                  }}
                >
                  <button
                    type="button"
                    onClick={runPipeline}
                    disabled={pipelineBusy}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 18px',
                      border: 'none',
                      borderRadius: 10,
                      background: palette.primary,
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: pipelineBusy ? 'wait' : 'pointer',
                      opacity: pipelineBusy ? 0.92 : 1,
                      boxShadow: `0 4px 14px ${palette.shadow}`,
                      transition: 'background 0.25s ease, color 0.25s ease',
                      flexShrink: 0,
                    }}
                  >
                    <Play size={18} fill="currentColor" />
                    {pipelineBusy ? 'Running…' : `Run batch (${PIPELINE_BATCH_SIZE})`}
                  </button>

                  {showPipelineProgress ? (
                    <AdminPipelineProgressBar
                      progress={pipelineProgress}
                      phase={pipelineRunPhase}
                      label={pipelineRunLabel}
                      palette={palette}
                      isDark={isDark}
                    />
                  ) : null}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: palette.card,
                  borderRadius: 14,
                  border: `1px solid ${palette.border}`,
                  boxShadow: `0 1px 2px ${palette.shadowLight}`,
                  padding: 18,
                  maxHeight: 200,
                  overflowY: 'auto',
                }}
              >
                <h3 style={{ fontSize: 14, fontWeight: 700, color: palette.textPrimary, margin: '0 0 12px' }}>
                  Recent failures
                </h3>
                {failures.length === 0 ? (
                  <p style={{ fontSize: 13, color: palette.textSecondary, margin: 0 }}>No recent pipeline errors.</p>
                ) : (
                  failures.map((f, i) => (
                    <div
                      key={i}
                      style={{
                        paddingBottom: 10,
                        marginBottom: 10,
                        borderBottom: i < failures.length - 1 ? `1px solid ${palette.borderLight}` : 'none',
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 600, color: palette.textPrimary, lineHeight: 1.35 }}>
                        {f.title}
                      </div>
                      <div style={{ fontSize: 11, color: palette.textTertiary, marginTop: 2 }}>{f.source_key}</div>
                      <div style={{ fontSize: 11, color: palette.error, marginTop: 4, lineHeight: 1.35 }}>{f.error}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <AdminScrapeSourcesPanel connections={chartData?.scrape_connections} palette={palette} />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardScreen;
