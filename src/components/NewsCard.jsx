// ============================================
// FILE: components/NewsCard.jsx
// ============================================
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import {
    ChevronUp,
    ChevronDown,
    Bookmark,
    Share2,
    MoreHorizontal,
    TrendingUp,
    CheckCircle,
    Clock,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export const NewsCard = ({ item, onPress, votedItems, bookmarkedItems, onVote, onBookmark, index = 0 }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const safeId = item?.id != null ? String(item.id) : `news-${index}`;
    const safeSource = String(item?.source || 'TRAK');
    const safeTitle = String(item?.title || 'Untitled');
    const safeExcerpt = String(item?.excerpt || item?.content || '');
    const safeCategory = String(item?.category || 'General');
    const safeVotes = Number(item?.votes || 0);
    const isBookmarked =
        bookmarkedItems?.has?.(item?.id) || bookmarkedItems?.has?.(String(item?.id));
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 50,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                delay: index * 50,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const cardStyles = StyleSheet.create({
        container: {
            marginBottom: 8,
            marginHorizontal: 4,
        },
        card: {
            backgroundColor: colors.surface,
            padding: 22,
            marginHorizontal: 2,
            marginVertical: 4,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.borderLight,
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
            padding: 6,
        },
        voteCount: {
            fontSize: 16,
            fontWeight: '700',
            color: colors.textPrimary,
            marginHorizontal: 8,
            minWidth: 32,
            textAlign: 'center',
        },
        actionsRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        actionButton: {
            padding: 6,
        },
    });

    const credLabel = String(item.credibilityLabel || '').toLowerCase();
    const isFake = !!item.isFake;
    const isLowCred = !!item.isLowCredibility;
    const credBg = isFake || isLowCred ? colors.errorBg : colors.successBg;
    const credFg = isFake || isLowCred ? colors.error : colors.success;
    const credText = isFake ? 'Fake / Low credibility' : credLabel === 'real' ? 'Verified / Higher credibility' : credLabel || 'Credibility';

    return (
        <Animated.View
            style={[
                cardStyles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.95}
            >
                <View style={cardStyles.card}>
                {/* Header */}
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
                                <Text style={cardStyles.sourceName}>{safeSource}</Text>
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
                    <TouchableOpacity
                        style={cardStyles.moreButton}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <MoreHorizontal size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Title */}
                <Text style={cardStyles.title}>{safeTitle}</Text>

                {/* Excerpt */}
                <Text style={cardStyles.excerpt} numberOfLines={3}>
                    {safeExcerpt}
                </Text>

                {/* Category & Trending */}
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

                {/* Actions */}
                <View style={cardStyles.actionsContainer}>
                    <View style={cardStyles.actionsLeft}>
                        <View style={cardStyles.voteSection}>
                            <TouchableOpacity
                                style={cardStyles.voteButton}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onVote(safeId, 'up');
                                }}
                            >
                                <ChevronUp
                                    size={18}
                                    color={votedItems[safeId] === 'up' ? colors.textPrimary : colors.textSecondary}
                                    strokeWidth={2.5}
                                />
                            </TouchableOpacity>

                            <Text style={cardStyles.voteCount}>{safeVotes}</Text>

                            <TouchableOpacity
                                style={cardStyles.voteButton}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onVote(safeId, 'down');
                                }}
                            >
                                <ChevronDown
                                    size={18}
                                    color={votedItems[safeId] === 'down' ? colors.textPrimary : colors.textSecondary}
                                    strokeWidth={2.5}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={cardStyles.actionsRight}>
                        <TouchableOpacity
                            style={cardStyles.actionButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                onBookmark(safeId);
                            }}
                        >
                            <Bookmark
                                size={18}
                                color={isBookmarked ? colors.primary : colors.textSecondary}
                                fill={isBookmarked ? colors.primary : 'transparent'}
                                strokeWidth={2}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={cardStyles.actionButton}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <Share2 size={18} color={colors.textSecondary} strokeWidth={2} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
        </Animated.View>
    );
};
