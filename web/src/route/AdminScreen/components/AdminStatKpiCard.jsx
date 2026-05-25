import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

function accentGradient(accent, cardBg, isDark) {
  if (!accent?.startsWith?.('#') || accent.length !== 7) {
    return cardBg;
  }
  if (isDark) {
    return `linear-gradient(145deg, ${accent}30 0%, ${accent}14 45%, ${cardBg} 100%)`;
  }
  return `linear-gradient(145deg, ${accent}1a 0%, ${cardBg} 72%)`;
}

export default function AdminStatKpiCard({ stat, palette, isDark, primary, onNavigate }) {
  const [hovered, setHovered] = useState(false);
  const Icon = stat.icon;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onNavigate(stat.path)}
      onKeyDown={(e) => e.key === 'Enter' && onNavigate(stat.path)}
      title={stat.hint}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? accentGradient(stat.accent, palette.card, isDark) : palette.card,
        borderRadius: 14,
        border: `1px solid ${hovered ? stat.accent : palette.border}`,
        borderLeft: `4px solid ${stat.accent}`,
        padding: '18px 18px 16px',
        cursor: 'pointer',
        boxShadow: hovered ? `0 8px 24px ${palette.shadow}` : `0 1px 2px ${palette.shadowLight}`,
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: hovered ? `${stat.accent}18` : palette.pageAlt,
            border: `1px solid ${hovered ? `${stat.accent}40` : palette.borderLight}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={20} color={stat.accent} strokeWidth={2.25} />
        </div>
        <ArrowRight size={16} color={hovered ? stat.accent : palette.textTertiary} />
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: palette.textPrimary,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
        }}
      >
        {stat.value}
      </div>
      <div style={{ fontSize: 13, color: palette.textSecondary, fontWeight: 500, marginTop: 6 }}>{stat.label}</div>
    </div>
  );
}
