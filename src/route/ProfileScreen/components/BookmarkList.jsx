import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Bookmark, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';
import { NewsCard } from '../../../components/NewsCard';

const BookmarkList = ({
  bookmarks,
  onPressArticle,
  votedItems,
  bookmarkedItems,
  onVote,
  onBookmark,
  onViewAll,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';
  const accent = colors.primary;
  const accentSoft = colors.primary ? `${colors.primary}18` : isDark ? 'rgba(129,140,248,0.14)' : '#eff6ff';

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View style={[styles.titleIcon, { backgroundColor: accentSoft }]}>
            <Bookmark size={18} color={accent} strokeWidth={2.25} />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Saved articles</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
            </Text>
          </View>
        </View>
        {bookmarks.length > 0 && onViewAll ? (
          <TouchableOpacity onPress={onViewAll} style={styles.viewAll} hitSlop={12}>
            <Text style={[styles.viewAllText, { color: accent }]}>See all</Text>
            <ChevronRight size={16} color={accent} />
          </TouchableOpacity>
        ) : null}
      </View>

      {bookmarks.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <View style={[styles.emptyIcon, { backgroundColor: accentSoft }]}>
            <Bookmark size={28} color={accent} strokeWidth={2} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Nothing saved yet</Text>
          <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
            Bookmark articles from your feed and they will show up here.
          </Text>
        </View>
      ) : (
        bookmarks.slice(0, 5).map((item, index) => (
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

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default BookmarkList;
