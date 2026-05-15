
// ============================================
// FILE: screens/ArticleDetailScreen.jsx
// ============================================
import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    ScrollView,
    Animated,
    Dimensions,
} from 'react-native';
import { shareArticle, openArticleMenu } from '../../utils/articleMenu';
import { useFeedback } from '../../components/ui/FeedbackProvider';
import { FeedSkeleton } from '../../components/FeedSkeleton';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { ArticleDetailHeader } from './components/ArticleDetailHeader';
import { ArticleSourceInfo } from './components/ArticleSourceInfo';
import { ArticleContent } from './components/ArticleContent';
import { ArticleActions } from './components/ArticleActions';
import { useTheme } from '../../theme/ThemeContext';
import { fetchArticle } from '../../api/newsApi';
import { mapApiItem } from '../../utils/loadFeed';
import { normalizeArticleForDetail } from '../../utils/articleNavigation';
import { getAccessToken } from '../../api/client';
import { addBookmark, listBookmarks, listReactions, removeBookmark, setReaction } from '../../utils/Service/api';
import { getBookmarkIds, setBookmarkIds } from '../../utils/bookmarksStorage';
import { getReactionMap, mergeReactionRows, setReactionForArticle } from '../../utils/reactionsStorage';

const { width, height } = Dimensions.get('window');

const ArticleDetailScreen = ({ navigation, route }) => {
    const { theme } = useTheme();
    const feedback = useFeedback();
    const { colors } = theme;
    const initialArticle = normalizeArticleForDetail(route.params?.article || {});
    const [article, setArticle] = useState(initialArticle);
    const [reaction, setReactionState] = useState(null); // 'up' | 'down' | null
    const [reactionPending, setReactionPending] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likeCount, setLikeCount] = useState(Number(initialArticle.like_count ?? 0));
    const [dislikeCount, setDislikeCount] = useState(Number(initialArticle.dislike_count ?? 0));
    const [detailLoading, setDetailLoading] = useState(
        !initialArticle.title && !initialArticle.fullContent && !initialArticle.excerpt
    );
    const articleId = String(route.params?.articleId || initialArticle.id || '');

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const circle1Anim = useRef(new Animated.Value(0)).current;
    const circle2Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const fromNav = normalizeArticleForDetail(route.params?.article || {});
        if (fromNav.id) {
            setArticle(fromNav);
            setDetailLoading(false);
        }
        const id = String(route.params?.articleId || fromNav.id || '').trim();
        let cancelled = false;
        (async () => {
            if (!id) {
                setDetailLoading(false);
                return;
            }
            const token = await getAccessToken();
            if (!token) {
                setDetailLoading(false);
                return;
            }
            const needsLoader = !fromNav.title && !fromNav.fullContent && !fromNav.excerpt;
            if (needsLoader) setDetailLoading(true);
            try {
                const doc = await fetchArticle(id);
                if (cancelled) return;
                const mapped = normalizeArticleForDetail(mapApiItem(doc));
                setArticle((prev) => ({ ...prev, ...mapped, id }));
                setLikeCount(Number(doc.like_count ?? mapped.like_count ?? 0));
                setDislikeCount(Number(doc.dislike_count ?? mapped.dislike_count ?? 0));
                const [cachedBmIds, bRes, rRes] = await Promise.all([
                    getBookmarkIds().catch(() => []),
                    listBookmarks().catch(() => ({ results: [] })),
                    listReactions().catch(() => ({ results: [] })),
                ]);
                const cacheHas = (cachedBmIds || []).map(String).includes(String(id));
                const isBm = cacheHas || (bRes.results || []).some((b) => String(b.article_id) === String(id));
                setIsBookmarked(isBm);
                const cachedReactions = await getReactionMap().catch(() => ({}));
                const serverReactionMap = await mergeReactionRows(rRes.results || [], { replace: false }).catch(() => ({}));
                const mergedMap = { ...cachedReactions, ...serverReactionMap };
                const rowVal = mergedMap[String(id)];
                const row = (rRes.results || []).find((r) => String(r.article_id) === String(id));
                const rv = row?.reaction === 'like' ? 'up' : row?.reaction === 'dislike' ? 'down' : null;
                setReactionState(rowVal ?? rv ?? null);
            } catch (e) {
                console.warn('Article fetch:', e?.message);
            } finally {
                if (!cancelled) setDetailLoading(false);
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
            const data = await setReaction(articleId, next === 'up' ? 'like' : next === 'down' ? 'dislike' : 'none');
            setLikeCount(Number(data.like_count ?? likeCount));
            setDislikeCount(Number(data.dislike_count ?? dislikeCount));
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
            const data = await setReaction(articleId, next === 'up' ? 'like' : next === 'down' ? 'dislike' : 'none');
            setLikeCount(Number(data.like_count ?? likeCount));
            setDislikeCount(Number(data.dislike_count ?? dislikeCount));
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
        shareArticle(article);
    };

    const handleMoreMenu = () => {
        openArticleMenu({ ...article, id: articleId }, feedback);
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
                    <ArticleDetailHeader onBackPress={handleBackPress} onMorePress={handleMoreMenu} />
                </Animated.View>

                {/* Article Content */}
                {detailLoading ? (
                    <View style={{ padding: 16, flex: 1 }}>
                        <FeedSkeleton colors={colors} count={2} />
                    </View>
                ) : (
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
                )}

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