import React from 'react';
import { useTheme } from '../theme/ThemeContext';

/**
 * Theme-aware TRAK mark: cross-fades black/white logos with the theme transition.
 * @param {'auto'|'light'|'dark'} variant — force logo color for fixed backgrounds (e.g. landing hero)
 */
export default function TrakLogo({ size = 32, alt = 'TRAK', style, className, variant = 'auto' }) {
  const { theme } = useTheme();
  const mode =
    variant === 'dark' ? 'dark' : variant === 'light' ? 'light' : theme.mode;
  const isDark = mode === 'dark';

  const fade = 'opacity var(--trak-transition-duration, 1.15s) var(--trak-transition-ease, ease)';

  return (
    <span
      className={className ? `trak-logo ${className}` : 'trak-logo'}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: size,
        height: size,
        flexShrink: 0,
        ...style,
      }}
    >
      <img
        src="/images/blackLogo.svg"
        alt={alt}
        aria-hidden={isDark}
        style={{
          position: 'absolute',
          inset: 0,
          margin: 'auto',
          width: size,
          height: 'auto',
          maxHeight: '100%',
          display: 'block',
          opacity: isDark ? 0 : 1,
          transition: fade,
          pointerEvents: 'none',
        }}
      />
      <img
        src="/images/whiteLogo.svg"
        alt={isDark ? alt : ''}
        aria-hidden={!isDark}
        style={{
          position: 'absolute',
          inset: 0,
          margin: 'auto',
          width: size,
          height: 'auto',
          maxHeight: '100%',
          display: 'block',
          opacity: isDark ? 1 : 0,
          transition: fade,
          pointerEvents: 'none',
        }}
      />
    </span>
  );
}
