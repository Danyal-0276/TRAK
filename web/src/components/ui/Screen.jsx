import React from 'react';
import { useTheme } from '../../theme/ThemeContext';

const Screen = ({ children, gradient = false, style, className = '' }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const screenStyle = {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: colors.background,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'background-color 0.3s ease',
    ...style
  };

  if (gradient) {
    screenStyle.background = `linear-gradient(135deg, ${colors.background}, ${colors.backgroundSecondary}, ${colors.background})`;
    screenStyle.backgroundSize = '200% 200%';
  }

  return (
    <div 
      style={screenStyle}
      className={`screen-container fade-in ${className}`}
    >
      {children}
    </div>
  );
};

export default Screen;

