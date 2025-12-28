// components/SettingsRow.jsx
import React from "react";
import { TouchableOpacity, View, StyleSheet, Switch } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import Text from "../../../components/ui/Text";

export default function SettingsRow({
  icon,
  label,
  onPress,
  switchValue,
  onSwitchChange,
  switchEnabled = false,
  labelColor,
  trailing,
}) {
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!onPress && !switchEnabled}
    >
      <View style={styles.rowLeft}>
        {icon}
        <Text variant="body" color={labelColor || colors.textPrimary} style={{ marginLeft: spacing.sm }}>
          {label}
        </Text>
      </View>

      {switchEnabled ? (
        <Switch
          trackColor={{ false: colors.borderDark, true: colors.primary }}
          thumbColor={switchValue ? colors.surface : colors.surface}
          ios_backgroundColor={colors.borderDark}
          onValueChange={onSwitchChange}
          value={switchValue}
        />
      ) : (
        trailing || null
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
});
