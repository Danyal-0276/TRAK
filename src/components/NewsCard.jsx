// ============================================
// FILE: components/NewsCard.jsx
// ============================================
import React, { useRef, useEffect, memo, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { TouchableOpacity as GHTouchableOpacity } from 'react-native-gesture-handler';
import ArticleInteractionBar from './ArticleInteractionBar';
import { resolveArticleSource } from '../utils/articleSource';
import { shareArticle, openArticleMenu } from '../utils/articleMenu';
import { useFeedback } from './ui/FeedbackProvider';
import {
    TrendingUp,
    CheckCircle,
    Clock,
    MoreHorizontal,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import FeedbackModal from './FeedbackModal';
import ArticleCardImage from './ArticleCardImage';
import { resolveArticleImageUrl } from '../utils/articleMedia';
import {
    resolveCardArticleId,
    resolveArticleVote,
    resolveArticleBookmarked,
} from '../utils/articleCardInteraction';
import { getCardSummaryText } from '../utils/articleNavigation';

function NewsCardInner({
    item,
    onPress,
    votedItems,
    bookmarkedItems,
    userVote: userVoteProp,
    isBookmarked: isBookmarkedProp,
    onVote,
    onBookmark,
    index = 0,
    animateEntry = false,
}) {
    const { theme } = useTheme();
    const feedback = useFeedback();
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const { colors } = theme;
    const articleId = resolveCardArticleId(item, index);
    const canInteract = !articleId.startsWith('news-');
    const safeSource = resolveArticleSource(item);
    const safeTitle = String(item?.title || 'Untitled');
    const safeExcerpt = getCardSummaryText(item);
    const safeCategory = String(item?.category || 'General');
    const likeCount = Number(item?.like_count ?? item?.upvotes ?? 0);
    const dislikeCount = Number(item?.dislike_count ?? 0);
    const currentReaction = resolveArticleVote(item, articleId, votedItems, userVoteProp);
    const isDark = theme.mode === 'dark';
    const isBookmarked = resolveArticleBookmarked(item, articleId, bookmarkedItems, isBookmarkedProp);
    const fadeAnim = useRef(new Animated.Value(animateEntry ? 0 : 1)).current;
    const slideAnim = useRef(new Animated.Value(animateEntry ? 20 : 0)).current;

    useEffect(() => {
        if (!animateEntry) {
            fadeAnim.setValue(1);
            slideAnim.setValue(0);
            return;
        }
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                delay: Math.min(index, 3) * 30,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                delay: Math.min(index, 3) * 30,
                useNativeDriver: true,
            }),
        ]).start();
    }, [animateEntry, index, fadeAnim, slideAnim]);

    const cardStyles = useMemo(() => StyleSheet.create({
        container: {
            marginBottom: 8,
            marginHorizontal: 4,
        },
        card: {
            backgroundColor: colors.surface,
            marginHorizontal: 2,
            marginVertical: 4,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.borderLight,
            overflow: 'hidden',
            ...Platform.select({
                ios: {
                    shadowColor: colors.shadowDark || '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                android: {
                    elevation: 3,
                },
            }),
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 12,
        },
        sourceContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        sourceIcon: {
            width: 44,
            height: 44,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        sourceIconText: {
            color: colors.textInverse,
            fontSize: 15,
            fontWeight: '900',
            letterSpacing: 0.5,
        },
        sourceInfo: {
            flex: 1,
            justifyContent: 'center',
        },
        sourceNameRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
        },
        sourceName: {
            color: colors.textPrimary,
            fontSize: 15,
            fontWeight: '700',
            marginRight: 6,
        },
        timeRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        timeText: {
            color: colors.textSecondary,
            fontSize: 13,
            fontWeight: '500',
            marginLeft: 4,
        },
        dot: {
            color: colors.textTertiary,
            fontSize: 13,
            marginHorizontal: 6,
        },
        readTime: {
            color: colors.textSecondary,
            fontSize: 13,
            fontWeight: '500',
        },
        moreButton: {
            padding: 4,
            marginTop: 4,
        },
        title: {
            color: colors.textPrimary,
            fontSize: 19,
            fontWeight: '700',
            lineHeight: 27,
            marginBottom: 12,
            letterSpacing: -0.3,
        },
        excerpt: {
            color: colors.textSecondary,
            fontSize: 15,
            lineHeight: 23,
            marginBottom: 14,
            fontWeight: '400',
        },
        metaRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 14,
            flexWrap: 'wrap',
            gap: 8,
        },
        categoryBadge: {
            backgroundColor: colors.backgroundSecondary,
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 6,
            borderLeftWidth: 3,
            borderLeftColor: colors.primary,
        },
        categoryText: {
            color: colors.textSecondary,
            fontSize: 12,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
        },
        trendingBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.errorBg,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 4,
            borderLeftWidth: 3,
            borderLeftColor: colors.error,
        },
        trendingText: {
            color: colors.error,
            fontSize: 11,
            fontWeight: '800',
            marginLeft: 4,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        credibilityBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 4,
            borderLeftWidth: 3,
        },
        credibilityText: {
            fontSize: 11,
            fontWeight: '800',
            marginLeft: 4,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        actionsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: colors.borderLight,
        },
        actionsLeft: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        voteSection: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        voteButton: {
            paddingVertical: 6,
            paddingHorizontal: 8,
            borderRadius: 6,
        },
        voteCountSmall: {
            fontSize: 13,
            fontWeight: '700',
            color: colors.textPrimary,
            marginRight: 10,
            minWidth: 20,
        },
        actionsRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        actionButton: {
            paddingVertical: 6,
            paddingHorizontal: 8,
            borderRadius: 6,
        },
        actionsOuter: {
            paddingHorizontal: 22,
            paddingBottom: 22,
        },
        cardBody: {
            padding: 22,
        },
        heroImage: {
            width: '100%',
            borderRadius: 0,
        },
    }), [theme.mode]);

    const credLabel = String(item.credibilityLabel || '').toLowerCase();
    const isFake = !!item.isFake;
    const isSuspicious = !!item.isLowCredibility || credLabel === 'suspicious';
    const credPalette = isFake
        ? { bg: colors.errorBg, color: colors.error }
        : isSuspicious
            ? { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }
            : credLabel === 'real'
                ? { bg: colors.successBg, color: colors.success }
                : { bg: colors.backgroundSecondary, color: colors.textSecondary };
    const credBg = credPalette.bg;
    const credFg = credPalette.color;
    const credText = isFake ? 'Fake / Low credibility' : credLabel === 'real' ? 'Verified / Higher credibility' : credLabel || 'Credibility';
    const cardImage = resolveArticleImageUrl(item);

    const CardWrapper = animateEntry ? Animated.View : View;

    return (
        <>
        <CardWrapper
            style={[
                cardStyles.container,
                animateEntry
                    ? {
                          opacity: fadeAnim,
                          transform: [{ translateY: slideAnim }],
                      }
                    : null,
            ]}
        >
            <View style={cardStyles.card}>
                <TouchableOpacity onPress={onPress} activeOpacity={0.95}>
                    {cardImage ? (
                        <ArticleCardImage
                            src={cardImage}
                            alt={safeTitle}
                            height={168}
                            borderRadius={0}
                            backgroundColor={colors.borderLight}
                            style={cardStyles.heroImage}
                        />
                    ) : null}
                    <View style={cardStyles.cardBody}>
                        <View style={cardStyles.header}>
                            <View style={cardStyles.sourceContainer}>
                                <View style={[
                                    cardStyles.sourceIcon,
                                    { backgroundColor: item.trending ? colors.primary : colors.textSecondary }
                                ]}>
                                    <Text style={cardStyles.sourceIconText}>
                                        {safeSource.substring(0, 2).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={cardStyles.sourceInfo}>
                                    <View style={cardStyles.sourceNameRow}>
                                        <Text style={cardStyles.sourceName} numberOfLines={1}>{safeSource}</Text>
                                        {item.verified && (
                                            <CheckCircle size={14} color={colors.verified} fill={colors.verified} />
                                        )}
                                    </View>
                                    <View style={cardStyles.timeRow}>
                                        <Clock size={12} color={colors.textSecondary} />
                                        <Text style={cardStyles.timeText}>{item.time}</Text>
                                        <Text style={cardStyles.dot}>•</Text>
                                        <Text style={cardStyles.readTime}>{item.readTime} min read</Text>
                                    </View>
                                </View>
                            </View>
                            <GHTouchableOpacity
                                style={cardStyles.moreButton}
                                onPress={() =>
                                    openArticleMenu(item, feedback, {
                                        articleId,
                                        onOpenFeedback: () => setFeedbackOpen(true),
                                    })
                                }
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                activeOpacity={0.7}
                                accessibilityLabel="More options"
                            >
                                <MoreHorizontal size={20} color={colors.textSecondary} />
                            </GHTouchableOpacity>
                        </View>

                        <Text style={cardStyles.title}>{safeTitle}</Text>

                        {safeExcerpt ? (
                            <Text style={cardStyles.excerpt}>{safeExcerpt}</Text>
                        ) : null}

                        <View style={cardStyles.metaRow}>
                            <View style={cardStyles.categoryBadge}>
                                <Text style={cardStyles.categoryText}>{safeCategory}</Text>
                            </View>
                            <View style={[cardStyles.credibilityBadge, { backgroundColor: credBg, borderLeftColor: credFg }]}>
                                <CheckCircle size={11} color={credFg} />
                                <Text style={[cardStyles.credibilityText, { color: credFg }]}>{credText}</Text>
                            </View>
                            {item.trending && (
                                <View style={cardStyles.trendingBadge}>
                                    <TrendingUp size={11} color={colors.error} strokeWidth={3} />
                                    <Text style={cardStyles.trendingText}>Trending</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>

                <View style={cardStyles.actionsOuter} pointerEvents="box-none">
                    <ArticleInteractionBar
                        articleId={canInteract ? articleId : ''}
                        likeCount={likeCount}
                        dislikeCount={dislikeCount}
                        voteType={currentReaction}
                        isBookmarked={isBookmarked}
                        onVote={onVote}
                        onBookmark={onBookmark}
                        onShare={() => shareArticle(item, articleId)}
                    />
                </View>
            </View>
        </CardWrapper>
        <FeedbackModal
            visible={feedbackOpen}
            onClose={() => setFeedbackOpen(false)}
            item={item}
            type="article_report"
        />
        </>
    );
}

function itemInteractionSnapshot(item) {
    if (!item) return '';
    return [
        item.userReaction ?? '',
        item.isBookmarked ? '1' : '0',
        Number(item.like_count ?? item.upvotes ?? 0),
        Number(item.dislike_count ?? 0),
    ].join('|');
}

function propsAreEqual(prev, next) {
    if (itemInteractionSnapshot(prev.item) !== itemInteractionSnapshot(next.item)) return false;
    if (prev.votedItems !== next.votedItems) return false;
    if (prev.bookmarkedItems !== next.bookmarkedItems) return false;
    if (prev.userVote !== next.userVote) return false;
    if (prev.isBookmarked !== next.isBookmarked) return false;
    if (prev.onPress !== next.onPress) return false;
    if (prev.onVote !== next.onVote) return false;
    if (prev.onBookmark !== next.onBookmark) return false;
    if (prev.animateEntry !== next.animateEntry) return false;
    return true;
}

export const NewsCard = memo(NewsCardInner, propsAreEqual);
