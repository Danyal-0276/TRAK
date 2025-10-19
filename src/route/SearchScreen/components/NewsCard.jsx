import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from "react-native";
import { Bookmark, Share2 } from "lucide-react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

const NewsCard = ({ item, scrollY }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [imageLoaded, setImageLoaded] = useState(false);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const imageSource = {
    uri:
      item.image ||
      "https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=900&q=60",
  };

  const translateY = scrollY
    ? scrollY.interpolate({
        inputRange: [-100, 0, 100],
        outputRange: [-4, 0, 4],
        extrapolate: "clamp",
      })
    : 0;

  return (
    <Animated.View
      style={[
        styles.card,
        { transform: [{ scale: scaleValue }, { translateY }] },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchContainer}
      >
        {/* LEFT SIDE — TEXT CONTENT */}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.description} numberOfLines={2}>
            {item.content}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.source}>
              {item.source || "Unknown Source"}
            </Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.time}>{item.time || "Just now"}</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.iconButton}>
              <Share2 size={16} color="#2e66ff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Bookmark size={16} color="#2e66ff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* RIGHT SIDE — IMAGE */}
        <View style={styles.imageWrapper}>
          {!imageLoaded && (
            <SkeletonPlaceholder
              borderRadius={10}
              backgroundColor="#e6ebff"
              highlightColor="#f5f8ff"
            >
              <SkeletonPlaceholder.Item width={90} height={70} borderRadius={10} />
            </SkeletonPlaceholder>
          )}
          <Animated.Image
            source={imageSource}
            style={[styles.image, { opacity: fadeAnim }]}
            onLoadEnd={handleImageLoad}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    marginBottom: 14,
    marginHorizontal: 10,
    padding: 10,
    shadowColor: "#b0c4ff",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  touchContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    color: "#1a1a1a",
    fontSize: 16.5,
    fontWeight: "700",
    lineHeight: 22,
  },
  description: {
    color: "#555",
    fontSize: 13.5,
    marginTop: 4,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  source: {
    color: "#2e66ff",
    fontSize: 12.5,
    fontWeight: "600",
  },
  time: {
    color: "#888",
    fontSize: 12,
    marginLeft: 4,
  },
  dot: {
    color: "#999",
    marginHorizontal: 5,
  },
  imageWrapper: {
    width: 90,
    height: 70,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f0f4ff",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 10,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  iconButton: {
    marginRight: 10,
    padding: 4,
  },
});

export default NewsCard;
