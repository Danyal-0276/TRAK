import React from 'react';
import { Hash, Sparkles } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import ScrollChipRail from '../../../components/ui/ScrollChipRail';
import { cn } from '../../../lib/cn';

const TrendingTopics = ({ topics, onTopicPress, searchQuery }) => {
  if (searchQuery?.trim()) return null;
  if (!topics || topics.length === 0) return null;

  const ranked = topics.slice(0, 12);

  return (
    <ScrollChipRail
      title="Trending"
      hint="Search a topic"
      scrollStep={180}
      style={{ marginBottom: 28 }}
    >
      {ranked.map((topic, index) => {
        const isFeatured = index === 0;
        const count = topic.articleCount ?? topic.count;

        return (
          <Badge
            key={topic.id}
            as="button"
            type="button"
            variant={isFeatured ? 'accent' : 'outline'}
            className={cn('trak-badge--interactive')}
            onClick={() => onTopicPress(topic.name)}
          >
            {isFeatured ? (
              <Sparkles size={13} strokeWidth={2.25} style={{ opacity: 0.85 }} />
            ) : (
              <Hash size={12} strokeWidth={2.5} style={{ opacity: 0.45 }} />
            )}
            <span>{topic.name}</span>
            {typeof count === 'number' && count > 0 ? (
              <Badge variant="secondary" className="trak-badge-count">
                {count}
              </Badge>
            ) : null}
          </Badge>
        );
      })}
    </ScrollChipRail>
  );
};

export default TrendingTopics;
