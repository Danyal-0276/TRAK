// NewsFeedScreen.jsx - Updated without bottom navigation
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BlackLogo from '../../assets/images/blackLogo.svg';
import { 
    Settings, 
    ChevronUp, 
    ChevronDown, 
    Bookmark, 
    Share,
    MoreHorizontal 
} from 'lucide-react-native';

const NewsFeedScreen = ({ navigation }) => {
    const feedData = [
        {
            id: 1,
            source: 'BBC',
            time: '3h',
            title: 'Pakistan won T20',
            content: 'Coming to suspect blood. Lorem ipsum dolor magna commodi ante. This turpis in massa ut commodo ante blandit at. Ut at bibendum nunc, molestie id congue vel. Nunc id urna ornare tellus laculis commodo varius. Maecenas mauris ut suscipit tortor ex. Vestibulum turpis erat, laoreet et tellus. Ut tincidunt elit mauris, ut vehicula orci imperdiet elit. Ut cursus tortor ex. Ut cursus mauris bibendum tellus fermentum consectetur.',
            category: 'Sports',
            verified: true
        },
        {
            id: 2,
            source: 'BBC',
            time: '5h',
            title: 'Pakistan won T20',
            content: 'Coming to suspect blood. Lorem ipsum dolor magna commodi ante. This turpis in massa ut commodo ante blandit at. Ut at bibendum nunc, molestie id congue vel. Nunc id urna ornare tellus laculis commodo varius. Maecenas mauris ut suscipit tortor ex. Vestibulum turpis erat, laoreet et tellus.',
            category: 'Sports',
            verified: true
        },
        {
            id: 3,
            source: 'BBC',
            time: '8h',
            title: 'Pakistan won T20',
            content: 'Coming to suspect blood. Lorem ipsum dolor magna commodi ante. This turpis in massa ut commodo ante blandit at. Ut at bibendum nunc, molestie id congue vel. Nunc id urna ornare tellus laculis commodo varius. Maecenas mauris ut suscipit tortor ex.',
            category: 'Sports',
            verified: true
        },
    ];

    const tabItems = ['For you', 'Following', 'Trending', 'Bookmarks'];
    const [activeTab, setActiveTab] = React.useState('For you');

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <BlackLogo width={25} height={25} />
                </View>
                <TouchableOpacity style={styles.settingsButton}>
                    <Settings size={20} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {tabItems.map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.tab,
                            activeTab === tab && styles.activeTab
                        ]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === tab && styles.activeTabText
                        ]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Feed */}
            <ScrollView style={styles.feed} showsVerticalScrollIndicator={false}>
                {feedData.map((item) => (
                    <View key={item.id} style={styles.feedItem}>
                        {/* Header */}
                        <View style={styles.feedHeader}>
                            <View style={styles.sourceContainer}>
                                <View style={styles.sourceIcon}>
                                    <Text style={styles.sourceIconText}>BBC</Text>
                                </View>
                                <Text style={styles.sourceName}>{item.source}</Text>
                                <Text style={styles.timeText}>{item.time}</Text>
                            </View>
                            <TouchableOpacity>
                                <MoreHorizontal size={16} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <Text style={styles.title}>{item.title}</Text>
                        <View style={styles.categoryContainer}>
                            <Text style={styles.categoryText}>{item.category}</Text>
                        </View>
                        <Text style={styles.content}>{item.content}</Text>

                        {/* Actions */}
                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.actionButton}>
                                <ChevronUp size={16} color="#666" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <ChevronDown size={16} color="#666" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Bookmark size={16} color="#666" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Share size={16} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e1e8ed',
        backgroundColor: '#fff',
    },
    logoContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f7f9fa',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e1e8ed',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#f7f9fa',
        marginHorizontal: 1,
    },
    activeTab: {
        backgroundColor: '#1DA1F2',
    },
    tabText: {
        color: '#657786',
        fontSize: 12,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#fff',
    },
    feed: {
        flex: 1,
        backgroundColor: '#fff',
    },
    feedItem: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e1e8ed',
        padding: 16,
    },
    feedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sourceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sourceIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#1DA1F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    sourceIconText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: 'bold',
    },
    sourceName: {
        color: '#000',
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 8,
    },
    timeText: {
        color: '#657786',
        fontSize: 12,
    },
    title: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    categoryContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#e1e8ed',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginBottom: 8,
    },
    categoryText: {
        color: '#000',
        fontSize: 10,
        fontWeight: '500',
    },
    content: {
        color: '#14171a',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e1e8ed',
    },
    actionButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f7f9fa',
    },
});

export default NewsFeedScreen;