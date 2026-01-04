import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
import Text from '../../components/ui/Text';
import { ArrowLeft, Plus, X, ArrowRight } from 'lucide-react';

const KeywordSelectionScreen = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [keywordInput, setKeywordInput] = useState('');
    
    const selectedTags = location.state?.selectedTags || [];

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

    const handleContinue = () => {
        navigate('/newsfeed', { 
            state: { 
                selectedTags, 
                selectedKeywords 
            } 
        });
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
                        Add Keywords
                    </Text>
                    <Text variant="body" style={{
                        fontSize: '16px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        lineHeight: '1.6',
                    }}>
                        Add specific keywords to get more personalized content (optional)
                    </Text>
                </div>
            </div>

            {/* Right Side - Keyword Selection */}
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
                        Custom keywords
                    </Text>
                    <Text variant="body" style={{
                        fontSize: '15px',
                        color: '#6b7280',
                        lineHeight: '1.5',
                    }}>
                        Add keywords you want to track (optional)
                    </Text>
                </div>

                {/* Keyword Input - Compact */}
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
                        <button
                            type="submit"
                            onClick={handleKeywordSubmit}
                            style={{
                                padding: '12px 20px',
                                backgroundColor: '#000000',
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
                                e.currentTarget.style.backgroundColor = '#1a1a1a';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#000000';
                            }}
                        >
                            <Plus size={16} />
                            Add
                        </button>
                    </div>
                </form>

                {/* Keyword Count - Compact */}
                {selectedKeywords.length > 0 && (
                    <div style={{
                        padding: '8px 12px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        display: 'inline-block',
                    }}>
                        <Text variant="body" style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#000000',
                        }}>
                            {selectedKeywords.length} keyword{selectedKeywords.length !== 1 ? 's' : ''}
                        </Text>
                    </div>
                )}

                {/* Keywords List - Compact */}
                <div style={{
                    marginBottom: '32px',
                    minHeight: '100px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                }}>
                    {selectedKeywords.length === 0 ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '40px 20px',
                            border: '2px dashed #e5e7eb',
                            borderRadius: '10px',
                            backgroundColor: '#f9fafb',
                        }}>
                            <Text variant="body" style={{
                                fontSize: '32px',
                                marginBottom: '12px',
                            }}>
                                🔍
                            </Text>
                            <Text variant="body" style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                textAlign: 'center',
                            }}>
                                No keywords added yet
                            </Text>
                        </div>
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                        }}>
                            {selectedKeywords.map((keyword, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 12px',
                                        backgroundColor: '#f3f4f6',
                                        borderRadius: '16px',
                                        border: '1px solid #e5e7eb',
                                    }}
                                >
                                    <Text variant="body" style={{
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        color: '#000000',
                                    }}>
                                        {keyword}
                                    </Text>
                                    <button
                                        onClick={() => removeKeyword(keyword)}
                                        style={{
                                            width: '16px',
                                            height: '16px',
                                            borderRadius: '50%',
                                            border: 'none',
                                            backgroundColor: '#d1d5db',
                                            color: '#000000',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: 0,
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#9ca3af';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#d1d5db';
                                        }}
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons - Fixed at bottom */}
                <div style={{
                    position: 'sticky',
                    bottom: 0,
                    backgroundColor: '#ffffff',
                    paddingTop: '20px',
                    borderTop: '1px solid #e5e7eb',
                    marginTop: 'auto',
                    display: 'flex',
                    gap: '12px',
                }}>
                    <button
                        onClick={handleContinue}
                        style={{
                            flex: 1,
                            padding: '14px 24px',
                            backgroundColor: '#000000',
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
                            e.currentTarget.style.backgroundColor = '#1a1a1a';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#000000';
                        }}
                    >
                        Continue to Feed
                        <ArrowRight size={18} />
                    </button>
                    <button
                        onClick={handleContinue}
                        style={{
                            padding: '14px 24px',
                            backgroundColor: '#ffffff',
                            color: '#374151',
                            border: '1px solid #e5e7eb',
                            borderRadius: '10px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                            e.currentTarget.style.borderColor = '#d1d5db';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffffff';
                            e.currentTarget.style.borderColor = '#e5e7eb';
                        }}
                    >
                        Skip
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KeywordSelectionScreen;
