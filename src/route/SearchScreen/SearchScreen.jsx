// ============================================
// SearchScreen.jsx - Enhanced Explore Page
// ============================================
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  Pressable,
  Keyboard,
  RefreshControl,
  StatusBar,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import SearchBar from "./components/SearchBar";
import Tabs from "./components/tabs";
import TrendingTopics from "./components/TrendingTopics";
import RecentSearches from "./components/RecentSearches";
import { NewsCard } from "../../components/NewsCard";
import { useTheme } from "../../theme/ThemeContext";
import { loadFeedItems } from "../../utils/loadFeed";
import {
  getRecentSearches,
  addRecentSearch,
  deleteRecentSearch,
} from "../../utils/recentSearchesStorage";
import Text from "../../components/ui/Text";
import { Search } from "lucide-react-native";
import { resetTabBarVisibility, setTabBarHidden } from "../../navigation/tabBarVisibility";

const { width, height } = Dimensions.get('window');

function deriveTrendingFromArticles(articles) {
  const counts = {};
  for (const a of articles) {
    for (const k of a.topic_keywords || []) {
      const key = String(k).toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count], i) => ({
      id: `${i}-${name}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count: `${count} in feed`,
      icon: "🔥",
      trending: count >= 2,
    }));
}

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
    <View style={skeletonStyles.container}>
      <View style={[skeletonStyles.card, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={skeletonStyles.header}>
          <View style={skeletonStyles.sourceContainer}>
            <Animated.View style={[skeletonStyles.sourceIcon, { opacity, backgroundColor: colors.border }]} />
            <View style={skeletonStyles.sourceInfo}>
              <Animated.View style={[skeletonStyles.sourceName, { opacity, backgroundColor: colors.border }]} />
              <Animated.View style={[skeletonStyles.timeText, { opacity, backgroundColor: colors.borderLight }]} />
            </View>
          </View>
        </View>
        <Animated.View style={[skeletonStyles.title, { opacity, backgroundColor: colors.border }]} />
        <Animated.View style={[skeletonStyles.titleShort, { opacity, backgroundColor: colors.border }]} />
        <Animated.View style={[skeletonStyles.excerpt, { opacity, backgroundColor: colors.borderLight }]} />
        <Animated.View style={[skeletonStyles.excerpt, { opacity, backgroundColor: colors.borderLight }]} />
        <Animated.View style={[skeletonStyles.excerptShort, { opacity, backgroundColor: colors.borderLight }]} />
        <View style={skeletonStyles.metaRow}>
          <Animated.View style={[skeletonStyles.badge, { opacity, backgroundColor: colors.border }]} />
          <Animated.View style={[skeletonStyles.badge, { opacity, backgroundColor: colors.border }]} />
        </View>
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

const SearchScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;
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
  const circle1Anim = useRef(new Animated.Value(0)).current;
  const circle2Anim = useRef(new Animated.Value(0)).current;
  const circle3Anim = useRef(new Animated.Value(0)).current;

  const categories = ["All", "Sports", "Technology", "Environment", "Business", "Wildlife"];

  useEffect(() => {
    const q = searchQuery.trim();
    const delayMs = q ? 360 : 0;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const items = await loadFeedItems({ q });
        setAllNews(items);
        if (!q) {
          setTrendingTopics(deriveTrendingFromArticles(items));
          setRecentSearches(await getRecentSearches());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }, delayMs);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.parallel([
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
        Animated.timing(circle3Anim, {
          toValue: 1,
          duration: 1400,
          delay: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  useEffect(() => {
    resetTabBarVisibility();
    return () => resetTabBarVisibility();
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
    // Extract keywords from topic name for better matching
    const keywords = topicName.toLowerCase().split(' ').filter(k => k.length > 2);
    
    // Try to find matching category first
    const matchingCategory = categories.find(cat => {
      const catLower = cat.toLowerCase();
      if (catLower === 'all') return false;
      return keywords.some(keyword => catLower.includes(keyword)) ||
             catLower.includes(topicName.toLowerCase()) ||
             topicName.toLowerCase().includes(catLower);
    });
    
    if (matchingCategory) {
      setActiveTab(matchingCategory);
      setSearchQuery(''); // Clear search to show all in category
      handleSearch(''); // Clear search
    } else {
      // Use the topic name as search query - search for keywords
      const searchKeywords = keywords.join(' ');
      setSearchQuery(searchKeywords || topicName);
      handleSearch(searchKeywords || topicName);
    }
    searchRef.current?.collapseKeepText();
  };

  const handleSearchSelect = async (query) => {
    if (!query || !query.trim()) {
      setSearchQuery('');
      return;
    }
    
    setSearchQuery(query);
    handleSearch(query);
    searchRef.current?.collapseKeepText();
    
    // Update recent searches
    try {
      const next = await addRecentSearch(query);
      setRecentSearches(next);
    } catch (error) {
      console.error("Error updating recent searches:", error);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    handleSearch('');
    setActiveTab('All');
    searchRef.current?.collapseKeepText();
  };

  const handleDeleteSearch = async (searchId) => {
    try {
      const next = await deleteRecentSearch(searchId);
      setRecentSearches(next);
    } catch (error) {
      console.error("Error deleting search:", error);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      let results = [...allNews];

      // Filter by category first
      if (activeTab !== "All") {
        results = results.filter(item => {
          const itemCategory = item.category ? item.category.toLowerCase() : '';
          const activeCategory = activeTab.toLowerCase();
          return itemCategory === activeCategory || 
                 itemCategory.includes(activeCategory) ||
                 (item.categories && item.categories.some(cat => 
                   cat.toLowerCase() === activeCategory || 
                   cat.toLowerCase().includes(activeCategory)
                 ));
        });
      }

      // Then filter by search query if provided
      if (searchQuery && searchQuery.trim()) {
        const lower = searchQuery.toLowerCase().trim();
        const searchTerms = lower.split(' ').filter(term => term.length > 0);
        
        results = results.filter(
          (item) => {
            // Check if any search term matches
            const matchesTerm = (text) => {
              if (!text) return false;
              const textLower = text.toLowerCase();
              return searchTerms.some(term => textLower.includes(term));
            };
            
            // Check title
            if (item.title && matchesTerm(item.title)) return true;
            // Check excerpt
            if (item.excerpt && matchesTerm(item.excerpt)) return true;
            // Check source
            if (item.source && matchesTerm(item.source)) return true;
            // Check category
            if (item.category && matchesTerm(item.category)) return true;
            // Check categories array
            if (item.categories && item.categories.some(cat => 
              matchesTerm(cat)
            )) return true;
            // Check content
            if (item.content && matchesTerm(item.content)) return true;
            // Check full content
            if (item.fullContent && matchesTerm(item.fullContent)) return true;
            if (item.topic_keywords && item.topic_keywords.some((k) => matchesTerm(k)))
              return true;
            return false;
          }
        );
      }

      setFilteredNews(results);
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery, activeTab, allNews]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const q = searchQuery.trim();
      const items = await loadFeedItems({ q });
      setAllNews(items);
      if (!q) {
        setTrendingTopics(deriveTrendingFromArticles(items));
        setRecentSearches(await getRecentSearches());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const diff = currentOffset - scrollOffset.current;
    const direction = currentOffset > scrollOffset.current ? "down" : "up";
    scrollOffset.current = currentOffset;
    if (direction === "down") searchRef.current?.collapse();
    else if (direction === "up") searchRef.current?.expandVisual();
    if (Math.abs(diff) > 6) {
      if (direction === "down" && currentOffset > 40) setTabBarHidden(true);
      if (direction === "up") setTabBarHidden(false);
    }
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
      /* votes not persisted — API TBD */
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
      /* bookmarks not persisted — API TBD */
    } catch (error) {
      console.error('Error bookmarking:', error);
    }
  };

  const handleTabPress = (category) => {
    setActiveTab(category);
  };

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
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
        pointerEvents="none"
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
        pointerEvents="none"
      />
      <Animated.View 
        style={[
          styles.accentCircle3, 
          { 
            backgroundColor: `rgba(0, 0, 0, ${theme.mode === 'dark' ? '0.08' : '0.03'})`,
            opacity: circle3Anim,
            transform: [
              {
                scale: circle3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          }
        ]}
        pointerEvents="none"
      />

      <SafeAreaView style={[styles.screenWrapper, { backgroundColor: 'transparent' }]}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: translateY }],
          }}
        >
          <View style={styles.headerSection}>
            <Text variant="title" style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Discover News
            </Text>
            <Text variant="body" color={colors.textSecondary} style={styles.headerSubtitle}>
              Search and explore trending topics
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: translateY }],
            zIndex: 50,
          }}
        >
          <SearchBar
            ref={searchRef}
            onSearch={handleSearch}
            initialQuery={searchQuery}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: translateY }],
          }}
        >
          <View style={styles.tabsWrapper}>
            <Tabs 
              categories={categories}
              activeTab={activeTab}
              onTabPress={handleTabPress}
            />
          </View>
        </Animated.View>

      <Pressable
        style={styles.contentArea}
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
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          >
            <SkeletonCard colors={colors} />
            <SkeletonCard colors={colors} />
            <SkeletonCard colors={colors} />
            <SkeletonCard colors={colors} />
            <SkeletonCard colors={colors} />
          </ScrollView>
        ) : filteredNews.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.noResultsContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Search size={48} color={colors.primary} strokeWidth={2} />
            </View>
            <Text variant="title" color={colors.textPrimary} style={styles.noResultsText}>No news found</Text>
            <Text variant="body" color={colors.textSecondary} style={styles.noResultsSub}>
              {searchQuery.trim() 
                ? "Try searching with different keywords" 
                : "No articles in this category"}
            </Text>
            {(searchQuery.trim() || activeTab !== 'All') && (
              <TouchableOpacity
                style={[styles.clearButton, { backgroundColor: colors.primary }]}
                onPress={handleClearSearch}
                activeOpacity={0.8}
              >
                <Text style={[styles.clearButtonText, { color: colors.textInverse || '#FFFFFF' }]}>
                  Clear & Show All
                </Text>
              </TouchableOpacity>
            )}
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
                  colors={[colors.primary]}
                  tintColor={colors.primary}
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
              
              {filteredNews.map((item, index) => (
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
              ))}
              <View style={styles.endPadding} />
            </ScrollView>
          </Animated.View>
        )}
      </Pressable>
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
    width: 350,
    height: 350,
    borderRadius: 175,
    top: -100,
    right: -100,
  },
  accentCircle2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    bottom: 200,
    left: -80,
  },
  accentCircle3: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: height * 0.4,
    right: -50,
  },
  screenWrapper: {
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  tabsWrapper: {
    height: 48,
  },
  contentArea: {
    flex: 1,
  },
  animatedList: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 120,
    paddingTop: 8,
  },
  noResultsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 100,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  noResultsText: {
    marginBottom: 8,
  },
  noResultsSub: {
    marginTop: 8,
    textAlign: "center",
    marginBottom: 24,
  },
  clearButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    marginTop: 20,
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
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

export default SearchScreen;