import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  FlatList,
  Text,
  Pressable,
  Animated as RNAnimated,
} from "react-native";
import { Search, X, Trash2, AlertCircle } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import LinearGradient from "react-native-linear-gradient";
import { Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const COLLAPSED_WIDTH = 50;
const EXPANDED_WIDTH = SCREEN_WIDTH * 0.9;

const SearchBar = forwardRef(({ onSearch, initialQuery = "" }, ref) => {
  const [focused, setFocused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [history, setHistory] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const inputRef = useRef(null);

  const width = useSharedValue(COLLAPSED_WIDTH);
  const popupScale = useRef(new RNAnimated.Value(0)).current;

  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(width.value, {
      duration: 400,
      easing: Easing.out(Easing.exp),
    }),
  }));

  const handleExpand = () => {
    setFocused(true);
    setExpanded(true);
    width.value = EXPANDED_WIDTH;
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleExpandVisual = () => {
    setExpanded(true);
    width.value = EXPANDED_WIDTH;
  };

  const handleCollapse = () => {
    setFocused(false);
    setExpanded(false);
    width.value = COLLAPSED_WIDTH;
    inputRef.current?.blur();
    Keyboard.dismiss();
  };

  const handleChangeText = (text) => {
    setQuery(text);
    onSearch && onSearch(text);
  };

  const handleSearchSubmit = () => {
    if (query.trim().length === 0) return;
    setHistory((prev) => [
      query.trim(),
      ...prev.filter((item) => item !== query.trim()),
    ]);
    onSearch && onSearch(query);
  };

  const handleDeleteHistoryItem = (item) => {
    setHistory((prev) => prev.filter((h) => h !== item));
  };

  const handleClearHistory = () => {
    setShowAlert(true);
    RNAnimated.spring(popupScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const confirmClearHistory = () => {
    setHistory([]);
    RNAnimated.spring(popupScale, {
      toValue: 0,
      useNativeDriver: true,
      friction: 5,
    }).start(() => setShowAlert(false));
  };

  const cancelClearHistory = () => {
    RNAnimated.spring(popupScale, {
      toValue: 0,
      useNativeDriver: true,
      friction: 5,
    }).start(() => setShowAlert(false));
  };

  const handleCrossPress = () => {
    if (query.length > 0) {
      setQuery("");
      onSearch && onSearch("");
    } else {
      handleCollapse();
    }
  };

  const handleOutsidePress = () => {
    if (focused || expanded) {
      Keyboard.dismiss();
      setFocused(false);
    }
  };

  const hideHistory = () => {
    setFocused(false);
  };

  const collapseKeepText = () => {
    setFocused(false);
    setExpanded(false);
    width.value = COLLAPSED_WIDTH;
    inputRef.current?.blur();
    Keyboard.dismiss();
  };

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useImperativeHandle(ref, () => ({
    collapse: handleCollapse,
    expandVisual: handleExpandVisual,
    hideHistory,
    collapseKeepText,
  }));

  return (
    <>
      {focused && (
        <Pressable
          onPress={handleOutsidePress}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      <Animated.View style={[styles.container, animatedStyle, { zIndex: 10 }]}>
        <LinearGradient
          colors={["#ffffff", "#f8faff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBox}
        >
          {!focused ? (
            <TouchableOpacity onPress={handleExpand} style={{ zIndex: 10 }}>
              <Search size={18} color="#4f8cff" />
            </TouchableOpacity>
          ) : (
            <>
              <Search size={18} color="#4f8cff" style={styles.icon} />
              <TextInput
                ref={inputRef}
                value={query}
                onChangeText={handleChangeText}
                placeholder="Search latest news..."
                placeholderTextColor="#888"
                style={styles.input}
                cursorColor="#4f8cff"
                selectionColor="rgba(79,140,255,0.3)"
                onFocus={() => setFocused(true)}
                onSubmitEditing={handleSearchSubmit}
              />
              <TouchableOpacity
                onPress={handleCrossPress}
                style={[styles.closeButton, { zIndex: 15 }]}
              >
                <X size={18} color="#4f8cff" />
              </TouchableOpacity>
            </>
          )}
        </LinearGradient>
      </Animated.View>

      {expanded && focused && query.length >= 0 && history.length > 0 && (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Search History</Text>
            <TouchableOpacity onPress={handleClearHistory}>
              <Trash2 size={18} color="#ff4d4d" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={history}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.historyItem}>
                <TouchableOpacity
                  onPress={() => {
                    setQuery(item);
                    onSearch && onSearch(item);
                    inputRef.current?.blur();
                    setFocused(false);
                  }}
                >
                  <Text style={styles.historyText}>{item}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteHistoryItem(item)}>
                  <X size={16} color="#888" />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      {showAlert && (
        <RNAnimated.View style={styles.modalOverlay}>
          <RNAnimated.View
            style={[styles.alertBox, { transform: [{ scale: popupScale }] }]}
          >
            <AlertCircle
              size={28}
              color="#4f8cff"
              style={{ alignSelf: "center", marginBottom: 12 }}
            />
            <Text style={styles.alertTitle}>Clear Search History?</Text>
            <Text style={styles.alertMessage}>
              This action cannot be undone.
            </Text>
            <View style={styles.alertActions}>
              <TouchableOpacity
                onPress={cancelClearHistory}
                style={[styles.alertButton, { backgroundColor: "#ddd" }]}
              >
                <Text style={{ color: "#555" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmClearHistory}
                style={[styles.alertButton, { backgroundColor: "#4f8cff" }]}
              >
                <Text style={{ color: "#fff" }}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </RNAnimated.View>
        </RNAnimated.View>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
    alignSelf: "center",
    marginVertical: 4,
    marginTop: 6,
    shadowColor: "#4f8cff",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.12,
    elevation: 4,
    backgroundColor: "#fff",
  },
  gradientBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 0.6,
    borderColor: "rgba(79,140,255,0.25)",
  },
  icon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#111",
    fontWeight: "500",
    paddingVertical: 0,
  },
  closeButton: { marginLeft: 10 },
  historyContainer: {
    position: "absolute",
    top: 55,
    left: 10,
    right: 10,
    backgroundColor: "#f0f4ff",
    borderRadius: 12,
    padding: 10,
    maxHeight: 200,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  historyTitle: { fontWeight: "600", color: "#4f8cff" },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  historyText: { color: "#111" },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  alertBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    width: "80%",
    shadowColor: "#4f8cff",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 12,
  },
  alertTitle: {
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
    color: "#4f8cff",
    marginBottom: 6,
  },
  alertMessage: { textAlign: "center", color: "#555", marginBottom: 15 },
  alertActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  alertButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
});

export default SearchBar;