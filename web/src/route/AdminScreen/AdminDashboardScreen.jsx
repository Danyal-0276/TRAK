import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useResponsive } from '../../hooks/useResponsive';
import { useAdminTheme } from './useAdminTheme';
import { getResponsiveGap } from '../../utils/responsiveStyles';
import { useAdminPageMeta } from './adminPageMeta';
import AdminPageLayout from './components/AdminPageLayout';
import AdminPageHeader from './components/AdminPageHeader';
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
import { postAdminScrapeRun } from '../../api/adminApi';
import { getUserFacingError } from '../../utils/getUserFacingError';
import { loadAdminOverview, buildOverviewStatCards } from './loadAdminOverview';
import {
  emptyAnalyticsSnapshot,
  enrichAnalyticsSnapshot,
  isAnalyticsPayload,
} from './dashboardChartUtils';
import { subscribeAdminOverviewRefresh, dispatchAdminOverviewRefresh } from '../../utils/adminOverviewEvents';
import AdminDashboardCharts from './components/AdminDashboardCharts';
import AdminScrapeSourcesPanel from './components/AdminScrapeSourcesPanel';
import AdminStatKpiCard from './components/AdminStatKpiCard';
import AdminPipelineProgressBar from './components/AdminPipelineProgressBar';
import { SkeletonStatCards } from '../../components/skeletons/SkeletonLayouts';

const SCRAPE_ONLY_LIMIT = 10;

function scrollToAdminSection(hash) {
  const id = String(hash || '').replace(/^#/, '');
  if (!id) return;
  window.requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

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
  const { palette, isDark, colors } = useAdminTheme();
  const { isMobile, isTablet } = useResponsive();
  const navigate = useNavigate();
  const location = useLocation();
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activePipelineAction, setActivePipelineAction] = useState(null);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [pipelineRunPhase, setPipelineRunPhase] = useState('idle');
  const [pipelineRunLabel, setPipelineRunLabel] = useState('');
  const [analyticsError, setAnalyticsError] = useState(null);
  const [liveUpdatedAt, setLiveUpdatedAt] = useState(null);
  const hasSnapshotRef = useRef(false);

  const chartData = snapshot || emptyAnalyticsSnapshot();
  const showInitialSkeleton = loading && !snapshot;
  const { title, description } = useAdminPageMeta();

  useEffect(() => {
    hasSnapshotRef.current = Boolean(snapshot);
  }, [snapshot]);

  useEffect(() => {
    if (pipelineRunPhase !== 'running' || !snapshot?.pipeline_summary) return;
    const queued = snapshot.pipeline_summary.queued ?? 0;
    setPipelineRunLabel(`Processing queue · ${queued} in queue…`);
  }, [snapshot, pipelineRunPhase]);

  const loadStats = useCallback(async ({ silent = false, manual = false, cacheBust = false } = {}) => {
    const isInitial = !hasSnapshotRef.current;
    try {
      setRefreshing(true);
      if (isInitial && !silent) setLoading(true);
      setAnalyticsError(null);

      const data = await loadAdminOverview({
        cacheBust: cacheBust || manual || !silent,
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
      setAnalyticsError(
        getUserFacingError(error, {
          status: error?.status,
          payload: error?.payload,
          fallback: 'Failed to load analytics.',
        })
      );
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
    return subscribeAdminOverviewRefresh((detail = {}) => {
      loadStats({
        silent: detail.silent !== false,
        manual: detail.manual === true,
        cacheBust: Boolean(detail.cacheBust),
      });
    });
  }, [loadStats]);

  useEffect(() => {
    if (!location.hash) return;
    scrollToAdminSection(location.hash);
  }, [location.hash, loading, snapshot]);

  const handleKpiNavigate = useCallback(
    (path) => {
      const hashIndex = path.indexOf('#');
      const pathname = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
      const hash = hashIndex >= 0 ? path.slice(hashIndex) : '';
      const onDashboard =
        location.pathname === '/admin/dashboard' ||
        location.pathname === '/admin' ||
        location.pathname === '/admin/analytics';

      if (hash && (pathname === '/admin/dashboard' || pathname === '/admin')) {
        if (onDashboard) {
          scrollToAdminSection(hash);
          return;
        }
        navigate(`/admin/dashboard${hash}`);
        return;
      }
      navigate(path);
    },
    [location.pathname, navigate]
  );

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

  const runAdminAction = async ({ actionId, runner, startLabel, successLabel }) => {
    if (activePipelineAction) return;
    setActivePipelineAction(actionId);
    setPipelineRunPhase('running');
    setPipelineProgress(4);
    setPipelineRunLabel(startLabel);

    const maxSimulated = 90;
    let tick;
    let poll;
    try {
      tick = window.setInterval(() => {
        setPipelineProgress((prev) => {
          if (prev >= maxSimulated) return prev;
          const bump = Math.max(2, (maxSimulated - prev) * 0.12);
          return Math.min(maxSimulated, prev + bump);
        });
      }, 280);
      poll = window.setInterval(() => {
        loadStats({ silent: true });
      }, 4000);
      const result = await runner();
      const ok = result?.processed_ok ?? result?.delta?.processed_total ?? 0;
      const err = result?.errors ?? 0;
      setPipelineProgress(100);
      setPipelineRunPhase('success');
      setPipelineRunLabel(successLabel(ok, err, result));
      dispatchAdminOverviewRefresh({ silent: true, cacheBust: true });
      await loadStats({ silent: true, cacheBust: true });
      window.setTimeout(resetPipelineRunUi, 2200);
    } catch (e) {
      setPipelineProgress(100);
      setPipelineRunPhase('error');
      setPipelineRunLabel(e?.message || 'Pipeline run failed');
      window.setTimeout(resetPipelineRunUi, 2800);
    } finally {
      if (tick) window.clearInterval(tick);
      if (poll) window.clearInterval(poll);
      setActivePipelineAction(null);
    }
  };

  const pipelineActionBusy = Boolean(activePipelineAction);
  const pipelineButtonLabel = (actionId, idleLabel) =>
    activePipelineAction === actionId ? 'Running…' : idleLabel;

  const runScrapeOnly = async () =>
    runAdminAction({
      actionId: 'scrape',
      runner: () => postAdminScrapeRun(SCRAPE_ONLY_LIMIT),
      startLabel: `Scraping ~${SCRAPE_ONLY_LIMIT} new articles (shared across sources)…`,
      successLabel: (_ok, _err, result) =>
        `Done · ${result?.delta?.raw_total ?? 0} raw added`,
    });

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

  const refreshButton = (
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
  );

  return (
    <AdminPageLayout maxWidth="1400px">
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <AdminPageHeader title={title} description={description} actions={refreshButton}>
        {updatedLabel ? (
          <p style={{ fontSize: 13, color: palette.textSecondary, margin: '8px 0 0' }}>
            Last updated {updatedLabel}
          </p>
        ) : null}
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
      </AdminPageHeader>

      <div className="admin-page-body">
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
                  onNavigate={handleKpiNavigate}
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
                {typeof analyticsError === 'string' ? analyticsError : 'Could not load analytics.'} Charts below
                use empty data until the API works. Restart the backend and click Refresh.
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
                  Run fake detection, fact-check, summary, and keywords on pending raw articles.{' '}
                  <strong style={{ color: palette.textPrimary }}>
                    {chartData?.pipeline_summary?.queued ?? 0}
                  </strong>{' '}
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
                    onClick={runScrapeOnly}
                    disabled={pipelineActionBusy}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 18px',
                      border: 'none',
                      borderRadius: 10,
                      background: palette.buttonPrimaryBg,
                      color: palette.buttonPrimaryText,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: pipelineActionBusy ? 'wait' : 'pointer',
                      opacity: activePipelineAction && activePipelineAction !== 'scrape' ? 0.55 : 1,
                      boxShadow: `0 4px 14px ${palette.shadow}`,
                      transition: 'background 0.25s ease, color 0.25s ease',
                      flexShrink: 0,
                    }}
                  >
                    <Play size={18} fill="currentColor" />
                    {pipelineButtonLabel('scrape', `Run scrape (~${SCRAPE_ONLY_LIMIT} fair mix)`)}
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
    </AdminPageLayout>
  );
};

export default AdminDashboardScreen;
