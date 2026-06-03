import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  StatusBar,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { Plus, Trash2, Tag, CheckCircle, X, AlertCircle } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeContext";
import Text from "../../components/ui/Text";
import { getAccessToken } from "../../api/client";
import { trackKeywords } from "../../api/newsApi";
import { loadUserKeywords, setUserKeywords } from "../../utils/userKeywordsStorage";
import { useFeedback } from "../../components/ui/FeedbackProvider";
import { useFilledActionColors } from "../../theme/buttonContrast";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CategoriesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { error } = useFeedback();
  const { colors, spacing } = theme;
  const actionColors = useFilledActionColors();
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const circle1Anim = useRef(new Animated.Value(0)).current;
  const circle2Anim = useRef(new Animated.Value(0)).current;
  const circle3Anim = useRef(new Animated.Value(0)).current;
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const categoryAnims = useRef({}).current;

  useEffect(() => {
    (async () => {
      const saved = await loadUserKeywords();
      if (saved.length) {
        setCategories(saved);
      }
    })();
  }, []);

  useEffect(() => {
    // Initialize animations for existing categories
    categories.forEach((cat) => {
      if (!categoryAnims[cat]) {
        categoryAnims[cat] = new Animated.Value(0);
      }
    });

    const categoryAnimations = categories.map((cat, index) =>
      Animated.timing(categoryAnims[cat], {
        toValue: 1,
        duration: 400,
        delay: 800 + index * 100,
        useNativeDriver: true,
      })
    );

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(circle1Anim, {
        toValue: 1,
        duration: 1000,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(circle2Anim, {
        toValue: 1,
        duration: 1000,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(circle3Anim, {
        toValue: 1,
        duration: 1000,
        delay: 600,
        useNativeDriver: true,
      }),
      ...categoryAnimations,
    ]).start();
  }, []);

  useEffect(() => {
    // Animate new categories when added
    categories.forEach((cat) => {
      if (!categoryAnims[cat]) {
        categoryAnims[cat] = new Animated.Value(0);
        Animated.timing(categoryAnims[cat], {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [categories.length]);

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderColorAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderColorAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  const persistCategories = async (next) => {
    const normalized = [...new Set(next.map((x) => String(x || "").trim().toLowerCase()).filter(Boolean))];
    setCategories(normalized);
    await setUserKeywords(normalized);
    const token = await getAccessToken();
    if (token) {
      await trackKeywords(normalized);
    }
    return normalized;
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    
    const candidate = newCategory.trim().toLowerCase();
    if (categories.includes(candidate)) {
      error("This category already exists.");
      return;
    }
    
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      await persistCategories([...categories, candidate]);
    } catch {
      error("Failed to save category.");
    }
    setNewCategory("");
    setLoading(false);
    setShowSuccess(true);
  };

  const confirmDelete = (cat) => {
    setCategoryToDelete(cat);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await persistCategories(categories.filter((c) => c !== categoryToDelete));
    } catch {
      error("Failed to remove category.");
    }
    setCategoryToDelete(null);
    setShowConfirm(false);
    setLoading(false);
    setShowSuccess(true);
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Gradient background */}
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
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            paddingTop: Math.max(insets.top, 12),
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <Text variant="title" style={[styles.title, { color: colors.textPrimary }]}>
          Manage Categories
        </Text>
      </Animated.View>

      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContent}
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Customize the categories you want to follow for personalized updates.
          </Text>
        </View>

        {/* Add Category Input */}
        <View style={styles.inputSection}>
          <Animated.View style={[styles.inputContainer, { 
            borderColor,
            backgroundColor: colors.surface,
          }]}>
            <Tag size={18} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { 
                color: colors.textPrimary,
                backgroundColor: 'transparent',
              }]}
              placeholder="Enter new category"
              placeholderTextColor={colors.textTertiary}
              value={newCategory}
              onChangeText={setNewCategory}
              onFocus={handleFocus}
              onBlur={handleBlur}
              cursorColor={colors.primary}
              onSubmitEditing={addCategory}
            />
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: actionColors.background }]}
              onPress={addCategory}
              activeOpacity={0.8}
              disabled={loading || !newCategory.trim()}
            >
              {loading ? (
                <ActivityIndicator size="small" color={actionColors.foreground} />
              ) : (
                <Plus size={18} color={actionColors.foreground} />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Categories List */}
        <View style={styles.categoriesSection}>
          <Text variant="subtitle" color={colors.textPrimary} style={styles.sectionTitle}>
            Your Categories ({categories.length})
          </Text>
          {categories.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Tag size={48} color={colors.textTertiary} />
              <Text variant="body" color={colors.textSecondary} style={styles.emptyText}>
                No categories yet
              </Text>
              <Text variant="caption" color={colors.textTertiary} style={styles.emptySubtext}>
                Add your first category above
              </Text>
            </View>
          ) : (
            categories.map((cat, idx) => {
              const anim = categoryAnims[cat] || fadeAnim;
              return (
                <Animated.View
                  key={idx}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      opacity: anim,
                      transform: [
                        {
                          translateY: anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                <View style={styles.categoryLeft}>
                  <View style={[styles.categoryIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                    <Tag size={18} color={colors.primary} />
                  </View>
                  <Text variant="body" color={colors.textPrimary} style={styles.categoryName}>
                    {cat}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: `${colors.error}15` }]}
                  onPress={() => confirmDelete(cat)}
                  activeOpacity={0.8}
                >
                  <Trash2 size={18} color={colors.error} />
                </TouchableOpacity>
              </Animated.View>
              );
            })
          )}
        </View>

        {/* Confirmation Modal */}
        <Modal
          visible={showConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowConfirm(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowConfirm(false)}>
            <View style={[styles.overlay, { backgroundColor: colors.overlay || 'rgba(0, 0, 0, 0.5)' }]}>
              <TouchableWithoutFeedback>
                <View style={[styles.alertBox, { backgroundColor: colors.surface }]}>
                  <View style={[styles.alertIconContainer, { backgroundColor: `${colors.error}15` }]}>
                    <AlertCircle size={32} color={colors.error} />
                  </View>
                  <Text variant="title" color={colors.textPrimary} style={styles.alertTitle}>
                    Delete Category
                  </Text>
                  <Text variant="body" color={colors.textSecondary} style={styles.alertMessage}>
                    Are you sure you want to delete "{categoryToDelete}"? This action cannot be undone.
                  </Text>

                  <View style={styles.alertBtns}>
                    <TouchableOpacity
                      style={[styles.alertBtn, styles.cancelBtn, { 
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.border,
                      }]}
                      onPress={() => setShowConfirm(false)}
                      activeOpacity={0.8}
                    >
                      <Text variant="body" color={colors.textPrimary} style={styles.alertBtnText}>
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.alertBtn, styles.deleteBtn, { backgroundColor: colors.error }]}
                      onPress={handleDelete}
                      activeOpacity={0.8}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text variant="body" color="#ffffff" style={styles.alertBtnText}>
                          Delete
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Success Modal */}
        <Modal
          visible={showSuccess}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSuccess(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowSuccess(false)}>
            <View style={[styles.overlay, { backgroundColor: colors.overlay || 'rgba(0, 0, 0, 0.5)' }]}>
              <TouchableWithoutFeedback>
                <View style={[styles.alertBox, { backgroundColor: colors.surface }]}>
                  <View style={[styles.alertIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                    <CheckCircle size={32} color={colors.primary} />
                  </View>
                  <Text variant="title" color={colors.textPrimary} style={styles.alertTitle}>
                    Success
                  </Text>
                  <Text variant="body" color={colors.textSecondary} style={styles.alertMessage}>
                    Action completed successfully!
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
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
    top: SCREEN_HEIGHT * 0.4,
    right: -50,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoriesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
  },
  categoryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  alertBox: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  alertIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  alertMessage: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  alertBtns: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  alertBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  cancelBtn: {
    borderWidth: 1.5,
  },
  deleteBtn: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertBtnText: {
    fontWeight: "700",
    fontSize: 15,
  },
});

export default CategoriesScreen;
