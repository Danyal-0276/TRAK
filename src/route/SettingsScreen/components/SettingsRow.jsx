// components/SettingsRow.jsx
import React from "react";
import { TouchableOpacity, View, StyleSheet, Switch } from "react-native";
import { ChevronRight } from "lucide-react-native";
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
      style={[styles.row, { 
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }]}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!onPress && !switchEnabled}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
          {icon}
        </View>
        <Text variant="body" color={labelColor || colors.textPrimary} style={styles.label}>
          {label}
        </Text>
      </View>

      {switchEnabled ? (
        <Switch
          trackColor={{ false: colors.borderDark || colors.border, true: colors.primary }}
          thumbColor={switchValue ? colors.surface : colors.surface}
          ios_backgroundColor={colors.borderDark || colors.border}
          onValueChange={onSwitchChange}
          value={switchValue}
        />
      ) : onPress ? (
        <ChevronRight size={20} color={colors.textTertiary} />
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
});
