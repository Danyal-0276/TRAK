import React from 'react';

const AdminBreakdownTable = ({ title, entries, textPrimary, textSecondary, borderColor, cardBackground }) => (
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

export default AdminBreakdownTable;
