// SettingsScreen.jsx
import React, { useState, useRef, useEffect } from "react";
import { ScrollView, SafeAreaView, StyleSheet, StatusBar, Animated, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { User, Bell, Lock, Tag, Database, Info, LogOut, Moon, FileText, Mail } from "lucide-react-native";
import { getNotificationPreferences, patchNotificationPreferences } from "../../api/notificationsApi";

import SettingsHeader from "./components/SettingsHeader";
import SettingsSection from "./components/SettingsSection";
import SettingsRow from "./components/SettingsRow";
import ThemeSwitchButton from "./components/ThemeSwitchButton";
import { useTheme } from "../../theme/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import Text from "../../components/ui/Text";
import { resetTabBarVisibility, setTabBarHidden } from "../../navigation/tabBarVisibility";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SettingsScreen({ navigation }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [keywordAlerts, setKeywordAlerts] = useState(true);
  const [quietHours, setQuietHours] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { colors } = theme;
  const { logout } = useAuth();
  const darkTheme = theme.mode === "dark";
  const insets = useSafeAreaInsets();
  const contentPaddingTop = Math.max(insets.top, theme.spacing.md);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const lastScrollY = useRef(0);
  const circle1Anim = useRef(new Animated.Value(0)).current;
  const circle2Anim = useRef(new Animated.Value(0)).current;
  const circle3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(circle1Anim, {
        toValue: 1,
        duration: 1000,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(circle2Anim, {
        toValue: 1,
        duration: 1000,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(circle3Anim, {
        toValue: 1,
        duration: 1000,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    resetTabBarVisibility();
    return () => resetTabBarVisibility();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const p = await getNotificationPreferences();
        setPushEnabled(!!p.push_enabled);
        setEmailEnabled(!!p.email_enabled);
        setKeywordAlerts(!!p.keyword_alerts);
      } catch {
        /* defaults */
      }
    })();
  }, []);

  const handleScroll = (event) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;
    if (Math.abs(diff) > 6) {
      if (diff > 0 && currentY > 40) setTabBarHidden(true);
      if (diff < 0) setTabBarHidden(false);
    }
    lastScrollY.current = currentY;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Gradient background */}
      <LinearGradient
        colors={theme.mode === 'dark' 
          ? ['#0F172A', '#1E293B', '#334155', '#1E293B', '#0F172A']
          : [colors.background, colors.backgroundSecondary, '#F8FAFC', colors.backgroundSecondary, colors.background]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />
      
      {/* Animated decorative circles */}
      <Animated.View 
        style={[
          styles.accentCircle1, 
          { 
            backgroundColor: `rgba(0, 0, 0, ${theme.mode === 'dark' ? '0.12' : '0.05'})`,
            opacity: circle1Anim,
            transform: [
              {
                scale: circle1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          }
        ]}
        pointerEvents="none"
      />
      <Animated.View 
        style={[
          styles.accentCircle2, 
          { 
            backgroundColor: `rgba(0, 0, 0, ${theme.mode === 'dark' ? '0.10' : '0.04'})`,
            opacity: circle2Anim,
            transform: [
              {
                scale: circle2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          }
        ]}
        pointerEvents="none"
      />
      <Animated.View 
        style={[
          styles.accentCircle3, 
          { 
            backgroundColor: `rgba(0, 0, 0, ${theme.mode === 'dark' ? '0.08' : '0.03'})`,
            opacity: circle3Anim,
            transform: [
              {
                scale: circle3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          }
        ]}
        pointerEvents="none"
      />
      
      <Animated.ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: contentPaddingTop,
            paddingHorizontal: theme.spacing.md,
            paddingBottom: theme.spacing.lg,
          },
        ]}
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
            icon={<User size={22} color={colors.primary} />}
            label="Account"
            onPress={() => navigation.navigate("ProfileScreen")}
          />
        </SettingsSection>

        <Card style={{ marginBottom: theme.spacing.lg }}>
          <Text variant="subtitle" color={theme.colors.textPrimary}>
            Feed &amp; channels
          </Text>
          <Text variant="caption" color={theme.colors.textSecondary} style={{ marginTop: theme.spacing.xs }}>
            Topics you follow for your personalized feed
          </Text>
        </Card>

        <SettingsSection>
          <SettingsRow
            icon={<Tag size={22} color={colors.primary} />}
            label="Following news channels"
            onPress={() => navigation.navigate("TagSelection", { fromSettings: true, selectedTags: [] })}
          />
        </SettingsSection>

        <Card style={{ marginBottom: theme.spacing.md }}>
          <Text variant="subtitle" color={theme.colors.textPrimary}>
            Notification preferences
          </Text>
        </Card>

        <SettingsSection>
          <SettingsRow
            icon={<Bell size={22} color={colors.primary} />}
            label="Push notifications"
            switchEnabled
            switchValue={pushEnabled}
            onSwitchChange={async (v) => {
              setPushEnabled(v);
              try {
                await patchNotificationPreferences({ push_enabled: v });
              } catch {
                setPushEnabled(!v);
              }
            }}
          />
          <SettingsRow
            icon={<Mail size={22} color={colors.primary} />}
            label="Email notifications"
            switchEnabled
            switchValue={emailEnabled}
            onSwitchChange={async (v) => {
              setEmailEnabled(v);
              try {
                await patchNotificationPreferences({ email_enabled: v });
              } catch {
                setEmailEnabled(!v);
              }
            }}
          />
          <SettingsRow
            icon={<Tag size={22} color={colors.primary} />}
            label="Keyword alerts"
            switchEnabled
            switchValue={keywordAlerts}
            onSwitchChange={async (v) => {
              setKeywordAlerts(v);
              try {
                await patchNotificationPreferences({ keyword_alerts: v });
              } catch {
                setKeywordAlerts(!v);
              }
            }}
          />
          <SettingsRow
            icon={<Moon size={22} color={colors.primary} />}
            label="Quiet hours"
            switchEnabled
            switchValue={quietHours}
            onSwitchChange={setQuietHours}
          />
        </SettingsSection>

        <SettingsSection>
          <SettingsRow
            icon={<Lock size={22} color={colors.primary} />}
            label="Privacy & Security"
            onPress={() => navigation.navigate("PrivacyScreen")}
          />
          <SettingsRow
            icon={<FileText size={22} color={colors.primary} />}
            label="Terms of Service"
            onPress={() => navigation.getParent()?.navigate("TermsScreen")}
          />
        </SettingsSection>

        <SettingsSection>
          <SettingsRow
            icon={<Database size={22} color={colors.primary} />}
            label="Data & Storage"
            onPress={() => navigation.navigate("DataScreen")}
          />
        </SettingsSection>

        <SettingsSection>
          <SettingsRow
            icon={<Info size={22} color={colors.primary} />}
            label="About"
            onPress={() => navigation.navigate("AboutScreen")}
          />
        </SettingsSection>

        <SettingsSection>
          <ThemeSwitchButton darkTheme={darkTheme} onToggle={toggleTheme} />
        </SettingsSection>

        <SettingsSection>
          <SettingsRow
            icon={<LogOut size={22} color={colors.error} />}
            label="Log Out"
            labelColor={colors.error}
            onPress={async () => {
              await logout();
              const root = navigation.getParent()?.getParent();
              root?.reset({ index: 0, routes: [{ name: "OpeningScreen" }] });
            }}
          />
        </SettingsSection>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  accentCircle1: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    top: -100,
    right: -100,
  },
  accentCircle2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    bottom: 200,
    left: -80,
  },
  accentCircle3: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: SCREEN_HEIGHT * 0.4,
    right: -50,
  },
  scroll: {},
});
