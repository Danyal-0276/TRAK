// Mock API for web version
const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

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

let mockRecentSearches = [
    { id: 1, query: "Electric vehicles", time: "2h ago", icon: "⚡", timestamp: Date.now() - 7200000 },
    { id: 2, query: "Climate summit", time: "5h ago", icon: "🌱", timestamp: Date.now() - 18000000 },
    { id: 3, query: "NBA playoffs", time: "1d ago", icon: "🏀", timestamp: Date.now() - 86400000 },
];

const mockTrendingTopics = [
    { id: 1, name: "AI Revolution", count: "2.5k posts", icon: "🤖", trending: true },
    { id: 2, name: "Climate Action", count: "1.8k posts", icon: "🌍", trending: true },
    { id: 3, name: "Space Exploration", count: "980 posts", icon: "🚀", trending: false },
    { id: 4, name: "Tech Startups", count: "1.2k posts", icon: "💡", trending: false },
    { id: 5, name: "Sports Highlights", count: "3.1k posts", icon: "⚽", trending: true },
    { id: 6, name: "Breaking News", count: "4.2k posts", icon: "📰", trending: true },
];

// Generate random news items
const generateRandomNews = () => {
    const categories = ['Technology', 'Business', 'Sports', 'Science', 'Health', 'Entertainment', 'Politics', 'Environment'];
    const sources = ['Tech News', 'Finance Daily', 'Sports Central', 'Science Today', 'Health Weekly', 'Entertainment Hub', 'Politics Now', 'Eco News', 'Global Times', 'News Network', 'Daily Report', 'World News', 'Breaking News', 'News Today', 'Latest Updates'];
    const timeOptions = ['1h ago', '2h ago', '3h ago', '4h ago', '5h ago', '6h ago', '8h ago', '10h ago', '12h ago', '1d ago', '2d ago'];
    
    const newsTemplates = [
        { title: 'Revolutionary AI System Breaks New Ground', category: 'Technology', trending: true },
        { title: 'Stock Market Reaches All-Time High', category: 'Business', trending: false },
        { title: 'Championship Game Breaks Viewership Records', category: 'Sports', trending: true },
        { title: 'Scientists Discover New Exoplanet', category: 'Science', trending: true },
        { title: 'Breakthrough in Cancer Treatment Research', category: 'Health', trending: false },
        { title: 'Award-Winning Film Premieres Worldwide', category: 'Entertainment', trending: false },
        { title: 'New Policy Changes Economic Landscape', category: 'Politics', trending: true },
        { title: 'Renewable Energy Milestone Achieved', category: 'Environment', trending: true },
        { title: 'Quantum Computing Advances to Next Level', category: 'Technology', trending: true },
        { title: 'Major Corporation Announces Expansion', category: 'Business', trending: false },
        { title: 'Olympic Athlete Sets New World Record', category: 'Sports', trending: true },
        { title: 'Space Mission Discovers Water on Mars', category: 'Science', trending: true },
        { title: 'New Vaccine Shows Promising Results', category: 'Health', trending: false },
        { title: 'Music Festival Draws Record Crowds', category: 'Entertainment', trending: false },
        { title: 'International Summit Addresses Climate', category: 'Politics', trending: true },
        { title: 'Wildlife Conservation Program Succeeds', category: 'Environment', trending: false },
        { title: '5G Network Expansion Accelerates', category: 'Technology', trending: false },
        { title: 'Startup Raises Record Funding Round', category: 'Business', trending: true },
        { title: 'World Cup Qualifiers Begin This Week', category: 'Sports', trending: true },
        { title: 'Breakthrough in Genetic Research', category: 'Science', trending: false },
        { title: 'Mental Health Awareness Campaign Launches', category: 'Health', trending: true },
        { title: 'Streaming Service Launches Original Series', category: 'Entertainment', trending: false },
        { title: 'Election Results Shape Future Policy', category: 'Politics', trending: true },
        { title: 'Ocean Cleanup Initiative Makes Progress', category: 'Environment', trending: false },
        { title: 'Cybersecurity Firm Prevents Major Attack', category: 'Technology', trending: true },
        { title: 'Global Trade Agreement Reached', category: 'Business', trending: true },
        { title: 'Tennis Grand Slam Tournament Begins', category: 'Sports', trending: false },
        { title: 'Astronomers Observe Rare Cosmic Event', category: 'Science', trending: true },
        { title: 'New Medical Device Approved', category: 'Health', trending: false },
        { title: 'Film Industry Celebrates Annual Awards', category: 'Entertainment', trending: true },
        { title: 'Diplomatic Talks Resume After Breakthrough', category: 'Politics', trending: true },
        { title: 'Solar Power Plant Sets Generation Record', category: 'Environment', trending: false },
        { title: 'Virtual Reality Technology Evolves', category: 'Technology', trending: false },
        { title: 'Banking Sector Reports Strong Growth', category: 'Business', trending: false },
        { title: 'Soccer League Announces New Season', category: 'Sports', trending: true },
        { title: 'Particle Physics Experiment Yields Results', category: 'Science', trending: false },
        { title: 'Public Health Initiative Reaches Milestone', category: 'Health', trending: true },
        { title: 'Gaming Industry Breaks Revenue Records', category: 'Entertainment', trending: true },
        { title: 'Legislative Reform Passes Key Vote', category: 'Politics', trending: false },
        { title: 'Reforestation Project Restores Ecosystem', category: 'Environment', trending: true },
        { title: 'Blockchain Technology Gains Adoption', category: 'Technology', trending: true },
        { title: 'E-commerce Platform Expands Globally', category: 'Business', trending: false },
        { title: 'Basketball Championship Series Continues', category: 'Sports', trending: true },
        { title: 'Medical Research Team Makes Discovery', category: 'Science', trending: false },
        { title: 'Telemedicine Services Expand Access', category: 'Health', trending: true },
        { title: 'Streaming Platform Adds New Features', category: 'Entertainment', trending: false },
        { title: 'International Relations Improve', category: 'Politics', trending: true },
        { title: 'Carbon Capture Technology Advances', category: 'Environment', trending: false },
        { title: 'Robotics Innovation Transforms Industry', category: 'Technology', trending: true },
        { title: 'Investment Firm Opens New Markets', category: 'Business', trending: false },
        { title: 'Athletics Competition Sets New Standards', category: 'Sports', trending: false },
    ];

    return newsTemplates.map((template, index) => {
        const randomSource = sources[Math.floor(Math.random() * sources.length)];
        const randomTime = timeOptions[Math.floor(Math.random() * timeOptions.length)];
        const randomVotes = Math.floor(Math.random() * 2000) + 50;
        const randomReadTime = Math.floor(Math.random() * 8) + 3;
        const isTrending = template.trending || Math.random() > 0.6;
        const isVerified = Math.random() > 0.4;

        return {
            id: index + 4, // Start from 4 since we have 3 existing items
            title: template.title,
            excerpt: `Latest developments in ${template.category.toLowerCase()} continue to shape the industry and impact global markets.`,
            description: `This article covers the latest news and updates regarding ${template.title.toLowerCase()}. Stay informed with comprehensive coverage and expert analysis.`,
            source: randomSource,
            time: randomTime,
            readTime: randomReadTime,
            category: template.category,
            upvotes: randomVotes,
            votes: randomVotes,
            trending: isTrending,
            verified: isVerified,
            fullContent: `${template.title}. This is a detailed article covering all aspects of this important development. The story continues with in-depth analysis and expert opinions from industry leaders.`,
        };
    });
};

export const mockApi = {
    getNewsFeed: async () => {
        await delay(1000);
        const baseNews = [
            {
                id: 1,
                title: 'Breaking: Major Technology Breakthrough Announced',
                excerpt: 'Scientists have made a significant discovery that could change the way we understand technology.',
                description: 'Scientists have made a significant discovery that could change the way we understand technology. This breakthrough represents years of research and collaboration.',
                source: 'Tech News',
                time: '2h ago',
                readTime: 5,
                category: 'Technology',
                upvotes: 124,
                votes: 124,
                trending: true,
                verified: true,
                fullContent: 'Scientists have made a significant discovery that could change the way we understand technology. This breakthrough represents years of research and collaboration.',
            },
            {
                id: 2,
                title: 'Global Markets React to Economic News',
                excerpt: 'Financial markets worldwide are responding to the latest economic indicators and policy changes.',
                description: 'Financial markets worldwide are responding to the latest economic indicators and policy changes. Analysts are watching closely.',
                source: 'Finance Daily',
                time: '4h ago',
                readTime: 7,
                category: 'Business',
                upvotes: 89,
                votes: 89,
                trending: false,
                verified: false,
                fullContent: 'Financial markets worldwide are responding to the latest economic indicators and policy changes. Analysts are watching closely.',
            },
            {
                id: 3,
                title: 'Sports Championship Finals This Weekend',
                excerpt: 'The highly anticipated championship match is set to take place this weekend with record attendance expected.',
                description: 'The highly anticipated championship match is set to take place this weekend with record attendance expected.',
                source: 'Sports Central',
                time: '6h ago',
                readTime: 4,
                category: 'Sports',
                upvotes: 256,
                votes: 256,
                trending: true,
                verified: true,
                fullContent: 'The highly anticipated championship match is set to take place this weekend with record attendance expected.',
            },
        ];
        
        const randomNews = generateRandomNews();
        return {
            data: [...baseNews, ...randomNews]
        };
    },
    voteArticle: async (itemId, voteType) => {
        await delay(300);
        return { success: true };
    },
    bookmarkArticle: async (itemId) => {
        await delay(300);
        return { success: true };
    },
    getTrendingTopics: async () => {
        await delay(300);
        return { success: true, data: mockTrendingTopics };
    },
    getRecentSearches: async () => {
        await delay(200);
        const updatedSearches = mockRecentSearches.map(search => ({
            ...search,
            time: formatTimeAgo(search.timestamp)
        }));
        return { success: true, data: updatedSearches };
    },
    addRecentSearch: async (query) => {
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
    },
    deleteRecentSearch: async (searchId) => {
        await delay(100);
        mockRecentSearches = mockRecentSearches.filter(s => s.id !== searchId);
        return { success: true, data: { id: searchId } };
    },
};

export default mockApi;

