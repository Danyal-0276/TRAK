// src/route/NotificationsScreen/components/NotificationCard.jsx
import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "../../../theme/ThemeContext";
import { getIcon } from "../utils/getIcon";

const NotificationCard = ({ item, index, onMarkAsRead, onNotificationPress }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const readAnim = useRef(new Animated.Value(item.read ? 1 : 0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const delay = index * 100;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
    ]).start();
  }, []);

  // Update animation when read status changes
  useEffect(() => {
    if (item.read) {
      Animated.timing(readAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    } else {
      readAnim.setValue(0);
    }
  }, [item.read]);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePress = () => {
    // Mark as read with animation if not already read
    if (!item.read && onMarkAsRead) {
      Animated.timing(readAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start(() => {
        // Call the mark as read function after animation completes
        onMarkAsRead(item.id);
      });
    }
    
    // Always navigate to detail screen
    if (onNotificationPress) {
      onNotificationPress(item);
    } else {
      navigation.navigate('NotificationDetail', { notificationId: item.id });
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case "mention": return "#FF6B6B";
      case "keyword": return "#4ECDC4";
      case "like": return "#FF9A8B";
      case "comment": return "#A78BFA";
      case "follow": return "#60A5FA";
      default: return "#6B7280";
    }
  };

  const iconColor = getIconColor(item.type);
  const isUnread = !item.read;

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [
            { scale: pressAnim },
            { scale: scaleAnim },
            { translateY: slideAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={styles.touchable}
      >
        {/* Message-like bubble design */}
        <View style={[
          styles.messageBubble,
          {
            backgroundColor: isUnread ? colors.surface : colors.backgroundSecondary,
            borderLeftWidth: isUnread ? 4 : 0,
            borderLeftColor: isUnread ? colors.primary : 'transparent',
          }
        ]}>
          {/* Avatar/Icon on left */}
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[iconColor, `${iconColor}DD`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              {getIcon(item.type, item.keyword)}
            </LinearGradient>
            {/* Unread indicator */}
            {isUnread && (
              <Animated.View 
                style={[
                  styles.unreadDot,
                  {
                    backgroundColor: colors.primary,
                    opacity: readAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0],
                    }),
                    transform: [
                      {
                        scale: readAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 0],
                        }),
                      },
                    ],
                  },
                ]} 
              />
            )}
          </View>

          {/* Message content */}
          <View style={styles.messageContent}>
            <View style={styles.messageHeader}>
              <Text style={[styles.senderName, { color: colors.textPrimary }]}>
                {item.type === "mention" && "Mention"}
                {item.type === "keyword" && "Keyword Alert"}
                {item.type === "like" && "Like"}
                {item.type === "comment" && "Comment"}
                {item.type === "follow" && "New Follower"}
              </Text>
              <Text style={[styles.messageTime, { color: colors.textTertiary }]}>{item.time}</Text>
            </View>
            
            <Text 
              style={[
                styles.messageText,
                { 
                  color: isUnread ? colors.textPrimary : colors.textSecondary,
                  fontWeight: isUnread ? '600' : '500',
                }
              ]}
              numberOfLines={2}
            >
              {item.text}
              {item.keyword && (
                <Text style={[styles.keyword, { color: colors.primary }]}> #{item.keyword}</Text>
              )}
            </Text>
            
            {item.keyword && (
              <View style={[styles.keywordBadge, { backgroundColor: `${colors.primary}15` }]}>
                <Text style={[styles.keywordBadgeText, { color: colors.primary }]}>
                  #{item.keyword}
                </Text>
              </View>
            )}
          </View>

          {/* Arrow indicator */}
          <View style={styles.arrowContainer}>
            <Text style={[styles.arrow, { color: colors.textTertiary }]}>›</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  touchable: {
    width: "100%",
  },
  messageBubble: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 80,
  },
  avatarContainer: {
    marginRight: 12,
    position: "relative",
  },
  avatarGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  messageContent: {
    flex: 1,
    paddingRight: 8,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  senderName: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  messageTime: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 8,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  keyword: {
    fontWeight: "700",
  },
  keywordBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  keywordBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  arrowContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 4,
  },
  arrow: {
    fontSize: 20,
    fontWeight: "300",
  },
});

export default NotificationCard;