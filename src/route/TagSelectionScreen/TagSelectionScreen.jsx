// ============================================
// FILE: screens/TagSelectionScreen.jsx
// ============================================
import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';

import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { SelectedCount } from './components/SelectedCount';
import { Tag } from './components/Tag';
import { SubcategoriesContainer } from './components/SubcategoriesContainer';
import { ContinueButton } from './components/ContinueButton';
import { newsTagsWithSubcategories } from './constants/newsCategories';

const TagSelectionScreen = ({ navigation }) => {
    const [selectedTags, setSelectedTags] = useState([]);
    const [searchText, setSearchText] = useState('');

    const mainTags = Object.keys(newsTagsWithSubcategories);

    // Filter tags based on search text
    const filteredTags = mainTags.filter(tag => 
        tag.toLowerCase().includes(searchText.toLowerCase())
    );

    // Toggle main category selection
    const toggleMainTag = (tag) => {
        setSelectedTags(prev => {
            if (prev.includes(tag)) {
                // Remove main tag and all its subcategories
                const subcategories = newsTagsWithSubcategories[tag];
                return prev.filter(t => t !== tag && !subcategories.includes(t));
            } else {
                // Add main tag
                return [...prev, tag];
            }
        });
    };

    // Toggle subcategory selection
    const toggleSubTag = (mainTag, subTag) => {
        setSelectedTags(prev => {
            if (prev.includes(subTag)) {
                // Remove subcategory
                return prev.filter(t => t !== subTag);
            } else {
                // Add subcategory and ensure main tag is selected
                if (!prev.includes(mainTag)) {
                    return [...prev, mainTag, subTag];
                }
                return [...prev, subTag];
            }
        });
    };

    // Navigate to next screen with selected tags
    const handleContinue = () => {
        console.log('Selected tags:', selectedTags);
        navigation.navigate('KeywordSelection', { selectedTags });
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
                            Pick tags that are{'\n'}relevant to you
                        </Text>
                        
                        <Text style={styles.subtitle}>
                            Select news categories you're interested in to personalize your feed
                        </Text>

                        <SearchBar 
                            value={searchText}
                            onChangeText={setSearchText}
                        />

                        <SelectedCount count={selectedTags.length} />

                        {/* Tags Container */}
                        <View style={styles.tagsContainer}>
                            {filteredTags.map((tag, index) => {
                                const isSelected = selectedTags.includes(tag);
                                return (
                                    <React.Fragment key={index}>
                                        {/* Main Tag */}
                                        <Tag
                                            label={tag}
                                            isSelected={isSelected}
                                            onPress={() => toggleMainTag(tag)}
                                        />

                                        {/* Subcategories */}
                                        {isSelected && (
                                            <SubcategoriesContainer
                                                mainTag={tag}
                                                subcategories={newsTagsWithSubcategories[tag]}
                                                selectedTags={selectedTags}
                                                onSubTagPress={toggleSubTag}
                                            />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </View>

                        <ContinueButton 
                            onPress={handleContinue}
                            selectedCount={selectedTags.length}
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
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 30,
        gap: 10,
    },
});

export default TagSelectionScreen;