import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

const AboutScreen = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
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

export default AboutScreen;
