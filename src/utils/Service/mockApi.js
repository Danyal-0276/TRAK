// ============================================
// FILE: utils/Service/mockApi.js
// ============================================

// Mock data for trending topics
const mockTrendingTopics = [
    { id: 1, name: "AI Revolution", count: "2.5k posts", icon: "🤖", trending: true },
    { id: 2, name: "Climate Action", count: "1.8k posts", icon: "🌍", trending: true },
    { id: 3, name: "Space Exploration", count: "980 posts", icon: "🚀", trending: false },
    { id: 4, name: "Tech Startups", count: "1.2k posts", icon: "💡", trending: false },
    { id: 5, name: "Sports Highlights", count: "3.1k posts", icon: "⚽", trending: true },
    { id: 6, name: "Breaking News", count: "4.2k posts", icon: "📰", trending: true },
    { id: 7, name: "Wildlife Conservation", count: "750 posts", icon: "🐾", trending: false },
];

// Mock data for recent searches
let mockRecentSearches = [
    { id: 1, query: "Electric vehicles", time: "2h ago", icon: "⚡", timestamp: Date.now() - 7200000 },
    { id: 2, query: "Climate summit", time: "5h ago", icon: "🌱", timestamp: Date.now() - 18000000 },
    { id: 3, query: "NBA playoffs", time: "1d ago", icon: "🏀", timestamp: Date.now() - 86400000 },
];

// Helper functions
const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
};

const getIconForQuery = (query) => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('sport') || lowerQuery.includes('nba') || lowerQuery.includes('cricket')) return '⚽';
    if (lowerQuery.includes('tech') || lowerQuery.includes('ai') || lowerQuery.includes('quantum')) return '💻';
    if (lowerQuery.includes('climate') || lowerQuery.includes('environment')) return '🌱';
    if (lowerQuery.includes('electric') || lowerQuery.includes('vehicle')) return '⚡';
    if (lowerQuery.includes('space') || lowerQuery.includes('rocket')) return '🚀';
    if (lowerQuery.includes('business') || lowerQuery.includes('market')) return '📈';
    if (lowerQuery.includes('wildlife') || lowerQuery.includes('animal')) return '🐾';
    return '🔍';
};

const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

const getNewsFeed = async (category = 'all', page = 1) => {
    await delay();

    const allNews = [
        {
            id: 1,
            source: 'BBC News',
            time: '2h ago',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            title: 'Pakistan Clinches Dramatic Victory in T20 Thriller Against Australia',
            excerpt: 'In a nail-biting finish at the Melbourne Cricket Ground, Pakistan secured a last-ball victory with exceptional performances from both batting and bowling units.',
            content: 'Pakistan secured a thrilling last-ball victory against Australia in the T20 international match. Babar Azam\'s masterclass innings of 87* off 52 balls guided Pakistan to a challenging total of 189/4.',
            fullContent: `Pakistan pulled off a stunning last-ball victory against Australia in a thrilling T20 international match at the Melbourne Cricket Ground. The match, which kept fans on the edge of their seats until the final delivery, showcased exceptional cricket from both teams.

Batting first, Pakistan posted a competitive total of 189/4 in their 20 overs, thanks to a masterclass innings from captain Babar Azam. The right-hander remained unbeaten on 87 off just 52 deliveries, an innings studded with 8 fours and 4 sixes. His partnership of 112 runs with Mohammad Rizwan (45 off 31) for the second wicket laid the foundation for Pakistan's formidable total.

Australia's chase got off to a shaky start as they lost both openers within the powerplay. However, a counter-attacking 73 off 41 balls from Glenn Maxwell and a composed 56 from Marcus Stoinis brought Australia back into the contest. The match went down to the wire, with Australia needing 12 runs off the final over.

Pakistan's death bowling specialist Haris Rauf held his nerve in the final over, conceding just 11 runs and picking up the crucial wicket of Stoinis on the penultimate delivery. Australia fell agonizingly short by just one run, ending on 188/7.

This victory marks Pakistan's third consecutive win in the T20 series and puts them in a commanding position with a 3-1 lead. The final match of the five-match series will be played in Sydney next week.`,
            categories: ['Sports', 'Cricket', 'International'],
            category: 'Sports',
            verified: true,
            trending: true,
            votes: 1247,
            readTime: 5,
        },
        {
            id: 2,
            source: 'TechCrunch',
            time: '4h ago',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            title: 'Revolutionary Quantum Computing Breakthrough Achieved by Tech Giants',
            excerpt: 'Scientists announce a major milestone in quantum computing that could transform encryption, drug discovery, and artificial intelligence within the next decade.',
            content: 'A consortium of tech giants including Google, IBM, and Microsoft have announced a groundbreaking achievement in quantum computing with 1000+ stable qubits.',
            fullContent: `A consortium of leading technology companies including Google, IBM, and Microsoft has announced a groundbreaking achievement in quantum computing that researchers are calling the most significant breakthrough in the field to date.

The collaborative project has successfully created a quantum computer with over 1,000 stable qubits, shattering the previous record of 433 qubits. More importantly, the system maintains quantum coherence for an unprecedented 10 minutes, solving one of the field's most persistent challenges.

Dr. Sarah Chen, lead researcher at Google's Quantum AI lab, explained: "This isn't just about having more qubits. We've fundamentally solved the error correction problem that has plagued quantum computing for decades. Our system can now perform complex calculations that would take classical supercomputers thousands of years to complete."`,
            categories: ['Technology', 'Science', 'Innovation'],
            category: 'Technology',
            verified: true,
            trending: true,
            votes: 2341,
            readTime: 7,
        },
        {
            id: 3,
            source: 'The Guardian',
            time: '6h ago',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
            title: 'Historic Climate Agreement: 195 Nations Commit to Net-Zero by 2045',
            excerpt: 'World leaders unite in Geneva to sign the most ambitious climate accord in history, with binding commitments and unprecedented funding for green technology.',
            content: 'In a historic moment at the Geneva Climate Summit, 195 nations have unanimously agreed to achieve net-zero carbon emissions by 2045.',
            fullContent: `In an unprecedented display of global cooperation, 195 nations have signed the Geneva Climate Accord, the most ambitious and binding climate agreement in human history.`,
            categories: ['Environment', 'Politics', 'Global'],
            category: 'Environment',
            verified: true,
            trending: false,
            votes: 3128,
            readTime: 8,
        },
        {
            id: 4,
            source: 'Financial Times',
            time: '8h ago',
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
            title: 'Global Markets Rally as Economic Indicators Show Strong Recovery',
            excerpt: 'Stock markets worldwide hit record highs as manufacturing data and employment figures exceed expectations.',
            content: 'Global financial markets experienced significant gains today. The S&P 500 rose 2.3%.',
            fullContent: `Global financial markets experienced a dramatic surge today.`,
            categories: ['Business', 'Finance', 'Economy'],
            category: 'Business',
            verified: true,
            trending: true,
            votes: 892,
            readTime: 6,
        },
        {
            id: 5,
            source: 'National Geographic',
            time: '10h ago',
            timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
            title: 'Rare Snow Leopards Spotted in Record Numbers Across Himalayas',
            excerpt: 'Conservation efforts pay off as camera traps reveal a 40% increase in snow leopard populations.',
            content: 'Wildlife conservationists celebrate a remarkable achievement.',
            fullContent: `Wildlife conservationists are celebrating a remarkable achievement.`,
            categories: ['Wildlife', 'Conservation', 'Nature'],
            category: 'Wildlife',
            verified: true,
            trending: false,
            votes: 1567,
            readTime: 5,
        },
    ];

    return {
        data: allNews,
        page,
        totalPages: 3,
        hasMore: page < 3,
    };
};

const voteArticle = async (articleId, voteType) => {
    await delay(300);
    return { success: true, articleId, voteType };
};

const bookmarkArticle = async (articleId) => {
    await delay(300);
    return { success: true, articleId };
};

const getTrendingTopics = async () => {
    await delay(300);
    return { success: true, data: mockTrendingTopics };
};

const getRecentSearches = async () => {
    await delay(200);
    const updatedSearches = mockRecentSearches.map(search => ({
        ...search,
        time: formatTimeAgo(search.timestamp)
    }));
    return { success: true, data: updatedSearches };
};

const addRecentSearch = async (query) => {
    await delay(100);
    mockRecentSearches = mockRecentSearches.filter(
        s => s.query.toLowerCase() !== query.toLowerCase()
    );
    const newSearch = {
        id: Date.now(),
        query: query,
        time: "Just now",
        icon: getIconForQuery(query),
        timestamp: Date.now()
    };
    mockRecentSearches.unshift(newSearch);
    if (mockRecentSearches.length > 5) {
        mockRecentSearches = mockRecentSearches.slice(0, 5);
    }
    return { success: true, data: newSearch };
};

const deleteRecentSearch = async (searchId) => {
    await delay(100);
    mockRecentSearches = mockRecentSearches.filter(s => s.id !== searchId);
    return { success: true, data: { id: searchId } };
};

// Export as named export AND default export
export const mockApi = {
    delay,
    getNewsFeed,
    voteArticle,
    bookmarkArticle,
    getTrendingTopics,
    getRecentSearches,
    addRecentSearch,
    deleteRecentSearch,
};

// Also export as default for compatibility
export default mockApi;