import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme/ThemeContext";

const DataScreen = ({ navigation }) => {
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
        <Text style={styles.title}>Data & Storage</Text>
        <Text style={styles.text}>
          Manage your data usage and storage preferences for better performance.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage Used</Text>
          <Text style={styles.sectionText}>120 MB of 1 GB</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup</Text>
          <Text style={styles.sectionText}>
            Automatic cloud backup is enabled. Your data is safe and secure.
          </Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DataScreen;
