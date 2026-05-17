import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewsCard } from '../../components/NewsCard';
import { addBookmark, getUserArticleDetail, listBookmarks, listReactions, removeBookmark, setReaction } from '../../utils/Service/api';
import { mapApiItem } from '../../utils/loadFeed';
import { normalizeArticleForDetail } from '../../utils/articleNavigation';
import { getBookmarkIds, setBookmarkIds } from '../../utils/bookmarksStorage';
import { getReactionMap, mergeReactionRows, setReactionForArticle } from '../../utils/reactionsStorage';
import { useTheme } from '../../theme/ThemeContext';
import { MasonryFeed, MasonryFeedSkeleton } from '../../components/MasonryFeed';
import { getSkeletonFeedProps } from '../../components/skeletons/SkeletonLayouts';

const BookmarksScreen = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme.mode === 'dark';
    const { colors } = theme;
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [votedItems, setVotedItems] = useState({});
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadBookmarks = async () => {
        try {
            setLoading(true);
            const cachedIds = getBookmarkIds();
            if (cachedIds.length) setBookmarkedItems(new Set(cachedIds.map(String)));
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
            setVotedItems(mergeReactionRows(reactRes.results || [], { replace: false }));
            const detailed = await Promise.all(
                rows.map(async (r) => {
                    const aid = String(r.article_id ?? '').trim();
                    try {
                        const full = await getUserArticleDetail(aid);
                        const likes = Number(full.like_count ?? full.upvotes ?? 0);
                        const dislikes = Number(full.dislike_count ?? 0);
                        return {
                            ...full,
                            id: aid,
                            description: full.excerpt || full.summary || '',
                            excerpt: full.excerpt || full.summary || '',
                            content: full.content || full.full_content || '',
                            fullContent: full.full_content || full.content || '',
                            category: full.topic_keywords?.[0] || 'Saved',
                            time: full.published_at ? new Date(full.published_at).toLocaleString() : (r.created_at ? new Date(r.created_at).toLocaleString() : 'Recently'),
                            like_count: likes,
                            dislike_count: dislikes,
                            upvotes: likes,
                            verified: full.credibility?.label === 'real',
                            trending: Boolean(full.topic_keywords?.length),
                        };
                    } catch {
                        return {
                            id: aid,
                            title: r.title || 'Saved article',
                            source: 'TRAK',
                            excerpt: '',
                            description: '',
                            content: '',
                            canonical_url: r.url || '',
                            category: 'Saved',
                            time: r.created_at ? new Date(r.created_at).toLocaleString() : 'Recently',
                            like_count: 0,
                            dislike_count: 0,
                            upvotes: 0,
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
        const aid = String(article.id);
        try {
            const full = await getUserArticleDetail(aid);
            const mapped = normalizeArticleForDetail(mapApiItem(full));
            navigate(`/article/${encodeURIComponent(aid)}`, { state: { article: { ...mapped, id: aid } } });
        } catch {
            navigate(`/article/${encodeURIComponent(aid)}`, { state: { article: normalizeArticleForDetail({ ...article, id: aid }) } });
        }
    };

    const handleVote = async (itemId, type) => {
        const id = String(itemId);
        const previousVote = votedItems[id];
        const newVote = previousVote === type ? null : type;

        setVotedItems((prev) => ({
            ...prev,
            [id]: newVote,
        }));
        setReactionForArticle(id, newVote);

        try {
            const data = await setReaction(
                id,
                newVote === 'up' ? 'like' : newVote === 'down' ? 'dislike' : 'none'
            );
            const likes = Number(data.like_count ?? 0);
            const dislikes = Number(data.dislike_count ?? 0);
            setNewsData((prev) =>
                prev.map((n) =>
                    String(n.id) !== id ? n : { ...n, like_count: likes, dislike_count: dislikes, upvotes: likes }
                )
            );
        } catch (error) {
            setVotedItems((prev) => ({
                ...prev,
                [id]: previousVote,
            }));
            setReactionForArticle(id, previousVote || null);
        }
    };

    const handleBookmark = async (itemId) => {
        const id = String(itemId);
        const wasBookmarked = bookmarkedItems.has(id);

        setBookmarkedItems((prev) => {
            const next = new Set([...prev].map(String));
            if (next.has(id)) next.delete(id);
            else next.add(id);
            setBookmarkIds(Array.from(next));
            return next;
        });

        try {
            const item = newsData.find((n) => String(n.id) === id);
            if (wasBookmarked) await removeBookmark(id);
            else await addBookmark(id, item?.title || '', item?.canonical_url || item?.url || '');
            await loadBookmarks();
        } catch (error) {
            console.error('Error bookmarking:', error);
            await loadBookmarks();
        }
    };

    const bookmarkedNews = newsData.filter((item) => bookmarkedItems.has(String(item.id)));

    const pageBg = isDark ? colors.background || '#0F172A' : '#ffffff';
    const headingColor = isDark ? colors.textPrimary || '#F1F5F9' : '#0f172a';
    const subColor = isDark ? colors.textSecondary || '#94a3b8' : '#64748b';

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: pageBg,
            paddingTop: '0',
            marginTop: '0',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
                padding: '0 24px 24px 24px',
            }}>
                <div style={{
                    marginTop: '0',
                    marginBottom: '24px',
                    paddingTop: '0',
                }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: headingColor,
                        margin: '0 0 8px 0',
                        paddingTop: '0',
                        letterSpacing: '-0.5px',
                    }}>
                        Bookmarks
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: subColor,
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        Your saved articles and stories
                    </p>
                </div>

                {loading ? (
                    <MasonryFeedSkeleton count={6} gap={24} {...getSkeletonFeedProps(isDark, colors)} />
                ) : bookmarkedNews.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: subColor,
                    }}>
                        <p style={{ fontSize: '16px', margin: 0 }}>No bookmarked articles yet.</p>
                        <p style={{ fontSize: '14px', margin: '8px 0 0 0', color: subColor }}>
                            Start bookmarking articles to see them here.
                        </p>
                    </div>
                ) : (
                    <MasonryFeed gap={24}>
                        {bookmarkedNews.map((item) => (
                            <NewsCard
                                key={String(item.id)}
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
            </div>
            <style>{`
                h1 {
                    margin-top: 0 !important;
                    padding-top: 0 !important;
                }
            `}</style>
        </div>
    );
};

export default BookmarksScreen;
