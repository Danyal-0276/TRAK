import React from 'react';
import { useTheme } from '../theme/ThemeContext';

/**
 * Theme-aware TRAK mark: black logo on light, white logo on dark.
 * @param {'auto'|'light'|'dark'} variant — force logo color for fixed backgrounds (e.g. landing hero)
 */
export default function TrakLogo({ size = 32, alt = 'TRAK', style, className, variant = 'auto' }) {
  const { theme } = useTheme();
  const src =
    variant === 'dark'
      ? '/images/whiteLogo.svg'
      : variant === 'light'
        ? '/images/blackLogo.svg'
        : theme.mode === 'dark'
          ? '/images/whiteLogo.svg'
          : '/images/blackLogo.svg';

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ width: size, height: 'auto', display: 'block', ...style }}
    />
  );
}
