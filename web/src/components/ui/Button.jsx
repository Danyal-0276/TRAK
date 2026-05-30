import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { filledActionColors } from '../../theme/buttonContrast';
import Text from './Text';
import './Button.css';

const Button = ({ title, onPress, variant = 'primary', primaryColors, style, textStyle, leftIcon, rightIcon, disabled }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';
  const action = filledActionColors(colors, isDark);

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
      ...style,
    };

    if (variant === 'primary') {
      const bg = primaryColors?.[0] || action.background;
      return {
        ...baseStyle,
        background: bg,
        color: action.foreground,
        boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.35)' : '0 4px 12px rgba(0, 0, 0, 0.12)',
      };
    }

    if (variant === 'secondary') {
      return {
        ...baseStyle,
        backgroundColor: action.background,
        color: action.foreground,
        boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.12)',
      };
    }

    return {
      ...baseStyle,
      border: `2px solid ${colors.border}`,
      backgroundColor: 'transparent',
      color: colors.textPrimary,
      background: 'transparent',
    };
  };

  const buttonStyle = getButtonStyle();
  const labelColor = variant === 'outline' ? colors.textPrimary : action.foreground;

  return (
    <button
      onClick={onPress}
      disabled={disabled}
      style={buttonStyle}
      className="button-modern"
      onMouseEnter={(e) => {
        if (!disabled && variant === 'primary') {
          e.currentTarget.style.transform = 'translateY(-1px)';
        } else if (!disabled && variant === 'outline') {
          e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && variant === 'primary') {
          e.currentTarget.style.transform = 'translateY(0)';
        } else if (!disabled && variant === 'outline') {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {leftIcon}
      <Text variant="button" color={labelColor} style={textStyle}>
        {title}
      </Text>
      {rightIcon}
    </button>
  );
};

export default Button;
