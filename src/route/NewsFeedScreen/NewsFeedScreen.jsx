// ============================================
// NewsFeedScreen.jsx - WITH SKELETON LOADING
// ============================================
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    StatusBar,
    RefreshControl,
    Animated,
    Platform,
    Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { FeedHeader } from './components/FeedHeader';
import { TabBar } from './components/TabBar';
import { NewsCard } from '../../components/NewsCard';
import { addBookmark, getUserFeed, listBookmarks, removeBookmark, setReaction } from '../../utils/Service/api';
import { useTheme } from '../../theme/ThemeContext';
import { resetTabBarVisibility, setTabBarHidden } from '../../navigation/tabBarVisibility';

const { width, height } = Dimensions.get('window');

const HEADER_HEIGHT = 60;
const TAB_HEIGHT = 50;
const TOTAL_HEADER_HEIGHT = HEADER_HEIGHT + TAB_HEIGHT;

// Skeleton Card Component
const SkeletonCard = ({ colors }) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [shimmerAnim]);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View style={[skeletonStyles.container]}>
            <View style={[skeletonStyles.card, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                {/* Header */}
                <View style={skeletonStyles.header}>
                    <View style={skeletonStyles.sourceContainer}>
                        <Animated.View style={[skeletonStyles.sourceIcon, { opacity, backgroundColor: colors.border }]} />
                        <View style={skeletonStyles.sourceInfo}>
                            <Animated.View style={[skeletonStyles.sourceName, { opacity, backgroundColor: colors.border }]} />
                            <Animated.View style={[skeletonStyles.timeText, { opacity, backgroundColor: colors.borderLight }]} />
                        </View>
                    </View>
                </View>

                {/* Title */}
                <Animated.View style={[skeletonStyles.title, { opacity, backgroundColor: colors.border }]} />
                <Animated.View style={[skeletonStyles.titleShort, { opacity, backgroundColor: colors.border }]} />

                {/* Excerpt */}
                <Animated.View style={[skeletonStyles.excerpt, { opacity, backgroundColor: colors.borderLight }]} />
                <Animated.View style={[skeletonStyles.excerpt, { opacity, backgroundColor: colors.borderLight }]} />
                <Animated.View style={[skeletonStyles.excerptShort, { opacity, backgroundColor: colors.borderLight }]} />

                {/* Meta */}
                <View style={skeletonStyles.metaRow}>
                    <Animated.View style={[skeletonStyles.badge, { opacity, backgroundColor: colors.border }]} />
                    <Animated.View style={[skeletonStyles.badge, { opacity, backgroundColor: colors.border }]} />
                </View>

                {/* Actions */}
                <View style={[skeletonStyles.actionsContainer, { borderTopColor: colors.borderLight }]}>
                    <View style={skeletonStyles.actionsLeft}>
                        <Animated.View style={[skeletonStyles.actionCircle, { opacity, backgroundColor: colors.border }]} />
                        <Animated.View style={[skeletonStyles.voteCount, { opacity, backgroundColor: colors.border }]} />
                        <Animated.View style={[skeletonStyles.actionCircle, { opacity, backgroundColor: colors.border }]} />
                    </View>
                    <View style={skeletonStyles.actionsRight}>
                        <Animated.View style={[skeletonStyles.actionCircle, { opacity, backgroundColor: colors.border }]} />
                        <Animated.View style={[skeletonStyles.actionCircle, { opacity, backgroundColor: colors.border }]} />
                    </View>
                </View>
            </View>
        </View>
    );
};

const NewsFeedScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const [activeTab, setActiveTab] = useState('For you');
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [votedItems, setVotedItems] = useState({});
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const insets = useSafeAreaInsets();

    // Animation refs
    const scrollY = useRef(new Animated.Value(0)).current;
    const lastScrollY = useRef(0);
    const headerTranslateY = useRef(new Animated.Value(0)).current;

    const loadNews = async () => {
        try {
            setLoading(true);
            const response = await getUserFeed();
            const mapped = (response.results || []).map((item, idx) => ({
                ...item,
                id: item.id || item.canonical_url || String(idx),
                source: item.source || 'Source',
                time: item.published_at
                    ? new Date(item.published_at).toLocaleString()
                    : 'Recently',
                title: item.title || 'Untitled',
                excerpt: item.excerpt || item.content || '',
                content: item.content || item.excerpt || '',
                fullContent: item.content || item.excerpt || '',
                category: item.topic_keywords?.[0] || 'General',
                verified: item.credibility?.label === 'real',
                trending: Boolean(item.topic_keywords?.length),
                votes: 0,
                readTime: 4,
            }));
            setNewsData(mapped);
        } catch (error) {
            console.error('Error loading news:', error);
            setNewsData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNews();
    }, []);

    useEffect(() => {
        resetTabBarVisibility();
        return () => resetTabBarVisibility();
    }, []);

    useEffect(() => {
        (async () => {
            const res = await listBookmarks().catch(() => ({ results: [] }));
            setBookmarkedItems(new Set((res.results || []).map((b) => String(b.article_id))));
        })();
    }, []);


    const handleRefresh = async () => {
        setRefreshing(true);
        setTabBarHidden(false);
        // Show header on refresh
        Animated.spring(headerTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
        }).start();
        await loadNews();
        setRefreshing(false);
    };

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: false,
            listener: (event) => {
                const currentScrollY = event.nativeEvent.contentOffset.y;
                const diff = currentScrollY - lastScrollY.current;

                // Only trigger animation if scroll change is significant
                if (Math.abs(diff) > 5) {
                    if (diff > 0 && currentScrollY > 50) {
                        setTabBarHidden(true);
                        // Scrolling down - hide header behind status bar
                        Animated.spring(headerTranslateY, {
                            toValue: -TOTAL_HEADER_HEIGHT,
                            useNativeDriver: true,
                            friction: 8,
                            tension: 40,
                        }).start();
                    } else if (diff < 0) {
                        setTabBarHidden(false);
                        // Scrolling up - show header
                        Animated.spring(headerTranslateY, {
                            toValue: 0,
                            useNativeDriver: true,
                            friction: 8,
                            tension: 40,
                        }).start();
                    }
                }

                lastScrollY.current = currentScrollY;
            },
        }
    );

    const handleArticlePress = (article) => {
        navigation.navigate('ArticleDetail', { article });
    };

    const handleVote = async (itemId, type) => {
        const previousVote = votedItems[itemId];
        const newVote = previousVote === type ? null : type;

        setVotedItems(prev => ({
            ...prev,
            [itemId]: newVote
        }));

        try {
            await setReaction(itemId, newVote || 'none');
        } catch (error) {
            setVotedItems(prev => ({
                ...prev,
                [itemId]: previousVote
            }));
        }
    };

    const handleBookmark = async (itemId) => {
        const wasBookmarked = bookmarkedItems.has(itemId);
        setBookmarkedItems(prev => {
            const next = new Set(prev);
            if (next.has(itemId)) next.delete(itemId);
            else next.add(itemId);
            return next;
        });

        try {
            const article = newsData.find((n) => String(n.id) === String(itemId));
            if (wasBookmarked) {
                await removeBookmark(itemId);
            } else {
                await addBookmark(itemId, article?.title || '', article?.canonical_url || article?.url || '');
            }
        } catch (error) {
            console.error('Error bookmarking:', error);
            setBookmarkedItems(prev => {
                const rollback = new Set(prev);
                if (rollback.has(itemId)) rollback.delete(itemId);
                else rollback.add(itemId);
                return rollback;
            });
        }
    };

    const filteredNews = useMemo(() => {
        if (activeTab === 'Following') {
            return newsData.filter((_, i) => i % 2 === 0);
        }
        return newsData;
    }, [newsData, activeTab]);

    return (
        <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
            <StatusBar 
                barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
                backgroundColor="transparent" 
                translucent 
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
            
            <View 
                style={[
                    styles.statusBarCover,
                    { 
                        height: insets.top,
                        backgroundColor: colors.background 
                    }
                ]}
            />

            <View style={[styles.container, { backgroundColor: 'transparent' }]}>
                <Animated.View
                    style={[
                        styles.headerContainer,
                        { 
                            paddingTop: insets.top,
                            transform: [{ translateY: headerTranslateY }],
                            backgroundColor: colors.surface,
                            shadowColor: colors.shadowDark || '#000',
                        },
                    ]}
                >
                    <FeedHeader navigation={navigation} />
                    <TabBar activeTab={activeTab} setActiveTab={setActiveTab} navigation={navigation} />
                </Animated.View>

                <Animated.ScrollView
                    style={[styles.feed, { backgroundColor: 'transparent' }]}
                    contentContainerStyle={[styles.feedContent, { backgroundColor: 'transparent', paddingTop: 8 }]}
                    showsVerticalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                            colors={[colors.primary]}
                            progressViewOffset={TOTAL_HEADER_HEIGHT + insets.top}
                        />
                    }
                >
                    <View style={{ height: TOTAL_HEADER_HEIGHT + insets.top + 8 }} />

                    {loading ? (
                        <>
                            <SkeletonCard colors={colors} />
                            <SkeletonCard colors={colors} />
                            <SkeletonCard colors={colors} />
                            <SkeletonCard colors={colors} />
                            <SkeletonCard colors={colors} />
                        </>
                    ) : (
                        filteredNews.map((item, index) => (
                            <NewsCard
                                key={item.id}
                                item={item}
                                onPress={() => handleArticlePress(item)}
                                votedItems={votedItems}
                                bookmarkedItems={bookmarkedItems}
                                onVote={handleVote}
                                onBookmark={handleBookmark}
                                index={index}
                            />
                        ))
                    )}
                    <View style={styles.endPadding} />
                </Animated.ScrollView>
            </View>
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
    statusBarCover: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        elevation: 1000,
    },
    container: {
        flex: 1,
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    feed: {
        flex: 1,
    },
    feedContent: {},
    endPadding: {
        height: 30,
    },
});

const skeletonStyles = StyleSheet.create({
    container: {
        marginBottom: 1,
    },
    card: {
        padding: 16,
        borderBottomWidth: 1,
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
        marginRight: 12,
    },
    sourceInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    sourceName: {
        width: 120,
        height: 14,
        borderRadius: 4,
        marginBottom: 6,
    },
    timeText: {
        width: 80,
        height: 12,
        borderRadius: 4,
    },
    title: {
        width: '100%',
        height: 16,
        borderRadius: 4,
        marginBottom: 8,
    },
    titleShort: {
        width: '70%',
        height: 16,
        borderRadius: 4,
        marginBottom: 12,
    },
    excerpt: {
        width: '100%',
        height: 12,
        borderRadius: 4,
        marginBottom: 6,
    },
    excerptShort: {
        width: '85%',
        height: 12,
        borderRadius: 4,
        marginBottom: 14,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        gap: 8,
    },
    badge: {
        width: 70,
        height: 24,
        borderRadius: 4,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 14,
        borderTopWidth: 1,
    },
    actionsLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionsRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    voteCount: {
        width: 32,
        height: 16,
        borderRadius: 4,
    },
});

export default NewsFeedScreen;