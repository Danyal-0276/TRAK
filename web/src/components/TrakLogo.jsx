import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import blackLogo from '../../../src/assets/images/blackLogo.svg';
import whiteLogo from '../../../src/assets/images/whiteLogo.svg';

/**
 * TRAK mark from shared src/assets (same files as React Native app).
 * @param {'auto'|'black'|'white'} variant — auto picks by light/dark theme
 */
export default function TrakLogo({ size = 36, variant = 'auto', className = '', alt = 'TRAK' }) {
  const { theme } = useTheme();
  const useWhite = variant === 'white' || (variant === 'auto' && theme === 'dark');
  const src = useWhite ? whiteLogo : blackLogo;

  return (
    <img
      src={src}
      alt={alt}
      className={`trak-logo-img ${className}`.trim()}
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
}
