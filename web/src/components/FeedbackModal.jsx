import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { filledActionColors } from '../theme/buttonContrast';
import { FEEDBACK_CATEGORIES } from '../constants/feedbackCategories';
import { submitUserFeedback } from '../utils/Service/api';
import { useUIFeedback } from './ui/UIFeedback';
import { X } from 'lucide-react';

export default function FeedbackModal({
  open,
  onClose,
  item = null,
  type = 'article_report',
  title = 'Report or give feedback',
}) {
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';
  const action = filledActionColors(colors, isDark);
  const { success, error: notifyError } = useUIFeedback();
  const [category, setCategory] = useState('misleading');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState('');

  if (!open) return null;

  const articleId = item?.id != null ? String(item.id) : '';
  const url = item?.canonical_url || item?.url || '';
  const fbType = type || (articleId ? 'article_report' : 'app_feedback');

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3200,
        background: 'rgba(15,23,42,0.45)',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflow: 'auto',
          background: isDark ? colors.surface : '#fff',
          border: `1px solid ${colors.border || '#dbe4f0'}`,
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 24px 48px rgba(15,23,42,0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.textPrimary }}>{title}</h2>
            {item?.title ? (
              <p style={{ margin: '8px 0 0', fontSize: 13, color: colors.textSecondary, lineHeight: 1.4 }}>
                {String(item.title).slice(0, 120)}
                {String(item.title).length > 120 ? '…' : ''}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 4,
              color: colors.textSecondary,
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <p style={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, marginBottom: 10 }}>
            What would you like to report?
          </p>
          <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
            {FEEDBACK_CATEGORIES.map((cat) => (
              <label
                key={cat.key}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: `1px solid ${category === cat.key ? colors.primary : colors.border || '#e2e8f0'}`,
                  background: category === cat.key ? (isDark ? colors.surfaceElevated : '#f8fafc') : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="feedback-category"
                  value={cat.key}
                  checked={category === cat.key}
                  onChange={() => setCategory(cat.key)}
                  style={{ marginTop: 3 }}
                />
                <span style={{ fontSize: 14, color: colors.textPrimary, lineHeight: 1.4 }}>{cat.label}</span>
              </label>
            ))}
          </div>

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.textSecondary, marginBottom: 8 }}>
            Additional details {category === 'other' ? '(required)' : '(optional)'}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="Share any details that will help our team review this…"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: 12,
              borderRadius: 10,
              border: `1px solid ${fieldError ? colors.error : colors.border || '#e2e8f0'}`,
              background: isDark ? colors.background : '#fff',
              color: colors.textPrimary,
              fontSize: 14,
              resize: 'vertical',
              marginBottom: fieldError ? 6 : 16,
            }}
          />
          {fieldError ? (
            <p style={{ color: colors.error, fontSize: 12, margin: '0 0 12px' }}>{fieldError}</p>
          ) : null}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: `1px solid ${colors.border || '#cbd5e1'}`,
                background: 'transparent',
                color: colors.textSecondary,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: 'none',
                background: action.background,
                color: action.color,
                cursor: loading ? 'wait' : 'pointer',
                fontWeight: 700,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Submitting…' : 'Submit feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
