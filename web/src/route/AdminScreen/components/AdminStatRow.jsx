import React from 'react';

const AdminStatRow = ({ label, value, percentage = 100, color, textPrimary, borderColor }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 0',
      borderBottom: `1px solid ${borderColor}`,
      gap: 16,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: color,
          marginRight: 12,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 15, fontWeight: 500, color: textPrimary }}>{label}</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: 1, maxWidth: 160 }}>
      <span style={{ fontSize: 18, fontWeight: 700, color: textPrimary, marginBottom: 4 }}>{value}</span>
      <div
        style={{
          width: 120,
          height: 6,
          backgroundColor: borderColor,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, Number(percentage) || 0))}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 3,
          }}
        />
      </div>
    </div>
  </div>
);

export default AdminStatRow;
