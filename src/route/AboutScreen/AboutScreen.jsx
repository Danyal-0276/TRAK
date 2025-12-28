import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme/ThemeContext";

const AboutScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors, spacing } = theme;
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
        <Text style={styles.title}>About This App</Text>
        <Text style={styles.text}>
          This app is designed to provide a personalized experience with modern
          design, secure data management, and customizable features.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Version</Text>
          <Text style={styles.sectionText}>1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer</Text>
          <Text style={styles.sectionText}>Shahroz Butt & Danyal & Abdullah</Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;
