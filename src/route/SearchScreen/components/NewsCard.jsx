import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ImageBackground,
  Dimensions,
} from "react-native";
import { Bookmark, Share2 } from "lucide-react-native";
import LinearGradient from "react-native-linear-gradient";
import SkeletonPlaceholder from "react-native-skeleton-placeholder"; 

const { width } = Dimensions.get("window");

const getShimmerTheme = (tags = [], title = "") => {
  const text = `${title} ${tags.join(" ")}`.toLowerCase();

  if (text.includes("sports") || text.includes("cricket") || text.includes("football"))
    return { base: "#b5f7b1", highlight: "#dbfdd6" }; 

  if (text.includes("ai") || text.includes("technology") || text.includes("innovation"))
    return { base: "#c9d8ff", highlight: "#e6edff" }; 

  if (text.includes("politics") || text.includes("government") || text.includes("election"))
    return { base: "#ffc9c9", highlight: "#ffe0d9" };

  if (text.includes("finance") || text.includes("stock") || text.includes("business"))
    return { base: "#fff5c2", highlight: "#fffde1" };

  return { base: "#e0e0e0", highlight: "#f4f4f4" };
};

const getRelevantImage = (title, tags = []) => {
  const text = `${title} ${tags.join(" ")}`.toLowerCase();

  if (text.includes("pakistan") || text.includes("cricket") || text.includes("sports"))
    return "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=60";

  if (text.includes("ai") || text.includes("artificial intelligence") || text.includes("technology"))
    return "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=60";

  if (text.includes("business") || text.includes("finance") || text.includes("stock"))
    return "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=60";

  if (text.includes("politics") || text.includes("government"))
    return "https://images.unsplash.com/photo-1535905496755-26ae35d0ae54?auto=format&fit=crop&w=900&q=60";

  if (text.includes("trending") || text.includes("social") || text.includes("media"))
    return "https://images.unsplash.com/photo-1603791452906-bb62a612b8a7?auto=format&fit=crop&w=900&q=60";

  return "https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=900&q=60";
};

const NewsCard = ({ item, scrollY }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [imageLoaded, setImageLoaded] = useState(false);

  const shimmerTheme = getShimmerTheme(item.tags, item.title);

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

  const imageSource = { uri: item.image || getRelevantImage(item.title, item.tags) };

  const translateY = scrollY
    ? scrollY.interpolate({
        inputRange: [-100, 0, 100],
        outputRange: [-8, 0, 8],
        extrapolate: "clamp",
      })
    : 0;

  return (
    <Animated.View
      style={[
        styles.card,
        { transform: [{ scale: scaleValue }, { translateY }] },
        imageLoaded && { shadowOpacity: 0.2 },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.imageContainer}>
          {!imageLoaded && (
            <SkeletonPlaceholder
              borderRadius={22}
              backgroundColor={shimmerTheme.base}
              highlightColor={shimmerTheme.highlight}
            >
              <SkeletonPlaceholder.Item
                width="100%"
                height={190}
                borderRadius={22}
              />
            </SkeletonPlaceholder>
          )}

          <Animated.View style={[{ opacity: fadeAnim, position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }]}>
  <ImageBackground
    source={imageSource}
    style={styles.image}
    imageStyle={styles.imageStyle}
    onLoadEnd={handleImageLoad}
  >
    <LinearGradient
      colors={["rgba(0,0,0,0.65)", "rgba(0,0,0,0.15)", "transparent"]}
      style={styles.imageOverlay}
    />
    <View style={styles.headerOverlay}>
      <Text style={styles.source}>{item.source}</Text>
      <Text style={styles.time}>{item.time}</Text>
    </View>
  </ImageBackground>
</Animated.View>
        </View>

        <Text style={styles.title}>{item.title}</Text>

        <View style={styles.tagsRow}>
          {item.tags.map((tag, index) => (
            <LinearGradient
              key={index}
              colors={["rgba(79,140,255,0.15)", "rgba(255,255,255,0.05)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tag}
            >
              <Text style={styles.tagText}>{tag}</Text>
            </LinearGradient>
          ))}
        </View>

        <Text style={styles.content} numberOfLines={3}>
          {item.content}
        </Text>

        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={18} color="#4f8cff" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Bookmark size={18} color="#4f8cff" />
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    marginBottom: 22,
    overflow: "hidden",
    shadowColor: "#4f8cff",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    borderWidth: 0.6,
    borderColor: "rgba(79,140,255,0.15)",
  },
  imageContainer: {
    height: 190,
    width: "100%",
    overflow: "hidden",
  },
  image: {
    flex: 1,
    justifyContent: "flex-end",
  },
  imageStyle: {
    resizeMode: "cover",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  headerOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  source: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowRadius: 4,
  },
  time: {
    color: "#ddd",
    fontSize: 12,
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111",
    lineHeight: 26,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: "rgba(79,140,255,0.2)",
  },
  tagText: {
    fontSize: 12,
    color: "#222",
    fontWeight: "600",
  },
  content: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 0.4,
    borderTopColor: "#eee",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 18,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 13.5,
    color: "#4f8cff",
    fontWeight: "600",
  },
});

export default NewsCard;
