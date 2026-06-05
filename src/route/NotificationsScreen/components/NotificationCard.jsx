// src/route/NotificationsScreen/components/NotificationCard.jsx

import React, { memo } from "react";

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { useNavigation } from "@react-navigation/native";

import { useTheme } from "../../../theme/ThemeContext";

import NotificationAvatar from "./NotificationAvatar";

import { getNotificationTypeLabel } from "../utils/notificationDisplay";



const NotificationCard = ({ item, onMarkAsRead, onNotificationPress }) => {

  const { theme } = useTheme();

  const { colors } = theme;

  const navigation = useNavigation();



  const handlePress = () => {
    if (onNotificationPress) {
      onNotificationPress(item);
      return;
    }
    if (item.id) {
      navigation.navigate("NotificationDetail", { notificationId: item.id, onMarkAsRead });
    }
  };



  const isUnread = !item.read;



  return (

    <View style={styles.card}>

      <TouchableOpacity activeOpacity={0.85} onPress={handlePress} style={styles.touchable}>

        <View

          style={[

            styles.messageBubble,

            {

              backgroundColor: isUnread ? colors.surfaceElevated : colors.surface,

              borderColor: isUnread ? colors.borderFocus : colors.border,

              borderLeftWidth: isUnread ? 4 : 1,

              borderLeftColor: isUnread ? colors.primary : colors.border,

              shadowColor: colors.shadowDark || "#000",

            },

          ]}

        >

          <View style={styles.avatarContainer}>

            <NotificationAvatar item={item} size={52} />

            {isUnread ? (

              <View

                style={[

                  styles.unreadDot,

                  {

                    backgroundColor: colors.primary,

                    borderColor: colors.surfaceElevated,

                  },

                ]}

              />

            ) : null}

          </View>



          <View style={styles.messageContent}>

            <View style={styles.messageHeader}>

              <Text style={[styles.senderName, { color: colors.textPrimary }]}>

                {getNotificationTypeLabel(item.type)}

              </Text>

              <Text style={[styles.messageTime, { color: colors.textTertiary }]}>

                {item.time}

              </Text>

            </View>



            <Text

              style={[

                styles.messageText,

                {

                  color: isUnread ? colors.textPrimary : colors.textSecondary,

                  fontWeight: isUnread ? "600" : "500",

                },

              ]}

              numberOfLines={2}

            >

              {item.text}

              {item.keyword ? (

                <Text style={[styles.keyword, { color: colors.primary }]}> #{item.keyword}</Text>

              ) : null}

            </Text>



            {item.keyword ? (

              <View style={[styles.keywordBadge, { backgroundColor: `${colors.primary}15` }]}>

                <Text style={[styles.keywordBadgeText, { color: colors.primary }]}>

                  #{item.keyword}

                </Text>

              </View>

            ) : null}

          </View>



          <View style={styles.arrowContainer}>

            <Text style={[styles.arrow, { color: colors.textTertiary }]}>›</Text>

          </View>

        </View>

      </TouchableOpacity>

    </View>

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

    borderWidth: 1,

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.08,

    shadowRadius: 8,

    elevation: 3,

    minHeight: 80,

  },

  avatarContainer: {

    marginRight: 12,

    position: "relative",

    justifyContent: "center",

  },

  unreadDot: {

    position: "absolute",

    top: -2,

    right: -2,

    width: 12,

    height: 12,

    borderRadius: 6,

    borderWidth: 2,

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



export default memo(NotificationCard);

