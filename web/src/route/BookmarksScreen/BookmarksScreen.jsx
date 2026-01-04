import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewsCard } from '../../components/NewsCard';
import { mockApi } from '../../utils/Service/mockApi';

const BookmarksScreen = () => {
    const navigate = useNavigate();
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [votedItems, setVotedItems] = useState({});
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadBookmarks = async () => {
        try {
            setLoading(true);
            const response = await mockApi.getNewsFeed();
            // In a real app, you'd fetch bookmarked items from the API
            // For now, we'll show all items and let users bookmark them
            setNewsData(response.data);
            
            // Load saved bookmarks from localStorage or API
            const savedBookmarks = localStorage.getItem('bookmarks');
            if (savedBookmarks) {
                setBookmarkedItems(new Set(JSON.parse(savedBookmarks)));
            }
        } catch (error) {
            console.error('Error loading bookmarks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookmarks();
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
            // Save to localStorage
            localStorage.setItem('bookmarks', JSON.stringify(Array.from(newSet)));
            return newSet;
        });

        try {
            await mockApi.bookmarkArticle(itemId);
        } catch (error) {
            console.error('Error bookmarking:', error);
        }
    };

    // Filter to show only bookmarked items
    const bookmarkedNews = newsData.filter(item => bookmarkedItems.has(item.id));

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#ffffff',
            paddingTop: '0',
            marginTop: '0',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
                padding: '0 24px 24px 24px',
            }}>
                {/* Header Section */}
                <div style={{
                    marginTop: '0',
                    marginBottom: '24px',
                    paddingTop: '0',
                }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: '#0f172a',
                        margin: '0 0 8px 0',
                        paddingTop: '0',
                        letterSpacing: '-0.5px',
                    }}>
                        Bookmarks
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: '#64748b',
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        Your saved articles and stories
                    </p>
                </div>

                {/* News Cards Grid */}
                {loading ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '500px',
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            border: '3px solid #e5e7eb',
                            borderTop: '3px solid #0f172a',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                        }} />
                    </div>
                ) : bookmarkedNews.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#64748b',
                    }}>
                        <p style={{ fontSize: '16px', margin: 0 }}>No bookmarked articles yet.</p>
                        <p style={{ fontSize: '14px', margin: '8px 0 0 0', color: '#9ca3af' }}>
                            Start bookmarking articles to see them here.
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '24px',
                    }}>
                        {bookmarkedNews.map((item) => (
                            <NewsCard
                                key={item.id}
                                item={item}
                                onPress={() => handleArticlePress(item)}
                                votedItems={votedItems}
                                bookmarkedItems={bookmarkedItems}
                                onVote={handleVote}
                                onBookmark={handleBookmark}
                            />
                        ))}
                    </div>
                )}
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                h1 {
                    margin-top: 0 !important;
                    padding-top: 0 !important;
                }
            `}</style>
        </div>
    );
};

export default BookmarksScreen;

