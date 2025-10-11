import React, { useState, useRef } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import LottieView from "lottie-react-native";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function PullToRefreshView({ onRefresh, children }) {
  const [refreshing, setRefreshing] = useState(false);
  const pullY = useSharedValue(0);
  const lottieRef = useRef(null);

  const triggerRefresh = async () => {
    try {
      setRefreshing(true);
      if (lottieRef.current?.play) lottieRef.current.play();
      await onRefresh?.(); 
    } catch (e) {
      console.warn("Refresh error:", e);
    } finally {

      setTimeout(() => {
        if (lottieRef.current?.reset) lottieRef.current.reset();
        setRefreshing(false);
      }, 700);
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      pullY.value = event.contentOffset.y;
    },
    onEndDrag: (event) => {
      const y = event.contentOffset.y;
      if (y < -120 && !refreshing) {
        runOnJS(triggerRefresh)();
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const pull = Math.min(Math.abs(pullY.value), 140);
    const scale = interpolate(pull, [0, 140], [0, 1], "clamp");
    const translateY = interpolate(pull, [0, 140], [-18, 0], "clamp");
    const opacity = interpolate(pull, [0, 140], [0, 1], "clamp");

    return {
      transform: [{ translateY }, { scale }],
      opacity,
    };
  });

  return (
    <AnimatedScrollView
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      bounces={true}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Animated.View style={[styles.lottieContainer, animatedStyle]}>
        <LottieView
          ref={lottieRef}
          source={require("../../../assets/animations/refresh.json")}
          autoPlay={false}
          loop={refreshing}
          style={styles.lottie}
        />
      </Animated.View>

      <View>{children}</View>
    </AnimatedScrollView>
  );
}

const styles = StyleSheet.create({
  lottieContainer: {
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 6,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: {
    width: 72,
    height: 72,
  },
});