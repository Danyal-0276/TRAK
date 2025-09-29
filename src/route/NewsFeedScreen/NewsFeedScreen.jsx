// NewsFeedScreen.jsx - Corrected to match the image design
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
            time: '3h ago',
            title: 'Pakistan won T20',
            content: 'Coming to suspect blood. Lorem ipsum dolor magna commodi ante. This turpis in massa ut commodo ante blandit at. Ut at bibendum nunc, molestie id congue vel. Nunc id urna ornare tellus laculis commodo varius. Maecenas mauris ut suscipit tortor ex. Vestibulum turpis erat, laoreet et tellus. Ut tincidunt elit mauris, ut vehicula orci imperdiet elit. Ut cursus tortor ex. Ut cursus mauris bibendum tellus fermentum consectetur.',
            fullContent: `Pakistan secured a thrilling victory in the T20 match yesterday, showcasing exceptional performance from their batting and bowling departments.

The match began with Pakistan winning the toss and deciding to bat first. The opening partnership between Babar Azam and Mohammad Rizwan provided a solid foundation, scoring 89 runs for the first wicket.

Babar Azam played a magnificent innings, scoring 87 runs off 52 balls, including 8 fours and 3 sixes. His knock was the cornerstone of Pakistan's total of 189/4 in their allotted 20 overs.

The bowling department then took center stage, with Shaheen Afridi leading the attack. He claimed 3 wickets for just 28 runs in his 4 overs, including the crucial wickets of the opposition's top-order batsmen.

Haris Rauf provided excellent support, taking 2 wickets for 31 runs, while the spin duo of Shadab Khan and Imad Wasim kept the run rate in check during the middle overs.

The opposition fought valiantly but could only manage 174/7 in their 20 overs, falling short by 15 runs. This victory marks Pakistan's third consecutive win in the series.

Captain Babar Azam expressed his satisfaction with the team's performance and praised the bowling unit for their disciplined approach. The team will now look forward to maintaining this momentum in the upcoming matches.`,
            category: 'Politics',
            verified: true
        },
        {
            id: 2,
            source: 'BBC',
            time: '3h ago',
            title: 'Pakistan won T20',
            content: 'Coming to suspect blood. Lorem ipsum dolor magna commodi ante. This turpis in massa ut commodo ante blandit at. Ut at bibendum nunc, molestie id congue vel. Nunc id urna ornare tellus laculis commodo varius. Maecenas mauris ut suscipit tortor ex. Vestibulum turpis erat, laoreet et tellus. Ut tincidunt elit mauris, ut vehicula orci imperdiet elit. Ut cursus tortor ex. Ut cursus mauris bibendum tellus fermentum consectetur.',
            fullContent: `A team of researchers at leading universities has announced a groundbreaking discovery in artificial intelligence that could transform the future of machine learning.

The new algorithm, dubbed "Neural Architecture Search 3.0," represents a significant advancement in how AI systems can automatically design and optimize their own neural network structures.

Dr. Sarah Johnson, lead researcher on the project, explained: "This breakthrough allows AI systems to evolve and improve themselves without human intervention, potentially leading to more efficient and powerful AI applications."

The research, published in the journal Nature AI, demonstrates that the new approach can achieve up to 40% better performance compared to traditional methods while using significantly less computational power.`,
            category: 'Technology',
            verified: true
        },
        {
            id: 3,
            source: 'BBC',
            time: '3h ago',
            title: 'Pakistan won T20',
            content: 'Coming to suspect blood. Lorem ipsum dolor magna commodi ante. This turpis in massa ut commodo ante blandit at. Ut at bibendum nunc, molestie id congue vel. Nunc id urna ornare tellus laculis commodo varius. Maecenas mauris ut suscipit tortor ex. Vestibulum turpis erat, laoreet et tellus. Ut tincidunt elit mauris, ut vehicula orci imperdiet elit. Ut cursus tortor ex. Ut cursus mauris bibendum tellus fermentum consectetur.',
            fullContent: `In a historic moment for global environmental policy, representatives from 195 countries have unanimously agreed to a comprehensive climate action plan at the Global Climate Summit held in Geneva.

The agreement, known as the Geneva Climate Accord, establishes binding commitments for all participating nations to achieve net-zero carbon emissions by 2050, with interim targets every five years.`,
            category: 'Environment',
            verified: true
        },
    ];

    const tabItems = ['For you', 'Following', 'Trending', 'Bookmarks'];
    const [activeTab, setActiveTab] = React.useState('For you');

    const handleArticlePress = (article) => {
        navigation.navigate('ArticleDetail', { article });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <BlackLogo width={25} height={25} />
                </View>
                <TouchableOpacity 
  style={styles.settingsButton}
  onPress={() => navigation.navigate("Settings")}
>
  <Settings size={20} color="#000" />
</TouchableOpacity>

            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.tabsScroll}
                    contentContainerStyle={styles.tabsContent}
                >
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
                </ScrollView>
            </View>

            {/* Feed */}
            <ScrollView style={styles.feed} showsVerticalScrollIndicator={false}>
                {feedData.map((item) => (
                    <TouchableOpacity 
                        key={item.id} 
                        style={styles.feedItem}
                        onPress={() => handleArticlePress(item)}
                        activeOpacity={0.95}
                    >
                        {/* Header */}
                        <View style={styles.feedHeader}>
                            <View style={styles.sourceContainer}>
                                <View style={styles.sourceIcon}>
                                    <Text style={styles.sourceIconText}>
                                        {item.source.substring(0, 3).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.sourceInfo}>
                                    <Text style={styles.sourceName}>{item.source}</Text>
                                    <Text style={styles.timeText}>{item.time}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={(e) => e.stopPropagation()}>
                                <MoreHorizontal size={16} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Title */}
                        <Text style={styles.title}>{item.title}</Text>

                        {/* Category Pills */}
                        <View style={styles.categoryRow}>
                            <View style={styles.categoryContainer}>
                                <Text style={styles.categoryText}>{item.category}</Text>
                            </View>
                            <View style={styles.categoryContainer}>
                                <Text style={styles.categoryText}>Technology</Text>
                            </View>
                            <View style={styles.categoryContainer}>
                                <Text style={styles.categoryText}>Sports</Text>
                            </View>
                            <View style={styles.categoryContainer}>
                                <Text style={styles.categoryText}>Business</Text>
                            </View>
                        </View>

                        {/* Content */}
                        <Text style={styles.content} numberOfLines={4}>
                            {item.content}
                        </Text>

                        {/* Actions */}
                        <View style={styles.actionsContainer}>
                            <View style={styles.actions}>
                                <TouchableOpacity 
                                    style={styles.actionButton}
                                    onPress={(e) => e.stopPropagation()}
                                >
                                    <ChevronUp size={18} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.actionButton}
                                    onPress={(e) => e.stopPropagation()}
                                >
                                    <ChevronDown size={18} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.actionButton}
                                    onPress={(e) => e.stopPropagation()}
                                >
                                    <Bookmark size={18} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.actionButton}
                                    onPress={(e) => e.stopPropagation()}
                                >
                                    <Share size={18} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
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
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e1e8ed',
        paddingVertical: 8,
    },
    tabsScroll: {
        paddingHorizontal: 16,
    },
    tabsContent: {
        alignItems: 'center',
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#f7f9fa',
        borderWidth: 1,
        borderColor: '#e1e8ed',
    },
    activeTab: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    tabText: {
        color: '#657786',
        fontSize: 14,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#fff',
        fontWeight: '600',
    },
    feed: {
        flex: 1,
        backgroundColor: '#fff',
    },
    feedItem: {
        backgroundColor: '#fff',
        borderBottomWidth: 8,
        borderBottomColor: '#f7f9fa',
        padding: 16,
    },
    feedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    sourceContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
    },
    sourceIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#666',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sourceIconText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    sourceInfo: {
        flex: 1,
    },
    sourceName: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    timeText: {
        color: '#657786',
        fontSize: 14,
    },
    title: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        lineHeight: 24,
    },
    categoryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    categoryContainer: {
        backgroundColor: '#000',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 4,
    },
    categoryText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    content: {
        color: '#14171a',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    actionsContainer: {
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#e1e8ed',
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 25,
        backgroundColor: '#000',
        minWidth: 50,
    },
});

export default NewsFeedScreen;