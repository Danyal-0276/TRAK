import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import Text from './Text';

const Input = ({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, style, ...props }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;

  return (
    <View style={style}>
      {label ? (
        <Text variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing.xs }}>{label}</Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={[styles.input, {
          backgroundColor: colors.surfaceElevated,
          color: colors.textPrimary,
          borderColor: colors.border,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md
        }]}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
  }
});

export default Input;
