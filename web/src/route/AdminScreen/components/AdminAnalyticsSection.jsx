import React from 'react';
import { TrendingUp } from 'lucide-react';
import AdminStatRow from './AdminStatRow';
import AdminChartSection from './AdminChartSection';
import AdminPercentageCard from './AdminPercentageCard';
import {
  MOCK_ANALYTICS,
  CHART_LEGEND_NEWS,
  CHART_LINES_NEWS,
  toWeeklyChartData,
  toMonthlyChartData,
} from '../mockAdminData';

function ConfusionMatrix({ matrix, borderColor }) {
  const rows = matrix || [];
  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
        overflow: 'hidden',
        display: 'inline-block',
        width: '100%',
        maxWidth: 360,
      }}
    >
      {rows.map((row, rIdx) => {
        const rowMax = Math.max(...(row || [1]), 1);
        return (
          <div key={`cm-row-${rIdx}`} style={{ display: 'flex' }}>
            {(row || []).map((v, cIdx) => {
              const intensity = Math.max(0.15, Number(v || 0) / rowMax);
              return (
                <div
                  key={`cm-${rIdx}-${cIdx}`}
                  style={{
                    flex: 1,
                    minHeight: 52,
                    borderRight: cIdx < 2 ? `1px solid ${borderColor}` : 'none',
                    borderBottom: rIdx < 2 ? `1px solid ${borderColor}` : 'none',
                    backgroundColor: `rgba(59, 130, 246, ${intensity})`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  <span>{String(v)}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.9 }}>{`r${rIdx}→c${cIdx}`}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function ServerAnalyticsView({ data, modelMetrics, colors }) {
  const textPrimary = colors.textPrimary;
  const textSecondary = colors.textSecondary;
  const borderColor = colors.border;
  const primary = colors.primary || '#3b82f6';

  const rawBy = data.raw_by_pipeline_status || {};
  const credBy = data.processed_by_credibility_label || {};
  const rawEntries = Object.entries(rawBy).sort((a, b) => b[1] - a[1]);
  const credEntries = Object.entries(credBy).sort((a, b) => b[1] - a[1]);
  const rawMax = Math.max(...rawEntries.map(([, v]) => v), 1);
  const credMax = Math.max(...credEntries.map(([, v]) => v), 1);

  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, margin: '0 0 8px 0' }}>
        Live data (Mongo)
      </h2>
      <p style={{ fontSize: 13, color: textSecondary, margin: '0 0 16px 0' }}>
        Totals: {data.raw_total ?? 0} raw · {data.processed_total ?? 0} processed
      </p>

      <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, margin: '0 0 8px 0' }}>
        Raw by pipeline_status
      </h3>
      {rawEntries.length === 0 ? (
        <p style={{ fontSize: 13, color: textSecondary, marginBottom: 20 }}>No raw articles or status not set.</p>
      ) : (
        rawEntries.map(([k, v]) => (
          <AdminStatRow
            key={k}
            label={String(k)}
            value={String(v)}
            percentage={(v / rawMax) * 100}
            color={primary}
            textPrimary={textPrimary}
            borderColor={borderColor}
          />
        ))
      )}

      <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, margin: '16px 0 8px 0' }}>
        Processed by credibility_label
      </h3>
      {credEntries.length === 0 ? (
        <p style={{ fontSize: 13, color: textSecondary }}>No processed articles yet.</p>
      ) : (
        credEntries.map(([k, v]) => (
          <AdminStatRow
            key={k}
            label={String(k)}
            value={String(v)}
            percentage={(v / credMax) * 100}
            color="#4CAF50"
            textPrimary={textPrimary}
            borderColor={borderColor}
          />
        ))
      )}

      {modelMetrics ? (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, margin: '0 0 8px 0' }}>
            Model performance
          </h3>
          <AdminStatRow
            label="Accuracy"
            value={Number(modelMetrics.accuracy ?? 0).toFixed(4)}
            percentage={100}
            color={primary}
            textPrimary={textPrimary}
            borderColor={borderColor}
          />
          <AdminStatRow
            label="Macro F1"
            value={Number(modelMetrics.macro_avg?.['f1-score'] ?? 0).toFixed(4)}
            percentage={100}
            color="#4CAF50"
            textPrimary={textPrimary}
            borderColor={borderColor}
          />
          <AdminStatRow
            label="Weighted F1"
            value={Number(modelMetrics.weighted_avg?.['f1-score'] ?? 0).toFixed(4)}
            percentage={100}
            color="#FF9800"
            textPrimary={textPrimary}
            borderColor={borderColor}
          />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, margin: '14px 0 8px 0' }}>
            Confusion matrix (rows=true, cols=pred)
          </h3>
          <p style={{ fontSize: 13, color: textSecondary, margin: '0 0 8px 0' }}>
            Labels order: 0=real, 1=fake, 2=suspicious
          </p>
          <ConfusionMatrix matrix={modelMetrics.confusion_matrix?.matrix} borderColor={borderColor} />
        </div>
      ) : null}
    </section>
  );
}

function MockAnalyticsView({ analytics, colors, cardBackground, borderColor }) {
  const textPrimary = colors.textPrimary;
  const textSecondary = colors.textSecondary;
  const data = analytics || MOCK_ANALYTICS;
  const { newsStats, weeklyData, monthlyTrend } = data;
  const total = newsStats.real + newsStats.fake + newsStats.underReview;
  const realPct = ((newsStats.real / total) * 100).toFixed(1);
  const fakePct = ((newsStats.fake / total) * 100).toFixed(1);
  const reviewPct = ((newsStats.underReview / total) * 100).toFixed(1);

  const pctCards = [
    { label: 'Real News', count: newsStats.real, pct: realPct, color: '#4CAF50' },
    { label: 'Fake News', count: newsStats.fake, pct: fakePct, color: '#f44336' },
    { label: 'Under Review', count: newsStats.underReview, pct: reviewPct, color: '#FF9800' },
  ];

  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: `${colors.primary || '#3b82f6'}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TrendingUp size={20} color={colors.primary || '#3b82f6'} />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, margin: 0 }}>News Analytics</h2>
          <p style={{ fontSize: 14, color: textSecondary, margin: '4px 0 0 0' }}>
            Comprehensive news verification statistics
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        {pctCards.map((c) => (
          <AdminPercentageCard
            key={c.label}
            percentage={c.pct}
            label={c.label}
            count={c.count}
            color={c.color}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
          />
        ))}
      </div>

      <AdminChartSection
        title="Weekly News Distribution"
        dateRange="Last 7 days"
        data={toWeeklyChartData(weeklyData)}
        lines={CHART_LINES_NEWS}
        showLegend
        legend={CHART_LEGEND_NEWS}
        colors={{ textPrimary, textSecondary, grid: borderColor, cardBackground }}
      />

      <AdminChartSection
        title="Monthly Trend Comparison"
        dateRange="Last 3 months"
        data={toMonthlyChartData(monthlyTrend)}
        lines={CHART_LINES_NEWS}
        colors={{ textPrimary, textSecondary, grid: borderColor, cardBackground }}
      />

      <h3 style={{ fontSize: 16, fontWeight: 700, color: textPrimary, marginBottom: 8 }}>Detailed Statistics</h3>
      <AdminStatRow label="Verified Real News" value={newsStats.real} percentage={realPct} color="#4CAF50" textPrimary={textPrimary} borderColor={borderColor} />
      <AdminStatRow label="Identified Fake News" value={newsStats.fake} percentage={fakePct} color="#f44336" textPrimary={textPrimary} borderColor={borderColor} />
      <AdminStatRow label="Pending Verification" value={newsStats.underReview} percentage={reviewPct} color="#FF9800" textPrimary={textPrimary} borderColor={borderColor} />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 20,
          marginTop: 12,
          borderTop: `2px solid ${borderColor}`,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700, color: textPrimary }}>Total Articles Analyzed</span>
        <span style={{ fontSize: 28, fontWeight: 700, color: colors.primary || '#3b82f6' }}>{total}</span>
      </div>
    </section>
  );
}

export default function AdminAnalyticsSection({ serverAnalytics, modelMetrics, mockAnalytics, colors, cardBackground, borderColor }) {
  if (serverAnalytics) {
    return <ServerAnalyticsView data={serverAnalytics} modelMetrics={modelMetrics} colors={colors} />;
  }
  return (
    <MockAnalyticsView
      analytics={mockAnalytics}
      colors={colors}
      cardBackground={cardBackground}
      borderColor={borderColor}
    />
  );
}
