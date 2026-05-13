import React, { useState, useRef, useEffect } from "react";
import { useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StatusBar, StyleSheet, Animated, View, Dimensions, TextInput, TouchableOpacity, Modal, Pressable, Image } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import ProfileHeader from "./components/ProfileHeader";
import ProfileActions from "./components/ProfileActions";
import BookmarkList from "./components/BookmarkList";
import LogoutButton from "./components/LogoutButton";
import { useTheme } from "../../theme/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { resetTabBarVisibility, setTabBarHidden } from "../../navigation/tabBarVisibility";
import { addBookmark, confirmProfileVerification, getProfile, getUserArticleDetail, listBookmarks, removeBookmark, requestProfileVerification, setReaction } from "../../utils/Service/api";
import Text from "../../components/ui/Text";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PROFILE_CACHE_KEY = "trak_profile_cache_v1";
const PROFILE_BOOKMARKS_CACHE_KEY = "trak_profile_bookmarks_cache_v1";

function stripLastLogin(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const { last_login: _ignored, ...rest } = obj;
  return rest;
}

const UserProfileScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const { logout, isAdmin, user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [profile, setProfile] = useState(() => stripLastLogin(user || null));
  const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
  const [votedItems, setVotedItems] = useState({});
  const [verificationChannel, setVerificationChannel] = useState("email");
  const [verificationCode, setVerificationCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [devCodeHint, setDevCodeHint] = useState("");
  const [verifyMessage, setVerifyMessage] = useState("");
  const [stats, setStats] = useState({ following: 0, followers: 0, saved: 0 });
  const [avatarActionOpen, setAvatarActionOpen] = useState(false);
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);
  const [uiReady, setUiReady] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const lastScrollY = useRef(0);
  const circle1Anim = useRef(new Animated.Value(0)).current;
  const circle2Anim = useRef(new Animated.Value(0)).current;
  const circle3Anim = useRef(new Animated.Value(0)).current;

  const hydrateFromCache = useCallback(async () => {
    try {
      const rawProfile = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
      if (rawProfile) {
        const cachedProfile = JSON.parse(rawProfile);
        if (cachedProfile && typeof cachedProfile === "object") {
          const cleaned = stripLastLogin(cachedProfile);
          setProfile((prev) => prev || cleaned);
        }
      }
    } catch (_) {
      // ignore cache parse issues
    }
    try {
      const rawBookmarks = await AsyncStorage.getItem(PROFILE_BOOKMARKS_CACHE_KEY);
      if (rawBookmarks) {
        const cachedRows = JSON.parse(rawBookmarks);
        if (Array.isArray(cachedRows) && cachedRows.length) {
          setBookmarks(cachedRows);
          setBookmarkedItems(new Set(cachedRows.map((b) => String(b.id))));
          setStats((prev) => ({ ...prev, saved: cachedRows.length }));
        }
      }
    } catch (_) {
      // ignore cache parse issues
    }
  }, []);

  const loadProfileData = useCallback(async () => {
    try {
      const p = stripLastLogin(await getProfile());
      setProfile(p);
      await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(p));
      setStats((prev) => ({
        ...prev,
        following: Number(p?.following_count || 0),
        followers: Number(p?.followers_count || 0),
      }));
    } catch {
      setProfile(null);
    }
    try {
      const response = await listBookmarks();
      const rows = response.results || [];
      const quickRows = rows.map((r) => ({
        id: r.article_id || r.id,
        title: r.title || "Saved article",
        source: "TRAK",
        excerpt: "",
        content: "",
        summary: "",
        date: r.created_at ? new Date(r.created_at).toLocaleString() : "Recently",
        time: r.created_at ? new Date(r.created_at).toLocaleString() : "Recently",
        category: "Saved",
        readTime: 4,
        votes: 0,
      }));
      setBookmarks(quickRows);
      setBookmarkedItems(new Set(quickRows.map((b) => String(b.id))));
      setStats((prev) => ({ ...prev, saved: quickRows.length }));

      const detailed = await Promise.allSettled(
        rows.map(async (r) => {
          const full = await getUserArticleDetail(r.article_id);
          return {
            ...full,
            id: full.id || r.article_id || r.id,
            source: full.source || "TRAK",
            title: full.title || r.title || "Saved article",
            excerpt: full.excerpt || full.content || "",
            content: full.content || full.excerpt || "",
            date: r.created_at ? new Date(r.created_at).toLocaleString() : "Recently",
            time: r.created_at ? new Date(r.created_at).toLocaleString() : "Recently",
            category: full.category || "Saved",
            readTime: full.readTime || 4,
            votes: Number(full.votes || 0),
          };
        })
      );
      const cleaned = detailed.map((r, i) => {
        if (r.status === "fulfilled" && r.value) return r.value;
        return quickRows[i];
      });
      setBookmarks(cleaned);
      setBookmarkedItems(new Set(cleaned.map((b) => String(b.id))));
      setStats((prev) => ({ ...prev, saved: cleaned.length }));
      await AsyncStorage.setItem(PROFILE_BOOKMARKS_CACHE_KEY, JSON.stringify(cleaned));
    } catch {
      setBookmarks([]);
      setBookmarkedItems(new Set());
    } finally {
      setUiReady(true);
    }
  }, []);

  useEffect(() => {
    hydrateFromCache();
    loadProfileData();
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
  }, [fadeAnim, slideAnim, hydrateFromCache, loadProfileData]);

  useFocusEffect(
    useCallback(() => {
      try {
        loadProfileData();
      } catch (_) {
        // ignore
      }
    }, [loadProfileData])
  );

  useEffect(() => {
    resetTabBarVisibility();
    return () => resetTabBarVisibility();
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

  const handleVote = async (itemId, type) => {
    const previousVote = votedItems[itemId];
    const newVote = previousVote === type ? null : type;
    setVotedItems((prev) => ({ ...prev, [itemId]: newVote }));
    try {
      await setReaction(itemId, newVote === "up" ? "like" : newVote === "down" ? "dislike" : "none");
    } catch {
      setVotedItems((prev) => ({ ...prev, [itemId]: previousVote }));
    }
  };

  const handleBookmark = async (itemId) => {
    try {
      const exists = bookmarkedItems.has(itemId) || bookmarkedItems.has(String(itemId));
      const item = bookmarks.find((n) => String(n.id) === String(itemId));
      if (exists) await removeBookmark(itemId);
      else await addBookmark(itemId, item?.title || "", item?.canonical_url || item?.url || "");
      await loadProfileData();
    } catch {
      // ignore and keep ui stable
    }
  };

  const sendVerificationCode = async () => {
    setSendingCode(true);
    setVerifyMessage("");
    setDevCodeHint("");
    try {
      const payload = verificationChannel === "phone" ? { channel: "phone", phone: profile?.phone || "" } : { channel: "email" };
      const result = await requestProfileVerification(payload);
      setVerifyMessage(result?.detail || "Verification code sent.");
      if (result?.dev_code) setDevCodeHint(String(result.dev_code));
    } catch (error) {
      setVerifyMessage(error?.message || "Failed to send verification code.");
    } finally {
      setSendingCode(false);
    }
  };

  const confirmVerificationCode = async () => {
    if (!verificationCode.trim()) {
      setVerifyMessage("Enter code first.");
      return;
    }
    setVerifyingCode(true);
    setVerifyMessage("");
    try {
      const updated = stripLastLogin(await confirmProfileVerification({ channel: verificationChannel, code: verificationCode.trim() }));
      setProfile(updated);
      setVerificationCode("");
      setDevCodeHint("");
      setVerifyMessage(`${verificationChannel === "email" ? "Email" : "Phone"} verified.`);
    } catch (error) {
      setVerifyMessage(error?.message || "Verification failed.");
    } finally {
      setVerifyingCode(false);
    }
  };

  if (!uiReady && !profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
          <SkeletonPlaceholder borderRadius={8} backgroundColor={colors.border} highlightColor={colors.surface}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
              <View style={{ width: 100, height: 100, borderRadius: 50 }} />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <View style={{ height: 22, width: '55%', marginBottom: 10 }} />
                <View style={{ height: 14, width: '35%', marginBottom: 12 }} />
                <View style={{ height: 40, width: '100%' }} />
              </View>
            </View>
            <View style={{ height: 14, width: '40%', marginBottom: 12 }} />
            <View style={{ height: 120, width: '100%', marginBottom: 12 }} />
            <View style={{ height: 120, width: '100%' }} />
          </SkeletonPlaceholder>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <ProfileHeader
          name={profile?.full_name || profile?.email?.split("@")[0] || "User"}
          username={`@${profile?.username || (profile?.email || "user").split("@")[0]}`}
          bio={profile?.bio || "Complete your profile and verify your contact details."}
          avatarUri={profile?.avatar_image || ""}
          verified={isAdmin ? true : Boolean(profile?.email_verified || profile?.phone_verified)}
          onLongPressAvatar={() => setAvatarActionOpen(true)}
          onPressAvatar={() => {
            if (profile?.avatar_image) setAvatarPreviewOpen(true);
          }}
        />
        {!isAdmin && (
          <View style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
          }}>
            <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "700", marginBottom: 8 }}>
              Verify your account
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
              <TouchableOpacity onPress={() => setVerificationChannel("email")} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: verificationChannel === "email" ? colors.primary : colors.border }}>
                <Text style={{ color: colors.textPrimary, fontSize: 12 }}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setVerificationChannel("phone")} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: verificationChannel === "phone" ? colors.primary : colors.border }}>
                <Text style={{ color: colors.textPrimary, fontSize: 12 }}>Phone</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={sendVerificationCode} disabled={sendingCode} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: colors.primary }}>
                <Text style={{ color: colors.textInverse, fontSize: 12 }}>{sendingCode ? "Sending..." : "Send code"}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <TextInput
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="Enter code"
                placeholderTextColor={colors.textTertiary}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  color: colors.textPrimary,
                }}
              />
              <TouchableOpacity onPress={confirmVerificationCode} disabled={verifyingCode} style={{ paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 8 }}>
                <Text style={{ color: colors.textPrimary, fontSize: 12 }}>{verifyingCode ? "..." : "Verify"}</Text>
              </TouchableOpacity>
            </View>
            {verifyMessage ? <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 8 }}>{verifyMessage}</Text> : null}
            {devCodeHint ? <Text style={{ color: colors.primary, fontSize: 12, marginTop: 4 }}>Test code: {devCodeHint}</Text> : null}
          </View>
        )}
        <View style={styles.sectionGap}>
          <StatsRow stats={stats} />
        </View>
        <ProfileActions navigation={navigation} />
        <BookmarkList
          bookmarks={bookmarks}
          onPressArticle={(article) => navigation.navigate("ArticleDetail", { article })}
          votedItems={votedItems}
          bookmarkedItems={bookmarkedItems}
          onVote={handleVote}
          onBookmark={handleBookmark}
        />
        <LogoutButton
          onLogout={async () => {
            await logout();
            navigation.reset({ index: 0, routes: [{ name: "OpeningScreen" }] });
          }}
        />
      </Animated.ScrollView>

      <Modal visible={avatarActionOpen} transparent animationType="fade" onRequestClose={() => setAvatarActionOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setAvatarActionOpen(false)}>
          <View style={[styles.actionSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                setAvatarActionOpen(false);
                navigation.navigate("EditProfileScreen");
              }}
            >
              <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: "600" }}>Change image</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              disabled={!profile?.avatar_image}
              onPress={() => {
                setAvatarActionOpen(false);
                if (profile?.avatar_image) setAvatarPreviewOpen(true);
              }}
            >
              <Text style={{ color: profile?.avatar_image ? colors.textPrimary : colors.textTertiary, fontSize: 15, fontWeight: "600" }}>Display image</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={avatarPreviewOpen} transparent animationType="fade" onRequestClose={() => setAvatarPreviewOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setAvatarPreviewOpen(false)}>
          <View style={styles.previewWrap}>
            {profile?.avatar_image ? <Image source={{ uri: profile.avatar_image }} style={styles.previewImage} /> : null}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const StatsRow = ({ stats }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  const items = [
    { label: 'Following', value: String(stats?.following ?? 0) },
    { label: 'Followers', value: String(stats?.followers ?? 0) },
    { label: 'Saved', value: String(stats?.saved ?? 0) },
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  actionSheet: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  actionItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.2)",
  },
  previewWrap: {
    width: "95%",
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});

export default UserProfileScreen;
