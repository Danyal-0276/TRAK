import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import Text from '../../components/ui/Text';
import { ArrowLeft, Plus, X, ArrowRight } from 'lucide-react';
import { getUserKeywords, setUserKeywords } from '../../utils/userKeywordsStorage';
import { newsTagsWithSubcategories } from '../TagSelectionScreen/constants/newsCategories';
import { trackKeywords } from '../../utils/Service/api';

const KeywordSelectionScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const { isMobile, isTablet } = useResponsive();
    const navigate = useNavigate();
    const location = useLocation();
    const BUILTIN_TAXONOMY_TERMS = new Set(
        Object.entries(newsTagsWithSubcategories).flatMap(([main, subs]) => [main, ...(subs || [])])
    );
    const [selectedKeywords, setSelectedKeywords] = useState(() =>
        getUserKeywords().filter((k) => !BUILTIN_TAXONOMY_TERMS.has(String(k || '').toLowerCase()))
    );
    const [keywordInput, setKeywordInput] = useState('');
    
    const selectedTags = location.state?.selectedTags || [];
    const fromSettings = Boolean(location.state?.fromSettings);

    const addKeyword = () => {
        const trimmedKeyword = keywordInput.trim();
        
        if (trimmedKeyword === '') {
            return;
        }
        
        if (selectedKeywords.includes(trimmedKeyword.toLowerCase())) {
            return;
        }
        
        if (trimmedKeyword.length < 2) {
            return;
        }
        
        setSelectedKeywords(prev => [...prev, trimmedKeyword.toLowerCase()]);
        setKeywordInput('');
    };

    const removeKeyword = (keyword) => {
        setSelectedKeywords(prev => prev.filter(k => k !== keyword));
    };

    const handleKeywordSubmit = (e) => {
        e.preventDefault();
        if (keywordInput.trim()) {
            addKeyword();
        }
    };

    const handleContinue = async () => {
        const merged = [...selectedKeywords, ...selectedTags]
            .map((k) => String(k || '').trim().toLowerCase())
            .filter(Boolean)
            .filter((k, idx, arr) => arr.indexOf(k) === idx);
        setUserKeywords(merged);
        try {
            await trackKeywords(merged);
        } catch (e) {
            console.warn('track-keywords:', e?.message);
        }
        if (fromSettings) {
            navigate('/settings');
            return;
        }
        navigate('/newsfeed', {
            state: {
                selectedTags,
                selectedKeywords: merged,
            },
        });
    };

    const backgroundColor = isDark ? colors.background || '#0F172A' : '#ffffff';
    const textPrimary = isDark ? colors.textPrimary || '#F1F5F9' : '#0f172a';
    const textSecondary = isDark ? colors.textSecondary || '#CBD5E1' : '#64748b';
    const borderColor = isDark ? colors.border || '#334155' : '#e5e7eb';
    const cardBackground = isDark ? colors.surface || '#1E293B' : '#ffffff';

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: backgroundColor,
            paddingTop: '0',
            marginTop: '0',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
                padding: isMobile ? '0 16px 24px 16px' : isTablet ? '0 20px 24px 20px' : '0 24px 24px 24px',
            }}>
                {/* Header Section */}
                <div style={{
                    marginTop: '0',
                    marginBottom: isMobile ? '16px' : '24px',
                    paddingTop: '0',
                }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 0',
                            border: 'none',
                            background: 'transparent',
                            color: textSecondary,
                            fontSize: '15px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            marginBottom: '24px',
                            alignSelf: 'flex-start',
                        }}
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>

                    <h1 style={{
                        fontSize: isMobile ? '22px' : isTablet ? '24px' : '28px',
                        fontWeight: '700',
                        color: textPrimary,
                        margin: '0 0 8px 0',
                        paddingTop: '0',
                        letterSpacing: '-0.5px',
                    }}>
                        {fromSettings ? 'Manage Custom Keywords' : 'Add Custom Keywords'}
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: textSecondary,
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        {fromSettings
                            ? 'Edit your extra keywords. Category tags are managed on previous step.'
                            : 'Add specific keywords to get more personalized content (optional)'}
                    </p>
                </div>

                {/* Keyword Input */}
                <form onSubmit={handleKeywordSubmit} style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            placeholder="e.g., AI, Climate, Sports"
                            style={{
                                flex: 1,
                                padding: '12px 14px',
                                fontSize: '14px',
                                border: `1px solid ${borderColor}`,
                                borderRadius: '8px',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                color: textPrimary,
                                backgroundColor: isDark ? cardBackground : '#f9fafb',
                            }}
                            onFocus={(e) => {
                                e.target.style.backgroundColor = cardBackground;
                                e.target.style.borderColor = isDark ? colors.primary || '#3b82f6' : '#000000';
                                e.target.style.boxShadow = `0 0 0 3px ${isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`;
                            }}
                            onBlur={(e) => {
                                e.target.style.backgroundColor = isDark ? cardBackground : '#f9fafb';
                                e.target.style.borderColor = borderColor;
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                        <button
                            type="submit"
                            onClick={handleKeywordSubmit}
                            style={{
                                padding: '12px 20px',
                                backgroundColor: isDark ? colors.primary || '#3b82f6' : '#000000',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = isDark ? '#2563eb' : '#1a1a1a';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = isDark ? colors.primary || '#3b82f6' : '#000000';
                            }}
                        >
                            <Plus size={16} />
                            Add
                        </button>
                    </div>
                </form>

                {/* Keyword Count */}
                {selectedKeywords.length > 0 && (
                    <div style={{
                        padding: '8px 14px',
                        backgroundColor: isDark ? colors.surface || '#1E293B' : '#f3f4f6',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        width: 'auto',
                        height: 'auto',
                    }}>
                        <span style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: textPrimary,
                            whiteSpace: 'nowrap',
                        }}>
                            {selectedKeywords.length} keyword{selectedKeywords.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                )}

                {/* Keywords List */}
                <div style={{
                    marginBottom: '32px',
                    minHeight: '100px',
                }}>
                    {selectedKeywords.length === 0 ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '40px 20px',
                            border: `2px dashed ${borderColor}`,
                            borderRadius: '10px',
                            backgroundColor: isDark ? colors.surface || '#1E293B' : '#f9fafb',
                        }}>
                            <span style={{
                                fontSize: '32px',
                                marginBottom: '12px',
                            }}>
                                🔍
                            </span>
                            <span style={{
                                fontSize: '14px',
                                color: textSecondary,
                                textAlign: 'center',
                            }}>
                                No keywords added yet
                            </span>
                        </div>
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px',
                            alignItems: 'flex-start',
                        }}>
                            {selectedKeywords.map((keyword, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 14px',
                                        backgroundColor: isDark ? colors.surface || '#1E293B' : '#f3f4f6',
                                        borderRadius: '16px',
                                        border: `1px solid ${borderColor}`,
                                        width: 'auto',
                                        height: 'auto',
                                    }}
                                >
                                    <span style={{
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        color: textPrimary,
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {keyword}
                                    </span>
                                    <button
                                        onClick={() => removeKeyword(keyword)}
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            borderRadius: '50%',
                                            border: 'none',
                                            backgroundColor: isDark ? colors.border || '#475569' : '#d1d5db',
                                            color: textPrimary,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: 0,
                                            transition: 'all 0.2s ease',
                                            flexShrink: 0,
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = isDark ? '#64748b' : '#9ca3af';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = isDark ? colors.border || '#475569' : '#d1d5db';
                                        }}
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div style={{
                    paddingTop: '20px',
                    borderTop: `1px solid ${borderColor}`,
                    marginTop: 'auto',
                    display: 'flex',
                    gap: '12px',
                }}>
                    <button
                        onClick={handleContinue}
                        style={{
                            flex: 1,
                            padding: '14px 24px',
                            backgroundColor: isDark ? colors.primary || '#3b82f6' : '#000000',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? '#2563eb' : '#1a1a1a';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? colors.primary || '#3b82f6' : '#000000';
                        }}
                    >
                        {fromSettings ? 'Save & Back' : 'Continue to Feed'}
                        <ArrowRight size={18} />
                    </button>
                    <button
                        onClick={() => (fromSettings ? navigate('/settings') : handleContinue())}
                        style={{
                            padding: '14px 24px',
                            backgroundColor: cardBackground,
                            color: textPrimary,
                            border: `1px solid ${borderColor}`,
                            borderRadius: '10px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? colors.surface || '#1E293B' : '#f9fafb';
                            e.currentTarget.style.borderColor = isDark ? colors.border || '#475569' : '#d1d5db';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = cardBackground;
                            e.currentTarget.style.borderColor = borderColor;
                        }}
                    >
                        {fromSettings ? 'Back to Settings' : 'Skip'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KeywordSelectionScreen;
