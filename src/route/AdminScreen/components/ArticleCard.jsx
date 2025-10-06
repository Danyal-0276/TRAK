import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Edit2, Trash2 } from 'lucide-react-native';

const ArticleCard = ({ article, onEdit, onDelete }) => {
  return (
    <View style={[styles.itemCard, article.status === 'pending' && styles.itemCardPending]}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{article.title}</Text>
        <Text style={styles.itemSubtitle}>By {article.author}</Text>
        <View style={styles.itemMeta}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{article.category}</Text>
          </View>
          <View style={[styles.statusBadge, article.status === 'published' ? styles.statusActive : styles.statusPending]}>
            <Text style={styles.statusText}>{article.status}</Text>
          </View>
          <Text style={styles.itemDate}>{article.date}</Text>
        </View>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(article)}>
          <Edit2 size={18} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => onDelete(article.id)}>
          <Trash2 size={18} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'space-between',
  },
  itemCardPending: {
    borderWidth: 2,
    borderColor: '#FF9800',
    backgroundColor: '#FFF8E1',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  statusActive: {
    backgroundColor: '#4CAF50',
  },
  statusPending: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  itemDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default ArticleCard;