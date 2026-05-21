import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewsCard } from '../../components/NewsCard';
import { mockApi } from '../../utils/Service/mockApi';
import { MasonryFeed, MasonryFeedSkeleton } from '../../components/MasonryFeed';
import { getSkeletonFeedProps } from '../../components/skeletons/SkeletonLayouts';
import AppPage, { PageHeader } from '../../components/layout/AppPage';

const TrendingScreen = () => {
  const navigate = useNavigate();
  const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
  const [votedItems, setVotedItems] = useState({});
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNews = async () => {
    try {
      setLoading(true);
      const response = await mockApi.getNewsFeed();
      setNewsData(response.data.filter((item) => item.trending));
    } catch (error) {
      console.error('Error loading trending news:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleArticlePress = (article) => {
    navigate(`/article/${article.id}`, { state: { article } });
  };

  const handleVote = async (itemId, type) => {
    const previousVote = votedItems[itemId];
    const newVote = previousVote === type ? null : type;
    setVotedItems((prev) => ({ ...prev, [itemId]: newVote }));
    try {
      await mockApi.voteArticle(itemId, newVote);
    } catch {
      setVotedItems((prev) => ({ ...prev, [itemId]: previousVote }));
    }
  };

  const handleBookmark = async (itemId) => {
    setBookmarkedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) newSet.delete(itemId);
      else newSet.add(itemId);
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
        title="Trending News"
        subtitle="Discover the most popular and trending stories right now"
      />
      {loading ? (
        <MasonryFeedSkeleton {...getSkeletonFeedProps()} />
      ) : newsData.length === 0 ? (
        <p style={{ color: 'var(--trak-ink3)', textAlign: 'center', padding: '48px 0' }}>
          No trending articles right now.
        </p>
      ) : (
        <MasonryFeed gap={18}>
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

export default TrendingScreen;
