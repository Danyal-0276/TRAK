// ============================================
// SearchScreen.jsx - Enhanced Explore Page
// ============================================
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
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
import { TabView } from "react-native-tab-view";
import { ScrollView as GHScrollView } from "react-native-gesture-handler";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import SearchBar from "./components/SearchBar";
import DiscoverScreenHeader from "./components/DiscoverScreenHeader";
import { useFilledActionColors } from "../../theme/buttonContrast";
import Tabs from "./components/tabs";
import { navigateToArticleDetail } from "../../utils/articleNavigation";
import TrendingTopics from "./components/TrendingTopics";
import ArticleFeedList from "../../components/ArticleFeedList";
import { FeedSkeleton } from "../../components/FeedSkeleton";
import { useArticleInteractions } from "../../hooks/useArticleInteractions";
import { useCollapsibleHeader } from "../../hooks/useCollapsibleHeader";
import { useTheme } from "../../theme/ThemeContext";
import { getRefreshControlProps } from "../../theme/refreshControl";
import { loadExplorePage } from "../../utils/loadFeed";
import { loadExploreCategoryTabs, exploreTabToCategorySlug } from "../../utils/platformTaxonomy";
import Text from "../../components/ui/Text";
import { Search } from "lucide-react-native";
import { useFeedback } from "../../components/ui/FeedbackProvider";
import { resetTabBarVisibility } from "../../navigation/tabBarVisibility";
import { resolveTopInset } from "../../utils/screenSafeArea";

const { width, height } = Dimensions.get('window');
const PAGER_LAYOUT = { width };
const AnimatedDiscoverScrollView = Animated.createAnimatedComponent(GHScrollView);

function buildDiscoverNewsByTab(allNews, searchQuery, routes, activeTab, platformCategories = []) {
  const apiSearch = Boolean(String(searchQuery || '').trim());
  const out = {};
  routes.forEach((route) => {
    const slug = exploreTabToCategorySlug(route.key, platformCategories);
    out[route.key] = filterDiscoverNews(allNews, searchQuery, route.key, {
      apiSearch,
      apiCategory: Boolean(slug) && route.key === activeTab,
      platformCategories,
    });
  });
  return out;
}
const DISCOVER_PAGE_SIZE = 30;
const DISCOVER_PREFETCH_PX = 900;
const DISCOVER_CACHE_TTL_MS = 10 * 60 * 1000;
const discoverFeedCache = new Map();

const DEFAULT_DISCOVER_CATEGORIES = ["All", "Sports", "Technology", "Environment", "Business", "Wildlife"];

function discoverCacheKey(q, tab, platformCategories = []) {
  return `${String(q || '').trim().toLowerCase()}|${exploreTabToCategorySlug(tab, platformCategories)}`;
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

function filterDiscoverNews(allNews, searchQuery, tabKey, { apiSearch = false, apiCategory = false, platformCategories = [] } = {}) {
  let results = [...allNews];
  if (!apiCategory && tabKey !== "All") {
    results = results.filter((item) => itemMatchesDiscoverTab(item, tabKey, platformCategories));
  }
  if (apiSearch || !searchQuery || !searchQuery.trim()) return results;
  const lower = searchQuery.toLowerCase().trim();
  const searchTerms = lower.split(" ").filter((term) => term.length > 0);
  return results.filter((item) => {
    const matchesTerm = (text) => {
      if (!text) return false;
      const textLower = text.toLowerCase();
      return searchTerms.some((term) => textLower.includes(term));
    };
    if (item.title && matchesTerm(item.title)) return true;
    if (item.excerpt && matchesTerm(item.excerpt)) return true;
    if (item.source && matchesTerm(item.source)) return true;
    if (item.category && matchesTerm(item.category)) return true;
    if (item.categories && item.categories.some((cat) => matchesTerm(cat))) return true;
    if (item.content && matchesTerm(item.content)) return true;
    if (item.fullContent && matchesTerm(item.fullContent)) return true;
    if (item.topic_keywords && item.topic_keywords.some((k) => matchesTerm(k))) return true;
    return false;
  });
}

function itemMatchesDiscoverTab(item, activeTab, platformCategories = []) {
  if (!activeTab || activeTab === 'All') return true;
  const tab = activeTab.toLowerCase().trim();
  const slug = exploreTabToCategorySlug(activeTab, platformCategories);
  const primary = String(item?.primary_category || '').trim().toLowerCase();
  if (slug && primary === slug) return true;
  if (Array.isArray(item?.categories) && item.categories.some((c) => String(c).trim().toLowerCase() === slug)) {
    return true;
  }
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
  const actionColors = useFilledActionColors();
  const insets = useSafeAreaInsets();
  const topInset = resolveTopInset(insets, 0);
  const feedback = useFeedback();
  const [allNews, setAllNews] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [discoverCategories, setDiscoverCategories] = useState(DEFAULT_DISCOVER_CATEGORIES);
  const [platformCategories, setPlatformCategories] = useState([]);
  const discoverTabRoutes = useMemo(
    () => discoverCategories.map((c) => ({ key: c, title: c })),
    [discoverCategories]
  );
  const [tabIndex, setTabIndex] = useState(0);
  const activeTab = discoverTabRoutes[tabIndex]?.key ?? "All";
  const setActiveTab = useCallback((tab) => {
    const i = discoverTabRoutes.findIndex((r) => r.key === tab);
    if (i >= 0) setTabIndex(i);
  }, [discoverTabRoutes]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { tabs, categories } = await loadExploreCategoryTabs();
      if (cancelled) return;
      setDiscoverCategories(tabs);
      setPlatformCategories(categories);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!discoverCategories.includes(activeTab)) {
      setTabIndex(0);
    }
  }, [discoverCategories, activeTab]);
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

  const loadFirstPage = useCallback(async (q, tab = activeTab, { refreshAux = true, preferCache = true } = {}) => {
    const cacheKey = discoverCacheKey(q, tab, platformCategories);
    const category = exploreTabToCategorySlug(tab, platformCategories);
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
      const page = await loadExplorePage({ q, limit: DISCOVER_PAGE_SIZE, cursor: '', category });
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
  }, [activeTab, platformCategories]);

  const loadMorePage = useCallback(async () => {
    if (loading || loadingMore || !hasMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const q = searchQuery.trim();
      const page = await loadExplorePage({
        q,
        limit: DISCOVER_PAGE_SIZE,
        cursor: nextCursor,
        category: exploreTabToCategorySlug(activeTab, platformCategories),
      });
      let added = 0;
      setAllNews((prev) => {
        const merged = mergeUniqueById(prev, page.items);
        added = merged.length - prev.length;
        discoverFeedCache.set(discoverCacheKey(q, activeTab, platformCategories), {
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
  }, [loading, loadingMore, hasMore, nextCursor, searchQuery, activeTab, platformCategories]);

  const filteredNews = useMemo(
    () =>
      filterDiscoverNews(allNews, searchQuery, activeTab, {
        apiSearch: Boolean(searchQuery.trim()),
        apiCategory: Boolean(exploreTabToCategorySlug(activeTab, platformCategories)),
        platformCategories,
      }),
    [allNews, searchQuery, activeTab, platformCategories]
  );

  useEffect(() => {
    const q = searchQuery.trim();
    const delayMs = q ? 360 : 0;
    const timer = setTimeout(async () => {
      await loadFirstPage(q, activeTab, { preferCache: !q });
    }, delayMs);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, loadFirstPage]);

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
    const matchingCategory = discoverCategories.find(cat => {
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

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      showDiscoverHeader();
      const q = searchQuery.trim();
      await loadFirstPage(q, activeTab, { refreshAux: true, preferCache: false });
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleScrollForTab = useCallback(
    (tabKey) => (event) => {
      const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
      const currentOffset = contentOffset.y;
      const direction = currentOffset > scrollOffset.current ? "down" : "up";

      if (tabKey === activeTab) {
        scrollOffset.current = currentOffset;
        handleHeaderCollapse(event);

        if (direction !== lastDirectionRef.current) {
          lastDirectionRef.current = direction;
          if (direction === "down") searchRef.current?.collapse();
          else searchRef.current?.expandVisual();
        }

        const nearBottom =
          layoutMeasurement.height + contentOffset.y >= contentSize.height - DISCOVER_PREFETCH_PX;
        if (nearBottom) {
          loadMorePage();
        }
      }
    },
    [activeTab, handleHeaderCollapse, loadMorePage]
  );

  const handleArticlePress = (article) => {
    navigateToArticleDetail(navigation, article, { returnTab: 'Search' });
  };

  const handleTabPress = (category) => {
    setActiveTab(category);
  };

  const discoverNewsByTab = useMemo(
    () => buildDiscoverNewsByTab(allNews, searchQuery, discoverTabRoutes, activeTab, platformCategories),
    [allNews, searchQuery, discoverTabRoutes, activeTab, platformCategories]
  );

  const renderDiscoverScene = useCallback(
    ({ route }) => {
      const tabKey = route.key;
      const tabNews = discoverNewsByTab[tabKey] || [];
      const showTrending = tabKey === "All" && !searchQuery.trim();

      const listHeader = (
        <>
          {showTrending ? (
            <TrendingTopics
              topics={trendingTopics}
              onTopicPress={handleTopicPress}
              searchQuery={searchQuery}
            />
          ) : null}
        </>
      );

      const listEmpty = loading ? (
        <FeedSkeleton colors={colors} count={5} />
      ) : (
        <>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + "15" }]}>
            <Search size={48} color={colors.primary} strokeWidth={2} />
          </View>
          <Text variant="title" color={colors.textPrimary} style={styles.noResultsText}>
            No news found
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.noResultsSub}>
            {searchQuery.trim()
              ? "Try searching with different keywords"
              : "No articles in this category"}
          </Text>
          {(searchQuery.trim() || tabKey !== "All") && (
            <TouchableOpacity
              style={[styles.clearButton, { backgroundColor: actionColors.background }]}
              onPress={handleClearSearch}
              activeOpacity={0.8}
            >
              <Text style={[styles.clearButtonText, { color: actionColors.foreground }]}>
                Clear & Show All
              </Text>
            </TouchableOpacity>
          )}
        </>
      );

      const listFooter = (
        <>
          {loadingMore && tabKey === activeTab ? (
            <View style={{ paddingVertical: 16, alignItems: "center" }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null}
          <View style={styles.endPadding} />
        </>
      );

      return (
        <View style={styles.discoverScene}>
        <ArticleFeedList
          animated
          keyPrefix={tabKey}
          style={styles.contentArea}
          data={loading || tabNews.length === 0 ? [] : tabNews}
          onArticlePress={handleArticlePress}
          onVote={handleVote}
          onBookmark={handleBookmark}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          ListFooterComponent={listFooter}
          onScroll={handleScrollForTab(tabKey)}
          scrollEventThrottle={16}
          onScrollBeginDrag={() => {
            Keyboard.dismiss();
            searchRef.current?.hideHistory();
            searchRef.current?.collapseKeepText();
          }}
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingTop: Math.max(0, topSectionHeight || 0) },
            !loading && tabNews.length === 0 ? styles.noResultsContainer : null,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              {...getRefreshControlProps(colors, theme.mode)}
            />
          }
        />
        </View>
      );
    },
    [
      activeTab,
      actionColors,
      colors,
      discoverNewsByTab,
      handleArticlePress,
      handleBookmark,
      handleClearSearch,
      handleScrollForTab,
      handleTopicPress,
      handleVote,
      loading,
      loadingMore,
      onRefresh,
      refreshing,
      searchQuery,
      topSectionHeight,
      trendingTopics,
    ]
  );

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Enhanced gradient background */}
      <LinearGradient
        colors={theme.mode === 'dark' 
          ? [colors.background, colors.backgroundSecondary, colors.background]
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
        style={[styles.statusBarCover, { height: topInset, backgroundColor: colors.surface }]}
        pointerEvents="none"
      />

      <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.screenWrapper, { backgroundColor: 'transparent' }]}>
        <Animated.View
          style={[
            styles.topSection,
            {
              paddingTop: topInset,
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
          <DiscoverScreenHeader />

          <View style={styles.searchRow}>
            <SearchBar
              embedded
              ref={searchRef}
              onSearch={handleSearch}
              initialQuery={searchQuery}
            />
          </View>

          <Tabs
            categories={discoverCategories}
            activeTab={activeTab}
            onTabPress={handleTabPress}
          />
        </Animated.View>

        <TabView
          navigationState={{ index: tabIndex, routes: discoverTabRoutes }}
          renderScene={renderDiscoverScene}
          onIndexChange={setTabIndex}
          initialLayout={PAGER_LAYOUT}
          renderTabBar={() => null}
          swipeEnabled
          animationEnabled
          lazy
          lazyPreloadDistance={0}
          sceneContainerStyle={styles.discoverSceneContainer}
          style={styles.discoverPager}
        />
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
  discoverPager: {
    flex: 1,
  },
  discoverSceneContainer: {
    flex: 1,
  },
  discoverScene: {
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