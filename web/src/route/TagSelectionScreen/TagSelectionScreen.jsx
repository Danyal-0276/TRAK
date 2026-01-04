import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
import Text from '../../components/ui/Text';
import { ArrowLeft, Search, Check, X } from 'lucide-react';
import { newsTagsWithSubcategories } from './constants/newsCategories';

const TagSelectionScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const navigate = useNavigate();
    const [selectedTags, setSelectedTags] = useState([]);
    const [searchText, setSearchText] = useState('');

    const mainTags = Object.keys(newsTagsWithSubcategories);

    const filteredTags = mainTags.filter(tag => 
        tag.toLowerCase().includes(searchText.toLowerCase())
    );

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
            alert('Please select at least one tag');
            return;
        }
        navigate('/keyword-selection', { state: { selectedTags } });
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            backgroundColor: '#ffffff',
        }}>
            {/* Left Side - Branding */}
            <div style={{
                flex: '0 0 40%',
                backgroundColor: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '400px' }}>
                    <img 
                        src="/images/whiteLogo.svg" 
                        alt="TRAK Logo" 
                        style={{ 
                            width: '100px', 
                            height: '100px',
                            margin: '0 auto 32px',
                            display: 'block',
                        }} 
                    />
                    <Text variant="title" style={{
                        fontSize: '42px',
                        fontWeight: '800',
                        color: '#ffffff',
                        marginBottom: '20px',
                        letterSpacing: '-1px',
                    }}>
                        Select Interests
                    </Text>
                    <Text variant="body" style={{
                        fontSize: '16px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        lineHeight: '1.6',
                    }}>
                        Choose categories to personalize your news feed
                    </Text>
                </div>
            </div>

            {/* Right Side - Tag Selection */}
            <div style={{
                flex: '0 0 60%',
                display: 'flex',
                flexDirection: 'column',
                padding: '40px 60px',
                backgroundColor: '#ffffff',
                overflowY: 'auto',
                maxHeight: '100vh',
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
                        color: '#6b7280',
                        fontSize: '15px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        marginBottom: '32px',
                        alignSelf: 'flex-start',
                    }}
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div style={{ marginBottom: '24px' }}>
                    <Text variant="body" style={{
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#374151',
                        marginBottom: '8px',
                        letterSpacing: '0.2px',
                    }}>
                        Select your interests
                    </Text>
                    <Text variant="body" style={{
                        fontSize: '15px',
                        color: '#6b7280',
                        lineHeight: '1.5',
                    }}>
                        Select at least one category to continue
                    </Text>
                </div>

                {/* Search */}
                <div style={{ marginBottom: '20px', position: 'relative' }}>
                    <Search size={18} color="#9ca3af" style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
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
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            color: '#111827',
                            backgroundColor: '#f9fafb',
                        }}
                        onFocus={(e) => {
                            e.target.style.backgroundColor = '#ffffff';
                            e.target.style.borderColor = '#000000';
                            e.target.style.boxShadow = '0 0 0 3px rgba(0, 0, 0, 0.05)';
                        }}
                        onBlur={(e) => {
                            e.target.style.backgroundColor = '#f9fafb';
                            e.target.style.borderColor = '#e5e7eb';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>

                {/* Selected Count - Compact */}
                {selectedTags.length > 0 && (
                    <div style={{
                        padding: '8px 12px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        display: 'inline-block',
                    }}>
                        <Text variant="body" style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#000000',
                        }}>
                            {selectedTags.length} selected
                        </Text>
                    </div>
                )}

                {/* Tags - Compact Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '8px',
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
                                        padding: '10px 12px',
                                        border: isSelected ? '2px solid #000000' : '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        backgroundColor: isSelected ? '#f9fafb' : '#ffffff',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.15s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        fontSize: '14px',
                                        fontWeight: isSelected ? 600 : 500,
                                        color: isSelected ? '#000000' : '#374151',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.borderColor = '#d1d5db';
                                            e.currentTarget.style.backgroundColor = '#f9fafb';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.borderColor = '#e5e7eb';
                                            e.currentTarget.style.backgroundColor = '#ffffff';
                                        }
                                    }}
                                >
                                    <span>{tag}</span>
                                    {isSelected && (
                                        <div style={{
                                            width: '18px',
                                            height: '18px',
                                            borderRadius: '4px',
                                            backgroundColor: '#000000',
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
                                        marginTop: '6px',
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '4px',
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
                                                        padding: '4px 10px',
                                                        border: isSubSelected ? '1px solid #000000' : '1px solid #e5e7eb',
                                                        borderRadius: '12px',
                                                        backgroundColor: isSubSelected ? '#f9fafb' : '#ffffff',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        fontWeight: isSubSelected ? 600 : 500,
                                                        color: isSubSelected ? '#000000' : '#6b7280',
                                                        transition: 'all 0.15s ease',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isSubSelected) {
                                                            e.currentTarget.style.borderColor = '#d1d5db';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isSubSelected) {
                                                            e.currentTarget.style.borderColor = '#e5e7eb';
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

                {/* Continue Button - Fixed at bottom */}
                <div style={{
                    position: 'sticky',
                    bottom: 0,
                    backgroundColor: '#ffffff',
                    paddingTop: '20px',
                    borderTop: '1px solid #e5e7eb',
                    marginTop: 'auto',
                }}>
                    <button
                        onClick={handleContinue}
                        disabled={selectedTags.length === 0}
                        style={{
                            width: '100%',
                            padding: '14px 24px',
                            backgroundColor: selectedTags.length > 0 ? '#000000' : '#d1d5db',
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
                                e.currentTarget.style.backgroundColor = '#1a1a1a';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selectedTags.length > 0) {
                                e.currentTarget.style.backgroundColor = '#000000';
                            }
                        }}
                    >
                        Continue ({selectedTags.length})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TagSelectionScreen;
