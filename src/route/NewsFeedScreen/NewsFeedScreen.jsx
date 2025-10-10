// ============================================
// FILE: screens/NewsFeedScreen.jsx
// ============================================
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    Text,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeedHeader } from './components/FeedHeader';
import { TabBar } from './components/TabBar';
import { NewsCard } from './components/NewsCard';
import { mockApi } from './Service/mockApi';

const HEADER_HEIGHT = 60; // Approximate height of FeedHeader
const TAB_HEIGHT = 50; // Approximate height of TabBar
const TOTAL_HEADER_HEIGHT = HEADER_HEIGHT + TAB_HEIGHT;

const NewsFeedScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('For you');
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [votedItems, setVotedItems] = useState({});
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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
        // Reset header position when refreshing
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

                // Only hide/show if scrolled more than 5 pixels
                if (Math.abs(diff) > 5) {
                    if (diff > 0 && currentScrollY > 50) {
                        // Scrolling down - hide header
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

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF4500" />
                    <Text style={styles.loadingText}>Loading stories...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Animated Header Container */}
            <Animated.View
                style={[
                    styles.headerContainer,
                    {
                        transform: [{ translateY: headerTranslateY }],
                    },
                ]}
            >
                <FeedHeader navigation={navigation} />
                <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
            </Animated.View>

            {/* Scrollable Feed */}
            <Animated.ScrollView
                style={styles.feed}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#FF4500"
                        colors={['#FF4500']}
                        progressViewOffset={TOTAL_HEADER_HEIGHT}
                    />
                }
            >
                {/* Spacer for header */}
                <View style={{ height: TOTAL_HEADER_HEIGHT }} />

                {newsData.map((item) => (
                    <NewsCard
                        key={item.id}
                        item={item}
                        onPress={() => handleArticlePress(item)}
                        votedItems={votedItems}
                        bookmarkedItems={bookmarkedItems}
                        onVote={handleVote}
                        onBookmark={handleBookmark}
                    />
                ))}
                <View style={styles.endPadding} />
            </Animated.ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: '#FFFFFF',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    feed: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
    },
    loadingText: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
    },
    endPadding: {
        height: 20,
    },
});

export default NewsFeedScreen;