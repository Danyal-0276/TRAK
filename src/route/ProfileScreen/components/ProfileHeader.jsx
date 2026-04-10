// components/profile/ProfileHeader.jsx
import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "../../../theme/ThemeContext";
import Text from "../../../components/ui/Text";
import Card from "../../../components/ui/Card";

const ProfileHeader = ({ name, username, bio, avatar, verified }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Card style={{ marginBottom: spacing.lg, overflow: 'hidden' }}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={[colors.primary, `${colors.primary}DD`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradient}
          >
            {avatar ? (
              <Image source={avatar} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surface }]}>
                <Text variant="title" color={colors.primary} style={styles.avatarText}>
                  {getInitials(name)}
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>
        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text variant="title" style={[styles.name, { color: colors.textPrimary }]}>{name}</Text>
            {verified ? <CheckCircle2 size={18} color="#2563EB" /> : null}
          </View>
          <Text variant="caption" color={colors.textSecondary} style={styles.username}>{username}</Text>
          <Text variant="body" color={colors.textSecondary} style={styles.bio}>{bio}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: { 
    flexDirection: "row",
    padding: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
  },
  headerText: { 
    flex: 1, 
    justifyContent: "center",
    paddingVertical: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  bio: {
    fontSize: 15,
    lineHeight: 20,
  },
});

export default ProfileHeader;
