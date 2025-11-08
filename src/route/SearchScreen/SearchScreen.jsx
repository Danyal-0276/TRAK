// ============================================
// SearchScreen.jsx - Enhanced Explore Page
// ============================================
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Animated,
  Pressable,
  Keyboard,
  RefreshControl,
} from "react-native";
import SearchBar from "./components/SearchBar";
import Tabs from "./components/tabs";
import TrendingTopics from "./components/TrendingTopics";
import RecentSearches from "./components/RecentSearches";
import { NewsCard } from "../../components/NewsCard";
import { mockApi } from "../../utils/Service/mockApi";

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
        <View style={skeletonStyles.header}>
          <View style={skeletonStyles.sourceContainer}>
            <Animated.View style={[skeletonStyles.sourceIcon, { opacity }]} />
            <View style={skeletonStyles.sourceInfo}>
              <Animated.View style={[skeletonStyles.sourceName, { opacity }]} />
              <Animated.View style={[skeletonStyles.timeText, { opacity }]} />
            </View>
          </View>
        </View>
        <Animated.View style={[skeletonStyles.title, { opacity }]} />
        <Animated.View style={[skeletonStyles.titleShort, { opacity }]} />
        <Animated.View style={[skeletonStyles.excerpt, { opacity }]} />
        <Animated.View style={[skeletonStyles.excerpt, { opacity }]} />
        <Animated.View style={[skeletonStyles.excerptShort, { opacity }]} />
        <View style={skeletonStyles.metaRow}>
          <Animated.View style={[skeletonStyles.badge, { opacity }]} />
          <Animated.View style={[skeletonStyles.badge, { opacity }]} />
        </View>
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

const SearchScreen = ({ navigation }) => {
  const [allNews, setAllNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [votedItems, setVotedItems] = useState({});
  const [bookmarkedItems, setBookmarkedItems] = useState(new Set());

  const searchRef = useRef(null);
  const scrollOffset = useRef(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  const categories = ["All", "Sports", "Technology", "Environment", "Business", "Wildlife"];

  const loadNews = async () => {
    try {
      setLoading(true);
      const [newsResponse, trendingResponse, searchesResponse] = await Promise.all([
        mockApi.getNewsFeed(),
        mockApi.getTrendingTopics(),
        mockApi.getRecentSearches(),
      ]);
      
      setAllNews(newsResponse.data);
      setFilteredNews(newsResponse.data);
      setTrendingTopics(trendingResponse.data);
      setRecentSearches(searchesResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    if (!loading && filteredNews.length > 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, filteredNews, fadeAnim, translateY]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleTopicPress = (topicName) => {
    setSearchQuery(topicName);
    handleSearch(topicName);
    searchRef.current?.collapseKeepText();
  };

  const handleSearchSelect = async (query) => {
    setSearchQuery(query);
    handleSearch(query);
    searchRef.current?.collapseKeepText();
    
    // Update recent searches
    try {
      await mockApi.addRecentSearch(query);
      const response = await mockApi.getRecentSearches();
      setRecentSearches(response.data);
    } catch (error) {
      console.error("Error updating recent searches:", error);
    }
  };

  const handleDeleteSearch = async (searchId) => {
    try {
      await mockApi.deleteRecentSearch(searchId);
      const response = await mockApi.getRecentSearches();
      setRecentSearches(response.data);
    } catch (error) {
      console.error("Error deleting search:", error);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      let results = [...allNews];

      if (activeTab !== "All") {
        results = results.filter(item => 
          item.category && item.category.toLowerCase() === activeTab.toLowerCase()
        );
      }

      if (searchQuery.trim()) {
        const lower = searchQuery.toLowerCase();
        results = results.filter(
          (item) =>
            (item.title && item.title.toLowerCase().includes(lower)) ||
            (item.excerpt && item.excerpt.toLowerCase().includes(lower)) ||
            (item.source && item.source.toLowerCase().includes(lower)) ||
            (item.category && item.category.toLowerCase().includes(lower))
        );
      }

      setFilteredNews(results);
    }, 350);
    return () => clearTimeout(delay);
  }, [searchQuery, activeTab, allNews]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const direction = currentOffset > scrollOffset.current ? "down" : "up";
    scrollOffset.current = currentOffset;
    if (direction === "down") searchRef.current?.collapse();
    else if (direction === "up") searchRef.current?.expandVisual();
  };

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

  const handleTabPress = (category) => {
    setActiveTab(category);
  };

  return (
    <View style={styles.screenWrapper}>
      <SearchBar
        ref={searchRef}
        onSearch={handleSearch}
        initialQuery={searchQuery}
      />

      <View style={styles.tabsWrapper}>
        <Tabs 
          categories={categories}
          activeTab={activeTab}
          onTabPress={handleTabPress}
        />
      </View>

      <Pressable
        style={{ flex: 1 }}
        onPress={() => {
          Keyboard.dismiss();
          searchRef.current?.hideHistory();
          searchRef.current?.collapseKeepText();
        }}
      >
        {loading ? (
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#4f8cff']}
                tintColor="#4f8cff"
              />
            }
          >
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </ScrollView>
        ) : filteredNews.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.noResultsContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#4f8cff']}
                tintColor="#4f8cff"
              />
            }
          >
            <Text style={styles.noResultsEmoji}>🔍</Text>
            <Text style={styles.noResultsText}>No news found</Text>
            <Text style={styles.noResultsSub}>
              {searchQuery.trim() 
                ? "Try searching with different keywords" 
                : "No articles in this category"}
            </Text>
          </ScrollView>
        ) : (
          <Animated.View
            style={[
              styles.animatedList,
              { opacity: fadeAnim, transform: [{ translateY }] },
            ]}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              contentContainerStyle={styles.scrollContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#4f8cff']}
                  tintColor="#4f8cff"
                />
              }
            >
              <TrendingTopics 
                topics={trendingTopics}
                onTopicPress={handleTopicPress}
                searchQuery={searchQuery}
              />
              
              <RecentSearches 
                searches={recentSearches}
                onSearchSelect={handleSearchSelect}
                onDeleteSearch={handleDeleteSearch}
                searchQuery={searchQuery}
              />
              
              {filteredNews.map((item) => (
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
          </Animated.View>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 4,
  },
  tabsWrapper: {
    height: 40,
  },
  animatedList: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 60,
    backgroundColor: "#F7F7F7",
  },
  noResultsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 20,
    paddingVertical: 100,
  },
  noResultsEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  noResultsText: {
    fontSize: 18,
    color: "#0F172A",
    fontWeight: "700",
  },
  noResultsSub: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
    textAlign: "center",
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

export default SearchScreen;