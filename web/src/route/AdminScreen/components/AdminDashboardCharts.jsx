import React, { useId } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  activityAreaData,
  credibilityPieData,
  factCheckBarData,
  pipelinePieData,
  sourceBarData,
} from '../dashboardChartUtils';

const CHART_HEIGHT = 280;

function ChartCard({ title, subtitle, children, palette }) {
  return (
    <div
      style={{
        backgroundColor: palette.card,
        borderRadius: 14,
        border: `1px solid ${palette.border}`,
        boxShadow: `0 1px 2px ${palette.shadowLight}`,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '16px 18px 12px',
          borderBottom: `1px solid ${palette.borderLight}`,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: palette.textPrimary, letterSpacing: '-0.02em' }}>
          {title}
        </h3>
        {subtitle ? (
          <p style={{ margin: '4px 0 0', fontSize: 12, color: palette.textSecondary, lineHeight: 1.4 }}>{subtitle}</p>
        ) : null}
      </div>
      <div style={{ width: '100%', height: CHART_HEIGHT, minHeight: CHART_HEIGHT, padding: '8px 4px 12px' }}>
        {children}
      </div>
    </div>
  );
}

function LegendPill({ label, value, color }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        color: 'inherit',
        padding: '4px 10px',
        borderRadius: 999,
        backgroundColor: `${color}20`,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
      <span>
        <strong style={{ fontWeight: 700 }}>{value}</strong> {label}
      </span>
    </span>
  );
}

function EmptyChart({ palette, message }) {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: palette.textSecondary,
        fontSize: 13,
      }}
    >
      {message}
    </div>
  );
}

function chartGridColumns(isMobile, isTablet) {
  if (isMobile) return '1fr';
  if (isTablet) return 'repeat(2, minmax(0, 1fr))';
  return 'repeat(3, minmax(0, 1fr))';
}

export default function AdminDashboardCharts({ snapshot, palette, isMobile = false, isTablet = false }) {
  const uid = useId().replace(/:/g, '');
  const scrapedGrad = `scrapedGrad${uid}`;
  const processedGrad = `processedGrad${uid}`;

  const activity = activityAreaData(snapshot);
  const pipeline = pipelinePieData(snapshot, palette);
  const credibility = credibilityPieData(snapshot, palette);
  const factCheck = factCheckBarData(snapshot, palette);
  const sourcesRaw = sourceBarData(snapshot, 'raw_by_source_key');
  const sourcesProc = sourceBarData(snapshot, 'processed_by_source_key');
  const ps = snapshot?.pipeline_summary || {};

  const tip = {
    borderRadius: 10,
    border: `1px solid ${palette.border}`,
    backgroundColor: palette.card,
    color: palette.textPrimary,
    fontSize: 12,
    boxShadow: `0 4px 12px ${palette.shadow}`,
  };

  const axisTick = { fill: palette.textTertiary, fontSize: 11 };
  const gridStroke = palette.borderLight;

  const pipelineSegments = [
    { n: ps.done, color: palette.pipeline.done, label: 'Done' },
    { n: ps.pending, color: palette.pipeline.pending, label: 'Pending' },
    { n: ps.processing, color: palette.pipeline.processing, label: 'Processing' },
    { n: ps.failed, color: palette.pipeline.failed, label: 'Failed' },
    { n: ps.unknown, color: palette.pipeline.unknown, label: 'Unknown' },
  ].filter((x) => x.n > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div
        style={{
          backgroundColor: palette.card,
          borderRadius: 14,
          border: `1px solid ${palette.border}`,
          boxShadow: `0 1px 2px ${palette.shadowLight}`,
          padding: '18px 20px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: palette.textPrimary }}>Pipeline progress</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: palette.textSecondary }}>
              {ps.completion_pct ?? 0}% of raw corpus complete · {ps.queued ?? 0} in queue
            </p>
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: palette.primary,
              letterSpacing: '-0.03em',
            }}
          >
            {ps.completion_pct ?? 0}%
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            height: 10,
            borderRadius: 999,
            overflow: 'hidden',
            backgroundColor: palette.pageAlt,
          }}
        >
          {pipelineSegments.map((seg) => (
            <div
              key={seg.label}
              title={`${seg.label}: ${seg.n}`}
              style={{
                flex: seg.n,
                backgroundColor: seg.color,
                minWidth: seg.n > 0 ? 6 : 0,
                transition: 'flex 0.3s ease',
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 14,
            color: palette.textSecondary,
          }}
        >
          {pipelineSegments.map((seg) => (
            <LegendPill key={seg.label} label={seg.label.toLowerCase()} value={seg.n} color={seg.color} />
          ))}
        </div>
      </div>

      <h2
        style={{
          margin: '4px 0 0',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: palette.textTertiary,
        }}
      >
        Analytics
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: chartGridColumns(isMobile, isTablet),
          gap: 16,
        }}
      >
        <ChartCard
          title="Scrape & process activity"
          subtitle="Last 14 days · MongoDB ingest & process dates"
          palette={palette}
        >
          {activity.length === 0 ? (
            <EmptyChart palette={palette} message="No dated activity in this period" />
          ) : (
            <ResponsiveContainer width="100%" height={CHART_HEIGHT - 24}>
              <AreaChart data={activity} margin={{ top: 4, right: 12, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id={scrapedGrad} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={palette.chart.scraped} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={palette.chart.scraped} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id={processedGrad} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={palette.chart.processed} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={palette.chart.processed} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridStroke} vertical={false} strokeDasharray="4 4" />
                <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={tip} labelStyle={{ color: palette.textSecondary }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" iconSize={8} />
                <Area
                  type="monotone"
                  dataKey="scraped"
                  name="Scraped"
                  stroke={palette.chart.scraped}
                  fill={`url(#${scrapedGrad})`}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="processed"
                  name="Processed"
                  stroke={palette.chart.processed}
                  fill={`url(#${processedGrad})`}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Pipeline status" subtitle="Raw articles by status" palette={palette}>
          {pipeline.length === 0 ? (
            <EmptyChart palette={palette} message="No pipeline data" />
          ) : (
            <ResponsiveContainer width="100%" height={CHART_HEIGHT - 20}>
              <PieChart>
                <Pie
                  data={pipeline}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="46%"
                  innerRadius={54}
                  outerRadius={82}
                  paddingAngle={3}
                  stroke={palette.card}
                  strokeWidth={2}
                >
                  {pipeline.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tip} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Credibility mix" subtitle="Processed verdicts" palette={palette}>
          {credibility.length === 0 ? (
            <EmptyChart palette={palette} message="No processed articles" />
          ) : (
            <ResponsiveContainer width="100%" height={CHART_HEIGHT - 20}>
              <PieChart>
                <Pie
                  data={credibility}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="46%"
                  innerRadius={0}
                  outerRadius={82}
                  paddingAngle={2}
                  stroke={palette.card}
                  strokeWidth={2}
                >
                  {credibility.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tip} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Fact-check outcomes" subtitle="By verdict" palette={palette}>
          {factCheck.length === 0 ? (
            <EmptyChart palette={palette} message="No fact-check data" />
          ) : (
            <ResponsiveContainer width="100%" height={CHART_HEIGHT - 20}>
              <BarChart data={factCheck} layout="vertical" margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
                <CartesianGrid stroke={gridStroke} horizontal={false} strokeDasharray="4 4" />
                <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={96} tick={{ ...axisTick, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tip} cursor={{ fill: palette.pageAlt }} />
                <Bar dataKey="value" name="Articles" radius={[0, 6, 6, 0]} barSize={14}>
                  {factCheck.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Top sources (raw)" subtitle="By source_key" palette={palette}>
          {sourcesRaw.length === 0 ? (
            <EmptyChart palette={palette} message="No source breakdown" />
          ) : (
            <ResponsiveContainer width="100%" height={CHART_HEIGHT - 20}>
              <BarChart data={sourcesRaw} margin={{ top: 8, right: 8, left: -12, bottom: 48 }}>
                <CartesianGrid stroke={gridStroke} vertical={false} strokeDasharray="4 4" />
                <XAxis
                  dataKey="name"
                  tick={{ ...axisTick, fontSize: 10 }}
                  interval={0}
                  angle={-32}
                  textAnchor="end"
                  height={52}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={axisTick} width={32} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tip} cursor={{ fill: palette.pageAlt }} />
                <Bar dataKey="count" name="Articles" fill={palette.chart.rawBar} radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Top sources (processed)" subtitle="Feed-ready" palette={palette}>
          {sourcesProc.length === 0 ? (
            <EmptyChart palette={palette} message="No processed sources" />
          ) : (
            <ResponsiveContainer width="100%" height={CHART_HEIGHT - 20}>
              <BarChart data={sourcesProc} margin={{ top: 8, right: 8, left: -12, bottom: 48 }}>
                <CartesianGrid stroke={gridStroke} vertical={false} strokeDasharray="4 4" />
                <XAxis
                  dataKey="name"
                  tick={{ ...axisTick, fontSize: 10 }}
                  interval={0}
                  angle={-32}
                  textAnchor="end"
                  height={52}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={axisTick} width={32} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tip} cursor={{ fill: palette.pageAlt }} />
                <Bar dataKey="count" name="Articles" fill={palette.chart.procBar} radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
