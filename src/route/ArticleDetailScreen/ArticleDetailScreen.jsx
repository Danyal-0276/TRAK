
// ============================================
// FILE: screens/ArticleDetailScreen.jsx
// ============================================
import React, { useRef, useEffect } from 'react';
import { useState } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    ScrollView,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { ArticleDetailHeader } from './components/ArticleDetailHeader';
import { ArticleSourceInfo } from './components/ArticleSourceInfo';
import { ArticleContent } from './components/ArticleContent';
import { ArticleActions } from './components/ArticleActions';
import { useTheme } from '../../theme/ThemeContext';

const { width, height } = Dimensions.get('window');

const ArticleDetailScreen = ({ navigation, route }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const { article } = route.params;
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likeCount, setLikeCount] = useState(article.votes || 24);
    const [dislikeCount, setDislikeCount] = useState(3);

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const circle1Anim = useRef(new Animated.Value(0)).current;
    const circle2Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 50,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 7,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(circle1Anim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(circle2Anim, {
                toValue: 1,
                duration: 1200,
                delay: 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleLike = () => {
        if (isDisliked) {
            setIsDisliked(false);
            setDislikeCount(dislikeCount - 1);
        }
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    };

    const handleDislike = () => {
        if (isLiked) {
            setIsLiked(false);
            setLikeCount(likeCount - 1);
        }
        setIsDisliked(!isDisliked);
        setDislikeCount(isDisliked ? dislikeCount - 1 : dislikeCount + 1);
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
    };

    const handleShare = () => {
        // Implement share functionality
        console.log('Share article');
    };

    return (
        <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
            <StatusBar 
                barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
                backgroundColor={colors.background} 
            />
            
            {/* Enhanced gradient background */}
            <LinearGradient
                colors={theme.mode === 'dark' 
                    ? ['#0F172A', '#1E293B', '#334155', '#1E293B', '#0F172A']
                    : [colors.background, colors.backgroundSecondary, '#F8FAFC', colors.backgroundSecondary, colors.background]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBackground}
            />
            
            {/* Animated decorative circles */}
            <Animated.View 
                style={[
                    styles.accentCircle1, 
                    { 
                        backgroundColor: `rgba(0, 0, 0, ${theme.mode === 'dark' ? '0.12' : '0.05'})`,
                        opacity: circle1Anim,
                        transform: [
                            {
                                scale: circle1Anim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.8, 1],
                                }),
                            },
                        ],
                    }
                ]} 
            />
            <Animated.View 
                style={[
                    styles.accentCircle2, 
                    { 
                        backgroundColor: `rgba(0, 0, 0, ${theme.mode === 'dark' ? '0.10' : '0.04'})`,
                        opacity: circle2Anim,
                        transform: [
                            {
                                scale: circle2Anim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.8, 1],
                                }),
                            },
                        ],
                    }
                ]} 
            />

            <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
                {/* Header */}
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }}
                >
                    <ArticleDetailHeader onBackPress={handleBackPress} />
                </Animated.View>

                {/* Article Content */}
                <ScrollView 
                    style={[styles.scrollContainer, { backgroundColor: 'transparent' }]} 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <Animated.View 
                        style={[
                            styles.articleContainer,
                            {
                                opacity: fadeAnim,
                                transform: [
                                    { translateY: slideAnim },
                                    { scale: scaleAnim },
                                ],
                            },
                        ]}
                    >
                        {/* Source Information */}
                        <Animated.View
                            style={{
                                opacity: fadeAnim,
                                transform: [
                                    {
                                        translateY: slideAnim.interpolate({
                                            inputRange: [0, 30],
                                            outputRange: [0, 20],
                                        }),
                                    },
                                ],
                            }}
                        >
                            <ArticleSourceInfo 
                                source={article.source}
                                time={article.time}
                                verified={article.verified}
                                trending={article.trending}
                                readTime={article.readTime}
                            />
                        </Animated.View>

                        {/* Article Content */}
                        <Animated.View
                            style={{
                                opacity: fadeAnim,
                                transform: [
                                    {
                                        translateY: slideAnim.interpolate({
                                            inputRange: [0, 30],
                                            outputRange: [0, 30],
                                        }),
                                    },
                                ],
                            }}
                        >
                            <ArticleContent 
                                category={article.category}
                                title={article.title}
                                content={article.fullContent || article.excerpt || 'Full article content goes here...'}
                            />
                        </Animated.View>

                        {/* Bottom Spacer for Actions */}
                        <View style={styles.bottomSpacer} />
                    </Animated.View>
                </ScrollView>

                {/* Bottom Actions */}
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [
                            {
                                translateY: slideAnim.interpolate({
                                    inputRange: [0, 30],
                                    outputRange: [0, 40],
                                }),
                            },
                        ],
                    }}
                >
                    <ArticleActions 
                        likeCount={likeCount}
                        dislikeCount={dislikeCount}
                        isLiked={isLiked}
                        isDisliked={isDisliked}
                        isBookmarked={isBookmarked}
                        onLike={handleLike}
                        onDislike={handleDislike}
                        onBookmark={handleBookmark}
                        onShare={handleShare}
                    />
                </Animated.View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
    },
    gradientBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    accentCircle1: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        top: -100,
        right: -80,
    },
    accentCircle2: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        bottom: 200,
        left: -60,
    },
    container: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    articleContainer: {
        padding: 24,
    },
    bottomSpacer: {
        height: 20,
    },
});

export default ArticleDetailScreen;