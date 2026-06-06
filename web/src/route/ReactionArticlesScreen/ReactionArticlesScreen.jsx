import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { NewsCard } from '../../components/NewsCard';
import { MasonryFeed, MasonryFeedSkeleton } from '../../components/MasonryFeed';
import { getSkeletonFeedProps } from '../../components/skeletons/SkeletonLayouts';
import { useTheme } from '../../theme/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import {
  addBookmark,
  getUserArticleDetail,
  listReactions,
  removeBookmark,
  setReaction,
} from '../../utils/Service/api';
import { normalizeArticleForDetail } from '../../utils/articleNavigation';
import { getBookmarkIds, setBookmarkIds } from '../../utils/bookmarksStorage';
import { getReactionMap, mergeReactionRows, setReactionForArticle } from '../../utils/reactionsStorage';
import { mapApiItem } from '../../utils/loadFeed';
import { loadArticlesFromRows } from '../../utils/loadArticleRows';
import { patchArticleVoteRow, reactionApiValue } from '../../utils/reactionVote';

export default function ReactionArticlesScreen({ reaction = 'like' }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';
  const { isMobile } = useResponsive();
  const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
  const [votedItems, setVotedItems] = useState({});
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const title = reaction === 'dislike' ? 'Disliked articles' : 'Liked articles';
  const emptyLabel = reaction === 'dislike' ? 'No disliked articles yet' : 'No liked articles yet';

  const loadItems = async () => {
    try {
      setLoading(true);
      const cachedIds = getBookmarkIds();
      if (cachedIds.length) setBookmarkedItems(new Set(cachedIds.map(String)));
      setVotedItems(getReactionMap());
      const reactRes = await listReactions().catch(() => ({ results: [] }));
      const rows = (reactRes.results || []).filter((r) => String(r.reaction || '').toLowerCase() === reaction);
      setVotedItems(mergeReactionRows(reactRes.results || [], { replace: false }));
      const detailed = await loadArticlesFromRows(rows);
      setNewsData(detailed);
    } catch (error) {
      console.error('Error loading reaction articles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [reaction]);

  const handleArticlePress = async (article) => {
    const aid = String(article.id);
    try {
      const full = await getUserArticleDetail(aid);
      const mapped = normalizeArticleForDetail(mapApiItem(full));
      navigate(`/article/${encodeURIComponent(aid)}`, { state: { article: { ...mapped, id: aid } } });
    } catch {
      navigate(`/article/${encodeURIComponent(aid)}`, {
        state: { article: normalizeArticleForDetail({ ...article, id: aid }) },
      });
    }
  };

  const handleVote = (itemId, type) => {
    const id = String(itemId);
    const previousVote = votedItems[id] ?? null;
    const newVote = previousVote === type ? null : type;
    const targetReaction = reaction === 'like' ? 'up' : 'down';

    setVotedItems((prev) => ({ ...prev, [id]: newVote }));
    setReactionForArticle(id, newVote);
    setNewsData((prev) =>
      prev.map((n) => (String(n.id) !== id ? n : patchArticleVoteRow(n, previousVote, newVote)))
    );

    (async () => {
      try {
        const data = await setReaction(id, reactionApiValue(newVote));
        const likes = Number(data.like_count ?? 0);
        const dislikes = Number(data.dislike_count ?? 0);
        setNewsData((prev) => {
          let next = prev.map((n) =>
            String(n.id) !== id
              ? n
              : { ...n, like_count: likes, dislike_count: dislikes, upvotes: likes, userReaction: newVote }
          );
          if (newVote !== targetReaction) {
            next = next.filter((n) => String(n.id) !== id);
          }
          return next;
        });
        if (newVote !== targetReaction) {
          await loadItems();
        }
      } catch {
        setVotedItems((prev) => ({ ...prev, [id]: previousVote }));
        setReactionForArticle(id, previousVote || null);
        setNewsData((prev) =>
          prev.map((n) =>
            String(n.id) !== id ? n : patchArticleVoteRow(n, newVote, previousVote)
          )
        );
      }
    })();
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
    } catch {
      /* ignore */
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '0 16px 24px' : '0 24px 24px' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 0',
            border: 'none',
            background: 'transparent',
            color: colors.textSecondary,
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: 16,
          }}
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: colors.textPrimary, margin: '0 0 8px' }}>
          {title}
        </h1>
        <p style={{ fontSize: 14, color: colors.textSecondary, margin: '0 0 24px' }}>
          Articles you {reaction === 'dislike' ? 'disliked' : 'liked'} on TRAK.
        </p>
        {loading ? (
          <MasonryFeedSkeleton count={isMobile ? 4 : 6} gap={24} {...getSkeletonFeedProps(isDark, colors)} />
        ) : newsData.length === 0 ? (
          <p style={{ color: colors.textSecondary, fontSize: 14 }}>{emptyLabel}</p>
        ) : (
          <MasonryFeed gap={24}>
            {newsData.map((item) => (
              <NewsCard
                key={String(item.id)}
                item={item}
                onPress={() => handleArticlePress(item)}
                votedItems={votedItems}
                bookmarkedItems={bookmarkedItems}
                onVote={handleVote}
                onBookmark={handleBookmark}
                layout="masonry"
              />
            ))}
          </MasonryFeed>
        )}
      </div>
    </div>
  );
}
