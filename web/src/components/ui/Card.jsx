import React from 'react';
import { useTheme } from '../../theme/ThemeContext';

const Card = ({ children, style, hover = false, onClick }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const cardStyle = {
    backgroundColor: colors.surface || '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
    border: `1px solid ${colors.border || '#e2e8f0'}`,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    ...style
  };

  if (hover || onClick) {
    cardStyle.cursor = onClick ? 'pointer' : 'default';
  }

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hover || onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover || onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)';
        }
      }}
    >
      {children}
    </div>
  );
};

export default Card;
