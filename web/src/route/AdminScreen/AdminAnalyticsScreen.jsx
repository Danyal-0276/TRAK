import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import {
  getResponsivePadding,
  getResponsiveMaxWidth,
  getResponsiveGridColumns,
  getResponsiveGap,
  getResponsiveFontSize,
} from '../../utils/responsiveStyles';
import { FileText, BarChart3, Activity, Hash } from 'lucide-react';
import { getAdminAnalytics, getAdminModelMetrics } from '../../api/adminApi';

const BreakdownTable = ({ title, entries, textPrimary, textSecondary, borderColor, cardBackground }) => (
  <div
    style={{
      backgroundColor: cardBackground,
      borderRadius: '12px',
      border: `1px solid ${borderColor}`,
      padding: '24px',
      marginBottom: '24px',
    }}
  >
    <h2
      style={{
        fontSize: '18px',
        fontWeight: '700',
        color: textPrimary,
        margin: '0 0 16px 0',
      }}
    >
      {title}
    </h2>
    {entries.length === 0 ? (
      <p style={{ margin: 0, color: textSecondary, fontSize: '14px' }}>No data.</p>
    ) : (
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
            <th style={{ textAlign: 'left', padding: '8px 0', color: textSecondary }}>Key</th>
            <th style={{ textAlign: 'right', padding: '8px 0', color: textSecondary }}>Count</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([k, v]) => (
            <tr key={String(k)} style={{ borderBottom: `1px solid ${borderColor}` }}>
              <td style={{ padding: '10px 0', color: textPrimary }}>{String(k)}</td>
              <td style={{ padding: '10px 0', textAlign: 'right', color: textPrimary, fontWeight: 600 }}>
                {v}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

const AdminAnalyticsScreen = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';
  const { isMobile, isTablet } = useResponsive();
  const [snapshot, setSnapshot] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const backgroundColor = isDark ? colors.background || '#0F172A' : '#ffffff';
  const cardBackground = isDark ? colors.surface || '#1E293B' : '#ffffff';
  const textPrimary = isDark ? colors.textPrimary || '#F1F5F9' : '#0f172a';
  const textSecondary = isDark ? colors.textSecondary || '#CBD5E1' : '#64748b';
  const borderColor = isDark ? colors.border || '#334155' : '#e5e7eb';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getAdminAnalytics();
        if (!cancelled) setSnapshot(data);
        try {
          const mm = await getAdminModelMetrics();
          if (!cancelled) setModelMetrics(mm);
        } catch {
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
    },
    {
      icon: BarChart3,
      label: 'Processed',
      value: snapshot != null ? String(snapshot.processed_total ?? 0) : '—',
      color: '#10b981',
    },
    {
      icon: Activity,
      label: 'Pipeline buckets',
      value: snapshot != null ? String(rawEntries.length) : '—',
      color: '#3b82f6',
    },
    {
      icon: Hash,
      label: 'Credibility labels',
      value: snapshot != null ? String(credEntries.length) : '—',
      color: '#8b5cf6',
    },
  ];

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: backgroundColor,
          paddingTop: '0',
          marginTop: '0',
        }}
      >
        <div
          style={{
            maxWidth: getResponsiveMaxWidth(isMobile, isTablet, '1400px'),
            margin: '0 auto',
            width: '100%',
            padding: getResponsivePadding(isMobile, isTablet),
          }}
        >
          <div
            style={{
              marginTop: '0',
              marginBottom: isMobile ? '20px' : '32px',
              paddingTop: '0',
            }}
          >
            <h1
              style={{
                fontSize: getResponsiveFontSize(isMobile, isTablet, 28),
                fontWeight: '700',
                color: textPrimary,
                margin: '0 0 8px 0',
                letterSpacing: '-0.5px',
              }}
            >
              Analytics
            </h1>
            <p
              style={{
                fontSize: '15px',
                color: textSecondary,
                margin: '0',
                lineHeight: '1.5',
              }}
            >
              MongoDB counts from the admin API (same source as the mobile admin panel).
            </p>
          </div>

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
                  style={{
                    backgroundColor: cardBackground,
                    borderRadius: '12px',
                    border: `1px solid ${borderColor}`,
                    padding: '24px',
                    boxShadow: isDark ? '0 1px 3px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
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
                    {loading ? '...' : stat.value}
                  </div>
                  <div style={{ fontSize: '14px', color: textSecondary, fontWeight: '500' }}>{stat.label}</div>
                </div>
              );
            })}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  border: `3px solid ${borderColor}`,
                  borderTop: `3px solid ${isDark ? colors.primary || '#818CF8' : '#0f172a'}`,
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
            </div>
          ) : snapshot == null ? (
            <p style={{ color: textSecondary }}>Could not load analytics. Sign in as an admin and ensure the API is up.</p>
          ) : (
            <>
              <BreakdownTable
                title="Raw articles by pipeline_status"
                entries={rawEntries}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                borderColor={borderColor}
                cardBackground={cardBackground}
              />
              <BreakdownTable
                title="Processed articles by credibility_label"
                entries={credEntries}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                borderColor={borderColor}
                cardBackground={cardBackground}
              />
              {modelMetrics && (
                <>
                  <BreakdownTable
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
                  <BreakdownTable
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
                    backgroundColor: isDark ? colors.surfaceElevated || '#334155' : '#f9fafb',
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
        </div>
      </div>
    </>
  );
};

export default AdminAnalyticsScreen;
