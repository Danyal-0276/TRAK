import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewsCard } from '../../components/NewsCard';
import { getUserArticleDetail, listBookmarks, listReactions, setReaction } from '../../utils/Service/api';
import { mapApiItem } from '../../utils/loadFeed';
import { normalizeArticleForDetail } from '../../utils/articleNavigation';
import { getBookmarkIds, setBookmarkIds } from '../../utils/bookmarksStorage';
import { getReactionMap, mergeReactionRows, setReactionForArticle } from '../../utils/reactionsStorage';
import { useTheme } from '../../theme/ThemeContext';
import { MasonryFeed, MasonryFeedSkeleton } from '../../components/MasonryFeed';
import { getSkeletonFeedProps } from '../../components/skeletons/SkeletonLayouts';
import { patchArticleVoteRow } from '../../utils/reactionVote';
import {
    subscribeArticleInteractionChange,
    applyArticleInteractionPatch,
    applyBookmarkListPatch,
} from '../../utils/articleInteractionEvents';
import {
    toggleVoteRegistered,
    scheduleVotePersist,
    seedVoteRegistry,
    setRegisteredVote,
} from '../../utils/articleVoteController';
import {
    applyOptimisticBookmarkToggle,
    queueBookmarkApi,
    rollbackBookmarkToggle,
} from '../../utils/articleBookmarkController';

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
            const reactionMap = mergeReactionRows(reactRes.results || [], { replace: false });
            setVotedItems(reactionMap);
            seedVoteRegistry(reactionMap);
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

    useEffect(() => {
        return subscribeArticleInteractionChange((patch) => {
            applyArticleInteractionPatch(patch, {
                setVotedItems,
                setBookmarkedItems,
                onArticlesPatch: setNewsData,
            });
            applyBookmarkListPatch(patch, {
                setBookmarkedItems,
                removeFromNewsData: (id) => {
                    setNewsData((prev) => prev.filter((n) => String(n.id) !== String(id)));
                },
            });
            if (patch.userReaction !== undefined) {
                setRegisteredVote(patch.articleId, patch.userReaction);
            }
            if (patch.isBookmarked && patch.article) {
                setNewsData((prev) => {
                    const id = String(patch.articleId);
                    if (prev.some((n) => String(n.id) === id)) return prev;
                    return [patch.article, ...prev];
                });
            }
        });
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

    const handleVote = (itemId, type) => {
        const id = String(itemId);
        const { previousVote, newVote } = toggleVoteRegistered(id, type);
        const articleRow = newsData.find((n) => String(n.id) === id) || {};
        const optimistic = patchArticleVoteRow(articleRow, previousVote, newVote);

        setVotedItems((prev) => ({ ...prev, [id]: newVote }));
        setReactionForArticle(id, newVote);
        setNewsData((prev) =>
            prev.map((n) => (String(n.id) !== id ? n : optimistic))
        );

        scheduleVotePersist(id, {
            persist: (articleId, apiValue) => setReaction(articleId, apiValue),
            onReconcile: (data, vote) => {
                const likes = Number(data.like_count ?? 0);
                const dislikes = Number(data.dislike_count ?? 0);
                setNewsData((prev) =>
                    prev.map((n) =>
                        String(n.id) !== id
                            ? n
                            : { ...n, like_count: likes, dislike_count: dislikes, upvotes: likes, userReaction: vote }
                    )
                );
            },
            onRollback: () => {
                setRegisteredVote(id, previousVote);
                setVotedItems((prev) => ({ ...prev, [id]: previousVote }));
                setReactionForArticle(id, previousVote || null);
                setNewsData((prev) =>
                    prev.map((n) => (String(n.id) !== id ? n : patchArticleVoteRow(optimistic, newVote, previousVote)))
                );
            },
        });
    };

    const handleBookmark = (itemId) => {
        const id = String(itemId);
        const article = newsData.find((n) => String(n.id) === id);
        const { wasBookmarked } = applyOptimisticBookmarkToggle({
            articleId: id,
            article,
            setBookmarkedItems,
            setNewsData,
            removeFromListOnUnbookmark: true,
        });

        queueBookmarkApi(id, wasBookmarked ? 'remove' : 'add', article).catch((error) => {
            console.error('Error bookmarking:', error);
            rollbackBookmarkToggle({
                articleId: id,
                wasBookmarked,
                article,
                setBookmarkedItems,
                setNewsData,
            });
        });
    };

    const bookmarkedNews = newsData.filter((item) => bookmarkedItems.has(String(item.id)));

    const pageBg = colors.background;
    const headingColor = colors.textPrimary;
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
