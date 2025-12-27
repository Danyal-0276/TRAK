import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import Text from './Text';

const Button = ({ title, onPress, variant = 'primary', primaryColors, style, textStyle, leftIcon, rightIcon, disabled }) => {
  const { theme } = useTheme();
  const { colors, radius, spacing } = theme;

  const content = (
    <View style={[styles.row, { gap: spacing.sm, alignItems: 'center', justifyContent: 'center' }]}> 
      {leftIcon}
      <Text variant="button" color={variant === 'outline' ? colors.textPrimary : colors.surface} style={textStyle}>
        {title}
      </Text>
      {rightIcon}
    </View>
  );

  if (variant === 'primary') {
    const gradientColors = primaryColors || [colors.primaryLight, colors.primary];
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} disabled={disabled} style={[{ borderRadius: radius.lg }, style]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingVertical: spacing.lg, borderRadius: radius.lg, alignItems: 'center' }}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} disabled={disabled} style={[{ backgroundColor: colors.textPrimary, paddingVertical: spacing.lg, borderRadius: radius.lg, alignItems: 'center' }, style]}>
        {content}
      </TouchableOpacity>
    );
  }

  // outline
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} disabled={disabled} style={[{ borderWidth: 1.5, borderColor: colors.border, paddingVertical: spacing.lg, borderRadius: radius.lg, alignItems: 'center' }, style]}>
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row' }
});

export default Button;
