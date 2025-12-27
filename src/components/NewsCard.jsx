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
                        <View style={[
                            cardStyles.sourceIcon,
                                { backgroundColor: item.trending ? '#2563EB' : '#1F2937' }
                        ]}>
                            <Text style={cardStyles.sourceIconText}>
                                {item.source.substring(0, 2).toUpperCase()}
                            </Text>
                        </View>
                        <View style={cardStyles.sourceInfo}>
                            <View style={cardStyles.sourceNameRow}>
                                <Text style={cardStyles.sourceName}>{item.source}</Text>
                                    {item.verified && (
                                        <CheckCircle size={14} color="#2563EB" fill="#2563EB" />
                                    )}
                            </View>
                            <View style={cardStyles.timeRow}>
                                <Clock size={12} color="#64748B" />
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
                        <MoreHorizontal size={20} color="#64748B" />
                    </TouchableOpacity>
                </View>

                {/* Title */}
                <Text style={cardStyles.title}>{item.title}</Text>

                {/* Excerpt */}
                <Text style={cardStyles.excerpt} numberOfLines={3}>
                    {item.excerpt}
                </Text>

                {/* Category & Trending */}
                <View style={cardStyles.metaRow}>
                    <View style={cardStyles.categoryBadge}>
                        <Text style={cardStyles.categoryText}>{item.category}</Text>
                    </View>
                    {item.trending && (
                        <View style={cardStyles.trendingBadge}>
                            <TrendingUp size={11} color="#DC2626" strokeWidth={3} />
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
                                    onVote(item.id, 'up');
                                }}
                            >
                                <ChevronUp
                                    size={18}
                                    color={votedItems[item.id] === 'up' ? '#0F172A' : '#94A3B8'}
                                    strokeWidth={2.5}
                                />
                            </TouchableOpacity>

                            <Text style={cardStyles.voteCount}>{item.votes}</Text>

                            <TouchableOpacity
                                style={cardStyles.voteButton}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onVote(item.id, 'down');
                                }}
                            >
                                <ChevronDown
                                    size={18}
                                    color={votedItems[item.id] === 'down' ? '#0F172A' : '#94A3B8'}
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
                                onBookmark(item.id);
                            }}
                        >
                            <Bookmark
                                size={18}
                                    color={bookmarkedItems.has(item.id) ? '#2563EB' : '#94A3B8'}
                                    fill={bookmarkedItems.has(item.id) ? '#2563EB' : 'transparent'}
                                strokeWidth={2}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={cardStyles.actionButton}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <Share2 size={18} color="#94A3B8" strokeWidth={2} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const cardStyles = StyleSheet.create({
    container: {
        marginBottom: 1,
    },
    card: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
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
        width: 42,
        height: 42,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sourceIconText: {
        color: '#FFFFFF',
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
        color: '#0F172A',
        fontSize: 15,
        fontWeight: '700',
        marginRight: 6,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        color: '#64748B',
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 4,
    },
    dot: {
        color: '#CBD5E1',
        fontSize: 13,
        marginHorizontal: 6,
    },
    readTime: {
        color: '#64748B',
        fontSize: 13,
        fontWeight: '500',
    },
    moreButton: {
        padding: 4,
        marginTop: 4,
    },
    title: {
        color: '#0F172A',
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 26,
        marginBottom: 10,
        letterSpacing: -0.3,
    },
    excerpt: {
        color: '#475569',
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
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 4,
        borderLeftWidth: 3,
            borderLeftColor: '#2563EB',
    },
    categoryText: {
        color: '#334155',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    trendingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 4,
        borderLeftWidth: 3,
        borderLeftColor: '#DC2626',
    },
    trendingText: {
        color: '#DC2626',
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
        borderTopColor: '#F1F5F9',
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
        color: '#0F172A',
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