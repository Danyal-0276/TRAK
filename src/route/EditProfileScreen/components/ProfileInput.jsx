// components/ProfileInput.jsx
import React, { useState, useRef } from "react";
import { View, TextInput, StyleSheet, Animated } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import Text from "../../../components/ui/Text";

export default function ProfileInput({ label, value, onChangeText, multiline = false, keyboardType = "default" }) {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  const [focused, setFocused] = useState(false);
  const borderColorAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderColorAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderColorAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  return (
    <View style={styles.container}>
      <Text variant="caption" color={colors.textSecondary} style={[styles.label, { marginBottom: spacing.xs }]}>
        {label}
      </Text>
      <Animated.View style={[styles.inputContainer, { borderColor }]}>
        <TextInput
          style={[
            styles.input, 
            { 
              color: colors.textPrimary,
              backgroundColor: colors.surface,
            },
            multiline && { height: 100, textAlignVertical: "top" }
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          keyboardType={keyboardType}
          placeholder={`Enter your ${label.toLowerCase()}`}
          placeholderTextColor={colors.textTertiary}
          cursorColor={colors.primary}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontWeight: "600",
    fontSize: 14,
  },
  inputContainer: {
    borderWidth: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    padding: 14,
    fontSize: 15,
    borderRadius: 12,
  },
});
