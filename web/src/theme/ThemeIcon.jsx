import React from 'react';

/** Lucide icon that transitions color in sync with the rest of the UI. */
export default function ThemeIcon({ icon: Icon, size, color, style, className, ...rest }) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        lineHeight: 0,
        flexShrink: 0,
        ...style,
      }}
    >
      <Icon size={size} strokeWidth={1.75} fill="none" aria-hidden {...rest} />
    </span>
  );
}
