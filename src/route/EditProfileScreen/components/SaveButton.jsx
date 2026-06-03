// components/SaveButton.jsx
import React from "react";
import { TouchableOpacity, StyleSheet, ActivityIndicator, View } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import Text from "../../../components/ui/Text";
import { Check } from "lucide-react-native";
import { useFilledActionColors } from "../../../theme/buttonContrast";

export default function SaveButton({ onPress, loading = false }) {
  const { theme } = useTheme();
  const { colors } = theme;
  const actionColors = useFilledActionColors();
  
  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.8}
      disabled={loading}
      style={[styles.buttonContainer, { shadowColor: colors.shadowDark || '#000' }]}
    >
      <View style={[styles.gradient, { backgroundColor: actionColors.background }]}>
        {loading ? (
          <ActivityIndicator size="small" color={actionColors.foreground} />
        ) : (
          <>
            <Check size={18} color={actionColors.foreground} />
            <Text variant="body" color={actionColors.foreground} style={styles.buttonText}>
              Save Changes
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 24,
    borderRadius: 14,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  buttonText: {
    fontWeight: "700",
    fontSize: 16,
  },
});
