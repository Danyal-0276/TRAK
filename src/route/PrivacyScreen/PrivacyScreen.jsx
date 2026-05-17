import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme/ThemeContext";

const PrivacyScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { padding: 20, backgroundColor: colors.background, flexGrow: 1 },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, color: colors.textPrimary },
    text: { fontSize: 16, color: colors.textSecondary, marginBottom: 20 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 6, color: colors.textPrimary },
    sectionText: { fontSize: 15, color: colors.textSecondary },
    btn: {
      backgroundColor: colors.textPrimary,
      padding: 14,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 20,
    },
    btnText: { color: colors.surface, fontWeight: "bold", fontSize: 16 },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
        <Text style={styles.title}>Privacy & Security</Text>
        <Text style={styles.text}>
          Your privacy is our priority. We ensure that your personal data is
          stored securely and never shared with third parties without your
          consent.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Protection</Text>
          <Text style={styles.sectionText}>
            All user data is encrypted and securely stored in compliance with
            industry standards.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          <Text style={styles.sectionText}>
            Enable two-factor authentication to add an extra layer of security to
            your account.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyScreen;
