import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewsCard } from '../../components/NewsCard';
import { mockApi } from '../../utils/Service/mockApi';
import { useTheme } from '../../theme/ThemeContext';
import { MasonryFeed, MasonryFeedSkeleton } from '../../components/MasonryFeed';
import { getSkeletonFeedProps } from '../../components/skeletons/SkeletonLayouts';
import AppPage, { PageHeader } from '../../components/layout/AppPage';

const RecentScreen = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [votedItems, setVotedItems] = useState({});
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadRecent = async () => {
        try {
            setLoading(true);
            const response = await mockApi.getNewsFeed();
            // Sort by time (most recent first) - in a real app, this would come from API
            const sortedNews = [...response.data].sort((a, b) => {
                // Parse time strings like "2h ago", "4h ago" to sort
                const getHours = (timeStr) => {
                    if (timeStr.includes('h')) {
                        return parseInt(timeStr) || 0;
                    }
                    if (timeStr.includes('d')) {
                        return parseInt(timeStr) * 24 || 0;
                    }
                    return 0;
                };
                return getHours(a.time || '0h') - getHours(b.time || '0h');
            });
            setNewsData(sortedNews);
        } catch (error) {
            console.error('Error loading recent news:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecent();
    }, []);

    const handleArticlePress = (article) => {
        navigate(`/article/${article.id}`, { state: { article } });
    };

    const handleVote = async (itemId, type) => {
        const previousVote = votedItems[itemId];
        const newVote = previousVote === type ? null : type;

        setVotedItems(prev => ({
            ...prev,
            [itemId]: newVote
        }));

        try {
            await mockApi.voteArticle(itemId, newVote);
        } catch (error) {
            setVotedItems(prev => ({
                ...prev,
                [itemId]: previousVote
            }));
        }
    };

    const handleBookmark = async (itemId) => {
        setBookmarkedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });

        try {
            await mockApi.bookmarkArticle(itemId);
        } catch (error) {
            console.error('Error bookmarking:', error);
        }
    };

    return (
        <AppPage>
            <PageHeader
                title="Recent Articles"
                subtitle="Latest articles sorted by publication time"
            />

                {/* News Cards Grid */}
                {loading ? (
                    <MasonryFeedSkeleton count={6} gap={24} {...getSkeletonFeedProps(theme.mode === 'dark', theme.colors)} />
                ) : (
                    <MasonryFeed gap={24}>
                        {newsData.map((item) => (
                            <NewsCard
                                key={item.id}
                                item={item}
                                layout="masonry"
                                onPress={() => handleArticlePress(item)}
                                votedItems={votedItems}
                                bookmarkedItems={bookmarkedItems}
                                onVote={handleVote}
                                onBookmark={handleBookmark}
                            />
                        ))}
                    </MasonryFeed>
                )}
        </AppPage>
    );
};

export default RecentScreen;

