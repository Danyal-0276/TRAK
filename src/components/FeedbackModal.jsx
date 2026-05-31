import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { filledActionColors } from '../theme/buttonContrast';
import { FEEDBACK_CATEGORIES } from '../constants/feedbackCategories';
import { submitUserFeedback } from '../api/newsApi';
import { useFeedback } from './ui/FeedbackProvider';

export default function FeedbackModal({
  visible,
  onClose,
  item = null,
  type = 'article_report',
  title = 'Report or give feedback',
}) {
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';
  const action = filledActionColors(colors, isDark);
  const { success, error: notifyError } = useFeedback();
  const [category, setCategory] = useState('misleading');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState('');

  const articleId = item?.id != null ? String(item.id) : '';
  const url = item?.canonical_url || item?.url || '';
  const fbType = type || (articleId ? 'article_report' : 'app_feedback');

  const handleSubmit = async () => {
    setFieldError('');
    if (category === 'other' && !message.trim()) {
      setFieldError('Please describe your feedback when selecting Other.');
      return;
    }
    setLoading(true);
    try {
      await submitUserFeedback({
        type: fbType,
        article_id: articleId,
        url,
        category,
        message: message.trim(),
      });
      success('Feedback submitted. Thank you.');
      setMessage('');
      setCategory('misleading');
      onClose?.();
    } catch (err) {
      notifyError(err?.message || 'Could not submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={[styles.overlay, { backgroundColor: 'rgba(15,23,42,0.45)' }]}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderLight,
              },
            ]}
          >
            <View style={styles.header}>
              <View style={styles.flex}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
                {item?.title ? (
                  <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
              <Text style={[styles.label, { color: colors.textSecondary }]}>What would you like to report?</Text>
              {FEEDBACK_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.option,
                    {
                      borderColor: category === cat.key ? colors.primary : colors.borderLight,
                      backgroundColor:
                        category === cat.key ? (isDark ? colors.surfaceElevated : colors.backgroundSecondary) : 'transparent',
                    },
                  ]}
                  onPress={() => setCategory(cat.key)}
                >
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: category === cat.key ? colors.primary : colors.border,
                        backgroundColor: category === cat.key ? colors.primary : 'transparent',
                      },
                    ]}
                  />
                  <Text style={[styles.optionText, { color: colors.textPrimary }]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}

              <Text style={[styles.label, { color: colors.textSecondary, marginTop: 8 }]}>
                Additional details {category === 'other' ? '(required)' : '(optional)'}
              </Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={2000}
                placeholder="Share any details that will help our team review this…"
                placeholderTextColor={colors.textTertiary}
                style={[
                  styles.input,
                  {
                    borderColor: fieldError ? colors.error : colors.borderLight,
                    color: colors.textPrimary,
                    backgroundColor: isDark ? colors.background : colors.surface,
                  },
                ]}
              />
              {fieldError ? (
                <Text style={[styles.fieldError, { color: colors.error }]}>{fieldError}</Text>
              ) : null}
            </ScrollView>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.borderLight }]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: action.background, opacity: loading ? 0.7 : 1 }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={action.color} />
                ) : (
                  <Text style={[styles.submitText, { color: action.color }]}>Submit feedback</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
  },
  card: {
    maxHeight: '92%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  scroll: {
    maxHeight: 420,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    marginTop: 2,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  fieldError: {
    fontSize: 12,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelText: {
    fontWeight: '600',
  },
  submitBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 140,
    alignItems: 'center',
  },
  submitText: {
    fontWeight: '700',
  },
});
