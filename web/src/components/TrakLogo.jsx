import React from 'react';
import { useTheme } from '../theme/ThemeContext';

/**
 * Theme-aware TRAK mark: black logo on light, white logo on dark.
 */
export default function TrakLogo({ size = 32, alt = 'TRAK', style, className }) {
  const { theme } = useTheme();
  const src = theme.mode === 'dark' ? '/images/whiteLogo.svg' : '/images/blackLogo.svg';

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ width: size, height: size, display: 'block', ...style }}
    />
  );
}
