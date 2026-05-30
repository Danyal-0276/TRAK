import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import Text from './Text';
import './Button.css';

const Button = ({ title, onPress, variant = 'primary', primaryColors, style, textStyle, leftIcon, rightIcon, disabled }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: '12px',
      padding: '14px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      fontWeight: 600,
      fontSize: '15px',
      letterSpacing: '0.2px',
      width: '100%',
      boxShadow: 'none',
      ...style
    };

    if (variant === 'primary') {
      const gradientColors = primaryColors || (colors.primaryGradient || [colors.primaryLight, colors.primary]);
      return {
        ...baseStyle,
        background: `linear-gradient(135deg, ${gradientColors.join(', ')})`,
        color: '#ffffff',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      };
    }

    if (variant === 'secondary') {
      return {
        ...baseStyle,
        backgroundColor: colors.textPrimary,
        color: '#ffffff',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)',
      };
    }

    // outline
    return {
      ...baseStyle,
      border: `2px solid ${colors.border || '#e2e8f0'}`,
      backgroundColor: 'transparent',
      color: colors.textPrimary,
      background: 'transparent',
    };
  };

  return (
    <button
      onClick={onPress}
      disabled={disabled}
      style={getButtonStyle()}
      className="button-modern"
      onMouseEnter={(e) => {
        if (!disabled && variant === 'primary') {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
        } else if (!disabled && variant === 'outline') {
          e.currentTarget.style.backgroundColor = colors.backgroundSecondary || '#f8fafc';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && variant === 'primary') {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
        } else if (!disabled && variant === 'outline') {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {leftIcon}
      <Text variant="button" color={variant === 'outline' ? colors.textPrimary : '#ffffff'} style={textStyle}>
        {title}
      </Text>
      {rightIcon}
    </button>
  );
};

export default Button;
