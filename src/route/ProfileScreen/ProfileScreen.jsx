import React, { useState, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StatusBar, StyleSheet, Animated, View } from "react-native";
import ProfileHeader from "./components/ProfileHeader";
import ProfileActions from "./components/ProfileActions";
import BookmarkList from "./components/BookmarkList";
import LogoutButton from "./components/LogoutButton";
import { useTheme } from "../../theme/ThemeContext";

const UserProfileScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const [bookmarks] = useState([
    {
      id: 1,
      title: "AI transforming healthcare in 2025",
      summary:
        "AI adoption in hospitals is growing rapidly, enhancing patient outcomes...",
      date: "2h ago",
    },
    {
      id: 2,
      title: "SNGPL service updates",
      summary: "SNGPL announced new digital services for customers...",
      date: "1d ago",
    },
    {
      id: 3,
      title: "Mobile market 2025",
      summary:
        "Latest Samsung vs iPhone models compared — new battle in flagship space...",
      date: "2d ago",
    },
  ]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContent}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          name="Shahroz"
          username="@shahroz_butt"
          bio="Personalized AI News & Reports 📑"
          avatar={require("../../assets/images/profile.jpg")}
        />
        <View style={styles.sectionGap}>
          <StatsRow />
        </View>
        <ProfileActions navigation={navigation} />
        <BookmarkList bookmarks={bookmarks} />
        <LogoutButton onLogout={() => navigation.navigate("LoginScreen")} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const StatsRow = () => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  const items = [
    { label: 'Following', value: '180' },
    { label: 'Followers', value: '2.4k' },
    { label: 'Saved', value: '38' },
  ];

  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      {items.map((item) => (
        <View
          key={item.label}
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            paddingVertical: spacing.md,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Animated.Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '800' }}>{item.value}</Animated.Text>
          <Animated.Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>{item.label}</Animated.Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  sectionGap: { marginTop: 8, marginBottom: 20 },
});

export default UserProfileScreen;
