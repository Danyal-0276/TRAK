import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

/**
 * Header theme control — ghost style like bell/chat icons (no filled pill).
 */
export default function ThemeToggle({ isDark, colors, onClick, size = 20 }) {
  const [hovered, setHovered] = useState(false);

  const iconFade =
    'opacity var(--trak-transition-duration, 1.15s) var(--trak-transition-ease, ease)';

  return (
    <button
      type="button"
      className="header-icon-btn header-theme-toggle"
      onClick={onClick}
      title={isDark ? 'Light mode' : 'Dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        border: 'none',
        padding: 0,
        margin: 0,
        backgroundColor: hovered ? colors.surfaceHover : 'transparent',
        color: colors.textPrimary,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <Sun
        size={size}
        strokeWidth={1.75}
        fill="none"
        aria-hidden
        style={{
          position: 'absolute',
          opacity: isDark ? 1 : 0,
          transition: iconFade,
          pointerEvents: 'none',
        }}
      />
      <Moon
        size={size}
        strokeWidth={1.75}
        fill="none"
        aria-hidden
        style={{
          position: 'absolute',
          opacity: isDark ? 0 : 1,
          transition: iconFade,
          pointerEvents: 'none',
        }}
      />
    </button>
  );
}
