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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, ChevronDown, ChevronRight } from 'lucide-react-native';

const TagSelectionScreen = ({ navigation }) => {
    const [selectedTags, setSelectedTags] = useState([]);
    const [expandedTags, setExpandedTags] = useState([]);
    const [searchText, setSearchText] = useState('');

    const newsTagsWithSubcategories = {
        'politics': ['elections', 'government', 'policy', 'international-relations', 'campaigns'],
        'business': ['stocks', 'markets', 'startups', 'economy', 'trade', 'corporate'],
        'technology': ['ai', 'smartphones', 'software', 'cybersecurity', 'innovation', 'gadgets'],
        'sports': ['football', 'basketball', 'soccer', 'baseball', 'olympics', 'tennis'],
        'entertainment': ['movies', 'tv-shows', 'celebrity', 'music', 'streaming', 'awards'],
        'health': ['medicine', 'fitness', 'nutrition', 'mental-health', 'research', 'wellness'],
        'science': ['research', 'space', 'climate', 'biology', 'physics', 'discoveries'],
        'world-news': ['international', 'conflicts', 'diplomacy', 'global-events'],
        'local-news': ['community', 'city-council', 'local-events', 'neighborhood'],
        'breaking-news': ['alerts', 'urgent', 'live-updates', 'emergency'],
        'finance': ['banking', 'investments', 'cryptocurrency', 'personal-finance', 'markets'],
        'weather': ['forecast', 'storms', 'climate-change', 'seasonal'],
        'education': ['schools', 'universities', 'students', 'teachers', 'learning'],
        'lifestyle': ['fashion', 'home', 'relationships', 'self-improvement', 'trends'],
        'food': ['recipes', 'restaurants', 'cooking', 'nutrition', 'food-culture'],
        'travel': ['destinations', 'airlines', 'hotels', 'tourism', 'adventure'],
        'automotive': ['cars', 'electric-vehicles', 'reviews', 'industry-news'],
        'real-estate': ['housing', 'market-trends', 'buying', 'selling', 'rentals'],
        'opinion': ['editorials', 'op-eds', 'commentary', 'analysis'],
        'culture': ['arts', 'literature', 'traditions', 'society', 'heritage'],
        'environment': ['climate-change', 'conservation', 'pollution', 'sustainability'],
        'crime': ['investigations', 'court-cases', 'law-enforcement', 'safety'],
        'military': ['defense', 'veterans', 'conflicts', 'security'],
        'gaming': ['video-games', 'esports', 'reviews', 'industry', 'streaming'],
        'startup': ['funding', 'unicorns', 'innovation', 'entrepreneurs', 'tech-companies'],
        'social-media': ['platforms', 'influencers', 'trends', 'digital-culture']
    };

    const mainTags = Object.keys(newsTagsWithSubcategories);

    const filteredTags = mainTags.filter(tag => 
        tag.toLowerCase().includes(searchText.toLowerCase())
    );

    const toggleMainTag = (tag) => {
        // Always expand when clicking a main tag
        setExpandedTags(prev => {
            if (!prev.includes(tag)) {
                return [...prev, tag];
            }
            return prev;
        });

        // Toggle selection
        setSelectedTags(prev => {
            if (prev.includes(tag)) {
                // Remove main tag and all its subcategories
                const subcategories = newsTagsWithSubcategories[tag];
                return prev.filter(t => t !== tag && !subcategories.includes(t));
            } else {
                return [...prev, tag];
            }
        });
    };

    const collapseMainTag = (tag) => {
        setExpandedTags(prev => prev.filter(t => t !== tag));
    };

    const toggleSubTag = (mainTag, subTag) => {
        setSelectedTags(prev => {
            if (prev.includes(subTag)) {
                return prev.filter(t => t !== subTag);
            } else {
                // Make sure main tag is also selected
                if (!prev.includes(mainTag)) {
                    return [...prev, mainTag, subTag];
                }
                return [...prev, subTag];
            }
        });
    };

    const handleContinue = () => {
        console.log('Selected tags:', selectedTags);
        navigation.navigate('KeywordSelection', { selectedTags });
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
                        <Text style={styles.title}>Pick tags that are{'\n'}relevant to you</Text>
                        
                        <Text style={styles.subtitle}>
                            Select news categories you're interested in to personalize your feed
                        </Text>

                        {/* Search Bar */}
                        <View style={styles.searchContainer}>
                            <Search size={20} color="#999" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search categories..."
                                placeholderTextColor="#999"
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        </View>

                        {/* Selected Count */}
                        {selectedTags.length > 0 && (
                            <Text style={styles.selectedCount}>
                                {selectedTags.length} categories selected
                            </Text>
                        )}

                        {/* Tags Container */}
                        <View style={styles.tagsContainer}>
                            {filteredTags.map((tag, index) => (
                                <View key={index} style={styles.tagGroup}>
                                    {/* Main Tag */}
                                    <TouchableOpacity
                                        style={[
                                            styles.tag,
                                            styles.mainTag,
                                            selectedTags.includes(tag) && styles.selectedTag
                                        ]}
                                        onPress={() => toggleMainTag(tag)}
                                    >
                                        <Text style={[
                                            styles.tagText,
                                            selectedTags.includes(tag) && styles.selectedTagText
                                        ]}>
                                            {tag}
                                        </Text>
                                        <TouchableOpacity 
                                            onPress={() => collapseMainTag(tag)}
                                            style={styles.chevronButton}
                                        >
                                            {expandedTags.includes(tag) ? 
                                                <ChevronDown size={16} color={selectedTags.includes(tag) ? "#fff" : "#000"} /> :
                                                <ChevronRight size={16} color={selectedTags.includes(tag) ? "#fff" : "#000"} />
                                            }
                                        </TouchableOpacity>
                                    </TouchableOpacity>

                                    {/* Subcategories */}
                                    {expandedTags.includes(tag) && (
                                        <View style={styles.subTagsContainer}>
                                            {newsTagsWithSubcategories[tag].map((subTag, subIndex) => (
                                                <TouchableOpacity
                                                    key={subIndex}
                                                    style={[
                                                        styles.tag,
                                                        styles.subTag,
                                                        selectedTags.includes(subTag) && styles.selectedSubTag
                                                    ]}
                                                    onPress={() => toggleSubTag(tag, subTag)}
                                                >
                                                    <Text style={[
                                                        styles.tagText,
                                                        styles.subTagText,
                                                        selectedTags.includes(subTag) && styles.selectedSubTagText
                                                    ]}>
                                                        {subTag}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>

                        {/* Continue Button */}
                        <TouchableOpacity 
                            style={[
                                styles.continueButton,
                                selectedTags.length === 0 && styles.disabledButton
                            ]}
                            onPress={handleContinue}
                            disabled={selectedTags.length === 0}
                        >
                            <Text style={[
                                styles.continueButtonText,
                                selectedTags.length === 0 && styles.disabledButtonText
                            ]}>
                                Continue ({selectedTags.length})
                            </Text>
                        </TouchableOpacity>
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.2)',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
    selectedCount: {
        color: '#000',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        opacity: 0.8,
    },
    tagsContainer: {
        marginBottom: 40,
    },
    tagGroup: {
        marginBottom: 8,
    },
    tag: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        minWidth: 80,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    mainTag: {
        marginBottom: 8,
        minHeight: 48,
    },
    subTag: {
        marginLeft: 20,
        marginBottom: 6,
        backgroundColor: '#f8f9fa',
        borderColor: 'rgba(0, 0, 0, 0.15)',
        minHeight: 40,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    selectedTag: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    selectedSubTag: {
        backgroundColor: '#333',
        borderColor: '#333',
    },
    tagText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    subTagText: {
        fontSize: 13,
        color: '#555',
    },
    selectedTagText: {
        color: '#fff',
        fontWeight: '600',
    },
    selectedSubTagText: {
        color: '#fff',
        fontWeight: '600',
    },
    chevronButton: {
        padding: 4,
    },
    subTagsContainer: {
        paddingLeft: 0,
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

export default TagSelectionScreen;