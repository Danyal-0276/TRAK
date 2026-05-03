
// ============================================
// FILE: screens/ArticleDetailScreen.jsx
// ============================================
import React, { useRef, useEffect, useState, useMemo } from 'react';
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
import { fetchArticle } from '../../api/newsApi';
import { mapApiItem } from '../../utils/loadFeed';
import { getAccessToken } from '../../api/client';
import { addBookmark, listBookmarks, listReactions, removeBookmark, setReaction } from '../../utils/Service/api';
import { getBookmarkIds, setBookmarkIds } from '../../utils/bookmarksStorage';
import { getReactionMap, mergeReactionRows, setReactionForArticle } from '../../utils/reactionsStorage';

const { width, height } = Dimensions.get('window');

const ArticleDetailScreen = ({ navigation, route }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const [article, setArticle] = useState(route.params?.article || {});
    const [reaction, setReactionState] = useState(null); // 'up' | 'down' | null
    const [reactionPending, setReactionPending] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [baseVotes, setBaseVotes] = useState(Number(route.params?.article?.votes || 0));
    const articleId = String(route.params?.articleId || route.params?.article?.id || '');
    const voteCount = useMemo(() => {
        const delta = reaction === 'up' ? 1 : reaction === 'down' ? -1 : 0;
        return Number(baseVotes || 0) + delta;
    }, [baseVotes, reaction]);

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const circle1Anim = useRef(new Animated.Value(0)).current;
    const circle2Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const fromNav = route.params?.article;
        if (fromNav && Object.keys(fromNav).length) {
            setArticle(fromNav);
        }
        const id = route.params?.articleId || fromNav?.id;
        let cancelled = false;
        (async () => {
            if (!id) return;
            const token = await getAccessToken();
            if (!token) return;
            try {
                const doc = await fetchArticle(String(id));
                if (cancelled) return;
                const mapped = mapApiItem(doc);
                setArticle((prev) => ({ ...prev, ...mapped }));
                setBaseVotes(Number(mapped.votes || route.params?.article?.votes || 0));
                const [cachedBmIds, bRes, rRes] = await Promise.all([
                    getBookmarkIds().catch(() => []),
                    listBookmarks().catch(() => ({ results: [] })),
                    listReactions().catch(() => ({ results: [] })),
                ]);
                const cacheHas = (cachedBmIds || []).map(String).includes(String(id));
                const isBm = cacheHas || (bRes.results || []).some((b) => String(b.article_id) === String(id));
                setIsBookmarked(isBm);
                const cachedReactions = await getReactionMap().catch(() => ({}));
                const serverReactionMap = await mergeReactionRows(rRes.results || []).catch(() => ({}));
                const mergedMap = { ...cachedReactions, ...serverReactionMap };
                const rowVal = mergedMap[String(id)];
                const row = (rRes.results || []).find((r) => String(r.article_id) === String(id));
                const rv = row?.reaction === 'like' ? 'up' : row?.reaction === 'dislike' ? 'down' : null;
                setReactionState(rowVal ?? rv ?? null);
            } catch (e) {
                console.warn('Article fetch:', e?.message);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [route.params?.article?.id, route.params?.articleId]);

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

    const handleLike = async () => {
        if (reactionPending) return;
        const previous = reaction;
        const next = previous === 'up' ? null : 'up';
        setReactionState(next);
        setReactionForArticle(articleId, next).catch(() => {});
        setReactionPending(true);
        try {
            await setReaction(articleId, next === 'up' ? 'like' : next === 'down' ? 'dislike' : 'none');
        } catch {
            setReactionForArticle(articleId, previous || null).catch(() => {});
            setReactionState(previous);
        } finally {
            setReactionPending(false);
        }
    };

    const handleDislike = async () => {
        if (reactionPending) return;
        const previous = reaction;
        const next = previous === 'down' ? null : 'down';
        setReactionState(next);
        setReactionForArticle(articleId, next).catch(() => {});
        setReactionPending(true);
        try {
            await setReaction(articleId, next === 'up' ? 'like' : next === 'down' ? 'dislike' : 'none');
        } catch {
            setReactionForArticle(articleId, previous || null).catch(() => {});
            setReactionState(previous);
        } finally {
            setReactionPending(false);
        }
    };

    const handleBookmark = async () => {
        const previous = isBookmarked;
        const next = !previous;
        setIsBookmarked(next);
        try {
            const ids = await getBookmarkIds().catch(() => []);
            const set = new Set((ids || []).map(String));
            if (next) set.add(articleId);
            else set.delete(articleId);
            await setBookmarkIds(Array.from(set)).catch(() => {});
            if (next) {
                await addBookmark(articleId, article?.title || '', article?.canonical_url || '');
            } else {
                await removeBookmark(articleId);
            }
        } catch {
            const ids = await getBookmarkIds().catch(() => []);
            const set = new Set((ids || []).map(String));
            if (previous) set.add(articleId);
            else set.delete(articleId);
            await setBookmarkIds(Array.from(set)).catch(() => {});
            setIsBookmarked(previous);
        }
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
                        likeCount={voteCount}
                        dislikeCount={0}
                        isLiked={reaction === 'up'}
                        isDisliked={reaction === 'down'}
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