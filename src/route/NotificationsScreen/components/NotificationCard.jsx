// src/route/NotificationsScreen/components/NotificationCard.jsx
import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getIcon } from "../utils/getIcon";

const NotificationCard = ({ item, index, onMarkAsRead }) => {
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
    } else {
      // Navigate to detail screen immediately if already read
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
        {/* Unread indicator with animation - disappears when read */}
        <Animated.View 
          style={[
            styles.unreadIndicator,
            {
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

        {/* Icon */}
        <View style={styles.iconContainer}>
          <View 
            style={[
              styles.iconBox,
              { backgroundColor: getIconColor(item.type) }
            ]}
          >
            {getIcon(item.type, item.keyword)}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[
            styles.notificationText,
            item.read ? styles.readText : styles.unreadText
          ]}>
            {item.text}
            {item.keyword && (
              <Text style={styles.keyword}> #{item.keyword}</Text>
            )}
          </Text>
          
          <View style={styles.footer}>
            <Text style={styles.time}>{item.time}</Text>
            <View style={[
              styles.badge,
              styles[`${item.type}Badge`]
            ]}>
              <Text style={styles.badgeText}>
                {item.type === "mention" && "@"}
                {item.type === "keyword" && "#"}
                {item.type === "like" && "❤️"}
                {item.type === "comment" && "💬"}
                {item.type === "follow" && "👤"}
              </Text>
            </View>
          </View>
        </View>

        {/* Chevron for navigation */}
        <View style={styles.chevron}>
          <Text style={styles.chevronText}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  touchable: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    position: "relative",
    minHeight: 80,
  },
  unreadIndicator: {
    position: "absolute",
    left: 8,
    top: "50%",
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flex: 1,
  },
  notificationText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
    fontWeight: "600",
  },
  unreadText: {
    color: "#1F2937",
  },
  readText: {
    color: "#6B7280",
  },
  keyword: {
    fontWeight: "700",
    color: "#3B82F6",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  time: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mentionBadge: {
    backgroundColor: "#FEE2E2",
  },
  keywordBadge: {
    backgroundColor: "#DBEAFE",
  },
  likeBadge: {
    backgroundColor: "#FCE7F3",
  },
  commentBadge: {
    backgroundColor: "#F3E8FF",
  },
  followBadge: {
    backgroundColor: "#E0F2FE",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#374151",
  },
  chevron: {
    marginLeft: 8,
  },
  chevronText: {
    fontSize: 18,
    color: "#D1D5DB",
    fontWeight: "bold",
  },
});

export default NotificationCard;