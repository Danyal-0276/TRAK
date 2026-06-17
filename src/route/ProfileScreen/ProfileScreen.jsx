import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { resolveTopInset } from "../../utils/screenSafeArea";
import { ScrollView, StatusBar, StyleSheet, Animated, View, TouchableOpacity, Modal, Pressable, Image } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ProfileHeader from "./components/ProfileHeader";
import ProfileActions from "./components/ProfileActions";
import AdminProfileView from "./components/AdminProfileView";
import BookmarkList from "./components/BookmarkList";
import { useTheme } from "../../theme/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { resetTabBarVisibility, setTabBarHidden } from "../../navigation/tabBarVisibility";
import { addBookmark, confirmProfileVerification, removeBookmark, requestProfileVerification, setReaction } from "../../utils/Service/api";
import {
  getProfileSessionCache,
  hydrateProfileFromStorage,
  isProfileCacheFresh,
  loadProfileBundle,
  stripLastLogin,
} from "../../utils/profileSessionCache";
import { buildArticleDetailParams } from "../../utils/articleNavigation";
import { queueAdminTab } from "../../utils/adminNavigationIntent";
import { useFeedback } from "../../components/ui/FeedbackProvider";
import Text from "../../components/ui/Text";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

function applyProfileBundle(setters, bundle) {
  if (!bundle) return;
  const { setProfile, setBookmarks, setBookmarkedItems, setVotedItems, setStats } = setters;
  if (bundle.profile) setProfile(bundle.profile);
  if (Array.isArray(bundle.bookmarks)) {
    setBookmarks(bundle.bookmarks);
    setBookmarkedItems(new Set(bundle.bookmarks.map((b) => String(b.id))));
  }
  if (bundle.votedItems) setVotedItems(bundle.votedItems);
  if (bundle.stats) setStats(bundle.stats);
}

const UserProfileScreen = ({ navigation: navigationProp }) => {
  const navigation = useNavigation();
  const stackNavigation = navigation.getParent() ?? navigationProp ?? navigation;
  const { theme } = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const topInset = resolveTopInset(insets, 0);
  const { logout, isAdmin, isSuperAdmin, user } = useAuth();
  const { confirm, error: showError } = useFeedback();
  const initialCache = getProfileSessionCache();
  const [bookmarks, setBookmarks] = useState(() => initialCache?.bookmarks || []);
  const [profile, setProfile] = useState(() => stripLastLogin(initialCache?.profile || user || null));
  const [bookmarkedItems, setBookmarkedItems] = useState(
    () => new Set((initialCache?.bookmarks || []).map((b) => String(b.id)))
  );
  const [votedItems, setVotedItems] = useState(() => initialCache?.votedItems || {});
  const [verificationChannel, setVerificationChannel] = useState("email");
  const [verificationCode, setVerificationCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [devCodeHint, setDevCodeHint] = useState("");
  const [verifyMessage, setVerifyMessage] = useState("");
  const [stats, setStats] = useState(
    () => initialCache?.stats || { liked: 0, disliked: 0, saved: initialCache?.bookmarks?.length || 0 }
  );
  const [avatarActionOpen, setAvatarActionOpen] = useState(false);
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);
  const [uiReady, setUiReady] = useState(() => Boolean(getProfileSessionCache()) || Boolean(user));
  
  const fadeAnim = useRef(new Animated.Value(getProfileSessionCache() || user ? 1 : 0)).current;
  const slideAnim = useRef(new Animated.Value(getProfileSessionCache() || user ? 0 : 20)).current;
  const lastScrollY = useRef(0);
  const loadingRef = useRef(false);

  const applyBundle = useCallback((bundle) => {
    applyProfileBundle(
      { setProfile, setBookmarks, setBookmarkedItems, setVotedItems, setStats },
      bundle
    );
  }, []);

  const refreshProfileData = useCallback(async ({ force = false } = {}) => {
    if (loadingRef.current && !force) return;
    loadingRef.current = true;
    try {
      const bundle = await loadProfileBundle({ force });
      applyBundle(bundle);
    } catch {
      // keep cached UI
    } finally {
      loadingRef.current = false;
      setUiReady(true);
    }
  }, [applyBundle]);

  useEffect(() => {
    if (isAdmin) {
      setProfile(stripLastLogin(user || null));
      setUiReady(true);
      return;
    }

    let cancelled = false;
    const memory = getProfileSessionCache();
    const hasInstantData = Boolean(memory || user);

    (async () => {
      if (memory) {
        applyBundle(memory);
        setUiReady(true);
      } else {
        const stored = await hydrateProfileFromStorage();
        if (cancelled) return;
        if (stored) applyBundle(stored);
        setUiReady(true);
      }

      if (!cancelled) {
        refreshProfileData({ force: !isProfileCacheFresh(getProfileSessionCache()) });
      }
    })();

    if (!hasInstantData) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
    }

    return () => {
      cancelled = true;
    };
  }, [applyBundle, fadeAnim, isAdmin, refreshProfileData, slideAnim, user]);

  useFocusEffect(
    useCallback(() => {
      if (isAdmin) return;
      if (!isProfileCacheFresh(getProfileSessionCache())) {
        refreshProfileData({ force: false });
      }
    }, [isAdmin, refreshProfileData])
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
    } catch (err) {
      setVotedItems((prev) => ({ ...prev, [id]: previousVote }));
      showError?.(err?.message || 'Could not save reaction');
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
    } catch (err) {
      await refreshProfileData({ force: true });
      showError?.(err?.message || 'Could not update bookmark');
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

  const openAdminSettings = () => {
    queueAdminTab('settings');
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.reset({
      index: 0,
      routes: [{ name: 'NewsFeed' }],
    });
  };

  if (!uiReady && !profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset }]}>
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
      </View>
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
  };

  const emailVerified = isAdmin ? true : Boolean(profile?.email_verified);
  const phoneVerified = isAdmin ? true : Boolean(profile?.phone_verified);

  if (isAdmin) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset }]}>
        <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <ScrollView
          contentContainerStyle={[styles.scrollContent, styles.adminScrollContent, { paddingBottom: Math.max(insets.bottom, 16) }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.adminTitle, { color: colors.textPrimary }]}>Profile</Text>
          <AdminProfileView
            user={profile || user}
            isSuperAdmin={isSuperAdmin}
            onOpenSettings={openAdminSettings}
            onLogout={handleLogout}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <>
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <Animated.ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 16) }]}
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
          onStatPress={(key) => {
            if (key === 'liked') {
              stackNavigation.navigate('ReactionArticles', { reaction: 'like' });
            } else if (key === 'disliked') {
              stackNavigation.navigate('ReactionArticles', { reaction: 'dislike' });
            } else if (key === 'saved') {
              stackNavigation.navigate('Bookmarks');
            }
          }}
          onLongPressAvatar={() => setAvatarActionOpen(true)}
          onPressAvatar={() => {
            if (profile?.avatar_image) setAvatarPreviewOpen(true);
          }}
        />

        <ProfileActions navigation={navigation} onLogout={handleLogout} />
        <BookmarkList
          bookmarks={bookmarks}
          onPressArticle={(article) => {
            stackNavigation.navigate('ArticleDetail', buildArticleDetailParams(article));
          }}
          onViewAll={() => stackNavigation.navigate('Bookmarks')}
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
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 120 },
  adminScrollContent: { paddingTop: 12, paddingBottom: 24 },
  adminTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3, marginBottom: 16 },
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
