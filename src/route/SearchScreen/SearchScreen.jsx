import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  RefreshControl,
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
    loadNews();
  }, []);

  
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
    }, 400);

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

    if (direction === "down") {
      searchRef.current?.collapse();
    } else if (direction === "up") {
      searchRef.current?.expandVisual(); 
    }
  };


  const renderShimmer = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {[1, 2, 3, 4].map((key) => (
        <SkeletonPlaceholder
          key={key}
          borderRadius={22}
          backgroundColor="#e2e8ff"
          highlightColor="#f0f4ff"
        >
          <SkeletonPlaceholder.Item
            width="100%"
            height={220}
            borderRadius={22}
            marginBottom={20}
          />
        </SkeletonPlaceholder>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <SearchBar ref={searchRef} onSearch={handleSearch} initialQuery={searchQuery} />

      {loading ? (
        renderShimmer()
      ) : filteredNews.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No news found 😔</Text>
        </View>
      ) : (
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f8ff",
    paddingTop: 10,
  },
  scrollContainer: {
    paddingHorizontal: 12,
    paddingBottom: 50,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
});

export default SearchScreen;
