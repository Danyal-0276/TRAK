import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

const PrivacyScreen = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
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

      <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
        <Text style={styles.btnText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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

export default PrivacyScreen;
