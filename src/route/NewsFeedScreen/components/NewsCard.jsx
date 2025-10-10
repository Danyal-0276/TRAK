// ============================================
// FILE: components/NewsCard.jsx
// ============================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

export const NewsCard = ({ item, onPress, votedItems, bookmarkedItems, onVote, onBookmark }) => {
    return (
        <TouchableOpacity
            style={cardStyles.container}
            onPress={onPress}
            activeOpacity={0.98}
        >
            <View style={cardStyles.card}>
                {/* Header */}
                <View style={cardStyles.header}>
                    <View style={cardStyles.sourceContainer}>
                        <View style={cardStyles.sourceIcon}>
                            <Text style={cardStyles.sourceIconText}>
                                {item.source.substring(0, 2).toUpperCase()}
                            </Text>
                        </View>
                        <View style={cardStyles.sourceInfo}>
                            <View style={cardStyles.sourceNameRow}>
                                <Text style={cardStyles.sourceName}>{item.source}</Text>
                                {item.verified && (
                                    <CheckCircle size={12} color="#FF4500" fill="#FF4500" />
                                )}
                            </View>
                            <View style={cardStyles.timeRow}>
                                <Clock size={11} color="#9CA3AF" />
                                <Text style={cardStyles.timeText}>{item.time}</Text>
                                <Text style={cardStyles.dot}>•</Text>
                                <Text style={cardStyles.readTime}>{item.readTime} min</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={cardStyles.moreButton}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <MoreHorizontal size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                {/* Title */}
                <Text style={cardStyles.title}>{item.title}</Text>

                {/* Excerpt */}
                <Text style={cardStyles.excerpt} numberOfLines={2}>
                    {item.excerpt}
                </Text>

                {/* Category & Trending */}
                <View style={cardStyles.metaRow}>
                    <View style={cardStyles.categoryBadge}>
                        <Text style={cardStyles.categoryText}>{item.category}</Text>
                    </View>
                    {item.trending && (
                        <View style={cardStyles.trendingBadge}>
                            <TrendingUp size={10} color="#FF4500" strokeWidth={2.5} />
                            <Text style={cardStyles.trendingText}>Trending</Text>
                        </View>
                    )}
                </View>

                {/* Actions */}
                <View style={cardStyles.actionsContainer}>
                    <View style={cardStyles.actionsLeft}>
                        <TouchableOpacity
                            style={cardStyles.voteContainer}
                            onPress={(e) => {
                                e.stopPropagation();
                                onVote(item.id, 'up');
                            }}
                        >
                            <ChevronUp
                                size={18}
                                color={votedItems[item.id] === 'up' ? '#FF4500' : '#9CA3AF'}
                                strokeWidth={2.5}
                            />
                        </TouchableOpacity>

                        <Text style={cardStyles.voteCount}>{item.votes}</Text>

                        <TouchableOpacity
                            style={cardStyles.voteContainer}
                            onPress={(e) => {
                                e.stopPropagation();
                                onVote(item.id, 'down');
                            }}
                        >
                            <ChevronDown
                                size={18}
                                color={votedItems[item.id] === 'down' ? '#7C3AED' : '#9CA3AF'}
                                strokeWidth={2.5}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={cardStyles.actionsRight}>
                        <TouchableOpacity
                            style={cardStyles.actionButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                onBookmark(item.id);
                            }}
                        >
                            <Bookmark
                                size={16}
                                color={bookmarkedItems.has(item.id) ? '#F59E0B' : '#9CA3AF'}
                                fill={bookmarkedItems.has(item.id) ? '#F59E0B' : 'transparent'}
                                strokeWidth={2}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={cardStyles.actionButton}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <Share2 size={16} color="#9CA3AF" strokeWidth={2} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const cardStyles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    sourceContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
    },
    sourceIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FF4500',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    sourceIconText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
    },
    sourceInfo: {
        flex: 1,
        paddingTop: 1,
    },
    sourceNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    sourceName: {
        color: '#1F2937',
        fontSize: 14,
        fontWeight: '700',
        marginRight: 4,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 3,
    },
    dot: {
        color: '#D1D5DB',
        fontSize: 12,
        marginHorizontal: 4,
    },
    readTime: {
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: '500',
    },
    moreButton: {
        padding: 4,
    },
    title: {
        color: '#1F2937',
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 22,
        marginBottom: 8,
    },
    excerpt: {
        color: '#6B7280',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 10,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryBadge: {
        backgroundColor: '#F7F7F7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 6,
    },
    categoryText: {
        color: '#6B7280',
        fontSize: 11,
        fontWeight: '600',
    },
    trendingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    trendingText: {
        color: '#FF4500',
        fontSize: 10,
        fontWeight: '700',
        marginLeft: 3,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F7F7F7',
    },
    actionsLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionsRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    voteContainer: {
        padding: 4,
    },
    voteCount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1F2937',
        marginHorizontal: 8,
        minWidth: 32,
        textAlign: 'center',
    },
    actionButton: {
        padding: 4,
    },
});