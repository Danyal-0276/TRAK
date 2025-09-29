import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TextInput,
    FlatList,
    TouchableOpacity,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';

const CATEGORIES = ["For you", "Following", "Trending", "Bookmarks"];

const DUMMY_FEED = [
    {
        id: "1",
        title: "Pakistan won T20",
        source: "BBC",
        time: "3h ago",
        tags: ["Technology", "Sports", "Business"],
        content:
            "Pakistan secures victory in the T20 match. A thrilling performance with a dramatic finish!",
    },
    {
        id: "2",
        title: "AI is taking over!",
        source: "TechCrunch",
        time: "5h ago",
        tags: ["AI", "Technology", "Startups"],
        content:
            "Latest research shows AI tools are growing rapidly in adoption across industries.",
    },
];

const SearchScreen = () => {
    const [activeTab, setActiveTab] = useState("For you");


    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    const searchScale = useSharedValue(1);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.exp) });
        translateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.exp) });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    const searchAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: searchScale.value }],
    }));

    const handleSearchFocus = () => {
        searchScale.value = withTiming(1.05, { duration: 250, easing: Easing.out(Easing.ease) });
    };

    const handleSearchBlur = () => {
        searchScale.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) });
    };

    const renderPost = ({ item }) => (
        <View style={styles.postContainer}>
            <Text style={styles.source}>{item.source} · {item.time}</Text>
            <Text style={styles.postTitle}>{item.title}</Text>
            <View style={styles.tagsRow}>
                {item.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                    </View>
                ))}
            </View>
            <Text style={styles.postContent}>{item.content}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.innerContainer}>
         
                    <Animated.View style={[styles.searchBar, animatedStyle, searchAnimatedStyle]}>
                        <Search size={20} color="#000" style={styles.searchIcon} />
                        <TextInput
                            placeholder="Search..."
                            placeholderTextColor="#999"
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            onFocus={handleSearchFocus}
                            onBlur={handleSearchBlur}
                        />
                    </Animated.View>

                    <View style={styles.tabsRow}>
                        {CATEGORIES.map((cat, idx) => {
                            const isActive = activeTab === cat;
                            return (
                                <TouchableOpacity
                                    key={idx}
                                    style={[
                                        styles.tab,
                                        isActive && styles.activeTab
                                    ]}
                                    onPress={() => setActiveTab(cat)}
                                >
                                    <Text style={[
                                        styles.tabText,
                                        isActive && styles.activeTabText
                                    ]}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                   
                    <FlatList
                        data={DUMMY_FEED}
                        keyExtractor={(item) => item.id}
                        renderItem={renderPost}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    innerContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginTop: 10,
        marginBottom: 10,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
    tabsRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    tab: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        backgroundColor: '#f2f2f2',
        borderRadius: 20,
        marginRight: 8,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    activeTab: {
        backgroundColor: '#000',
    },
    activeTabText: {
        color: '#fff',
    },
    postContainer: {
        backgroundColor: '#fff',
        padding: 14,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    source: {
        fontSize: 12,
        color: '#777',
        marginBottom: 4,
    },
    postTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        marginBottom: 6,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 6,
    },
    tag: {
        backgroundColor: '#f2f2f2',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 6,
        marginBottom: 6,
    },
    tagText: {
        fontSize: 12,
        color: '#000',
    },
    postContent: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
});

export default SearchScreen;
