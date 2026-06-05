import React from 'react';

/**
 * Recharts default tooltip uses hard-coded dark item text — unreadable on dark cards.
 */
export default function AdminChartTooltip({ active, payload, label, palette }) {
  if (!active || !payload?.length || !palette) return null;

  return (
    <div
      style={{
        borderRadius: 10,
        border: `1px solid ${palette.border}`,
        backgroundColor: palette.card,
        color: palette.textPrimary,
        fontSize: 12,
        boxShadow: `0 4px 12px ${palette.shadow}`,
        padding: '10px 12px',
        minWidth: 120,
      }}
    >
      {label != null && label !== '' ? (
        <p
          style={{
            margin: '0 0 6px',
            fontWeight: 700,
            color: palette.textPrimary,
            lineHeight: 1.35,
          }}
        >
          {label}
        </p>
      ) : null}
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {payload.map((entry, index) => {
          const name = entry.name ?? entry.dataKey ?? 'Value';
          const value = entry.value ?? entry.payload?.value ?? 0;
          const swatch = entry.color || entry.fill;
          return (
            <li
              key={`${name}-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: palette.textPrimary,
                lineHeight: 1.4,
              }}
            >
              {swatch ? (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: swatch,
                    flexShrink: 0,
                  }}
                />
              ) : null}
              <span style={{ color: palette.textSecondary }}>{name}</span>
              <span style={{ color: palette.textTertiary }}>:</span>
              <span style={{ color: palette.textPrimary, fontWeight: 600 }}>{value}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function adminChartTooltipRenderer(palette) {
  return function renderTooltip(props) {
    return <AdminChartTooltip {...props} palette={palette} />;
  };
}
