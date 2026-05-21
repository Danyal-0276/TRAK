import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewsCard } from '../../components/NewsCard';
import { addBookmark, listBookmarks, listReactions, removeBookmark, setReaction } from '../../utils/Service/api';
import { bookmarkRowToCard } from '../../utils/bookmarkCardMapper';
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
            setNewsData(rows.map(bookmarkRowToCard));
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

    const pageBg = colors.background;
    const headingColor = colors.textPrimary;
    const subColor = colors.textSecondary;

    return (
        <div className="trak-app-page" style={{ backgroundColor: pageBg }}>
            <div className="trak-app-page-inner">
                <header className="trak-page-header">
                    <h1 className="trak-pg-title" style={{ color: headingColor }}>Bookmarks</h1>
                    <p className="trak-pg-sub" style={{ color: subColor }}>Your saved articles and stories</p>
                </header>

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
