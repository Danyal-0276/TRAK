// components/SettingsRow.jsx
import React from "react";
import { TouchableOpacity, View, Text, StyleSheet, Switch } from "react-native";

export default function SettingsRow({
  icon,
  label,
  darkTheme,
  onPress,
  switchValue,
  onSwitchChange,
  switchEnabled = false,
  labelColor,
}) {
  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: darkTheme ? "#111" : "#fff" }]}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!onPress && !switchEnabled}
    >
      <View style={styles.rowLeft}>
        {icon}
        <Text
          style={[
            styles.label,
            { color: labelColor || (darkTheme ? "#fff" : "#000") },
          ]}
        >
          {label}
        </Text>
      </View>

      {switchEnabled && (
        <Switch
          trackColor={{ false: "#6b7280", true: "#000" }}
          thumbColor={switchValue ? "#fff" : "#ccc"}
          ios_backgroundColor="#6b7280"
          onValueChange={onSwitchChange}
          value={switchValue}
        />
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
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  label: { fontSize: 16, marginLeft: 12 },
});
