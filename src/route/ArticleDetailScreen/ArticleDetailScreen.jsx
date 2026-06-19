
// ============================================
// FILE: screens/ArticleDetailScreen.jsx
// ============================================
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Animated,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { shareArticle, openArticleMenu } from '../../utils/articleMenu';
import { useFeedback } from '../../components/ui/FeedbackProvider';
import FeedbackModal from '../../components/FeedbackModal';
import { FeedSkeleton } from '../../components/FeedSkeleton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { ArticleDetailHeader } from './components/ArticleDetailHeader';
import { ArticleSourceInfo } from './components/ArticleSourceInfo';
import { ArticleContent } from './components/ArticleContent';
import { ArticleActions } from './components/ArticleActions';
import { useTheme } from '../../theme/ThemeContext';
import { fetchArticle } from '../../api/newsApi';
import { mapApiItem } from '../../utils/loadFeed';
import { normalizeArticleForDetail, getArticleListenText } from '../../utils/articleNavigation';
import { returnToMainTab } from '../../navigation/appStackNavigation';
import { useStackBackHandler } from '../../hooks/useStackBackHandler';
import { buildHighlightLinesFromContent } from '../../utils/ttsHighlight';
import ArticleTtsPlayer from '../../components/ArticleTtsPlayer';
import ArticleCardImage from '../../components/ArticleCardImage';
import { resolveArticleImageUrl } from '../../utils/articleMedia';
import { stopNativePlayback } from '../../utils/articleTts';
import { getAccessToken } from '../../api/client';
import { listBookmarks, listReactions, setReaction } from '../../utils/Service/api';
import { getBookmarkIds, setBookmarkIds } from '../../utils/bookmarksStorage';
import { getReactionMap, mergeReactionRows, setReactionForArticle } from '../../utils/reactionsStorage';
import { computeOptimisticReactionCounts } from '../../utils/reactionVote';
import { emitArticleInteractionChange, subscribeArticleInteractionChange } from '../../utils/articleInteractionEvents';
import {
    toggleVoteRegistered,
    scheduleVotePersist,
    setRegisteredVote,
    getRegisteredVote,
    isVoteRegistered,
    hasPendingVotePersist,
    seedVoteRegistry,
} from '../../utils/articleVoteController';
import { emitBookmarkToggle, queueBookmarkApi } from '../../utils/articleBookmarkController';

const { width, height } = Dimensions.get('window');

const ArticleDetailScreen = ({ navigation, route }) => {
    const { theme } = useTheme();
    const feedback = useFeedback();
    const { colors } = theme;
    const initialArticle = normalizeArticleForDetail(route.params?.article || {});
    const articleId = String(route.params?.articleId || initialArticle.id || '');
    const [article, setArticle] = useState(initialArticle);
    const [reaction, setReactionState] = useState(
        () => initialArticle.userReaction ?? getRegisteredVote(articleId) ?? null,
    );
    const [isBookmarked, setIsBookmarked] = useState(
        () => Boolean(initialArticle.isBookmarked) || false,
    );
    const [likeCount, setLikeCount] = useState(Number(initialArticle.like_count ?? 0));
    const [dislikeCount, setDislikeCount] = useState(Number(initialArticle.dislike_count ?? 0));
    const [detailLoading, setDetailLoading] = useState(
        !initialArticle.title && !initialArticle.fullContent && !initialArticle.excerpt
    );
    const [fetchError, setFetchError] = useState('');
    const returnTab = route.params?.returnTab || 'Home';
    useStackBackHandler(navigation, true, returnTab);
    const [activeTtsLineIndex, setActiveTtsLineIndex] = useState(-1);
    const [feedbackOpen, setFeedbackOpen] = useState(false);

    const articleBody =
        article.fullContent || article.content || article.full_content || '';
    const heroImage = resolveArticleImageUrl(article);
    const listenText = getArticleListenText(article);
    const { lines: ttsHighlightLines } = useMemo(
        () => buildHighlightLinesFromContent(articleBody, listenText, { title: article.title }),
        [articleBody, listenText, article.title]
    );

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const circle1Anim = useRef(new Animated.Value(0)).current;
    const circle2Anim = useRef(new Animated.Value(0)).current;
    const scrollRef = useRef(null);
    const scrollContentRef = useRef(null);

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
            const cachedReactions = await getReactionMap().catch(() => ({}));
            seedVoteRegistry(cachedReactions);
            const cachedBmIds = await getBookmarkIds().catch(() => []);
            const cacheHasBm = (cachedBmIds || []).map(String).includes(String(id));
            if (cacheHasBm) setIsBookmarked(true);
            const cachedVote = getRegisteredVote(id) ?? cachedReactions[String(id)] ?? fromNav.userReaction ?? null;
            if (cachedVote) setReactionState(cachedVote);

            const needsLoader = !fromNav.title && !fromNav.fullContent && !fromNav.excerpt;
            if (needsLoader) setDetailLoading(true);
            try {
                const doc = await fetchArticle(id);
                if (cancelled) return;
                const mapped = normalizeArticleForDetail(mapApiItem(doc));
                setArticle((prev) => ({ ...prev, ...mapped, id }));
                if (!isVoteRegistered(id) && !hasPendingVotePersist(id)) {
                    setLikeCount(Number(doc.like_count ?? mapped.like_count ?? 0));
                    setDislikeCount(Number(doc.dislike_count ?? mapped.dislike_count ?? 0));
                }
                if (!isVoteRegistered(id) && !hasPendingVotePersist(id)) {
                    const row = (await listReactions().catch(() => ({ results: [] }))).results?.find(
                        (r) => String(r.article_id) === String(id)
                    );
                    const rv = row?.reaction === 'like' ? 'up' : row?.reaction === 'dislike' ? 'down' : null;
                    setReactionState(getRegisteredVote(id) ?? cachedReactions[String(id)] ?? rv ?? null);
                }
                if (!cacheHasBm) {
                    const bRes = await listBookmarks().catch(() => ({ results: [] }));
                    const isBm = (bRes.results || []).some((b) => String(b.article_id) === String(id));
                    setIsBookmarked(isBm);
                }
            } catch (e) {
                if (!cancelled) {
                    setFetchError(e?.message || 'Could not load this article.');
                }
            } finally {
                if (!cancelled) setDetailLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [route.params?.article?.id, route.params?.articleId]);

    useEffect(() => {
        if (!articleId) return undefined;
        const fromParams = normalizeArticleForDetail(route.params?.article || {});
        if (fromParams.userReaction != null) setReactionState(fromParams.userReaction);
        else {
            const vote = getRegisteredVote(articleId) ?? null;
            if (vote) setReactionState(vote);
        }
        if (fromParams.like_count != null) setLikeCount(Number(fromParams.like_count));
        if (fromParams.dislike_count != null) setDislikeCount(Number(fromParams.dislike_count));
        if (fromParams.isBookmarked != null) setIsBookmarked(Boolean(fromParams.isBookmarked));

        return subscribeArticleInteractionChange((patch) => {
            if (String(patch.articleId) !== String(articleId)) return;
            if (patch.userReaction !== undefined) setReactionState(patch.userReaction);
            if (patch.like_count !== undefined) setLikeCount(patch.like_count);
            if (patch.dislike_count !== undefined) setDislikeCount(patch.dislike_count);
            if (patch.isBookmarked !== undefined) setIsBookmarked(patch.isBookmarked);
        });
    }, [articleId, route.params?.article]);

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
    }, [fadeAnim, slideAnim, scaleAnim, circle1Anim, circle2Anim]);

    useFocusEffect(
        useCallback(() => {
            const unsub = navigation.addListener('beforeRemove', () => {
                stopNativePlayback();
            });
            return unsub;
        }, [navigation])
    );

    const applyReaction = (type) => {
        const { previousVote, newVote, changed } = toggleVoteRegistered(articleId, type);
        if (!changed) return;
        const counts = computeOptimisticReactionCounts(likeCount, dislikeCount, previousVote, newVote);
        setReactionState(newVote);
        setLikeCount(counts.like_count);
        setDislikeCount(counts.dislike_count);
        setReactionForArticle(articleId, newVote).catch(() => {});
        emitArticleInteractionChange({
            articleId,
            userReaction: newVote,
            like_count: counts.like_count,
            dislike_count: counts.dislike_count,
        });

        scheduleVotePersist(articleId, {
            debounceMs: 80,
            persist: (id, apiValue) => setReaction(id, apiValue),
            onReconcile: (data, vote) => {
                const likes = Number(data.like_count ?? counts.like_count);
                const dislikes = Number(data.dislike_count ?? counts.dislike_count);
                setLikeCount(likes);
                setDislikeCount(dislikes);
                emitArticleInteractionChange({
                    articleId,
                    userReaction: vote,
                    like_count: likes,
                    dislike_count: dislikes,
                });
            },
            onRollback: () => {
                setRegisteredVote(articleId, previousVote);
                setReactionForArticle(articleId, previousVote || null).catch(() => {});
                setReactionState(previousVote);
                const rollback = computeOptimisticReactionCounts(
                    counts.like_count,
                    counts.dislike_count,
                    newVote,
                    previousVote
                );
                setLikeCount(rollback.like_count);
                setDislikeCount(rollback.dislike_count);
                emitArticleInteractionChange({
                    articleId,
                    userReaction: previousVote,
                    like_count: rollback.like_count,
                    dislike_count: rollback.dislike_count,
                });
            },
        });
    };

    const handleLike = () => applyReaction('up');
    const handleDislike = () => applyReaction('down');

    const handleBookmark = async () => {
        const previous = isBookmarked;
        const next = !previous;
        setIsBookmarked(next);
        const ids = await getBookmarkIds().catch(() => []);
        const set = new Set((ids || []).map(String));
        if (next) set.add(articleId);
        else set.delete(articleId);
        await setBookmarkIds(Array.from(set)).catch(() => {});
        emitBookmarkToggle({ articleId, isBookmarked: next, article });

        queueBookmarkApi(articleId, previous ? 'remove' : 'add', article).catch(async () => {
            const rollbackIds = await getBookmarkIds().catch(() => []);
            const rollback = new Set((rollbackIds || []).map(String));
            if (previous) rollback.add(articleId);
            else rollback.delete(articleId);
            await setBookmarkIds(Array.from(rollback)).catch(() => {});
            setIsBookmarked(previous);
            emitBookmarkToggle({ articleId, isBookmarked: previous, article });
        });
    };

    const handleShare = () => {
        shareArticle(article, articleId);
    };

    const handleMoreMenu = () => {
        openArticleMenu({ ...article, id: articleId }, feedback, {
            articleId,
            onOpenFeedback: () => setFeedbackOpen(true),
        });
    };

    const handleBack = () => {
        stopNativePlayback();
        if (navigation.canGoBack?.()) {
            navigation.goBack();
            return;
        }
        returnToMainTab(navigation, returnTab);
    };

    const handleHome = () => {
        stopNativePlayback();
        navigation.navigate('MainTabs', { screen: 'Home' });
    };

    return (
        <>
        <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
            <StatusBar 
                barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
                backgroundColor={colors.background} 
            />
            
            <LinearGradient
                colors={theme.mode === 'dark' 
                    ? [colors.background, colors.backgroundSecondary, colors.background]
                    : [colors.background, colors.backgroundSecondary, '#F8FAFC', colors.backgroundSecondary, colors.background]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBackground}
            />
            
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
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }}
                >
                    <ArticleDetailHeader
                        onBackPress={handleBack}
                        onHomePress={handleHome}
                        onMorePress={handleMoreMenu}
                    />
                </Animated.View>

                {detailLoading ? (
                    <View style={{ padding: 16, flex: 1 }}>
                        <FeedSkeleton colors={colors} count={2} />
                    </View>
                ) : fetchError && !article.title ? (
                    <View style={styles.errorWrap}>
                        <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                            Could not load article
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
                            {fetchError}
                        </Text>
                        <TouchableOpacity
                            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
                            onPress={handleBack}
                        >
                            <Text style={{ color: colors.textOnPrimary || '#fff', fontWeight: '600' }}>Go back</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                <ScrollView
                    ref={scrollRef}
                    style={[styles.scrollContainer, { backgroundColor: 'transparent' }]}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View ref={scrollContentRef} collapsable={false}>
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

                        {heroImage ? (
                            <ArticleCardImage
                                src={heroImage}
                                alt={article.title || 'Article'}
                                height={220}
                                borderRadius={14}
                                backgroundColor={colors.borderLight}
                                style={styles.heroImage}
                            />
                        ) : null}

                        <ArticleTtsPlayer
                            text={listenText}
                            colors={colors}
                            highlightLines={ttsHighlightLines}
                            onActiveLineIndex={setActiveTtsLineIndex}
                            articleId={articleId}
                        />

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
                                content={articleBody || 'Full article content goes here...'}
                                highlightLines={ttsHighlightLines}
                                activeLineIndex={activeTtsLineIndex}
                                scrollRef={scrollRef}
                                scrollContentRef={scrollContentRef}
                            />
                        </Animated.View>

                        <View style={styles.bottomSpacer} />
                    </Animated.View>
                    </View>
                </ScrollView>
                )}

                <Animated.View
                    pointerEvents={detailLoading || (fetchError && !article.title) ? 'none' : 'auto'}
                    style={{
                        opacity: detailLoading || (fetchError && !article.title) ? 0 : fadeAnim,
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
        <FeedbackModal
            visible={feedbackOpen}
            onClose={() => setFeedbackOpen(false)}
            item={{ ...article, id: articleId }}
            type="article_report"
        />
        </>
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
    heroImage: {
        marginBottom: 20,
    },
    bottomSpacer: {
        height: 20,
    },
    errorWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    retryBtn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
});

export default ArticleDetailScreen;
