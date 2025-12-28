import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

const Card = ({ children, style }) => {
  const { theme } = useTheme();
  const { colors, radius, spacing, elevation } = theme;

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: spacing.lg,
          shadowColor: colors.shadow,
          shadowOpacity: 0.12,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: 12,
          elevation: elevation.lg,
          borderWidth: 1,
          borderColor: colors.border
        },
        style
      ]}
    >
      {children}
    </View>
  );
};

export default Card;
