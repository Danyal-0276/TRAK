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
import { ChevronLeft, Search } from 'lucide-react-native';
import { LinearGradient } from 'react-native-linear-gradient';

const TagSelectionScreen = ({ navigation }) => {
    const [selectedTags, setSelectedTags] = useState([]);
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
        setSelectedTags(prev => {
            if (prev.includes(tag)) {
                // Remove main tag and show subcategories
                const subcategories = newsTagsWithSubcategories[tag];
                return prev.filter(t => t !== tag && !subcategories.includes(t));
            } else {
                return [...prev, tag];
            }
        });
    };

    const toggleSubTag = (mainTag, subTag) => {
        setSelectedTags(prev => {
            if (prev.includes(subTag)) {
                return prev.filter(t => t !== subTag);
            } else {
                // Add subtag and ensure main tag is also selected
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

    const renderSubcategories = (mainTag) => {
        if (!selectedTags.includes(mainTag)) return null;
        
        return newsTagsWithSubcategories[mainTag].map((subTag, subIndex) => (
            <TouchableOpacity
                key={subIndex}
                style={[
                    styles.tag,
                    styles.subTag,
                    selectedTags.includes(subTag) && styles.selectedSubTag
                ]}
                onPress={() => toggleSubTag(mainTag, subTag)}
                activeOpacity={0.7}
            >
                {selectedTags.includes(subTag) && <View style={styles.selectionDot} />}
                <Text style={[
                    styles.tagText,
                    styles.subTagText,
                    selectedTags.includes(subTag) && styles.selectedSubTagText
                ]}>
                    {subTag}
                </Text>
            </TouchableOpacity>
        ));
    };

    return (
        <LinearGradient
            colors={['#ffffff', '#1DA1F2', '#8b5cf6']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <ChevronLeft size={24} color="#1f2937" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        <Text style={styles.title}>Pick tags that are{'\n'}relevant to you</Text>
                        
                        <Text style={styles.subtitle}>
                            Select news categories you're interested in to personalize your feed
                        </Text>

                        {/* Search Bar */}
                        <View style={styles.searchContainer}>
                            <Search size={20} color="#9ca3af" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search categories..."
                                placeholderTextColor="#9ca3af"
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
                            {filteredTags.map((tag, index) => {
                                const isSelected = selectedTags.includes(tag);
                                return (
                                    <React.Fragment key={index}>
                                        {/* Main Tag */}
                                        <TouchableOpacity
                                            style={[
                                                styles.tag,
                                                isSelected && styles.selectedMainTag
                                            ]}
                                            onPress={() => toggleMainTag(tag)}
                                            activeOpacity={0.7}
                                        >
                                            {isSelected && <View style={styles.selectionDot} />}
                                            <Text style={[
                                                styles.tagText,
                                                isSelected && styles.selectedMainTagText
                                            ]}>
                                                {tag}
                                            </Text>
                                        </TouchableOpacity>

                                        {/* Subcategories right next to main tag */}
                                        {isSelected && newsTagsWithSubcategories[tag].map((subTag, subIndex) => {
                                            const isSubSelected = selectedTags.includes(subTag);
                                            return (
                                                <TouchableOpacity
                                                    key={`${tag}-${subIndex}`}
                                                    style={[
                                                        styles.tag,
                                                        styles.subTag,
                                                        isSubSelected && styles.selectedSubTag
                                                    ]}
                                                    onPress={() => toggleSubTag(tag, subTag)}
                                                    activeOpacity={0.7}
                                                >
                                                    {isSubSelected && <View style={styles.selectionDot} />}
                                                    <Text style={[
                                                        styles.tagText,
                                                        styles.subTagText,
                                                        isSubSelected && styles.selectedSubTagText
                                                    ]}>
                                                        {subTag}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            })}
                        </View>

                        {/* Continue Button */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                                style={[
                                    styles.continueButton,
                                    selectedTags.length === 0 && styles.disabledButton
                                ]}
                                onPress={handleContinue}
                                disabled={selectedTags.length === 0}
                                activeOpacity={selectedTags.length === 0 ? 1 : 0.8}
                            >
                                <Text style={[
                                    styles.continueButtonText,
                                    selectedTags.length === 0 && styles.disabledButtonText
                                ]}>
                                    Continue ({selectedTags.length})
                                </Text>
                            </TouchableOpacity>
                        </View>
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
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
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
        color: '#1f2937',
        marginBottom: 10,
        textAlign: 'center',
        lineHeight: 36,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
    },
    selectedCount: {
        color: '#6b7280',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 30,
        gap: 10,
    },
    tag: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    selectedMainTag: {
        backgroundColor: '#1DA1F2',
        borderColor: '#1DA1F2',
    },
    subTag: {
        backgroundColor: '#ffffff',
        borderColor: '#8b5cf6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
    },
    selectedSubTag: {
        backgroundColor: '#8b5cf6',
        borderColor: '#8b5cf6',
    },
    selectionDot: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#10b981',
        borderWidth: 2,
        borderColor: '#ffffff',
        zIndex: 1,
    },
    tagText: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        color: '#374151',
    },
    selectedMainTagText: {
        color: '#ffffff',
        fontWeight: '600',
    },
    subTagText: {
        fontSize: 13,
        color: '#6b7280',
    },
    selectedSubTagText: {
        color: '#ffffff',
        fontWeight: '600',
    },
    buttonContainer: {
        marginTop: 20,
        paddingHorizontal: 10,
    },
    continueButton: {
        backgroundColor: '#1f2937',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    disabledButton: {
        backgroundColor: '#e5e7eb',
        shadowOpacity: 0,
        elevation: 0,
    },
    continueButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButtonText: {
        color: '#9ca3af',
    },
});

export default TagSelectionScreen;