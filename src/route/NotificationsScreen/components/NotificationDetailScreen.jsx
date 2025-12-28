// src/route/NotificationsScreen/components/NotificationDetailScreen.jsx
import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Dimensions 
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";     
import { getIcon } from "../utils/getIcon";
import mockAPI from "../services/mockNotificationAPI";        

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NotificationDetailScreen = () => {
  const route = useRoute();
  const { notificationId, onMarkAsRead } = route.params;
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideUpAnim = useState(new Animated.Value(30))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];
  const headerSlideAnim = useState(new Animated.Value(-50))[0];
  const iconScaleAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadNotificationDetails();
  }, []);

  const loadNotificationDetails = async () => {
    try {
      const data = await mockAPI.getNotificationDetails(notificationId);
      setNotification(data);
      
      if (!data.read && onMarkAsRead) {
        await mockAPI.markAsRead(notificationId);
        onMarkAsRead(notificationId);
      }

      // Staggered animations for smooth entrance
      Animated.sequence([
        // Icon animation first
        Animated.spring(iconScaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        
        // Main content animations
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(slideUpAnim, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 60,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.spring(headerSlideAnim, {
            toValue: 0,
            tension: 70,
            friction: 6,
            useNativeDriver: true,
          }),
        ]),
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

  const getCardColor = (type) => {
    const colors = {
      "mention": "#FEF2F2",
      "keyword": "#F0FDFA",
      "like": "#FDF2F8",
      "comment": "#FAF5FF",
      "follow": "#EFF6FF",
      "default": "#F9FAFB"
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
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.loadingSpinner]} />
        <Text style={styles.loadingText}>Loading notification...</Text>
      </View>
    );
  }

  if (!notification) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Notification not found</Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => navigation.goBack()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const iconColor = getIconColor(notification.type);
  const cardColor = getCardColor(notification.type);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with slide animation */}
      <Animated.View 
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            transform: [{ translateX: headerSlideAnim }],
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <View style={styles.backButtonInner}>
            <Text style={styles.backButtonText}>‹</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Details</Text>
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
          {/* Notification Header */}
          <View style={[styles.notificationHeader, { backgroundColor: cardColor }]}>
            <Animated.View 
              style={[
                styles.iconContainer,
                {
                  backgroundColor: iconColor,
                  transform: [{
                    scale: iconScaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  }],
                }
              ]}
            >
              {getIcon(notification.type, notification.keyword)}
            </Animated.View>
            
            <View style={styles.headerText}>
              <Text style={styles.notificationTitle}>
                {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
              </Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
              {notification.read && (
                <View style={styles.readStatus}>
                  <Text style={styles.readStatusText}>✓ Read</Text>
                </View>
              )}
            </View>
          </View>

          {/* Main Content Card */}
          <View style={styles.mainContent}>
            {/* Preview Text */}
            <Text style={styles.previewText}>{notification.text}</Text>
            
            {/* Keyword Badge */}
            {notification.keyword && (
              <View style={styles.keywordBadge}>
                <Text style={styles.keywordText}>#{notification.keyword}</Text>
              </View>
            )}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Details Section */}
            <View style={styles.detailsSection}>
              <Text style={styles.detailsTitle}>Details</Text>
              <Text style={styles.detailsText}>{notification.details}</Text>
            </View>

            {/* User Info Card */}
            <Animated.View 
              style={[
                styles.userInfo,
                {
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
              <View style={styles.userAvatarContainer}>
                <Text style={styles.userAvatar}>{notification.avatar}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{notification.user}</Text>
                {notification.postTitle && (
                  <Text style={styles.postTitle}>in "{notification.postTitle}"</Text>
                )}
                <Text style={styles.userAction}>{
                  notification.type === 'mention' ? 'mentioned you' :
                  notification.type === 'like' ? 'liked your content' :
                  notification.type === 'comment' ? 'replied to you' :
                  notification.type === 'follow' ? 'started following you' :
                  'interacted with you'
                }</Text>
              </View>
            </Animated.View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              {notification.type === "mention" && (
                <TouchableOpacity style={[styles.actionButton, styles.primaryAction]}>
                  <Text style={styles.actionButtonText}>💬 Reply</Text>
                </TouchableOpacity>
              )}
              {notification.type === "comment" && (
                <TouchableOpacity style={[styles.actionButton, styles.primaryAction]}>
                  <Text style={styles.actionButtonText}>🧵 View Thread</Text>
                </TouchableOpacity>
              )}
              {notification.type === "follow" && (
                <TouchableOpacity style={[styles.actionButton, styles.primaryAction]}>
                  <Text style={styles.actionButtonText}>👥 Follow Back</Text>
                </TouchableOpacity>
              )}
              
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionButton, styles.secondaryAction]}>
                  <Text style={styles.secondaryActionText}>✕ Dismiss</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.actionButton, styles.tertiaryAction]}>
                  <Text style={styles.tertiaryActionText}>⚙️ Settings</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
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
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#3B82F6",
    borderTopColor: "transparent",
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#374151",
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  errorButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 20,
    color: "#374151",
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    color: "#111827",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  readStatus: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  readStatusText: {
    color: "#065F46",
    fontWeight: "700",
    fontSize: 11,
  },
  mainContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  previewText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  keywordBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    alignSelf: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  keywordText: {
    color: "#1E40AF",
    fontWeight: "700",
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 20,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  detailsText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
    fontWeight: "500",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  userAvatarContainer: {
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
    color: "#111827",
    marginBottom: 2,
  },
  postTitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  userAction: {
    fontSize: 11,
    color: "#3B82F6",
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    flex: 1,
  },
  primaryAction: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryAction: {
    backgroundColor: "transparent",
    borderColor: "#E5E7EB",
  },
  secondaryActionText: {
    color: "#6B7280",
    fontWeight: "700",
    fontSize: 15,
  },
  tertiaryAction: {
    backgroundColor: "#F3F4F6",
    borderColor: "#F3F4F6",
  },
  tertiaryActionText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 14,
  },
  footer: {
    marginTop: 24,
    padding: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
    textAlign: "center",
  },
});

export default NotificationDetailScreen;