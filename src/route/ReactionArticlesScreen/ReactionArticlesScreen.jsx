import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resolveTopInset } from '../../utils/screenSafeArea';
import { ChevronLeft } from 'lucide-react-native';
import ArticleFeedList from '../../components/ArticleFeedList';
import { useTheme } from '../../theme/ThemeContext';
import { getRefreshControlProps } from '../../theme/refreshControl';
import {
  addBookmark,
  listReactions,
  removeBookmark,
  setReaction,
} from '../../utils/Service/api';
import Text from '../../components/ui/Text';
import { buildArticleDetailParams } from '../../utils/articleNavigation';
import { getBookmarkIds, setBookmarkIds } from '../../utils/bookmarksStorage';
import { mergeReactionRows, setReactionForArticle } from '../../utils/reactionsStorage';
import { loadArticlesFromRows } from '../../utils/loadArticleRows';
import { useFeedback } from '../../components/ui/FeedbackProvider';

const ReactionArticlesScreen = ({ navigation, route }) => {
  const reaction = route?.params?.reaction === 'dislike' ? 'dislike' : 'like';
  const isLike = reaction === 'like';
  const title = isLike ? 'Liked articles' : 'Disliked articles';
  const emptyLabel = isLike ? 'No liked articles yet' : 'No disliked articles yet';

  const { theme } = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const topInset = resolveTopInset(insets, 0);
  const feedback = useFeedback();
  const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
  const [votedItems, setVotedItems] = useState({});
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      const cachedIds = await getBookmarkIds().catch(() => []);
      if (cachedIds.length) setBookmarkedItems(new Set(cachedIds.map(String)));

      const reactRes = await listReactions().catch(() => ({ results: [] }));
      const rows = (reactRes.results || []).filter(
        (r) => String(r.reaction || '').toLowerCase() === reaction
      );
      const reactionMap = await mergeReactionRows(reactRes.results || [], { replace: true });
      setVotedItems(reactionMap);

      const detailed = await loadArticlesFromRows(rows);
      const bmSet = new Set(cachedIds.map(String));
      setNewsData(
        detailed.map((n) => ({
          ...n,
          userReaction: reactionMap[String(n.id)] || (isLike ? 'up' : 'down'),
          isBookmarked: bmSet.has(String(n.id)),
        }))
      );
    } catch (err) {
      setNewsData([]);
      feedback?.error?.(err?.message || 'Could not load articles');
    } finally {
      setLoading(false);
    }
  }, [reaction, feedback]);

  useEffect(() => {
    setLoading(true);
    loadItems();
  }, [loadItems]);

  const handleArticlePress = (article) => {
    navigation.navigate('ArticleDetail', buildArticleDetailParams(article));
  };

  const handleVote = async (itemId, type) => {
    const id = String(itemId || '').trim();
    if (!id) return;
    const previousVote = votedItems[id];
    const newVote = previousVote === type ? null : type;
    setVotedItems((prev) => ({ ...prev, [id]: newVote }));
    setReactionForArticle(id, newVote).catch(() => {});
    const targetVote = isLike ? 'up' : 'down';
    if (newVote !== targetVote) {
      setNewsData((prev) => prev.filter((n) => String(n.id) !== id));
    } else {
      setNewsData((prev) =>
        prev.map((n) => (String(n.id) === id ? { ...n, userReaction: newVote } : n))
      );
    }

    try {
      const data = await setReaction(
        id,
        newVote === 'up' ? 'like' : newVote === 'down' ? 'dislike' : 'none'
      );
      const likes = Number(data.like_count ?? 0);
      const dislikes = Number(data.dislike_count ?? 0);
      if (newVote === targetVote) {
        setNewsData((prev) =>
          prev.map((n) =>
            String(n.id) !== id
              ? n
              : {
                    ...n,
                    like_count: likes,
                    dislike_count: dislikes,
                    upvotes: likes,
                    userReaction: newVote,
                  }
          )
        );
      }
    } catch (err) {
      setVotedItems((prev) => ({ ...prev, [id]: previousVote }));
      setReactionForArticle(id, previousVote || null).catch(() => {});
      feedback?.error?.(err?.message || 'Could not save reaction');
    }
  };

  const handleBookmark = async (itemId) => {
    const id = String(itemId || '').trim();
    if (!id) return;
    const wasBookmarked = bookmarkedItems.has(id);
    setBookmarkedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setBookmarkIds(Array.from(next)).catch(() => {});
      return next;
    });
    setNewsData((prev) =>
      prev.map((n) => (String(n.id) === id ? { ...n, isBookmarked: !wasBookmarked } : n))
    );
    try {
      const item = newsData.find((n) => String(n.id) === id);
      if (wasBookmarked) await removeBookmark(id);
      else await addBookmark(id, item?.title || '', item?.canonical_url || item?.url || '');
    } catch (err) {
      feedback?.error?.(err?.message || 'Could not update bookmark');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  return (
    <View style={[styles.safe, { backgroundColor: colors.background, paddingTop: topInset }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { borderBottomColor: colors.borderLight, backgroundColor: colors.surface }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text variant="title" style={{ color: colors.textPrimary }}>
            {title}
          </Text>
          <Text variant="caption" color={colors.textSecondary}>
            Articles you {isLike ? 'liked' : 'disliked'} on TRAK
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ArticleFeedList
          data={newsData}
          contentContainerStyle={styles.list}
          onArticlePress={handleArticlePress}
          onVote={handleVote}
          onBookmark={handleBookmark}
          ListEmptyComponent={
            <Text variant="body" color={colors.textSecondary} style={styles.empty}>
              {emptyLabel}
            </Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              {...getRefreshControlProps(colors, theme.mode)}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, paddingRight: 12 },
  list: { paddingBottom: 120, paddingTop: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: 48, paddingHorizontal: 24 },
});

export default ReactionArticlesScreen;
