import React, { useCallback, memo } from 'react';
import { FlatList, Animated, Platform, StyleSheet } from 'react-native';
import { NewsCard } from './NewsCard';
import { resolveCardArticleId } from '../utils/articleCardInteraction';

export const ARTICLE_LIST_PERF = {
  initialNumToRender: 5,
  maxToRenderPerBatch: 4,
  windowSize: 5,
  updateCellsBatchingPeriod: 16,
  removeClippedSubviews: Platform.OS === 'android',
};

const FeedRow = memo(function FeedRow({
  item,
  index,
  onArticlePress,
  onVote,
  onBookmark,
}) {
  const onPress = useCallback(() => onArticlePress(item), [item, onArticlePress]);
  return (
    <NewsCard
      item={item}
      onPress={onPress}
      onVote={onVote}
      onBookmark={onBookmark}
      index={index}
      animateEntry={false}
    />
  );
});

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

function ArticleFeedList({
  data,
  onArticlePress,
  onVote,
  onBookmark,
  ListHeaderComponent,
  ListEmptyComponent,
  ListFooterComponent,
  contentContainerStyle,
  style,
  refreshControl,
  onScroll,
  scrollEventThrottle = 16,
  listRef,
  keyPrefix = '',
  animated = false,
  ...rest
}) {
  const ListComponent = animated ? AnimatedFlatList : FlatList;
  const keyExtractor = useCallback(
    (item, index) => {
      const id = resolveCardArticleId(item, index);
      return keyPrefix ? `${keyPrefix}-${id}` : id;
    },
    [keyPrefix]
  );

  const renderItem = useCallback(
    ({ item, index }) => (
      <FeedRow
        item={item}
        index={index}
        onArticlePress={onArticlePress}
        onVote={onVote}
        onBookmark={onBookmark}
      />
    ),
    [onArticlePress, onVote, onBookmark]
  );

  return (
    <ListComponent
      ref={listRef}
      style={[styles.list, style]}
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      {...ARTICLE_LIST_PERF}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
});

export default memo(ArticleFeedList);
