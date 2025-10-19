import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  RefreshControl,
  Animated,
  Pressable,
  Keyboard,
} from "react-native";
import SearchBar from "./components/SearchBar";
import NewsCard from "./components/NewsCard";
import { fetchNewsFeed } from "./api/mockAPI";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

const SearchScreen = () => {
  const [allNews, setAllNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const searchRef = useRef(null);
  const scrollOffset = useRef(0);

  // animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await fetchNewsFeed();
      setAllNews(data);
      setFilteredNews(data);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => loadNews(), 200);
    return () => clearTimeout(timeout);
  }, []);

  // animate when loading finishes
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
  }, [loading, filteredNews]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (!searchQuery.trim()) {
        setFilteredNews(allNews);
      } else {
        const lower = searchQuery.toLowerCase();
        const results = allNews.filter(
          (item) =>
            item.title.toLowerCase().includes(lower) ||
            item.content.toLowerCase().includes(lower) ||
            (item.tags &&
              item.tags.some((tag) => tag.toLowerCase().includes(lower))) ||
            item.source.toLowerCase().includes(lower)
        );
        setFilteredNews(results);
      }
    }, 350);
    return () => clearTimeout(delay);
  }, [searchQuery, allNews]);

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

  const renderShimmer = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {[1, 2, 3, 4, 5].map((key) => (
        <SkeletonPlaceholder
          key={key}
          borderRadius={14}
          backgroundColor="#e2e8ff"
          highlightColor="#f5f8ff"
        >
          <SkeletonPlaceholder.Item
            width="100%"
            height={90}
            borderRadius={14}
            marginBottom={16}
          />
        </SkeletonPlaceholder>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.screenWrapper}>
  <SearchBar
    ref={searchRef}
    onSearch={handleSearch}
    initialQuery={searchQuery}
  />

  
  <Pressable
    style={{ flex: 1 }}
    onPress={() => {
      Keyboard.dismiss();
      searchRef.current?.hideHistory();
      searchRef.current?.collapseKeepText();
    }}
  >
    {loading ? (
      renderShimmer()
    ) : filteredNews.length === 0 ? (
      <View style={styles.noResultsContainer}>
        <Text style={styles.noResultsEmoji}>😔</Text>
        <Text style={styles.noResultsText}>No news found</Text>
        <Text style={styles.noResultsSub}>Try searching something else</Text>
      </View>
    ) : (
      <Animated.View
        style={[
          styles.animatedList,
          { opacity: fadeAnim, transform: [{ translateY }] },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContainer}
        >
          {filteredNews.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
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
    backgroundColor: "#f5f8ff",
    paddingTop: 10,
  },
  animatedList: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 12,
    paddingBottom: 60,
    backgroundColor: "#f5f8ff",
  },
  noResultsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f8ff",
    paddingHorizontal: 20,
  },
  noResultsEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  noResultsText: {
    fontSize: 18,
    color: "#2e66ff",
    fontWeight: "700",
  },
  noResultsSub: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
});

export default SearchScreen;