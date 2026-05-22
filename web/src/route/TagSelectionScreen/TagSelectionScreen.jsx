import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import Text from '../../components/ui/Text';
import { ArrowLeft, Search, Check, X } from 'lucide-react';
import { newsTagsWithSubcategories } from './constants/newsCategories';
import { useUIFeedback } from '../../components/ui/UIFeedback';
import { getUserKeywords, loadUserKeywords } from '../../utils/userKeywordsStorage';
import { getUserKeywordsFromServer } from '../../utils/Service/api';

const TagSelectionScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const { isMobile, isTablet } = useResponsive();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { error } = useUIFeedback();
    const [selectedTags, setSelectedTags] = useState([]);
    const [searchText, setSearchText] = useState('');
    const fromSettings = Boolean(location.state?.fromSettings) || searchParams.get('fromSettings') === '1';
    const fromSignup = Boolean(location.state?.fromSignup);

    const mainTags = Object.keys(newsTagsWithSubcategories);

    const filteredTags = mainTags.filter(tag => 
        tag.toLowerCase().includes(searchText.toLowerCase())
    );

    useEffect(() => {
        if (!fromSignup) return;
        let cancelled = false;
        (async () => {
            const kws = await loadUserKeywords(getUserKeywordsFromServer);
            if (!cancelled && kws?.length) {
                navigate('/newsfeed', { replace: true });
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [fromSignup, navigate]);

    useEffect(() => {
        if (fromSignup) return;
        const saved = getUserKeywords();
        if (!saved.length) return;
        const next = new Set();
        for (const main of mainTags) {
            const subs = newsTagsWithSubcategories[main] || [];
            if (saved.includes(main)) next.add(main);
            for (const sub of subs) {
                if (saved.includes(sub)) {
                    next.add(main);
                    next.add(sub);
                }
            }
        }
        if (next.size) setSelectedTags(Array.from(next));
    // Intentionally run once on mount; fromSignup is fixed for this navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleMainTag = (tag) => {
        setSelectedTags(prev => {
            if (prev.includes(tag)) {
                const subcategories = newsTagsWithSubcategories[tag];
                return prev.filter(t => t !== tag && !subcategories.includes(t));
            } else {
                return [...prev, tag];
            }
        });
    };

    const toggleSubTag = (mainTag, subTag) => {
        setSelectedTags(prev => {
            if (prev.includes(subTag)) {
                return prev.filter(t => t !== subTag);
            } else {
                if (!prev.includes(mainTag)) {
                    return [...prev, mainTag, subTag];
                }
                return [...prev, subTag];
            }
        });
    };

    const handleContinue = () => {
        if (selectedTags.length === 0) {
            error('Please select at least one tag');
            return;
        }
        navigate('/keyword-selection', { state: { selectedTags, fromSettings } });
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
                        {fromSettings ? 'Manage Categories' : 'Select Your Interests'}
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: textSecondary,
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        {fromSettings
                            ? 'Update your category preferences. Next, review custom keywords.'
                            : 'Choose categories to personalize your news feed'}
                    </p>
                </div>

                {/* Search */}
                <div style={{ marginBottom: '20px', position: 'relative' }}>
                    <Search size={18} color={textSecondary} style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        zIndex: 1,
                    }} />
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search categories..."
                        style={{
                            width: '100%',
                            padding: '12px 14px 12px 44px',
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
                </div>

                {/* Selected Count */}
                {selectedTags.length > 0 && (
                    <div style={{
                        padding: '8px 14px',
                        backgroundColor: isDark ? colors.surface || '#1E293B' : '#f3f4f6',
                        borderRadius: '8px',
                        marginBottom: '20px',
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
                            {selectedTags.length} selected
                        </span>
                    </div>
                )}

                {/* Tags Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(auto-fill, minmax(180px, 1fr))' : 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '12px',
                    marginBottom: '32px',
                }}>
                    {filteredTags.map((tag, index) => {
                        const isSelected = selectedTags.includes(tag);
                        const subcategories = newsTagsWithSubcategories[tag] || [];

                        return (
                            <div key={index} style={{ position: 'relative' }}>
                                <button
                                    onClick={() => toggleMainTag(tag)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: isSelected ? `2px solid ${isDark ? colors.primary || '#3b82f6' : '#000000'}` : `1px solid ${borderColor}`,
                                        borderRadius: '8px',
                                        backgroundColor: isSelected ? (isDark ? colors.surface || '#1E293B' : '#f9fafb') : cardBackground,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.15s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        fontSize: '14px',
                                        fontWeight: isSelected ? 600 : 500,
                                        color: textPrimary,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.borderColor = isDark ? colors.border || '#475569' : '#d1d5db';
                                            e.currentTarget.style.backgroundColor = isDark ? colors.surface || '#1E293B' : '#f9fafb';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.borderColor = borderColor;
                                            e.currentTarget.style.backgroundColor = cardBackground;
                                        }
                                    }}
                                >
                                    <span>{tag}</span>
                                    {isSelected && (
                                        <div style={{
                                            width: '18px',
                                            height: '18px',
                                            borderRadius: '4px',
                                            backgroundColor: isDark ? colors.primary || '#3b82f6' : '#000000',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <Check size={12} color="#ffffff" />
                                        </div>
                                    )}
                                </button>

                                {/* Subcategories - Inline Pills */}
                                {isSelected && subcategories.length > 0 && (
                                    <div style={{
                                        marginTop: '8px',
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '6px',
                                    }}>
                                        {subcategories.map((subTag, subIndex) => {
                                            const isSubSelected = selectedTags.includes(subTag);
                                            return (
                                                <button
                                                    key={subIndex}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSubTag(tag, subTag);
                                                    }}
                                                    style={{
                                                        padding: '6px 12px',
                                                        border: isSubSelected ? `1px solid ${isDark ? colors.primary || '#3b82f6' : '#000000'}` : `1px solid ${borderColor}`,
                                                        borderRadius: '12px',
                                                        backgroundColor: isSubSelected ? (isDark ? colors.surface || '#1E293B' : '#f9fafb') : cardBackground,
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        fontWeight: isSubSelected ? 600 : 500,
                                                        color: isSubSelected ? textPrimary : textSecondary,
                                                        transition: 'all 0.15s ease',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isSubSelected) {
                                                            e.currentTarget.style.borderColor = isDark ? colors.border || '#475569' : '#d1d5db';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isSubSelected) {
                                                            e.currentTarget.style.borderColor = borderColor;
                                                        }
                                                    }}
                                                >
                                                    {subTag}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Continue Button */}
                <div style={{
                    paddingTop: '20px',
                    borderTop: `1px solid ${borderColor}`,
                    marginTop: 'auto',
                }}>
                    <button
                        onClick={handleContinue}
                        disabled={selectedTags.length === 0}
                        style={{
                            width: '100%',
                            padding: '14px 24px',
                            backgroundColor: selectedTags.length > 0 ? (isDark ? colors.primary || '#3b82f6' : '#000000') : (isDark ? '#475569' : '#d1d5db'),
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: selectedTags.length > 0 ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            if (selectedTags.length > 0) {
                                e.currentTarget.style.backgroundColor = isDark ? '#2563eb' : '#1a1a1a';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selectedTags.length > 0) {
                                e.currentTarget.style.backgroundColor = isDark ? colors.primary || '#3b82f6' : '#000000';
                            }
                        }}
                    >
                        {fromSettings ? 'Next' : 'Continue'} ({selectedTags.length})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TagSelectionScreen;
