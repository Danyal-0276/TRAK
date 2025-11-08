// ============================================
// FILE: components/ArticleActions.jsx
// ============================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronUp, ChevronDown, Bookmark, Share } from 'lucide-react-native';

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
    return (
        <View style={styles.container}>
            <View style={styles.actions}>
                {/* Like Button */}
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={onLike}
                >
                    <ChevronUp 
                        size={22} 
                        color={isLiked ? '#0F172A' : '#94A3B8'} 
                        strokeWidth={2.5}
                    />
                    <Text style={[
                        styles.actionText,
                        isLiked && styles.actionTextActive
                    ]}>
                        {likeCount}
                    </Text>
                </TouchableOpacity>

                {/* Dislike Button */}
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={onDislike}
                >
                    <ChevronDown 
                        size={22} 
                        color={isDisliked ? '#0F172A' : '#94A3B8'} 
                        strokeWidth={2.5}
                    />
                    <Text style={[
                        styles.actionText,
                        isDisliked && styles.actionTextActive
                    ]}>
                        {dislikeCount}
                    </Text>
                </TouchableOpacity>

                {/* Bookmark Button */}
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={onBookmark}
                >
                    <Bookmark 
                        size={20} 
                        color={isBookmarked ? '#0F172A' : '#94A3B8'}
                        fill={isBookmarked ? '#0F172A' : 'none'}
                        strokeWidth={2}
                    />
                    <Text style={[
                        styles.actionText,
                        isBookmarked && styles.actionTextActive
                    ]}>
                        Save
                    </Text>
                </TouchableOpacity>

                {/* Share Button */}
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={onShare}
                >
                    <Share 
                        size={20} 
                        color="#0F172A" 
                        strokeWidth={2}
                    />
                    <Text style={styles.actionTextActive}>Share</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingTop: 14,
        paddingBottom: 20,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 8,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4,
        backgroundColor: 'transparent',
        flex: 1,
    },
    actionText: {
        color: '#94A3B8',
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 4,
    },
    actionTextActive: {
        color: '#0F172A',
    },
});