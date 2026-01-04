// components/SaveButton.jsx
import React from "react";
import { TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "../../../theme/ThemeContext";
import Text from "../../../components/ui/Text";
import { Check } from "lucide-react-native";

export default function SaveButton({ onPress, loading = false }) {
  const { theme } = useTheme();
  const { colors } = theme;
  
  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.8}
      disabled={loading}
      style={styles.buttonContainer}
    >
      <LinearGradient
        colors={[colors.primary, `${colors.primary}DD`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.surface} />
        ) : (
          <>
            <Check size={18} color={colors.surface} />
            <Text variant="body" color={colors.surface} style={styles.buttonText}>
              Save Changes
            </Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 24,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: "#000",
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
