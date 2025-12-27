import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const DataScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20, backgroundColor: "#fff", flexGrow: 1 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, color: "#000" },
  text: { fontSize: 16, color: "#555", marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 6 },
  sectionText: { fontSize: 15, color: "#555" },
  btn: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default DataScreen;
