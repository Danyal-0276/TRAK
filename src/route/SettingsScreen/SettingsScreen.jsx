// SettingsScreen.jsx
import React, { useState } from "react";
import { ScrollView, SafeAreaView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { User, Bell, Lock, Tag, Database, Info, LogOut, Moon } from "lucide-react-native";

import SettingsHeader from "./components/SettingsHeader";
import SettingsSection from "./components/SettingsSection";
import SettingsRow from "./components/SettingsRow";
import ThemeSwitchButton from "./components/ThemeSwitchButton";
import { useTheme } from "../../theme/ThemeContext";
import Card from "../../components/ui/Card";
import Text from "../../components/ui/Text";

export default function SettingsScreen({ navigation }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [keywordAlerts, setKeywordAlerts] = useState(false);
  const [quietHours, setQuietHours] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const darkTheme = theme.mode === "dark";
  const insets = useSafeAreaInsets();
  const contentPaddingTop = Math.max(insets.top, theme.spacing.md);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: contentPaddingTop,
            paddingHorizontal: theme.spacing.md,
            paddingBottom: theme.spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <SettingsHeader />

        <Card style={{ marginBottom: theme.spacing.lg }}>
          <Text variant="subtitle" color={theme.colors.textPrimary}>
            Your Account
          </Text>
          <Text
            variant="body"
            color={theme.colors.textSecondary}
            style={{ marginTop: theme.spacing.xs }}
          >
            Manage profile, preferences, and security.
          </Text>
        </Card>

        <SettingsSection>
          <SettingsRow
            icon={<User size={22} color={theme.colors.textPrimary} />}
            label="Account"
            onPress={() => navigation.navigate("ProfileScreen")}
          />
        </SettingsSection>

        <SettingsSection>
          <SettingsRow
            icon={<Bell size={22} color={theme.colors.textPrimary} />}
            label="Push Notifications"
            switchEnabled
            switchValue={pushEnabled}
            onSwitchChange={setPushEnabled}
          />
          <SettingsRow
            icon={<Tag size={22} color={theme.colors.textPrimary} />}
            label="Keyword Alerts"
            switchEnabled
            switchValue={keywordAlerts}
            onSwitchChange={setKeywordAlerts}
          />
          <SettingsRow
            icon={<Moon size={22} color={theme.colors.textPrimary} />}
            label="Quiet Hours"
            switchEnabled
            switchValue={quietHours}
            onSwitchChange={setQuietHours}
          />
        </SettingsSection>

        <SettingsSection>
          <SettingsRow
            icon={<Lock size={22} color={theme.colors.textPrimary} />}
            label="Privacy & Security"
            onPress={() => navigation.navigate("PrivacyScreen")}
          />
        </SettingsSection>

        <SettingsSection>
          <SettingsRow
            icon={<Tag size={22} color={theme.colors.textPrimary} />}
            label="Manage Categories"
            onPress={() => navigation.navigate("CategoriesScreen")}
          />
        </SettingsSection>

        <SettingsSection>
          <SettingsRow
            icon={<Database size={22} color={theme.colors.textPrimary} />}
            label="Data & Storage"
            onPress={() => navigation.navigate("DataScreen")}
          />
        </SettingsSection>

        <SettingsSection>
          <SettingsRow
            icon={<Info size={22} color={theme.colors.textPrimary} />}
            label="About"
            onPress={() => navigation.navigate("AboutScreen")}
          />
        </SettingsSection>

        <SettingsSection>
          <ThemeSwitchButton darkTheme={darkTheme} onToggle={toggleTheme} />
        </SettingsSection>

        <SettingsSection>
          <SettingsRow
            icon={<LogOut size={22} color={theme.colors.error} />}
            label="Log Out"
            labelColor={theme.colors.error}
            onPress={() => navigation.navigate("LoginScreen")}
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {},
});
