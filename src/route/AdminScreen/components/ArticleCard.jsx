import React, { useState, memo } from 'react';
import { View, TouchableOpacity, StyleSheet, Linking, Pressable, Image } from 'react-native';
import { Eye, Trash2, Clock, Tag } from 'lucide-react-native';
import Text from '../../../components/ui/Text';
import ArticleInsightBadges, {
  ArticleCredibilityIndicator,
  ArticleCredibilitySourceDot,
  ArticleTopicKeywords,
} from './ArticleInsightBadges';
import { useAdminTheme } from '../useAdminTheme';

const HERO_HEIGHT = 168;

const ArticleCard = ({ article, onEdit, onDelete, onView, onReview, palette: paletteProp }) => {
  const { palette: themePalette } = useAdminTheme();
  const palette = paletteProp || themePalette;
  const [imageHidden, setImageHidden] = useState(false);
  const cardBg = palette.card;
  const border = palette.border;
  const textPrimary = palette.textPrimary;
  const textSecondary = palette.textSecondary;
  const textTertiary = palette.textTertiary;
  const avatarBg = palette.textPrimary;
  const avatarText = palette.textInverse;
  const isDark = palette.isDark;
  const sourceLabel = article.source || article.source_key || 'Source';
  const initials = String(sourceLabel).substring(0, 2).toUpperCase() || 'N';
  const summary = article.ai_summary || article.excerpt || article.description;

  const handleView = () => {
    if (onView) onView(article);
    else if (onEdit) onEdit(article);
    else if (article.canonical_url) Linking.openURL(article.canonical_url);
  };

  return (
    <Pressable
      onPress={() => onReview?.(article)}
      style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
    >
      {article.image_url && !imageHidden ? (
        <Image
          source={{ uri: article.image_url }}
          style={[styles.hero, { backgroundColor: palette.inputBg, height: HERO_HEIGHT }]}
          resizeMode="cover"
          onError={() => setImageHidden(true)}
        />
      ) : null}

      <View style={styles.topRow}>
        <View style={styles.sourceRow}>
          <View style={[styles.sourceAvatar, { backgroundColor: avatarBg }]}>
            <Text style={[styles.sourceInitials, { color: avatarText }]}>{initials}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.sourceNameRow}>
              <Text variant="body" color={textPrimary} style={{ fontWeight: '600', fontSize: 13 }}>
                {sourceLabel}
              </Text>
              <ArticleCredibilitySourceDot article={article} size={12} />
            </View>
            <View style={styles.timeRow}>
              <Clock size={10} color={textTertiary} />
              <Text variant="caption" color={textTertiary} style={{ marginLeft: 4, fontSize: 11 }}>
                {article.time || article.date || '—'}
              </Text>
            </View>
          </View>
        </View>
        <ArticleCredibilityIndicator article={article} />
      </View>

      {article.category ? (
        <View style={[styles.categoryPill, { backgroundColor: palette.pageAlt }]}>
          <Tag size={10} color={textSecondary} />
          <Text variant="caption" color={textSecondary} style={styles.categoryText}>
            {article.category}
          </Text>
        </View>
      ) : null}

      <ArticleInsightBadges article={article} palette={palette} />
      <ArticleTopicKeywords
        keywords={article.topic_keywords}
        textSecondary={textSecondary}
        isDark={isDark}
        borderColor={border}
      />

      <Text variant="body" color={textPrimary} style={styles.title} numberOfLines={3}>
        {article.title}
      </Text>

      {summary ? (
        <Text variant="caption" color={textSecondary} style={styles.excerpt} numberOfLines={2}>
          {summary}
        </Text>
      ) : null}

      <View style={[styles.footer, { borderTopColor: palette.borderLight }]}>
        <TouchableOpacity
          style={[styles.footerBtn, { borderColor: border, backgroundColor: palette.pageAlt }]}
          onPress={(e) => {
            e?.stopPropagation?.();
            handleView();
          }}
        >
          <Eye size={12} color={textPrimary} />
          <Text variant="caption" color={textPrimary} style={{ fontWeight: '600', marginLeft: 4 }}>
            View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.footerBtn, styles.deleteBtn, { borderColor: palette.error, backgroundColor: palette.errorBg }]}
          onPress={() => onDelete?.(article)}
        >
          <Trash2 size={12} color={palette.error} />
          <Text variant="caption" style={{ color: palette.error, fontWeight: '600', marginLeft: 4 }}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  hero: {
    width: '100%',
    borderRadius: 8,
    marginBottom: 12,
    marginTop: -4,
  },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  sourceNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  sourceAvatar: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sourceInitials: { fontSize: 12, fontWeight: '700' },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 10,
  },
  categoryText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontWeight: '600', lineHeight: 22, marginBottom: 8 },
  excerpt: { lineHeight: 18, marginBottom: 12 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    marginTop: 4,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  deleteBtn: { borderColor: '#ef4444' },
});

function articleCardPropsEqual(prev, next) {
  if (prev.article !== next.article) return false;
  if (prev.palette !== next.palette) return false;
  return (
    prev.onView === next.onView &&
    prev.onReview === next.onReview &&
    prev.onDelete === next.onDelete
  );
}

export default memo(ArticleCard, articleCardPropsEqual);
