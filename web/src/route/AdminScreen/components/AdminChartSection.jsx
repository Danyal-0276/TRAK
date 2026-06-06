import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/**
 * Web equivalent of mobile ChartSection (react-native-chart-kit LineChart).
 */
export default function AdminChartSection({
  title,
  dateRange,
  data = [],
  lines = [],
  showLegend = false,
  legend = [],
  height = 220,
  yAxisSuffix = '',
  colors = {},
}) {
  const textPrimary = colors.textPrimary || '#0a0a0a';
  const textSecondary = colors.textSecondary || '#525252';
  const gridColor = colors.grid || colors.borderLight || '#f0f0f0';
  const cardBg = colors.cardBackground || colors.card || '#ffffff';

  const formatY = (v) => {
    const n = Number(v);
    if (Number.isNaN(n)) return v;
    const base = yAxisSuffix ? `${n}${yAxisSuffix}` : String(n);
    return base;
  };

  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: 18, fontWeight: 700, color: textPrimary }}>{title}</h3>
        {dateRange ? (
          <p style={{ margin: 0, fontSize: 13, color: textSecondary }}>{dateRange}</p>
        ) : null}
      </div>

      {showLegend && legend.length > 0 ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 20,
            marginBottom: 16,
          }}
        >
          {legend.map((item) => (
            <span
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: textSecondary,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: item.color,
                }}
              />
              {item.label}
            </span>
          ))}
        </div>
      ) : null}

      <div
        style={{
          width: '100%',
          height,
          borderRadius: 16,
          marginTop: 8,
          marginBottom: 8,
          backgroundColor: cardBg,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid stroke={gridColor} strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: textSecondary, fontSize: 12 }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: textSecondary, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatY}
              width={yAxisSuffix ? 44 : 36}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: `1px solid ${gridColor}`,
                backgroundColor: cardBg,
                color: textPrimary,
              }}
              formatter={(value) => [formatY(value), '']}
              labelStyle={{ color: textPrimary, fontWeight: 600 }}
              itemStyle={{ color: textPrimary }}
            />
            {lines.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                strokeWidth={line.strokeWidth ?? 2}
                dot={line.showDots === true ? { r: 4 } : false}
                activeDot={line.showDots === true ? { r: 5 } : { r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
