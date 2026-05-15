import React from 'react';

export default function AdminPercentageCard({ percentage, label, count, color, textPrimary, textSecondary }) {
  return (
    <div style={{ textAlign: 'center', flex: 1, minWidth: 100 }}>
      <div style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{percentage}%</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: textSecondary }}>{count} articles</div>
    </div>
  );
}
