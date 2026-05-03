import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewsCard } from '../../components/NewsCard';
import { addBookmark, getUserArticleDetail, listBookmarks, listReactions, removeBookmark, setReaction } from '../../utils/Service/api';
import { getBookmarkIds, setBookmarkIds } from '../../utils/bookmarksStorage';
import { getReactionMap, mergeReactionRows, setReactionForArticle } from '../../utils/reactionsStorage';

const BookmarksScreen = () => {
    const navigate = useNavigate();
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [votedItems, setVotedItems] = useState({});
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadBookmarks = async () => {
        try {
            setLoading(true);
            const cachedIds = getBookmarkIds();
            if (cachedIds.length) setBookmarkedItems(new Set(cachedIds));
            const cachedReactions = getReactionMap();
            if (Object.keys(cachedReactions).length) setVotedItems(cachedReactions);
            const [response, reactRes] = await Promise.all([
                listBookmarks(),
                listReactions().catch(() => ({ results: [] })),
            ]);
            const rows = response.results || [];
            const ids = new Set(rows.map((r) => String(r.article_id)));
            setBookmarkedItems(ids);
            setBookmarkIds(Array.from(ids));
            setVotedItems(mergeReactionRows(reactRes.results || []));
            const detailed = await Promise.all(
                rows.map(async (r) => {
                    try {
                        const full = await getUserArticleDetail(r.article_id);
                        return {
                            ...full,
                            id: full.id || r.article_id || r.id,
                            time: full.time || (r.created_at ? new Date(r.created_at).toLocaleString() : 'Recently'),
                            category: full.category || 'Saved',
                        };
                    } catch {
                        return {
                            id: r.article_id || r.id,
                            title: r.title || 'Saved article',
                            source: 'TRAK',
                            excerpt: '',
                            description: '',
                            content: '',
                            canonical_url: r.url || '',
                            category: 'Saved',
                            time: r.created_at ? new Date(r.created_at).toLocaleString() : 'Recently',
                            upvotes: 0,
                            votes: 0,
                        };
                    }
                })
            );
            setNewsData(detailed.filter(Boolean));
        } catch (error) {
            console.error('Error loading bookmarks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookmarks();
    }, []);

    const handleArticlePress = async (article) => {
        try {
            const full = await getUserArticleDetail(article.id);
            navigate(`/article/${article.id}`, { state: { article: full } });
        } catch {
            navigate(`/article/${article.id}`, { state: { article } });
        }
    };

    const handleVote = async (itemId, type) => {
        const id = String(itemId);
        const previousVote = votedItems[id];
        const newVote = previousVote === type ? null : type;

        setVotedItems(prev => ({
            ...prev,
            [id]: newVote
        }));
        setReactionForArticle(id, newVote);

        try {
            await setReaction(id, newVote === 'up' ? 'like' : newVote === 'down' ? 'dislike' : 'none');
        } catch (error) {
            setVotedItems(prev => ({
                ...prev,
                [id]: previousVote
            }));
            setReactionForArticle(id, previousVote || null);
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
            setBookmarkIds(Array.from(newSet));
            return newSet;
        });

        try {
            const exists = bookmarkedItems.has(itemId) || bookmarkedItems.has(String(itemId));
            const item = newsData.find((n) => String(n.id) === String(itemId));
            if (exists) await removeBookmark(itemId);
            else await addBookmark(itemId, item?.title || '', item?.canonical_url || item?.url || '');
            await loadBookmarks();
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

