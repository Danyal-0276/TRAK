// ============================================
// FILE: components/ArticleActions.jsx
// ============================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronUp, ChevronDown, Bookmark, Share } from 'lucide-react-native';
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
    
    return (
        <View style={[styles.container, { 
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            shadowColor: colors.shadow,
        }]}>
            <View style={styles.actions}>
                {/* Like Button */}
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={onLike}
                >
                    <ChevronUp 
                        size={22} 
                        color={isLiked ? colors.textPrimary : colors.textTertiary} 
                        strokeWidth={2.5}
                    />
                    <Text style={[
                        styles.actionText,
                        { color: colors.textTertiary },
                        isLiked && { color: colors.textPrimary }
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
                        color={isDisliked ? colors.textPrimary : colors.textTertiary} 
                        strokeWidth={2.5}
                    />
                    <Text style={[
                        styles.actionText,
                        { color: colors.textTertiary },
                        isDisliked && { color: colors.textPrimary }
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
                        color={isBookmarked ? colors.textPrimary : colors.textTertiary}
                        fill={isBookmarked ? colors.textPrimary : 'none'}
                        strokeWidth={2}
                    />
                    <Text style={[
                        styles.actionText,
                        { color: colors.textTertiary },
                        isBookmarked && { color: colors.textPrimary }
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
                        color={colors.textPrimary} 
                        strokeWidth={2}
                    />
                    <Text style={[styles.actionText, { color: colors.textPrimary }]}>Share</Text>
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
        paddingTop: 14,
        paddingBottom: 20,
        paddingHorizontal: 16,
        borderTopWidth: 1,
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
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 4,
    },
});