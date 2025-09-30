import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Bell,
  Lock,
  Tag,
  Database,
  Info,
  LogOut,
  Moon,
} from "lucide-react-native";



const SettingsScreen = ({ navigation }) => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [keywordAlerts, setKeywordAlerts] = useState(false);
  const [quietHours, setQuietHours] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);

  const Row = ({ children, onPress }) => (
    <TouchableOpacity
      style={[
        styles.row,
        { backgroundColor: darkTheme ? "#111" : "#fff" },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: darkTheme ? "#000" : "#f5f5f5" },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
    
        <View style={styles.header}>
          <Text
            style={[styles.headerTitle, { color: darkTheme ? "#fff" : "#000" }]}
          >
            Settings
          </Text>
        </View>

      
        <View
          style={[
            styles.section,
            {
              backgroundColor: darkTheme ? "#111" : "#fff",
              shadowOpacity: darkTheme ? 0 : 0.05,
            },
          ]}
        >
          <Row onPress={() => navigation.navigate('ProfileScreen')}>
            <User size={22} color={darkTheme ? "#fff" : "#000"} />
            <Text style={[styles.label, { color: darkTheme ? "#fff" : "#000" }]}>
              Account
            </Text>
          </Row>
        </View>


        <View
          style={[
            styles.section,
            {
              backgroundColor: darkTheme ? "#111" : "#fff",
              shadowOpacity: darkTheme ? 0 : 0.05,
            },
          ]}
        >
          <Row>
            <Bell size={22} color={darkTheme ? "#fff" : "#000"} />
            <Text style={[styles.label, { color: darkTheme ? "#fff" : "#000" }]}>
              Push Notifications
            </Text>
            <Switch
              trackColor={{ false: "#6b7280", true: "#000" }}
              thumbColor={pushEnabled ? "#fff" : "#ccc"}
              ios_backgroundColor="#6b7280"
              onValueChange={setPushEnabled}
              value={pushEnabled}
            />
          </Row>

          <View
            style={[
              styles.separator,
              { backgroundColor: darkTheme ? "#333" : "#E5E7EB" },
            ]}
          />

          <Row>
            <Tag size={22} color={darkTheme ? "#fff" : "#000"} />
            <Text style={[styles.label, { color: darkTheme ? "#fff" : "#000" }]}>
              Keyword Alerts
            </Text>
            <Switch
              trackColor={{ false: "#6b7280", true: "#000" }}
              thumbColor={keywordAlerts ? "#fff" : "#ccc"}
              ios_backgroundColor="#6b7280"
              onValueChange={setKeywordAlerts}
              value={keywordAlerts}
            />
          </Row>

          <View
            style={[
              styles.separator,
              { backgroundColor: darkTheme ? "#333" : "#E5E7EB" },
            ]}
          />

          <Row>
            <Moon size={22} color={darkTheme ? "#fff" : "#000"} />
            <Text style={[styles.label, { color: darkTheme ? "#fff" : "#000" }]}>
              Quiet Hours
            </Text>
            <Switch
              trackColor={{ false: "#6b7280", true: "#000" }}
              thumbColor={quietHours ? "#fff" : "#ccc"}
              ios_backgroundColor="#6b7280"
              onValueChange={setQuietHours}
              value={quietHours}
            />
          </Row>
        </View>

        
        <View
          style={[
            styles.section,
            {
              backgroundColor: darkTheme ? "#111" : "#fff",
              shadowOpacity: darkTheme ? 0 : 0.05,
            },
          ]}
        >
          <Row onPress={() => navigation.navigate("PrivacyScreen")}>
            <Lock size={22} color={darkTheme ? "#fff" : "#000"} />
            <Text style={[styles.label, { color: darkTheme ? "#fff" : "#000" }]}>
              Privacy & Security
            </Text>
          </Row>
        </View>

       
        <View
          style={[
            styles.section,
            {
              backgroundColor: darkTheme ? "#111" : "#fff",
              shadowOpacity: darkTheme ? 0 : 0.05,
            },
          ]}
        >
          <Row onPress={() => navigation.navigate("CategoriesScreen")}>
            <Tag size={22} color={darkTheme ? "#fff" : "#000"} />
            <Text style={[styles.label, { color: darkTheme ? "#fff" : "#000" }]}>
              Manage Categories
            </Text>
          </Row>
        </View>

        
        <View
          style={[
            styles.section,
            {
              backgroundColor: darkTheme ? "#111" : "#fff",
              shadowOpacity: darkTheme ? 0 : 0.05,
            },
          ]}
        >
          <Row onPress={() => navigation.navigate("DataScreen")}>
            <Database size={22} color={darkTheme ? "#fff" : "#000"} />
            <Text style={[styles.label, { color: darkTheme ? "#fff" : "#000" }]}>
              Data & Storage
            </Text>
          </Row>
        </View>

     
        <View
          style={[
            styles.section,
            {
              backgroundColor: darkTheme ? "#111" : "#fff",
              shadowOpacity: darkTheme ? 0 : 0.05,
            },
          ]}
        >
          <Row onPress={() => navigation.navigate("AboutScreen")}>
            <Info size={22} color={darkTheme ? "#fff" : "#000"} />
            <Text style={[styles.label, { color: darkTheme ? "#fff" : "#000" }]}>
              About
            </Text>
          </Row>
        </View>

       
        <View
          style={[
            styles.section,
            {
              backgroundColor: darkTheme ? "#111" : "#fff",
              shadowOpacity: darkTheme ? 0 : 0.05,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.themeButton,
              { backgroundColor: darkTheme ? "#fff" : "#000" },
            ]}
            onPress={() => setDarkTheme(!darkTheme)}
          >
            <Text
              style={[
                styles.themeText,
                { color: darkTheme ? "#000" : "#fff" },
              ]}
            >
              {darkTheme ? "Switch to Light Theme" : "Switch to Dark Theme"}
            </Text>
          </TouchableOpacity>
        </View>

        
        <View
          style={[
            styles.section,
            {
              backgroundColor: darkTheme ? "#111" : "#fff",
              shadowOpacity: darkTheme ? 0 : 0.05,
            },
          ]}
        >
          <Row>
            <LogOut size={22} color="#EF4444" />
            <Text style={[styles.label, { color: "#EF4444" }]}>Log Out</Text>
          </Row>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16 },
  header: { marginBottom: 20, alignItems: "center" },
  headerTitle: { fontSize: 22, fontWeight: "bold" },
  section: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  separator: {
    height: 1,
    marginLeft: 50,
  },
  label: { fontSize: 16, flex: 1, marginLeft: 12 },
  themeButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  themeText: { fontSize: 16, fontWeight: "600" },
});

export default SettingsScreen;
