import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '../../hooks/useResponsive';
import {
  getResponsiveGridColumns,
  getResponsiveGap,
} from '../../utils/responsiveStyles';
import { FileText, BarChart3, Activity, Hash } from 'lucide-react';
import { getAdminAnalytics, getAdminModelMetrics } from '../../api/adminApi';
import { isModelMetricsUnavailable, markModelMetricsUnavailable } from './loadAdminOverview';
import AdminBreakdownTable from './components/AdminBreakdownTable';
import { SkeletonStatCards, SkeletonTableRows } from '../../components/skeletons/SkeletonLayouts';
import AdminPageLayout from './components/AdminPageLayout';
import AdminPageHeader from './components/AdminPageHeader';
import { useAdminPageMeta } from './adminPageMeta';
import { useAdminTheme } from './useAdminTheme';

const AdminAnalyticsScreen = () => {
  const { palette, isDark, colors } = useAdminTheme();
  const { isMobile, isTablet } = useResponsive();
  const [snapshot, setSnapshot] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activeMetric, setActiveMetric] = useState('all');
  const { title, description } = useAdminPageMeta();

  const cardBackground = palette.card;
  const textPrimary = palette.textPrimary;
  const textSecondary = palette.textSecondary;
  const borderColor = palette.border;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getAdminAnalytics();
        if (!cancelled) setSnapshot(data);
        try {
          if (!isModelMetricsUnavailable()) {
            const mm = await getAdminModelMetrics();
            if (!cancelled) setModelMetrics(mm);
          }
        } catch (err) {
          if (err?.status === 404) markModelMetricsUnavailable();
          if (!cancelled) setModelMetrics(null);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setSnapshot(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const rawEntries = snapshot?.raw_by_pipeline_status
    ? Object.entries(snapshot.raw_by_pipeline_status).sort((a, b) => b[1] - a[1])
    : [];
  const credEntries = snapshot?.processed_by_credibility_label
    ? Object.entries(snapshot.processed_by_credibility_label).sort((a, b) => b[1] - a[1])
    : [];

  const statCards = [
    {
      icon: FileText,
      label: 'Raw articles',
      value: snapshot != null ? String(snapshot.raw_total ?? 0) : '—',
      color: '#f59e0b',
      key: 'raw',
    },
    {
      icon: BarChart3,
      label: 'Processed',
      value: snapshot != null ? String(snapshot.processed_total ?? 0) : '—',
      color: '#10b981',
      key: 'processed',
    },
    {
      icon: Activity,
      label: 'Pipeline buckets',
      value: snapshot != null ? String(rawEntries.length) : '—',
      color: palette.primary,
      key: 'pipeline',
    },
    {
      icon: Hash,
      label: 'Credibility labels',
      value: snapshot != null ? String(credEntries.length) : '—',
      color: '#8b5cf6',
      key: 'credibility',
    },
  ];

  return (
    <AdminPageLayout maxWidth="1400px">
      <AdminPageHeader title={title} description={description}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12, fontSize: 13 }}>
          <button
            type="button"
            onClick={() => navigate('/admin/notifications')}
            style={{ border: 'none', background: 'transparent', color: palette.textSecondary, cursor: 'pointer', padding: 0 }}
          >
            Notifications
          </button>
          <span style={{ color: palette.border }}>·</span>
          <button
            type="button"
            onClick={() => navigate('/admin/settings')}
            style={{ border: 'none', background: 'transparent', color: palette.textSecondary, cursor: 'pointer', padding: 0 }}
          >
            Platform settings
          </button>
        </div>
      </AdminPageHeader>

      <div className="admin-page-body">
        {loading ? (
          <div style={{ padding: '8px 0 24px' }}>
            <SkeletonStatCards count={4} isDark={isDark} colors={colors} />
            <div style={{ marginTop: 20 }}>
              <SkeletonTableRows rows={8} isDark={isDark} colors={colors} />
            </div>
          </div>
        ) : (
          <>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: getResponsiveGridColumns(isMobile, isTablet, 250),
            gap: getResponsiveGap(isMobile, isTablet),
            marginBottom: '24px',
          }}
        >
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                onClick={() => {
                  if (stat.key === 'raw') navigate('/admin/articles?pipeline=raw');
                  else if (stat.key === 'processed') navigate('/admin/articles?pipeline=done');
                  else setActiveMetric(stat.key);
                }}
                style={{
                  backgroundColor: cardBackground,
                  borderRadius: '12px',
                  border: `1px solid ${activeMetric === stat.key ? palette.primary : borderColor}`,
                  padding: '24px',
                  boxShadow: palette.shadowLight,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    backgroundColor: stat.color + '20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <Icon size={24} color={stat.color} />
                </div>
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: textPrimary,
                    marginBottom: '4px',
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: '14px', color: textSecondary, fontWeight: '500' }}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        {snapshot == null ? (
          <p style={{ color: textSecondary }}>Could not load analytics. Sign in as an admin and ensure the API is up.</p>
        ) : (
          <>
            <AdminBreakdownTable
              title="Raw articles by pipeline_status"
              entries={rawEntries}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              borderColor={borderColor}
              cardBackground={cardBackground}
            />
            {activeMetric !== 'pipeline' && (
              <AdminBreakdownTable
                title="Processed articles by credibility_label"
                entries={credEntries}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                borderColor={borderColor}
                cardBackground={cardBackground}
              />
            )}
            {modelMetrics && (
              <>
                <AdminBreakdownTable
                  title="Model per-class F1"
                  entries={Object.entries(modelMetrics.per_class || {}).map(([k, v]) => [
                    k,
                    Number(v?.['f1-score'] ?? 0).toFixed(3),
                  ])}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  borderColor={borderColor}
                  cardBackground={cardBackground}
                />
                <AdminBreakdownTable
                  title="Model macro/weighted metrics"
                  entries={[
                    ['accuracy', Number(modelMetrics.accuracy ?? 0).toFixed(4)],
                    ['macro_f1', Number(modelMetrics.macro_avg?.['f1-score'] ?? 0).toFixed(4)],
                    ['weighted_f1', Number(modelMetrics.weighted_avg?.['f1-score'] ?? 0).toFixed(4)],
                    ['eval_rows', String(modelMetrics.eval_rows ?? '—')],
                  ]}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  borderColor={borderColor}
                  cardBackground={cardBackground}
                />
                <div
                  style={{
                    backgroundColor: cardBackground,
                    borderRadius: '12px',
                    border: `1px solid ${borderColor}`,
                    padding: '24px',
                    marginBottom: '24px',
                  }}
                >
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: textPrimary, margin: '0 0 12px 0' }}>
                    Confusion matrix (rows=true, cols=pred)
                  </h2>
                  <p style={{ margin: '0 0 10px 0', color: textSecondary, fontSize: '13px' }}>
                    Labels: 0=real, 1=fake, 2=suspicious
                  </p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                        <th style={{ textAlign: 'left', padding: '8px 0', color: textSecondary }}>row</th>
                        <th style={{ textAlign: 'left', padding: '8px 0', color: textSecondary }}>[0,1,2]</th>
                      </tr>
                    </thead>
                    <tbody>
                      {((modelMetrics.confusion_matrix?.matrix || [])).map((row, idx) => (
                        <tr key={`cm-${idx}`} style={{ borderBottom: `1px solid ${borderColor}` }}>
                          <td style={{ padding: '8px 0', color: textPrimary }}>{idx}</td>
                          <td style={{ padding: '8px 0', color: textPrimary }}>{`[${(row || []).join(', ')}]`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <div
              style={{
                backgroundColor: cardBackground,
                borderRadius: '12px',
                border: `1px solid ${borderColor}`,
                padding: '24px',
              }}
            >
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: textPrimary, margin: '0 0 12px 0' }}>
                Raw JSON
              </h2>
              <pre
                style={{
                  margin: 0,
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: palette.pageAlt,
                  border: `1px solid ${borderColor}`,
                  fontSize: '12px',
                  color: textPrimary,
                  overflow: 'auto',
                  maxHeight: '360px',
                }}
              >
                {JSON.stringify(snapshot, null, 2)}
              </pre>
            </div>
          </>
        )}
          </>
        )}
      </div>
    </AdminPageLayout>
  );
};

export default AdminAnalyticsScreen;
