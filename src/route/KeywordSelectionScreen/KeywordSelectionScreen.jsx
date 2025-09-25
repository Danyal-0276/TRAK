import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
    TextInput,
    Dimensions,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, X } from 'lucide-react-native';

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
        // Navigate to the next screen or final setup
        navigation.navigate('NewsFeed', { 
            selectedTags, 
            selectedKeywords 
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <ChevronLeft size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.content}>
                        <Text style={styles.title}>Add custom keywords{'\n'}for better results</Text>
                        
                        <Text style={styles.subtitle}>
                            Add specific keywords you want to follow for more personalized news content
                        </Text>

                        {/* Keyword Input */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.keywordInput}
                                placeholder="Enter a keyword..."
                                placeholderTextColor="#999"
                                value={keywordInput}
                                onChangeText={setKeywordInput}
                                onSubmitEditing={handleKeywordSubmit}
                                returnKeyType="done"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.addButton,
                                    !keywordInput.trim() && styles.disabledAddButton
                                ]}
                                onPress={addKeyword}
                                disabled={!keywordInput.trim()}
                            >
                                <Plus size={20} color={keywordInput.trim() ? "#fff" : "#999"} />
                            </TouchableOpacity>
                        </View>

                        {/* Added Keywords Count */}
                        {selectedKeywords.length > 0 && (
                            <Text style={styles.selectedCount}>
                                {selectedKeywords.length} keywords added
                            </Text>
                        )}

                        {/* Keywords Container */}
                        <View style={styles.keywordsContainer}>
                            {selectedKeywords.map((keyword, index) => (
                                <View
                                    key={index}
                                    style={styles.keyword}
                                >
                                    <Text style={styles.keywordText}>
                                        {keyword}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => removeKeyword(keyword)}
                                    >
                                        <X size={14} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            
                            {selectedKeywords.length === 0 && (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyStateText}>
                                        No keywords added yet
                                    </Text>
                                    <Text style={styles.emptyStateSubtext}>
                                        Add keywords above to see them here
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Skip/Continue Section */}
                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity 
                                style={styles.skipButton}
                                onPress={handleContinue}
                            >
                                <Text style={styles.skipButtonText}>
                                    Skip this step
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[
                                    styles.continueButton,
                                    selectedKeywords.length === 0 && styles.disabledButton
                                ]}
                                onPress={handleContinue}
                                disabled={selectedKeywords.length === 0}
                            >
                                <Text style={[
                                    styles.continueButtonText,
                                    selectedKeywords.length === 0 && styles.disabledButtonText
                                ]}>
                                    Continue ({selectedKeywords.length})
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.2)',
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
        textAlign: 'center',
        lineHeight: 40,
    },
    subtitle: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 4,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.2)',
    },
    keywordInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        paddingVertical: 12,
    },
    addButton: {
        backgroundColor: '#000',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    disabledAddButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    selectedCount: {
        color: '#000',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        opacity: 0.8,
    },
    keywordsContainer: {
        minHeight: 200,
        marginBottom: 40,
    },
    keyword: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#000',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        marginBottom: 12,
        alignSelf: 'flex-start',
    },
    keywordText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        marginRight: 8,
    },
    removeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyStateText: {
        fontSize: 18,
        color: '#000',
        fontWeight: '500',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    buttonsContainer: {
        gap: 12,
    },
    skipButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        marginBottom: 8,
    },
    skipButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '500',
    },
    continueButton: {
        backgroundColor: '#000',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    disabledButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        shadowOpacity: 0,
        elevation: 0,
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButtonText: {
        color: 'rgba(255, 255, 255, 0.5)',
    },
});

export default KeywordSelectionScreen;