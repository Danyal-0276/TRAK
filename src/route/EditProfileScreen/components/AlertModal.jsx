// components/AlertModal.jsx
import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import { useFilledActionColors } from "../../../theme/buttonContrast";

export default function AlertModal({ visible, title, message, onClose }) {
  const { theme } = useTheme();
  const { colors } = theme;
  const actionColors = useFilledActionColors();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[
          styles.alertBox,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadowDark || '#000',
          },
        ]}>
          <Text style={[styles.alertTitle, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.alertMessage, { color: colors.textSecondary }]}>{message}</Text>
          <TouchableOpacity
            style={[styles.alertBtn, { backgroundColor: actionColors.background }]}
            onPress={onClose}
          >
            <Text style={[styles.alertBtnText, { color: actionColors.foreground }]}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    width: "80%",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  alertMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  alertBtn: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  alertBtnText: {
    fontWeight: "bold",
  },
});
