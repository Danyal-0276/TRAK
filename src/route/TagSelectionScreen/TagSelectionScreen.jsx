// ============================================
// FILE: screens/TagSelectionScreen.jsx
// ============================================
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, Animated, Dimensions, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Tags } from 'lucide-react-native';

import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { SelectedCount } from './components/SelectedCount';
import { Tag } from './components/Tag';
import { ContinueButton } from './components/ContinueButton';
import { newsTagsWithSubcategories } from './constants/newsCategories';
import { useTheme } from '../../theme/ThemeContext';
import TextComponent from '../../components/ui/Text';
import { getUserKeywords } from '../../utils/userKeywordsStorage';

const { width, height } = Dimensions.get('window');

const TagSelectionScreen = ({ navigation, route }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const [selectedTags, setSelectedTags] = useState([]);
    const [expandedMainTags, setExpandedMainTags] = useState([]);
    const subTagAnimMap = useRef({}).current;
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const { fromSettings = false, fromSignup = false, selectedTags: incomingSelectedTags = [] } = route?.params || {};

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const iconScale = useRef(new Animated.Value(0)).current;
    const iconRotate = useRef(new Animated.Value(0)).current;
    const circle1Anim = useRef(new Animated.Value(0)).current;
    const circle2Anim = useRef(new Animated.Value(0)).current;
    const circle3Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

    useEffect(() => {
        // Staggered entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 50,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 7,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.spring(iconScale, {
                toValue: 1,
                friction: 6,
                tension: 40,
                delay: 300,
                useNativeDriver: true,
            }),
            Animated.timing(iconRotate, {
                toValue: 1,
                duration: 1000,
                delay: 400,
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
        if (fromSignup) return;
        let mounted = true;
        (async () => {
            const saved = await getUserKeywords();
            const seed = [...saved, ...incomingSelectedTags]
                .map((x) => String(x || '').trim().toLowerCase())
                .filter(Boolean);
            if (!seed.length || !mounted) return;

            const next = new Set();
            const mainTags = Object.keys(newsTagsWithSubcategories);
            for (const main of mainTags) {
                const subs = newsTagsWithSubcategories[main] || [];
                if (seed.includes(main)) {
                    next.add(main);
                }
                for (const sub of subs) {
                    if (seed.includes(sub)) {
                        next.add(main);
                        next.add(sub);
                    }
                }
            }
            if (next.size) {
                setSelectedTags(Array.from(next));
            }
        })();
        return () => {
            mounted = false;
        };
    }, [incomingSelectedTags, fromSignup]);

    const mainTags = Object.keys(newsTagsWithSubcategories);

    const animateLayout = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    };

    const runSubtagOpenAnimation = (mainTag) => {
        const subcategories = newsTagsWithSubcategories[mainTag] || [];
        const anims = subcategories.map((subTag, index) => {
            const key = `${mainTag}::${subTag}`;
            if (!subTagAnimMap[key]) {
                subTagAnimMap[key] = new Animated.Value(0);
            } else {
                subTagAnimMap[key].setValue(0);
            }
            return Animated.timing(subTagAnimMap[key], {
                toValue: 1,
                duration: 220,
                delay: index * 22,
                useNativeDriver: true,
            });
        });
        if (anims.length) {
            Animated.parallel(anims).start();
        }
    };

    // Filter tags based on search text
    const filteredTags = mainTags.filter(tag => 
        tag.toLowerCase().includes(searchText.toLowerCase())
    );

    // Toggle main category selection
    const onMainTagPress = (tag) => {
        animateLayout();
        setSelectedTags(prev => {
            if (!prev.includes(tag)) {
                setExpandedMainTags((expanded) => (expanded.includes(tag) ? expanded : [...expanded, tag]));
                runSubtagOpenAnimation(tag);
                return [...prev, tag];
            }
            // Already selected: toggle open/close only (don't deselect)
            setExpandedMainTags((expanded) =>
                expanded.includes(tag) ? expanded.filter((t) => t !== tag) : [...expanded, tag]
            );
            if (!expandedMainTags.includes(tag)) {
                runSubtagOpenAnimation(tag);
            }
            return prev;
        });
    };

    const clearMainTag = (tag) => {
        animateLayout();
        setExpandedMainTags((expanded) => expanded.filter((t) => t !== tag));
        setSelectedTags((prev) => {
            const subcategories = newsTagsWithSubcategories[tag] || [];
            return prev.filter((t) => t !== tag && !subcategories.includes(t));
        });
    };

    // Toggle subcategory selection
    const toggleSubTag = (mainTag, subTag) => {
        animateLayout();
        setSelectedTags(prev => {
            if (prev.includes(subTag)) {
                // Remove subcategory
                return prev.filter(t => t !== subTag);
            } else {
                // Add subcategory and ensure main tag is selected
                setExpandedMainTags((expanded) => (expanded.includes(mainTag) ? expanded : [...expanded, mainTag]));
                if (!prev.includes(mainTag)) {
                    return [...prev, mainTag, subTag];
                }
                return [...prev, subTag];
            }
        });
    };

    // Navigate to next screen with selected tags
    const handleContinue = async () => {
        if (selectedTags.length === 0) {
            return;
        }
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            navigation.navigate('KeywordSelection', { selectedTags, fromSettings });
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.safeContainer, { backgroundColor: colors.background }]}>
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
            />

            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Animated.View 
                    style={[
                        styles.contentWrapper, 
                        { 
                            opacity: fadeAnim, 
                            transform: [
                                { translateY: slideAnim },
                                { scale: scaleAnim },
                            ],
                        }
                    ]}
                >
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }}
                    >
                        <Header onBack={() => navigation.goBack()} />
                    </Animated.View>

                    <Animated.View 
                        style={[
                            styles.headerSection,
                            {
                                opacity: fadeAnim,
                                transform: [
                                    {
                                        translateY: slideAnim.interpolate({
                                            inputRange: [0, 50],
                                            outputRange: [0, 20],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <View style={styles.iconContainer}>
                            <Animated.View
                                style={{
                                    transform: [
                                        {
                                            scale: iconScale,
                                        },
                                        {
                                            rotate: iconRotate.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['-10deg', '0deg'],
                                            }),
                                        },
                                    ],
                                }}
                            >
                                <Tags size={48} color={colors.primary} strokeWidth={2} />
                            </Animated.View>
                        </View>
                        <TextComponent variant="title" style={styles.title}>
                            {fromSettings
                                ? 'Manage categories'
                                : 'Pick tags that are\nrelevant to you'}
                        </TextComponent>
                        <TextComponent variant="body" color={colors.textSecondary} style={styles.subtitle}>
                            {fromSettings
                                ? 'Edit your category preferences. Next, you can review custom keywords.'
                                : "Select news categories you're interested in to personalize your feed"}
                        </TextComponent>
                    </Animated.View>

                    <Animated.View 
                        style={{
                            opacity: fadeAnim,
                            transform: [
                                {
                                    translateY: slideAnim.interpolate({
                                        inputRange: [0, 50],
                                        outputRange: [0, 30],
                                    }),
                                },
                            ],
                        }}
                    >
                        <SearchBar 
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </Animated.View>

                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [
                                {
                                    translateY: slideAnim.interpolate({
                                        inputRange: [0, 50],
                                        outputRange: [0, 30],
                                    }),
                                },
                            ],
                        }}
                    >
                        <SelectedCount count={selectedTags.length} />
                    </Animated.View>

                    {/* Tags Container */}
                    <Animated.View 
                        style={[
                            styles.tagsContainer,
                            {
                                opacity: fadeAnim,
                                transform: [
                                    {
                                        translateY: slideAnim.interpolate({
                                            inputRange: [0, 50],
                                            outputRange: [0, 40],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        {filteredTags.map((tag, index) => {
                            const isSelected = selectedTags.includes(tag);
                            const subcategories = newsTagsWithSubcategories[tag] || [];
                            const selectedSubCount = (newsTagsWithSubcategories[tag] || []).filter((sub) =>
                                selectedTags.includes(sub)
                            ).length;
                            const isExpanded = expandedMainTags.includes(tag);
                            return (
                                <React.Fragment key={index}>
                                    {/* Main Tag */}
                                    <Tag
                                        label={tag}
                                        isSelected={isSelected}
                                        onPress={() => onMainTagPress(tag)}
                                        showClear={isSelected}
                                        onClearSelection={() => clearMainTag(tag)}
                                        selectedSubCount={selectedSubCount}
                                    />

                                    {/* Subcategories */}
                                    {isSelected && isExpanded
                                        ? subcategories.map((subTag, subIndex) => {
                                              const isSubSelected = selectedTags.includes(subTag);
                                              const key = `${tag}::${subTag}`;
                                              if (!subTagAnimMap[key]) {
                                                  subTagAnimMap[key] = new Animated.Value(1);
                                              }
                                              const translateY = subTagAnimMap[key].interpolate({
                                                  inputRange: [0, 1],
                                                  outputRange: [8, 0],
                                              });
                                              return (
                                                  <Animated.View
                                                      key={`${tag}-${subIndex}`}
                                                      style={{
                                                          opacity: subTagAnimMap[key],
                                                          transform: [{ translateY }],
                                                      }}
                                                  >
                                                      <Tag
                                                          label={subTag}
                                                          isSelected={isSubSelected}
                                                          onPress={() => toggleSubTag(tag, subTag)}
                                                          isSubTag={true}
                                                      />
                                                  </Animated.View>
                                              );
                                          })
                                        : null}
                                </React.Fragment>
                            );
                        })}
                    </Animated.View>

                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [
                                {
                                    translateY: slideAnim.interpolate({
                                        inputRange: [0, 50],
                                        outputRange: [0, 50],
                                    }),
                                },
                            ],
                        }}
                    >
                        <ContinueButton 
                            onPress={handleContinue}
                            selectedCount={selectedTags.length}
                            loading={loading}
                            labelPrefix={fromSettings ? 'Next' : 'Continue'}
                        />
                    </Animated.View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
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
        width: 400,
        height: 400,
        borderRadius: 200,
        top: -150,
        right: -120,
    },
    accentCircle2: {
        position: 'absolute',
        width: 320,
        height: 320,
        borderRadius: 160,
        bottom: 100,
        left: -100,
    },
    accentCircle3: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        top: height * 0.3,
        right: -50,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 30,
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 8,
    },
    headerSection: {
        marginTop: 32,
        marginBottom: 32,
        alignItems: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        lineHeight: 24,
        textAlign: 'center',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 30,
    },
});

export default TagSelectionScreen;