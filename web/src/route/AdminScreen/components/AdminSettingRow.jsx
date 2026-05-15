import React from 'react';

export default function AdminSettingRow({ label, children, borderColor, textPrimary }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: `1px solid ${borderColor}`,
        gap: 16,
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 500, color: textPrimary }}>{label}</span>
      {children}
    </div>
  );
}
