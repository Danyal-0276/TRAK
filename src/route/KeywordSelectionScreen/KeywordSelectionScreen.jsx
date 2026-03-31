
// ============================================
// FILE: screens/KeywordSelectionScreen.jsx
// ============================================
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    Alert,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Hash } from 'lucide-react-native';

import { Header } from './components/Header';
import { KeywordInput } from './components/KeywordInput';
import { KeywordCount } from './components/KeywordCount';
import { KeywordChip } from './components/KeywordChip';
import { EmptyState } from './components/EmptyState';
import { ActionButtons } from './components/ActionButtons';
import { useTheme } from '../../theme/ThemeContext';
import TextComponent from '../../components/ui/Text';
import { trackKeywords } from '../../api/newsApi';
import { getAccessToken } from '../../api/client';
import { getUserKeywords, setUserKeywords } from '../../utils/userKeywordsStorage';

const { width, height } = Dimensions.get('window');

const KeywordSelectionScreen = ({ navigation, route }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [keywordInput, setKeywordInput] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Get selected tags from previous screen
    const { selectedTags = [], fromSettings = false } = route.params || {};

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
        (async () => {
            const saved = await getUserKeywords();
            if (saved.length) setSelectedKeywords(saved);
        })();
    }, []);

    const addKeyword = () => {
        const trimmedKeyword = keywordInput.trim();
        
        if (trimmedKeyword === '') {
            Alert.alert('Invalid Input', 'Please enter a keyword');
            return;
        }
        
        if (selectedKeywords.includes(trimmedKeyword.toLowerCase())) {
            Alert.alert('Duplicate Keyword', 'This keyword has already been added');
            return;
        }
        
        if (trimmedKeyword.length < 2) {
            Alert.alert('Too Short', 'Keyword must be at least 2 characters long');
            return;
        }
        
        setSelectedKeywords(prev => [...prev, trimmedKeyword.toLowerCase()]);
        setKeywordInput('');
    };

    const removeKeyword = (keyword) => {
        setSelectedKeywords(prev => prev.filter(k => k !== keyword));
    };

    const handleKeywordSubmit = () => {
        if (keywordInput.trim()) {
            addKeyword();
        }
    };

    const handleContinue = async () => {
        setLoading(true);
        try {
            const merged = [...selectedKeywords, ...selectedTags]
                .map((k) => String(k || '').trim().toLowerCase())
                .filter(Boolean)
                .filter((k, idx, arr) => arr.indexOf(k) === idx);
            const token = await getAccessToken();
            if (token && merged.length) {
                try {
                    await trackKeywords(merged);
                    await setUserKeywords(merged);
                } catch (e) {
                    console.warn('track-keywords:', e?.message);
                }
            }
            if (fromSettings) {
                navigation.goBack();
            } else {
                navigation.navigate('NewsFeed', {
                    selectedTags,
                    selectedKeywords: merged,
                });
            }
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
                                <Hash size={48} color={colors.primary} strokeWidth={2} />
                            </Animated.View>
                        </View>
                        <TextComponent variant="title" style={styles.title}>
                            Add custom keywords{'\n'}for better results
                        </TextComponent>
                        <TextComponent variant="body" color={colors.textSecondary} style={styles.subtitle}>
                            Add specific keywords you want to follow for more personalized news content
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
                        <KeywordInput
                            value={keywordInput}
                            onChangeText={setKeywordInput}
                            onSubmit={handleKeywordSubmit}
                            onAdd={addKeyword}
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
                        <KeywordCount count={selectedKeywords.length} />
                    </Animated.View>

                    {/* Keywords Container */}
                    <Animated.View 
                        style={[
                            styles.keywordsContainer,
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
                        {selectedKeywords.map((keyword, index) => (
                            <KeywordChip
                                key={index}
                                keyword={keyword}
                                onRemove={() => removeKeyword(keyword)}
                            />
                        ))}
                        
                        {selectedKeywords.length === 0 && <EmptyState />}
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
                        <ActionButtons
                            onSkip={handleContinue}
                            onContinue={handleContinue}
                            keywordCount={selectedKeywords.length}
                            loading={loading}
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
    keywordsContainer: {
        minHeight: 200,
        marginBottom: 40,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
});

export default KeywordSelectionScreen;