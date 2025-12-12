
// ============================================
// FILE: screens/KeywordSelectionScreen.jsx
// ============================================
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';

import { Header } from './components/Header';
import { KeywordInput } from './components/KeywordInput';
import { KeywordCount } from './components/KeywordCount';
import { KeywordChip } from './components/KeywordChip';
import { EmptyState } from './components/EmptyState';
import { ActionButtons } from './components/ActionButtons';

const KeywordSelectionScreen = ({ navigation, route }) => {
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [keywordInput, setKeywordInput] = useState('');
    
    // Get selected tags from previous screen
    const { selectedTags } = route.params || { selectedTags: [] };

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

    const handleContinue = () => {
        console.log('Selected tags:', selectedTags);
        console.log('Selected keywords:', selectedKeywords);
        navigation.navigate('NewsFeed', { 
            selectedTags, 
            selectedKeywords 
        });
    };

    return (
        <LinearGradient
            colors={['#f8fafc', '#e2e8f0', '#cbd5e1']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <SafeAreaView style={styles.safeArea}>
                
                <Header onBack={() => navigation.goBack()} />

                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        <Text style={styles.title}>
                            Add custom keywords{'\n'}for better results
                        </Text>
                        
                        <Text style={styles.subtitle}>
                            Add specific keywords you want to follow for more personalized news content
                        </Text>

                        <KeywordInput
                            value={keywordInput}
                            onChangeText={setKeywordInput}
                            onSubmit={handleKeywordSubmit}
                            onAdd={addKeyword}
                        />

                        <KeywordCount count={selectedKeywords.length} />

                        {/* Keywords Container */}
                        <View style={styles.keywordsContainer}>
                            {selectedKeywords.map((keyword, index) => (
                                <KeywordChip
                                    key={index}
                                    keyword={keyword}
                                    onRemove={() => removeKeyword(keyword)}
                                />
                            ))}
                            
                            {selectedKeywords.length === 0 && <EmptyState />}
                        </View>

                        <ActionButtons
                            onSkip={handleContinue}
                            onContinue={handleContinue}
                            keywordCount={selectedKeywords.length}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 10,
        textAlign: 'center',
        lineHeight: 36,
    },
    subtitle: {
        fontSize: 16,
        color: '#475569',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    keywordsContainer: {
        minHeight: 200,
        marginBottom: 40,
    },
});

export default KeywordSelectionScreen;