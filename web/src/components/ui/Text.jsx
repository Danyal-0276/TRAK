import React from 'react';
import { useTheme } from '../../theme/ThemeContext';

const Text = ({ variant = 'body', color, style, children, ...props }) => {
  const { theme } = useTheme();
  const base = theme.typography[variant] || theme.typography.body;
  const resolvedColor = color || theme.colors.textPrimary;

  return (
    <span
      {...props}
      style={{
        ...base,
        color: resolvedColor,
        ...style
      }}
    >
      {children}
    </span>
  );
};

export default Text;


