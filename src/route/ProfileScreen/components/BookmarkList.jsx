// components/profile/BookmarkList.jsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { BookMarked } from "lucide-react-native";
import { useTheme } from "../../../theme/ThemeContext";
import Text from "../../../components/ui/Text";
import { NewsCard } from "../../../components/NewsCard";

const BookmarkList = ({ bookmarks, onPressArticle, votedItems, bookmarkedItems, onVote, onBookmark }) => {
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  return (
    <View style={{ marginBottom: spacing.xl }}>
      <Text variant="subtitle" style={{ marginBottom: spacing.md }}>
        My Reports (Bookmarks)
      </Text>
      {bookmarks.length === 0 ? (
        <View style={{ paddingVertical: spacing.md }}>
          <Text variant="body" color={colors.textSecondary}>No saved articles yet.</Text>
        </View>
      ) : (
        bookmarks.map((item, index) => (
          <NewsCard
            key={item.id}
            item={item}
            index={index}
            onPress={() => onPressArticle?.(item)}
            votedItems={votedItems}
            bookmarkedItems={bookmarkedItems}
            onVote={onVote}
            onBookmark={onBookmark}
          />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({});

export default BookmarkList;
