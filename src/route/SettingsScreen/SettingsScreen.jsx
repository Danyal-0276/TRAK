// SettingsScreen.jsx
import React, { useState } from "react";
import { ScrollView, SafeAreaView, StyleSheet, View } from "react-native";
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

import SettingsHeader from "./components/SettingsHeader";
import SettingsSection from "./components/SettingsSection";
import SettingsRow from "./components/SettingsRow";
import ThemeSwitchButton from "./components/ThemeSwitchButton";

export default function SettingsScreen({ navigation }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [keywordAlerts, setKeywordAlerts] = useState(false);
  const [quietHours, setQuietHours] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: darkTheme ? "#000" : "#f5f5f5" },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <SettingsHeader darkTheme={darkTheme} />

        {/* Account Section */}
        <SettingsSection darkTheme={darkTheme}>
          <SettingsRow
            icon={<User size={22} color={darkTheme ? "#fff" : "#000"} />}
            label="Account"
            darkTheme={darkTheme}
            onPress={() => navigation.navigate("ProfileScreen")}
          />
        </SettingsSection>

        {/* Notification Settings */}
        <SettingsSection darkTheme={darkTheme}>
          <SettingsRow
            icon={<Bell size={22} color={darkTheme ? "#fff" : "#000"} />}
            label="Push Notifications"
            darkTheme={darkTheme}
            switchEnabled
            switchValue={pushEnabled}
            onSwitchChange={setPushEnabled}
          />

          <SettingsRow
            icon={<Tag size={22} color={darkTheme ? "#fff" : "#000"} />}
            label="Keyword Alerts"
            darkTheme={darkTheme}
            switchEnabled
            switchValue={keywordAlerts}
            onSwitchChange={setKeywordAlerts}
          />

          <SettingsRow
            icon={<Moon size={22} color={darkTheme ? "#fff" : "#000"} />}
            label="Quiet Hours"
            darkTheme={darkTheme}
            switchEnabled
            switchValue={quietHours}
            onSwitchChange={setQuietHours}
          />
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection darkTheme={darkTheme}>
          <SettingsRow
            icon={<Lock size={22} color={darkTheme ? "#fff" : "#000"} />}
            label="Privacy & Security"
            darkTheme={darkTheme}
            onPress={() => navigation.navigate("PrivacyScreen")}
          />
        </SettingsSection>

        {/* Categories */}
        <SettingsSection darkTheme={darkTheme}>
          <SettingsRow
            icon={<Tag size={22} color={darkTheme ? "#fff" : "#000"} />}
            label="Manage Categories"
            darkTheme={darkTheme}
            onPress={() => navigation.navigate("CategoriesScreen")}
          />
        </SettingsSection>

        {/* Data */}
        <SettingsSection darkTheme={darkTheme}>
          <SettingsRow
            icon={<Database size={22} color={darkTheme ? "#fff" : "#000"} />}
            label="Data & Storage"
            darkTheme={darkTheme}
            onPress={() => navigation.navigate("DataScreen")}
          />
        </SettingsSection>

        {/* About */}
        <SettingsSection darkTheme={darkTheme}>
          <SettingsRow
            icon={<Info size={22} color={darkTheme ? "#fff" : "#000"} />}
            label="About"
            darkTheme={darkTheme}
            onPress={() => navigation.navigate("AboutScreen")}
          />
        </SettingsSection>

        {/* Theme Toggle */}
        <SettingsSection darkTheme={darkTheme}>
          <ThemeSwitchButton
            darkTheme={darkTheme}
            onToggle={() => setDarkTheme(!darkTheme)}
          />
        </SettingsSection>

        {/* Logout */}
        <SettingsSection darkTheme={darkTheme}>
          <SettingsRow
            icon={<LogOut size={22} color="#EF4444" />}
            label="Log Out"
            darkTheme={darkTheme}
            labelColor="#EF4444"
            onPress={() => navigation.navigate("LoginScreen")}
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16 },
});
