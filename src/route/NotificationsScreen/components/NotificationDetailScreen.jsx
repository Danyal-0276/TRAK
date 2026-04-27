// src/route/NotificationsScreen/components/NotificationDetailScreen.jsx
import React, { useEffect, useState, useRef } from "react";
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Dimensions,
  ActivityIndicator,
  StatusBar
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import { ChevronLeft, MessageCircle, Heart, UserPlus, Hash, Settings, X } from "lucide-react-native";
import { useTheme } from "../../../theme/ThemeContext";
import Text from "../../../components/ui/Text";
import { getIcon } from "../utils/getIcon";
import * as notificationsApi from "../../../api/notificationsApi";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const NotificationDetailScreen = () => {
  const route = useRoute();
  const { notificationId, onMarkAsRead } = route.params || {};
  const { theme } = useTheme();
  const { colors } = theme;
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const headerSlideAnim = useRef(new Animated.Value(-50)).current;
  const iconScaleAnim = useRef(new Animated.Value(0)).current;
  const circle1Anim = useRef(new Animated.Value(0)).current;
  const circle2Anim = useRef(new Animated.Value(0)).current;
  const circle3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadNotificationDetails();
  }, []);

  const loadNotificationDetails = async () => {
    try {
      const data = await notificationsApi.getNotificationDetails(notificationId);
      setNotification(data);
      
      if (!data.read && onMarkAsRead) {
        await notificationsApi.markAsRead(notificationId);
        onMarkAsRead(notificationId);
      }

      // Staggered animations for smooth entrance
      Animated.parallel([
        // Decorative circles
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
        // Icon animation
        Animated.spring(iconScaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 7,
          delay: 300,
          useNativeDriver: true,
        }),
        // Main content animations
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          delay: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideUpAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          delay: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 7,
          delay: 400,
          useNativeDriver: true,
        }),
        Animated.spring(headerSlideAnim, {
          toValue: 0,
          tension: 70,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error("Error loading notification:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIconColor = (type) => {
    const colors = {
      "mention": "#FF6B6B",
      "keyword": "#4ECDC4", 
      "like": "#FF9A8B",
      "comment": "#A78BFA",
      "follow": "#60A5FA",
      "default": "#6B7280"
    };
    return colors[type] || colors.default;
  };

  const handleBackPress = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 30,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.goBack();
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="body" color={colors.textSecondary} style={styles.loadingText}>Loading notification...</Text>
      </SafeAreaView>
    );
  }

  if (!notification) {
    return (
      <SafeAreaView style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <Text variant="title" color={colors.textPrimary} style={styles.errorText}>Notification not found</Text>
        <TouchableOpacity 
          style={[styles.errorButton, { backgroundColor: colors.primary }]} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text variant="body" color={colors.surface} style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const iconColor = getIconColor(notification.type);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
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
      
      {/* Header with slide animation */}
      <Animated.View 
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            paddingTop: Math.max(insets.top, 12),
            transform: [{ translateX: headerSlideAnim }],
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.8}
        >
          <View style={[styles.backButtonInner, { backgroundColor: colors.backgroundSecondary }]}>
            <ChevronLeft size={20} color={colors.textPrimary} />
          </View>
        </TouchableOpacity>
        <Text variant="title" style={[styles.headerTitle, { color: colors.textPrimary }]}>Details</Text>
        <View style={styles.headerPlaceholder} />
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Content Container */}
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideUpAnim },
                { scale: scaleAnim }
              ],
            }
          ]}
        >
          {/* Notification Header Card */}
          <Animated.View 
            style={[
              styles.notificationHeader,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                transform: [{
                  scale: iconScaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                }],
              }
            ]}
          >
            <LinearGradient
              colors={[iconColor, `${iconColor}DD`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              {getIcon(notification.type, notification.keyword)}
            </LinearGradient>
            
            <View style={styles.headerText}>
              <Text variant="title" style={[styles.notificationTitle, { color: colors.textPrimary }]}>
                {notification.type === "mention" && "Mention"}
                {notification.type === "keyword" && "Keyword Alert"}
                {notification.type === "like" && "Like"}
                {notification.type === "comment" && "Comment"}
                {notification.type === "follow" && "New Follower"}
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.notificationTime}>
                {notification.time}
              </Text>
              {notification.read && (
                <View style={[styles.readStatus, { backgroundColor: `${colors.primary}15` }]}>
                  <Text variant="caption" style={[styles.readStatusText, { color: colors.primary }]}>✓ Read</Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Main Content Card */}
          <View style={[styles.mainContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Preview Text */}
            <Text variant="body" style={[styles.previewText, { color: colors.textPrimary }]}>
              {notification.text}
            </Text>
            
            {/* Keyword Badge */}
            {notification.keyword && (
              <View style={[styles.keywordBadge, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` }]}>
                <Hash size={14} color={colors.primary} />
                <Text variant="caption" style={[styles.keywordText, { color: colors.primary }]}>
                  {notification.keyword}
                </Text>
              </View>
            )}

            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Details Section */}
            <View style={styles.detailsSection}>
              <Text variant="title" style={[styles.detailsTitle, { color: colors.textPrimary }]}>Full Details</Text>
              <Text variant="body" style={[styles.detailsText, { color: colors.textSecondary }]}>
                {notification.details}
              </Text>
            </View>

            {/* User Info Card */}
            <Animated.View 
              style={[
                styles.userInfo,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                  opacity: fadeAnim,
                  transform: [{
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  }],
                }
              ]}
            >
              <View style={[styles.userAvatarContainer, { backgroundColor: `${iconColor}20` }]}>
                <Text style={styles.userAvatar}>{notification.avatar}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text variant="body" style={[styles.userName, { color: colors.textPrimary }]}>
                  {notification.user}
                </Text>
                {notification.postTitle && (
                  <Text variant="caption" color={colors.textSecondary} style={styles.postTitle}>
                    in "{notification.postTitle}"
                  </Text>
                )}
                <Text variant="caption" style={[styles.userAction, { color: colors.primary }]}>
                  {notification.type === 'mention' ? 'mentioned you' :
                  notification.type === 'like' ? 'liked your content' :
                  notification.type === 'comment' ? 'replied to you' :
                  notification.type === 'follow' ? 'started following you' :
                  'interacted with you'}
                </Text>
              </View>
            </Animated.View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              {notification.type === "mention" && (
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: colors.primary }]}
                  activeOpacity={0.8}
                >
                  <MessageCircle size={18} color={colors.surface} />
                  <Text variant="body" color={colors.surface} style={styles.actionButtonText}>Reply</Text>
                </TouchableOpacity>
              )}
              {notification.type === "comment" && (
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: colors.primary }]}
                  activeOpacity={0.8}
                >
                  <MessageCircle size={18} color={colors.surface} />
                  <Text variant="body" color={colors.surface} style={styles.actionButtonText}>View Thread</Text>
                </TouchableOpacity>
              )}
              {notification.type === "follow" && (
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: colors.primary }]}
                  activeOpacity={0.8}
                >
                  <UserPlus size={18} color={colors.surface} />
                  <Text variant="body" color={colors.surface} style={styles.actionButtonText}>Follow Back</Text>
                </TouchableOpacity>
              )}
              
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.secondaryAction, { 
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                  }]}
                  activeOpacity={0.8}
                >
                  <X size={18} color={colors.textPrimary} />
                  <Text variant="body" color={colors.textPrimary} style={styles.secondaryActionText}>Dismiss</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.tertiaryAction, { backgroundColor: colors.backgroundSecondary }]}
                  activeOpacity={0.8}
                >
                  <Settings size={18} color={colors.textPrimary} />
                  <Text variant="body" color={colors.textPrimary} style={styles.tertiaryActionText}>Settings</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text variant="caption" color={colors.textTertiary} style={styles.footerText}>
              TRAK • Always keeping you informed
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginBottom: 20,
    textAlign: "center",
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorButtonText: {
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    padding: 4,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  content: {
    padding: 20,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  headerText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  readStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  readStatusText: {
    fontWeight: "700",
    fontSize: 11,
  },
  mainContent: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
  },
  previewText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    lineHeight: 26,
    textAlign: "center",
  },
  keywordBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    alignSelf: "center",
    marginBottom: 16,
    borderWidth: 1,
    gap: 6,
  },
  keywordText: {
    fontWeight: "700",
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  detailsText: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "500",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  userAvatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userAvatar: {
    fontSize: 28,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  postTitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  userAction: {
    fontSize: 12,
    fontWeight: "600",
  },
  actions: {
    gap: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryAction: {
    borderWidth: 1,
  },
  secondaryActionText: {
    fontWeight: "600",
    fontSize: 15,
  },
  tertiaryAction: {
    borderWidth: 0,
  },
  tertiaryActionText: {
    fontWeight: "600",
    fontSize: 14,
  },
  footer: {
    marginTop: 24,
    padding: 16,
    alignItems: "center",
  },
  footerText: {
    fontWeight: "500",
    textAlign: "center",
  },
});

export default NotificationDetailScreen;