// ArticleDetailScreen.jsx - Full article view with original icons
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ChevronLeft, 
    ChevronUp, 
    ChevronDown, 
    Bookmark, 
    Share,
    MoreHorizontal
} from 'lucide-react-native';

const ArticleDetailScreen = ({ navigation, route }) => {
    const { article } = route.params;
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likeCount, setLikeCount] = useState(24);
    const [dislikeCount, setDislikeCount] = useState(3);

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    };

    const handleDislike = () => {
        setDislikeCount(dislikeCount + 1);
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={handleBackPress}
                >
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.moreButton}>
                    <MoreHorizontal size={20} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Article Content */}
            <ScrollView 
                style={styles.scrollContainer} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.articleContainer}>
                    {/* Source Information */}
                    <View style={styles.sourceContainer}>
                        <View style={styles.sourceIcon}>
                            <Text style={styles.sourceIconText}>
                                {article.source.substring(0, 3).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.sourceDetails}>
                            <Text style={styles.sourceName}>{article.source}</Text>
                            <Text style={styles.timeText}>{article.time}</Text>
                        </View>
                    </View>

                    {/* Category */}
                    <View style={styles.categoryContainer}>
                        <Text style={styles.categoryText}>{article.category}</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{article.title}</Text>

                    {/* Full Article Content */}
                    <Text style={styles.content}>
                        {article.fullContent}
                    </Text>

                    {/* Bottom Spacer for Actions */}
                    <View style={styles.bottomSpacer} />
                </View>
            </ScrollView>

            {/* Bottom Actions with Original Icons */}
            <View style={styles.bottomActionsContainer}>
                <View style={styles.bottomActions}>
                    {/* Like Button */}
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={handleLike}
                    >
                        <View style={styles.actionIconContainer}>
                            <ChevronUp size={22} color="#fff" />
                        </View>
                        <Text style={styles.actionCount}>
                            {likeCount}
                        </Text>
                    </TouchableOpacity>

                    {/* Dislike Button */}
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={handleDislike}
                    >
                        <View style={styles.actionIconContainer}>
                            <ChevronDown size={22} color="#fff" />
                        </View>
                        <Text style={styles.actionCount}>{dislikeCount}</Text>
                    </TouchableOpacity>

                    {/* Bookmark Button */}
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={handleBookmark}
                    >
                        <View style={styles.actionIconContainer}>
                            <Bookmark 
                                size={22} 
                                color="#fff"
                                fill={isBookmarked ? "#fff" : "none"}
                            />
                        </View>
                        <Text style={styles.actionCount}>
                            Save
                        </Text>
                    </TouchableOpacity>

                    {/* Share Button */}
                    <TouchableOpacity style={styles.actionButton}>
                        <View style={styles.actionIconContainer}>
                            <Share size={20} color="#fff" />
                        </View>
                        <Text style={styles.actionCount}>Share</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e1e8ed',
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f7f9fa',
    },
    moreButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f7f9fa',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 120, // Space for enhanced bottom actions
    },
    articleContainer: {
        padding: 16,
    },
    sourceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sourceIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#666',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sourceIconText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    sourceDetails: {
        flex: 1,
    },
    sourceName: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    timeText: {
        color: '#657786',
        fontSize: 14,
    },
    categoryContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#000',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        marginBottom: 16,
    },
    categoryText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    title: {
        color: '#000',
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 30,
        marginBottom: 20,
    },
    content: {
        color: '#14171a',
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'justify',
    },
    bottomSpacer: {
        height: 20,
    },
    bottomActionsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingTop: 12,
        paddingBottom: 20,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    bottomActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e1e8ed',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: '#000',
        minWidth: 60,
    },
    actionIconContainer: {
        marginBottom: 2,
    },
    actionCount: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default ArticleDetailScreen;