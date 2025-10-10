// ============================================
// FILE: screens/NewsFeedScreen.jsx
// ============================================
import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeedHeader } from './components/FeedHeader';
import { TabBar } from './components/TabBar';
import { NewsCard } from './components/NewsCard';
import { mockApi } from './Service/mockApi';

const NewsFeedScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('For you');
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [votedItems, setVotedItems] = useState({});
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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
        await loadNews();
        setRefreshing(false);
    };

    const handleArticlePress = (article) => {
        // Navigate to ArticleDetail screen with article data
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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            
            <FeedHeader navigation={navigation} />
            <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <ScrollView 
                style={styles.feed} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#FF4500"
                        colors={['#FF4500']}
                    />
                }
            >
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
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
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