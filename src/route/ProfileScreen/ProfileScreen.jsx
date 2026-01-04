import React, { useState, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StatusBar, StyleSheet, Animated, View, Dimensions } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import ProfileHeader from "./components/ProfileHeader";
import ProfileActions from "./components/ProfileActions";
import BookmarkList from "./components/BookmarkList";
import LogoutButton from "./components/LogoutButton";
import { useTheme } from "../../theme/ThemeContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  }, [fadeAnim, slideAnim]);

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
        contentContainerStyle={styles.scrollContent}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          name="Shahroz"
          username="@shahroz_butt"
          bio="Personalized AI News & Reports 📑"
          avatar={null}
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
  scrollContent: { padding: 20, paddingBottom: 120 },
  sectionGap: { marginTop: 8, marginBottom: 20 },
});

export default UserProfileScreen;
