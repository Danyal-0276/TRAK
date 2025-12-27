// components/profile/ProfileHeader.jsx
import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import Text from "../../../components/ui/Text";
import Card from "../../../components/ui/Card";

const ProfileHeader = ({ name, username, bio, avatar }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  return (
    <Card style={{ marginBottom: spacing.lg }}>
      <View style={styles.header}>
        <Image source={avatar} style={[styles.avatar, { borderColor: colors.border }]} />
        <View style={styles.headerText}>
          <Text variant="title" style={{ color: colors.textPrimary }}>{name}</Text>
          <Text variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing.xs }}>{username}</Text>
          <Text variant="body" color={colors.textSecondary}>{bio}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: "row" },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 15,
    borderWidth: 1,
  },
  headerText: { flex: 1, justifyContent: "center" },
  name: {},
  username: {},
  bio: {},
});

export default ProfileHeader;
