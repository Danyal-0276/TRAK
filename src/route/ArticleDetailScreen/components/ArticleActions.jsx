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
                    style={[
                        styles.actionButton,
                        isLiked && styles.actionButtonLiked
                    ]}
                    onPress={onLike}
                >
                    <ChevronUp 
                        size={20} 
                        color={isLiked ? '#FF4500' : '#6B7280'} 
                        strokeWidth={2.5}
                    />
                    <Text style={[
                        styles.actionText,
                        isLiked && styles.actionTextLiked
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
                        size={20} 
                        color="#6B7280" 
                        strokeWidth={2.5}
                    />
                    <Text style={styles.actionText}>{dislikeCount}</Text>
                </TouchableOpacity>

                {/* Bookmark Button */}
                <TouchableOpacity 
                    style={[
                        styles.actionButton,
                        isBookmarked && styles.actionButtonBookmarked
                    ]}
                    onPress={onBookmark}
                >
                    <Bookmark 
                        size={20} 
                        color={isBookmarked ? '#F59E0B' : '#6B7280'}
                        fill={isBookmarked ? '#F59E0B' : 'none'}
                        strokeWidth={2}
                    />
                    <Text style={[
                        styles.actionText,
                        isBookmarked && styles.actionTextBookmarked
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
                        size={18} 
                        color="#6B7280" 
                        strokeWidth={2}
                    />
                    <Text style={styles.actionText}>Share</Text>
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
        backgroundColor: '#fff',
        paddingTop: 12,
        paddingBottom: 20,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 8,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F7F7F7',
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: 'transparent',
        minWidth: 70,
    },
    actionButtonLiked: {
        backgroundColor: '#FFF5F0',
    },
    actionButtonBookmarked: {
        backgroundColor: '#FFFBEB',
    },
    actionText: {
        color: '#6B7280',
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 2,
    },
    actionTextLiked: {
        color: '#FF4500',
    },
    actionTextBookmarked: {
        color: '#F59E0B',
    },
});