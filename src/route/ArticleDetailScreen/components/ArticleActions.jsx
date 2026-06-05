import React from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { ChevronUp, ChevronDown, Bookmark, Share2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';

export const ArticleActions = ({
  likeCount,
  dislikeCount,
  isLiked,
  isDisliked,
  isBookmarked,
  onLike,
  onDislike,
  onBookmark,
  onShare,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const isDark = theme.mode === 'dark';

  const dockBg = isDark ? colors.surface : colors.surface;
  const pillBg = isDark ? colors.backgroundSecondary : colors.background;

  const renderBtn = (icon, label, active, onPress, count) => (
    <Pressable style={[styles.btn, { backgroundColor: active ? colors.primary + '14' : 'transparent' }]} onPress={onPress} delayPressIn={0} hitSlop={8}>
      {icon}
      <Text style={[styles.btnLabel, { color: active ? colors.textPrimary : colors.textSecondary }]}>
        {count != null ? count : label}
      </Text>
    </Pressable>
  );

  return (
    <View
      style={[
        styles.outer,
        {
          paddingBottom: Math.max(insets.bottom, 12),
          backgroundColor: 'transparent',
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.dock,
          {
            backgroundColor: dockBg,
            borderColor: colors.borderLight,
            shadowColor: colors.shadowDark || '#000',
          },
        ]}
      >
        <View style={[styles.pill, { backgroundColor: pillBg }]}>
          {renderBtn(
            <ChevronUp size={20} color={isLiked ? colors.primary : colors.textTertiary} strokeWidth={2.5} />,
            'Up',
            isLiked,
            onLike,
            likeCount
          )}
          <View style={[styles.sep, { backgroundColor: colors.borderLight }]} />
          {renderBtn(
            <ChevronDown size={20} color={isDisliked ? colors.error : colors.textTertiary} strokeWidth={2.5} />,
            'Down',
            isDisliked,
            onDislike,
            dislikeCount
          )}
        </View>

        <Pressable
          style={[styles.roundBtn, { backgroundColor: isBookmarked ? colors.primary : pillBg, borderColor: colors.borderLight }]}
          onPress={onBookmark}
          delayPressIn={0}
          hitSlop={8}
        >
          <Bookmark
            size={20}
            color={isBookmarked ? colors.textOnPrimary || '#fff' : colors.textPrimary}
            fill={isBookmarked ? colors.textOnPrimary || '#fff' : 'none'}
          />
        </Pressable>

        <Pressable
          style={[styles.roundBtn, { backgroundColor: pillBg, borderColor: colors.borderLight }]}
          onPress={onShare}
          delayPressIn={0}
          hitSlop={8}
        >
          <Share2 size={20} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 10 },
    }),
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    overflow: 'hidden',
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  btnLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  sep: {
    width: 1,
    height: 24,
  },
  roundBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
