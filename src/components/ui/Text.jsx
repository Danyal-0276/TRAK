import React from 'react';
import { Text as RNText } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

const Text = ({ variant = 'body', color, style, children, ...props }) => {
  const { theme } = useTheme();
  const base = theme.typography[variant] || theme.typography.body;
  const resolvedColor = color || theme.colors.textPrimary;

  return (
    <RNText
      {...props}
      style={[
        base,
        { color: resolvedColor },
        style
      ]}
    >
      {children}
    </RNText>
  );
};

export default Text;
