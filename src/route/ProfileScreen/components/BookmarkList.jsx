// components/profile/BookmarkList.jsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { BookMarked } from "lucide-react-native";
import { useTheme } from "../../../theme/ThemeContext";
import Text from "../../../components/ui/Text";
import Card from "../../../components/ui/Card";

const BookmarkList = ({ bookmarks }) => {
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  return (
    <View style={{ marginBottom: spacing.xl }}>
      <Text variant="subtitle" style={{ marginBottom: spacing.md }}>
        My Reports (Bookmarks)
      </Text>
      {bookmarks.map((item) => (
        <Card key={item.id} style={{ marginBottom: spacing.sm }}>
          <BookMarked size={18} color={colors.textPrimary} style={{ marginBottom: spacing.xs }} />
          <Text variant="body" style={{ fontWeight: '600', marginBottom: spacing.xs }}>{item.title}</Text>
          <Text variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xs }}>{item.summary}</Text>
          <Text variant="caption" color={colors.textTertiary}>{item.date}</Text>
        </Card>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({});

export default BookmarkList;
