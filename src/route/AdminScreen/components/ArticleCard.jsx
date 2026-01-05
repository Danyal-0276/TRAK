import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Edit2, Trash2, FileText } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';

const ArticleCard = ({ article, onEdit, onDelete }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const isPublished = article.status === 'published';

  return (
    <View style={[styles.itemCard, {
      backgroundColor: colors.surface,
      borderColor: isPublished ? colors.border : colors.primary,
      borderWidth: isPublished ? 1 : 2,
    }]}>
      <View style={styles.itemInfo}>
        <View style={styles.itemHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <FileText size={20} color={colors.primary} />
          </View>
          <View style={styles.itemTitleContainer}>
            <Text variant="body" color={colors.textPrimary} style={styles.itemTitle}>
              {article.title}
            </Text>
            <Text variant="caption" color={colors.textSecondary} style={styles.itemSubtitle}>
              By {article.author}
            </Text>
          </View>
        </View>
        <View style={styles.itemMeta}>
          <View style={[styles.categoryBadge, { backgroundColor: `${colors.primary}10` }]}>
            <Text variant="caption" style={[styles.categoryText, { color: colors.primary }]}>
              {article.category}
            </Text>
          </View>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: isPublished ? `${colors.primary}20` : `${colors.error}20` }
          ]}>
            <View style={[
              styles.statusDot,
              { backgroundColor: isPublished ? colors.primary : colors.error }
            ]} />
            <Text variant="caption" style={[
              styles.statusText,
              { color: isPublished ? colors.primary : colors.error }
            ]}>
              {article.status}
            </Text>
          </View>
          <Text variant="caption" color={colors.textTertiary} style={styles.itemDate}>
            {article.date}
          </Text>
        </View>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: `${colors.primary}15` }]} 
          onPress={() => onEdit(article)}
          activeOpacity={0.7}
        >
          <Edit2 size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: `${colors.error}15` }]} 
          onPress={() => onDelete(article.id)}
          activeOpacity={0.7}
        >
          <Trash2 size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemTitleContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  itemDate: {
    fontSize: 12,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ArticleCard;