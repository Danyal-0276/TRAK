import React, { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import Text from './Text';

const Input = ({ label, value, onChange, placeholder, type = 'text', style, error, ...props }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const [focused, setFocused] = useState(false);

  return (
    <div style={style}>
      {label ? (
        <Text variant="caption" color={colors.textSecondary || '#64748b'} style={{ 
          marginBottom: '8px', 
          display: 'block',
          fontWeight: 500,
          fontSize: '14px',
        }}>
          {label}
        </Text>
      ) : null}
      <div style={{ position: 'relative' }}>
        <input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          type={type}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            backgroundColor: colors.backgroundSecondary || '#f8fafc',
            color: colors.textPrimary || '#0f172a',
            border: `2px solid ${error ? '#ef4444' : (focused ? '#3b82f6' : '#e2e8f0')}`,
            padding: '14px 16px',
            borderRadius: '12px',
            fontSize: '15px',
            outline: 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: focused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
            fontWeight: 400,
          }}
          {...props}
        />
        {error && (
          <Text variant="caption" color="#ef4444" style={{
            marginTop: '6px',
            fontSize: '13px',
          }}>
            {error}
          </Text>
        )}
      </div>
    </div>
  );
};

export default Input;
