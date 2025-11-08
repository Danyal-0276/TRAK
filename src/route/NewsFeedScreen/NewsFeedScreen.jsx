// ============================================
// NewsFeedScreen.jsx - WITH SKELETON LOADING
// ============================================
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    StatusBar,
    RefreshControl,
    Animated,
    Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeedHeader } from './components/FeedHeader';
import { TabBar } from './components/TabBar';
import { NewsCard } from '../../components/NewsCard';
import { mockApi } from '../../utils/Service/mockApi';

const HEADER_HEIGHT = 60;
const TAB_HEIGHT = 50;
const TOTAL_HEADER_HEIGHT = HEADER_HEIGHT + TAB_HEIGHT;

// Skeleton Card Component
const SkeletonCard = () => {
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
        <View style={skeletonStyles.container}>
            <View style={skeletonStyles.card}>
                {/* Header */}
                <View style={skeletonStyles.header}>
                    <View style={skeletonStyles.sourceContainer}>
                        <Animated.View style={[skeletonStyles.sourceIcon, { opacity }]} />
                        <View style={skeletonStyles.sourceInfo}>
                            <Animated.View style={[skeletonStyles.sourceName, { opacity }]} />
                            <Animated.View style={[skeletonStyles.timeText, { opacity }]} />
                        </View>
                    </View>
                </View>

                {/* Title */}
                <Animated.View style={[skeletonStyles.title, { opacity }]} />
                <Animated.View style={[skeletonStyles.titleShort, { opacity }]} />

                {/* Excerpt */}
                <Animated.View style={[skeletonStyles.excerpt, { opacity }]} />
                <Animated.View style={[skeletonStyles.excerpt, { opacity }]} />
                <Animated.View style={[skeletonStyles.excerptShort, { opacity }]} />

                {/* Meta */}
                <View style={skeletonStyles.metaRow}>
                    <Animated.View style={[skeletonStyles.badge, { opacity }]} />
                    <Animated.View style={[skeletonStyles.badge, { opacity }]} />
                </View>

                {/* Actions */}
                <View style={skeletonStyles.actionsContainer}>
                    <View style={skeletonStyles.actionsLeft}>
                        <Animated.View style={[skeletonStyles.actionCircle, { opacity }]} />
                        <Animated.View style={[skeletonStyles.voteCount, { opacity }]} />
                        <Animated.View style={[skeletonStyles.actionCircle, { opacity }]} />
                    </View>
                    <View style={skeletonStyles.actionsRight}>
                        <Animated.View style={[skeletonStyles.actionCircle, { opacity }]} />
                        <Animated.View style={[skeletonStyles.actionCircle, { opacity }]} />
                    </View>
                </View>
            </View>
        </View>
    );
};

const NewsFeedScreen = ({ navigation }) => {
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
            const response = await mockApi.getNewsFeed();
            setNewsData(response.data);
        } catch (error) {
            console.error('Error loading news:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNews();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
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
                        // Scrolling down - hide header behind status bar
                        Animated.spring(headerTranslateY, {
                            toValue: -TOTAL_HEADER_HEIGHT,
                            useNativeDriver: true,
                            friction: 8,
                            tension: 40,
                        }).start();
                    } else if (diff < 0) {
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
            await mockApi.voteArticle(itemId, newVote);
        } catch (error) {
            setVotedItems(prev => ({
                ...prev,
                [itemId]: previousVote
            }));
        }
    };

    const handleBookmark = async (itemId) => {
        setBookmarkedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });

        try {
            await mockApi.bookmarkArticle(itemId);
        } catch (error) {
            console.error('Error bookmarking:', error);
        }
    };

    return (
        <View style={styles.outerContainer}>
            {/* Translucent status bar - header slides behind this area */}
            <StatusBar 
                barStyle="dark-content" 
                backgroundColor="transparent" 
                translucent 
            />
            
            {/* SOLID STATUS BAR AREA - ALWAYS VISIBLE */}
            <View 
                style={[
                    styles.statusBarCover, 
                    { height: insets.top }
                ]}
            />

            <View style={styles.container}>
                {/* Animated Header that slides up behind status bar */}
                <Animated.View
                    style={[
                        styles.headerContainer,
                        { 
                            paddingTop: insets.top,
                            transform: [{ translateY: headerTranslateY }]
                        },
                    ]}
                >
                    <FeedHeader navigation={navigation} />
                    <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
                </Animated.View>

                {/* Scrollable Content */}
                <Animated.ScrollView
                    style={styles.feed}
                    contentContainerStyle={styles.feedContent}
                    showsVerticalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#2563EB"
                            colors={['#2563EB']}
                            progressViewOffset={TOTAL_HEADER_HEIGHT + insets.top}
                        />
                    }
                >
                    {/* Spacer for header + status bar */}
                    <View style={{ height: TOTAL_HEADER_HEIGHT + insets.top }} />

                    {loading ? (
                        // Show skeleton cards while loading
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : (
                        // Show actual news cards
                        newsData.map((item) => (
                            <NewsCard
                                key={item.id}
                                item={item}
                                onPress={() => handleArticlePress(item)}
                                votedItems={votedItems}
                                bookmarkedItems={bookmarkedItems}
                                onVote={handleVote}
                                onBookmark={handleBookmark}
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
        backgroundColor: '#FFFFFF',
    },
    statusBarCover: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        zIndex: 10000,
        elevation: 1000,
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: '#FFFFFF',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 3,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    feed: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    feedContent: {
        backgroundColor: '#F7F7F7',
    },
    endPadding: {
        height: 20,
    },
});

const skeletonStyles = StyleSheet.create({
    container: {
        marginBottom: 1,
    },
    card: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
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
        backgroundColor: '#E2E8F0',
        marginRight: 12,
    },
    sourceInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    sourceName: {
        width: 120,
        height: 14,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        marginBottom: 6,
    },
    timeText: {
        width: 80,
        height: 12,
        backgroundColor: '#F1F5F9',
        borderRadius: 4,
    },
    title: {
        width: '100%',
        height: 16,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        marginBottom: 8,
    },
    titleShort: {
        width: '70%',
        height: 16,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        marginBottom: 12,
    },
    excerpt: {
        width: '100%',
        height: 12,
        backgroundColor: '#F1F5F9',
        borderRadius: 4,
        marginBottom: 6,
    },
    excerptShort: {
        width: '85%',
        height: 12,
        backgroundColor: '#F1F5F9',
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
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
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
        backgroundColor: '#E2E8F0',
    },
    voteCount: {
        width: 32,
        height: 16,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
    },
});

export default NewsFeedScreen;