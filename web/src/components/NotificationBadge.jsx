import React from 'react';

export default function NotificationBadge({ count = 0, size = 'md', style = {} }) {
  if (!count || count <= 0) return null;
  const label = count > 99 ? '99+' : String(count);
  const isSm = size === 'sm';
  const minW = isSm ? 16 : 18;
  const h = isSm ? 16 : 18;
  const fontSize = isSm ? 9 : 10;

  return (
    <span
      aria-label={`${count} unread notifications`}
      style={{
        position: 'absolute',
        top: isSm ? 4 : 6,
        right: isSm ? 4 : 6,
        minWidth: minW,
        height: h,
        padding: '0 4px',
        borderRadius: 999,
        backgroundColor: '#ef4444',
        color: '#ffffff',
        fontSize,
        fontWeight: 800,
        lineHeight: `${h}px`,
        textAlign: 'center',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {label}
    </span>
  );
}
