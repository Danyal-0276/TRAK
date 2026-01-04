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
import { useTheme } from "../../../theme/ThemeContext";

const SCREEN_WIDTH = Dimensions.get("window").width;
const COLLAPSED_WIDTH = 50;
const EXPANDED_WIDTH = SCREEN_WIDTH * 0.9;

const SearchBar = forwardRef(({ onSearch, initialQuery = "" }, ref) => {
  const { theme } = useTheme();
  const { colors } = theme;
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
    // Don't collapse if there's text in the input - keep it expanded but unfocused
    if (query.trim()) {
      setFocused(false);
      // Keep expanded state
      if (!expanded) {
        setExpanded(true);
        width.value = EXPANDED_WIDTH;
      }
      return;
    }
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
    // If there's text, keep it expanded visually but unfocused
    if (query.trim()) {
      setExpanded(true);
      width.value = EXPANDED_WIDTH;
    } else {
      setExpanded(false);
      width.value = COLLAPSED_WIDTH;
    }
    inputRef.current?.blur();
    Keyboard.dismiss();
  };

  useEffect(() => {
    setQuery(initialQuery);
    // Keep expanded if there's text
    if (initialQuery && initialQuery.trim()) {
      setExpanded(true);
      width.value = EXPANDED_WIDTH;
    }
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
          style={[StyleSheet.absoluteFillObject, { zIndex: 5 }]}
          pointerEvents="box-none"
        />
      )}

      <Animated.View style={[
        styles.container, 
        animatedStyle, 
        { 
          zIndex: 100,
          backgroundColor: colors.surface,
          shadowColor: colors.primary,
          elevation: 10,
        }
      ]}
      >
        <LinearGradient
          colors={[colors.surface, colors.backgroundSecondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientBox, { borderColor: `${colors.primary}40` }]}
        >
          {!expanded && !query ? (
            <TouchableOpacity 
              onPress={handleExpand} 
              style={{ zIndex: 110 }}
              activeOpacity={0.8}
            >
              <Search size={18} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  // If not focused but has text, focus the input
                  if (!focused && query.trim()) {
                    handleExpand();
                  }
                }}
                style={styles.icon}
              >
                <Search size={18} color={colors.primary} />
              </TouchableOpacity>
              <TextInput
                ref={inputRef}
                value={query}
                onChangeText={handleChangeText}
                placeholder="Search latest news..."
                placeholderTextColor={colors.textTertiary}
                style={[styles.input, { color: colors.textPrimary }]}
                cursorColor={colors.primary}
                selectionColor={`${colors.primary}4D`}
                onFocus={() => {
                  setFocused(true);
                  if (!expanded) {
                    setExpanded(true);
                    width.value = EXPANDED_WIDTH;
                  }
                }}
                onBlur={() => {
                  if (!query.trim()) {
                    setFocused(false);
                    setExpanded(false);
                    width.value = COLLAPSED_WIDTH;
                  } else {
                    // Keep expanded if there's text
                    setFocused(false);
                    if (!expanded) {
                      setExpanded(true);
                      width.value = EXPANDED_WIDTH;
                    }
                  }
                }}
                onSubmitEditing={handleSearchSubmit}
                editable={true}
              />
              {query.length > 0 && (
                <TouchableOpacity
                  onPress={handleCrossPress}
                  style={[styles.closeButton, { zIndex: 115 }]}
                  activeOpacity={0.7}
                >
                  <X size={16} color={colors.textSecondary} />
                  <Text style={[styles.clearText, { color: colors.textSecondary }]}>clear</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </LinearGradient>
      </Animated.View>

      {expanded && focused && query.length >= 0 && history.length > 0 && (
        <View style={[styles.historyContainer, { 
          backgroundColor: colors.backgroundSecondary,
          shadowColor: colors.shadow,
          zIndex: 90,
        }]}>
          <View style={styles.historyHeader}>
            <Text style={[styles.historyTitle, { color: colors.primary }]}>Search History</Text>
            <TouchableOpacity onPress={handleClearHistory}>
              <Trash2 size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={history}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={[styles.historyItem, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                  onPress={() => {
                    setQuery(item);
                    onSearch && onSearch(item);
                    inputRef.current?.blur();
                    setFocused(false);
                  }}
                >
                  <Text style={[styles.historyText, { color: colors.textPrimary }]}>{item}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteHistoryItem(item)}>
                  <X size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      {showAlert && (
        <RNAnimated.View style={[styles.modalOverlay, { backgroundColor: colors.overlay, zIndex: 200 }]}>
          <RNAnimated.View
            style={[
              styles.alertBox, 
              { 
                transform: [{ scale: popupScale }],
                backgroundColor: colors.surface,
                shadowColor: colors.primary,
              }
            ]}
          >
            <AlertCircle
              size={28}
              color={colors.primary}
              style={{ alignSelf: "center", marginBottom: 12 }}
            />
            <Text style={[styles.alertTitle, { color: colors.primary }]}>Clear Search History?</Text>
            <Text style={[styles.alertMessage, { color: colors.textSecondary }]}>
              This action cannot be undone.
            </Text>
            <View style={styles.alertActions}>
              <TouchableOpacity
                onPress={cancelClearHistory}
                style={[styles.alertButton, { backgroundColor: colors.border }]}
              >
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmClearHistory}
                style={[styles.alertButton, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: colors.textInverse }}>Clear All</Text>
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
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.12,
    elevation: 4,
  },
  gradientBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 0.6,
  },
  icon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    paddingVertical: 0,
  },
  closeButton: { 
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyContainer: {
    position: "absolute",
    top: 55,
    left: 10,
    right: 10,
    borderRadius: 12,
    padding: 10,
    maxHeight: 200,
    zIndex: 10,
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
  historyTitle: { fontWeight: "600" },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
  },
  historyText: {},
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  alertBox: {
    padding: 20,
    borderRadius: 16,
    width: "80%",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 12,
  },
  alertTitle: {
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 6,
  },
  alertMessage: { textAlign: "center", marginBottom: 15 },
  alertActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  alertButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
});

export default SearchBar;