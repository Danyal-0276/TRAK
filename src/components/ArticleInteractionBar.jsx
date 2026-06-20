import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ChevronUp, ChevronDown, Bookmark, Share2 } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

/**
 * Action row aligned with web NewsCard — like, dislike, save, share in one group.
 */
export default function ArticleInteractionBar({
  articleId,
  likeCount = 0,
  dislikeCount = 0,
  voteType = null,
  isBookmarked = false,
  onVote,
  onBookmark,
  onShare,
}) {
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';
  const id = String(articleId || '').trim();

  const voteUpBg =
    voteType === 'up' ? (isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff') : 'transparent';
  const voteDownBg =
    voteType === 'down' ? (isDark ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2') : 'transparent';
  const bookmarkBg = isBookmarked ? (isDark ? '#78350F' : '#fef3c7') : 'transparent';

  const pressUp = () => {
    if (!id || typeof onVote !== 'function') return;
    onVote(id, 'up');
  };

  const pressDown = () => {
    if (!id || typeof onVote !== 'function') return;
    onVote(id, 'down');
  };

  const pressBookmark = () => {
    if (!id || typeof onBookmark !== 'function') return;
    onBookmark(id);
  };

  return (
    <View
      style={[styles.row, { borderTopColor: colors.borderLight }]}
      collapsable={false}
      pointerEvents="box-none"
    >
      <View style={styles.group} pointerEvents="box-none">
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: voteUpBg }]}
          onPress={pressUp}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 4 }}
          accessibilityRole="button"
          accessibilityLabel="Like article"
        >
          <ChevronUp
            size={16}
            color={voteType === 'up' ? colors.primary : colors.textSecondary}
            strokeWidth={voteType === 'up' ? 2.5 : 2}
          />
          <Text
            style={[
              styles.count,
              { color: voteType === 'up' ? colors.primary : colors.textSecondary },
            ]}
          >
            {likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: voteDownBg }]}
          onPress={pressDown}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 4, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Dislike article"
        >
          <ChevronDown
            size={16}
            color={voteType === 'down' ? colors.error : colors.textSecondary}
            strokeWidth={voteType === 'down' ? 2.5 : 2}
          />
          <Text
            style={[
              styles.count,
              { color: voteType === 'down' ? colors.error : colors.textSecondary },
            ]}
          >
            {dislikeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: bookmarkBg }]}
          onPress={pressBookmark}
          activeOpacity={0.7}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
        >
          <Bookmark
            size={16}
            color={isBookmarked ? '#f59e0b' : colors.textSecondary}
            fill={isBookmarked ? '#f59e0b' : 'transparent'}
            strokeWidth={2}
          />
        </TouchableOpacity>

        {typeof onShare === 'function' ? (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onShare}
            activeOpacity={0.7}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Share article"
          >
            <Share2 size={16} color={colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    minHeight: 36,
  },
  iconBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    minHeight: 36,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'left',
    fontVariant: ['tabular-nums'],
  },
});
