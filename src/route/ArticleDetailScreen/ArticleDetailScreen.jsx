// ============================================
// FILE: screens/ArticleDetailScreen.jsx
// ============================================
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArticleDetailHeader } from './components/ArticleDetailHeader';
import { ArticleSourceInfo } from './components/ArticleSourceInfo';
import { ArticleContent } from './components/ArticleContent';
import { ArticleActions } from './components/ArticleActions';

const ArticleDetailScreen = ({ navigation, route }) => {
    const { article } = route.params;
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likeCount, setLikeCount] = useState(article.votes || 24);
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

    const handleShare = () => {
        // Implement share functionality
        console.log('Share article');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            
            {/* Header */}
            <ArticleDetailHeader onBackPress={handleBackPress} />

            {/* Article Content */}
            <ScrollView 
                style={styles.scrollContainer} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.articleContainer}>
                    {/* Source Information */}
                    <ArticleSourceInfo 
                        source={article.source}
                        time={article.time}
                        verified={article.verified}
                    />

                    {/* Article Content */}
                    <ArticleContent 
                        category={article.category}
                        title={article.title}
                        content={article.fullContent}
                    />

                    {/* Bottom Spacer for Actions */}
                    <View style={styles.bottomSpacer} />
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <ArticleActions 
                likeCount={likeCount}
                dislikeCount={dislikeCount}
                isLiked={isLiked}
                isBookmarked={isBookmarked}
                onLike={handleLike}
                onDislike={handleDislike}
                onBookmark={handleBookmark}
                onShare={handleShare}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    articleContainer: {
        padding: 16,
    },
    bottomSpacer: {
        height: 20,
    },
});

export default ArticleDetailScreen;