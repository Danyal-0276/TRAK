import React, { useState, useRef, useEffect } from "react";
import { useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StatusBar, StyleSheet, Animated, View, TouchableOpacity, Modal, Pressable, Image } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import ProfileHeader from "./components/ProfileHeader";
import ProfileActions from "./components/ProfileActions";
import BookmarkList from "./components/BookmarkList";
import { useTheme } from "../../theme/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { resetTabBarVisibility, setTabBarHidden } from "../../navigation/tabBarVisibility";
import { addBookmark, confirmProfileVerification, getProfile, getUserArticleDetail, listBookmarks, removeBookmark, requestProfileVerification, setReaction } from "../../utils/Service/api";
import { resolveArticleSource } from "../../utils/articleSource";
import ChatBotWidget from "../../components/ChatBotWidget";
import { buildArticleDetailParams } from "../../utils/articleNavigation";
import { useFeedback } from "../../components/ui/FeedbackProvider";
import Text from "../../components/ui/Text";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

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
  const { confirm } = useFeedback();
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
      const quickRows = rows.map((r) => {
        const aid = String(r.article_id || r.id || "");
        return {
          id: aid,
          article_id: aid,
          title: r.title || "Saved article",
          source: resolveArticleSource(r),
          excerpt: r.excerpt || "",
          content: "",
          fullContent: "",
          canonical_url: r.url || r.canonical_url || "",
          url: r.url || r.canonical_url || "",
          date: r.created_at ? new Date(r.created_at).toLocaleString() : "Recently",
          time: r.created_at ? new Date(r.created_at).toLocaleString() : "Recently",
          category: "Saved",
          readTime: 4,
          votes: 0,
          like_count: 0,
          dislike_count: 0,
        };
      });
      setBookmarks(quickRows);
      setBookmarkedItems(new Set(quickRows.map((b) => String(b.id))));
      setStats((prev) => ({ ...prev, saved: quickRows.length }));
      await AsyncStorage.setItem(PROFILE_BOOKMARKS_CACHE_KEY, JSON.stringify(quickRows));
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
    const id = String(itemId);
    let previousVote = null;
    let newVote = null;
    setVotedItems((prev) => {
      previousVote = prev[id] ?? null;
      newVote = previousVote === type ? null : type;
      return { ...prev, [id]: newVote };
    });
    setBookmarks((prev) =>
      prev.map((n) => {
        if (String(n.id) !== id) return n;
        let likes = Number(n.like_count ?? n.upvotes ?? 0);
        let dislikes = Number(n.dislike_count ?? 0);
        if (previousVote === 'up') likes -= 1;
        if (previousVote === 'down') dislikes -= 1;
        if (newVote === 'up') likes += 1;
        if (newVote === 'down') dislikes += 1;
        return {
          ...n,
          like_count: Math.max(0, likes),
          dislike_count: Math.max(0, dislikes),
          upvotes: Math.max(0, likes),
          userReaction: newVote,
        };
      })
    );
    try {
      await setReaction(id, newVote === "up" ? "like" : newVote === "down" ? "dislike" : "none");
    } catch {
      setVotedItems((prev) => ({ ...prev, [id]: previousVote }));
    }
  };

  const handleBookmark = async (itemId) => {
    const id = String(itemId);
    const exists = bookmarkedItems.has(id);
    const item = bookmarks.find((n) => String(n.id) === id);
    setBookmarkedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setBookmarks((prev) => (exists ? prev.filter((b) => String(b.id) !== id) : prev));
    setStats((prev) => ({ ...prev, saved: Math.max(0, prev.saved + (exists ? -1 : 0)) }));
    try {
      if (exists) await removeBookmark(id);
      else await addBookmark(id, item?.title || "", item?.canonical_url || item?.url || "");
    } catch {
      await loadProfileData();
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

  const handleLogout = async () => {
    const accepted = await confirm({
      title: 'Log out',
      message: 'Are you sure you want to sign out?',
      confirmText: 'Log out',
      danger: true,
    });
    if (!accepted) return;
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'OpeningScreen' }] });
  };

  const emailVerified = isAdmin ? true : Boolean(profile?.email_verified);
  const phoneVerified = isAdmin ? true : Boolean(profile?.phone_verified);

  return (
    <>
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <ProfileHeader
          name={profile?.full_name || profile?.email?.split('@')[0] || 'User'}
          username={`@${profile?.username || (profile?.email || 'user').split('@')[0]}`}
          bio={profile?.bio || 'Add a short bio so others know what you follow.'}
          avatarUri={profile?.avatar_image || ''}
          verified={isAdmin ? true : Boolean(profile?.email_verified || profile?.phone_verified)}
          email={profile?.email}
          phone={profile?.phone}
          emailVerified={emailVerified}
          phoneVerified={phoneVerified}
          dateJoined={profile?.date_joined}
          stats={stats}
          onLongPressAvatar={() => setAvatarActionOpen(true)}
          onPressAvatar={() => {
            if (profile?.avatar_image) setAvatarPreviewOpen(true);
          }}
        />

        <ProfileActions navigation={navigation} onLogout={handleLogout} />
        <BookmarkList
          bookmarks={bookmarks}
          onPressArticle={(article) => {
            navigation.navigate('ArticleDetail', buildArticleDetailParams(article));
          }}
          onViewAll={() => navigation.navigate('Bookmarks')}
          votedItems={votedItems}
          bookmarkedItems={bookmarkedItems}
          onVote={handleVote}
          onBookmark={handleBookmark}
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
    <ChatBotWidget />
  </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 120 },
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
