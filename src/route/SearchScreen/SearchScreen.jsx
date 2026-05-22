// ============================================
// SearchScreen.jsx - Enhanced Explore Page
// ============================================
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  Pressable,
  Keyboard,
  RefreshControl,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Share,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import SearchBar from "./components/SearchBar";
import PageScreenHeader from "../../components/ui/PageScreenHeader";
import { useCollapsibleHeader } from "../../hooks/useCollapsibleHeader";
import Tabs from "./components/tabs";
import { buildArticleDetailParams } from "../../utils/articleNavigation";
import TrendingTopics from "./components/TrendingTopics";
import { NewsCard } from "../../components/NewsCard";
import { FeedSkeleton } from "../../components/FeedSkeleton";
import ChatBotWidget from "../../components/ChatBotWidget";
import { useArticleInteractions } from "../../hooks/useArticleInteractions";
import { useTheme } from "../../theme/ThemeContext";
import { loadExplorePage } from "../../utils/loadFeed";
import Text from "../../components/ui/Text";
import { Search } from "lucide-react-native";
import { useFeedback } from "../../components/ui/FeedbackProvider";
import { resetTabBarVisibility } from "../../navigation/tabBarVisibility";

const { width, height } = Dimensions.get('window');
const DISCOVER_PAGE_SIZE = 30;
const DISCOVER_PREFETCH_PX = 900;
const DISCOVER_CACHE_TTL_MS = 2 * 60 * 1000;
const discoverFeedCache = new Map();

function discoverCacheKey(q) {
  return String(q || '').trim().toLowerCase();
}

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

/** Explore chips are broad topics; `mapApiItem` often sets `category` to credibility ("real") not "Technology". */
const DISCOVER_TAB_SYNONYMS = {
  sports: ['sport', 'cricket', 'football', 'soccer', 'nba', 'olympic', 'match', 'league', 'athlete'],
  technology: ['tech', 'software', 'ai', 'apple', 'google', 'startup', 'computer', 'digital', 'cyber', 'iphone'],
  environment: ['climate', 'pollution', 'carbon', 'green', 'energy', 'renewable', 'weather', 'cop'],
  business: ['business', 'economy', 'market', 'stock', 'finance', 'trade', 'company', 'tariff'],
  wildlife: ['wildlife', 'animal', 'species', 'zoo', 'nature', 'forest', 'marine', 'bird'],
};

function itemMatchesDiscoverTab(item, activeTab) {
  if (!activeTab || activeTab === 'All') return true;
  const tab = activeTab.toLowerCase().trim();
  const blob = [
    item.title,
    item.excerpt,
    item.content,
    item.fullContent,
    item.category,
    item.source,
    ...(item.categories || []),
    ...(item.topic_keywords || []).map(String),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (blob.includes(tab)) return true;
  for (const w of DISCOVER_TAB_SYNONYMS[tab] || []) {
    if (blob.includes(w)) return true;
  }
  return false;
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
  const insets = useSafeAreaInsets();
  const feedback = useFeedback();
  const [allNews, setAllNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const {
    votedItems,
    bookmarkedItems,
    handleVote,
    handleBookmark,
    syncFromServer,
  } = useArticleInteractions({
    articles: allNews,
    onArticlesPatch: setAllNews,
  });
  const [topSectionHeight, setTopSectionHeight] = useState(152);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const searchRef = useRef(null);
  const prefetchAttemptsRef = useRef(0);
  const scrollOffset = useRef(0);
  const lastDirectionRef = useRef("down");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const {
    translateY: topSectionTranslateY,
    handleScroll: handleHeaderCollapse,
    showHeader: showDiscoverHeader,
  } = useCollapsibleHeader({
    hideOffset: topSectionHeight,
    hideThreshold: 60,
  });
  const circle1Anim = useRef(new Animated.Value(0)).current;
  const circle2Anim = useRef(new Animated.Value(0)).current;
  const circle3Anim = useRef(new Animated.Value(0)).current;

  const categories = ["All", "Sports", "Technology", "Environment", "Business", "Wildlife"];

  const mergeUniqueById = (prev, incoming) => {
    const seen = new Set(prev.map((x) => x.id));
    const next = [...prev];
    for (const item of incoming) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        next.push(item);
      }
    }
    return next;
  };

  const loadFirstPage = useCallback(async (q, { refreshAux = true, preferCache = true } = {}) => {
    const cacheKey = discoverCacheKey(q);
    if (preferCache) {
      const cached = discoverFeedCache.get(cacheKey);
      if (cached && Date.now() - cached.ts < DISCOVER_CACHE_TTL_MS) {
        setAllNews(cached.items || []);
        setNextCursor(cached.nextCursor || null);
        setHasMore(Boolean(cached.hasMore));
        if (!q && refreshAux) {
          setTrendingTopics(cached.trendingTopics || deriveTrendingFromArticles(cached.items || []));
        }
        setLoading(false);
        return;
      }
    }
    prefetchAttemptsRef.current = 0;
    setLoading(true);
    try {
      const page = await loadExplorePage({ q, limit: DISCOVER_PAGE_SIZE, cursor: '' });
      setAllNews(page.items);
      setNextCursor(page.nextCursor);
      setHasMore(page.hasMore);
      if (!q && refreshAux) {
        setTrendingTopics(deriveTrendingFromArticles(page.items));
      }
      discoverFeedCache.set(cacheKey, {
        ts: Date.now(),
        items: page.items || [],
        nextCursor: page.nextCursor || null,
        hasMore: Boolean(page.hasMore),
        trendingTopics: !q && refreshAux ? deriveTrendingFromArticles(page.items || []) : [],
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setAllNews([]);
      setNextCursor(null);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMorePage = useCallback(async () => {
    if (loading || loadingMore || !hasMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const q = searchQuery.trim();
      const page = await loadExplorePage({ q, limit: DISCOVER_PAGE_SIZE, cursor: nextCursor });
      let added = 0;
      setAllNews((prev) => {
        const merged = mergeUniqueById(prev, page.items);
        added = merged.length - prev.length;
        discoverFeedCache.set(discoverCacheKey(q), {
          ts: Date.now(),
          items: merged,
          nextCursor: page.nextCursor || null,
          hasMore: Boolean(page.hasMore),
          trendingTopics: deriveTrendingFromArticles(merged),
        });
        return merged;
      });
      if (added === 0) {
        setHasMore(false);
      } else {
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
      }
    } catch (error) {
      console.error("Error loading more discover items:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loading, loadingMore, nextCursor, searchQuery]);

  useEffect(() => {
    const q = searchQuery.trim();
    const delayMs = q ? 360 : 0;
    const timer = setTimeout(async () => {
      await loadFirstPage(q, { preferCache: true });
    }, delayMs);
    return () => clearTimeout(timer);
  }, [searchQuery, loadFirstPage]);

  useEffect(() => {
    // Proactive fetch of page 2 in "All" so first scroll feels instant.
    if (loading || loadingMore || !hasMore) return;
    if (activeTab !== "All") return;
    if (searchQuery.trim()) return;
    if (prefetchAttemptsRef.current >= 2) return;
    if (allNews.length > 0 && allNews.length < DISCOVER_PAGE_SIZE * 2) {
      prefetchAttemptsRef.current += 1;
      loadMorePage();
    }
  }, [activeTab, allNews.length, hasMore, loadMorePage, loading, loadingMore, searchQuery]);

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

  const handleClearSearch = () => {
    setSearchQuery('');
    handleSearch('');
    setActiveTab('All');
    searchRef.current?.collapseKeepText();
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      let results = [...allNews];

      // Category chips: match topic/title text, not legacy `item.category` (often credibility label).
      if (activeTab !== "All") {
        results = results.filter((item) => itemMatchesDiscoverTab(item, activeTab));
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
      showDiscoverHeader();
      const q = searchQuery.trim();
      await loadFirstPage(q, { refreshAux: true, preferCache: false });
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleScroll = (event) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const currentOffset = contentOffset.y;
    const diff = currentOffset - scrollOffset.current;
    const direction = currentOffset > scrollOffset.current ? "down" : "up";
    scrollOffset.current = currentOffset;

    handleHeaderCollapse(event);

    if (direction !== lastDirectionRef.current) {
      lastDirectionRef.current = direction;
      if (direction === "down") searchRef.current?.collapse();
      else searchRef.current?.expandVisual();
    }

    const nearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - DISCOVER_PREFETCH_PX;
    if (nearBottom) {
      loadMorePage();
    }
  };

  const handleArticlePress = (article) => {
    navigation.navigate('ArticleDetail', buildArticleDetailParams(article));
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

      <View
        style={[styles.statusBarCover, { height: insets.top, backgroundColor: colors.surface }]}
        pointerEvents="none"
      />

      <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.screenWrapper, { backgroundColor: 'transparent' }]}>
        <Animated.View
          style={[
            styles.topSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: topSectionTranslateY }],
              backgroundColor: colors.surface,
              borderBottomColor: colors.borderLight,
            },
          ]}
          onLayout={(e) => {
            const h = Math.max(0, Math.round(e?.nativeEvent?.layout?.height || 0));
            if (h > 0 && h !== topSectionHeight) setTopSectionHeight(h);
          }}
        >
          <PageScreenHeader
            title="Discover"
            subtitle="Explore topics & sources"
            paddingTop={0}
            style={{ borderBottomWidth: 0, paddingBottom: 4 }}
          />

          <View style={styles.searchRow}>
            <SearchBar
              embedded
              ref={searchRef}
              onSearch={handleSearch}
              initialQuery={searchQuery}
            />
          </View>

          <Tabs
            categories={categories}
            activeTab={activeTab}
            onTabPress={handleTabPress}
          />
        </Animated.View>

      <Animated.ScrollView
        style={styles.contentArea}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          Keyboard.dismiss();
          searchRef.current?.hideHistory();
          searchRef.current?.collapseKeepText();
        }}
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: Math.max(0, (topSectionHeight || 0) + 14) },
          !loading && filteredNews.length === 0 ? styles.noResultsContainer : null,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {loading ? (
          <FeedSkeleton colors={colors} count={5} />
        ) : filteredNews.length === 0 ? (
          <>
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
          </>
        ) : (
          <>
            <TrendingTopics
              topics={trendingTopics}
              onTopicPress={handleTopicPress}
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
            {loadingMore ? (
              <View style={{ paddingVertical: 16, alignItems: "center" }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null}
            <View style={styles.endPadding} />
          </>
        )}
      </Animated.ScrollView>
      </SafeAreaView>
      <ChatBotWidget />
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
  statusBarCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 70,
  },
  screenWrapper: {
    flex: 1,
  },
  topSection: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    zIndex: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchRow: {
    width: '100%',
    maxWidth: '100%',
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 50,
  },
  headerSection: {
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 16,
    width: '100%',
  },
  headerTitle: {
    marginBottom: 4,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    width: '100%',
  },
  headerSubtitle: {
    textAlign: 'left',
    lineHeight: 20,
    fontSize: 14,
    width: '100%',
  },
  contentArea: {
    flex: 1,
  },
  animatedList: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 120,
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